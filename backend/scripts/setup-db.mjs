#!/usr/bin/env node
/**
 * Runs SQL migrations (and optionally seeds) against DATABASE_URL.
 *
 * Usage:
 *   npm run db:setup              # apply pending migrations + seeds (no wipe)
 *   npm run db:migrate            # apply pending migrations only
 *   npm run db:reset              # DROP SCHEMA, then migrate + seed
 *   node backend/scripts/setup-db.mjs --reset
 *   node backend/scripts/setup-db.mjs --migrate-only
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const projectRoot = join(root, "..");

const args = new Set(process.argv.slice(2));
const RESET = args.has("--reset") || process.env.WNP_DB_RESET === "1";
const MIGRATE_ONLY =
  args.has("--migrate-only") || process.env.WNP_MIGRATE_ONLY === "1";

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  const content = readFileSync(filePath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(join(projectRoot, ".env"));
loadEnvFile(join(projectRoot, ".env.local"));

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://washnpress:washnpress@postgres:5432/washnpress";

let client = new pg.Client({ connectionString });

let migrationCount = 0;
let seedCount = 0;
let skippedCount = 0;

function stripTransactionWrappers(sql) {
  // Avoid nested BEGIN/COMMIT when the runner already wraps each file.
  return sql
    .replace(/^\s*BEGIN\s*;\s*/i, "")
    .replace(/\s*COMMIT\s*;\s*$/i, "");
}

async function ensureMigrationsTable() {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
}

async function isApplied(filename) {
  const result = await client.query(
    `SELECT 1 FROM schema_migrations WHERE filename = $1`,
    [filename],
  );
  return result.rowCount > 0;
}

async function markApplied(filename) {
  await client.query(
    `INSERT INTO schema_migrations (filename) VALUES ($1) ON CONFLICT DO NOTHING`,
    [filename],
  );
}

async function runSqlFile(type, fileName, filePath, { track = false } = {}) {
  const raw = readFileSync(filePath, "utf8");
  const sql = stripTransactionWrappers(raw);

  console.log(`\n▶ Running ${type}: ${fileName}`);
  const start = Date.now();

  try {
    await client.query("BEGIN");
    await client.query(sql);
    if (track) {
      await markApplied(fileName);
    }
    await client.query("COMMIT");

    const duration = Date.now() - start;
    console.log(`✅ ${fileName} (${duration} ms)`);

    if (type === "migration") migrationCount++;
    if (type === "seed") seedCount++;
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(`\n❌ Failed: ${fileName}`);
    console.error(err.message);
    throw err;
  }
}

async function waitForPostgres(maxAttempts = 30) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      client = new pg.Client({ connectionString });
      await client.connect();
      return;
    } catch (err) {
      try {
        await client.end();
      } catch {
        /* ignore */
      }
      if (attempt === maxAttempts) throw err;
      console.log(
        `⏳ Waiting for PostgreSQL (attempt ${attempt}/${maxAttempts})...`,
      );
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}

async function main() {
  console.log("======================================");
  console.log(" Wash N Press Database Setup");
  console.log("======================================");

  const envLocalPath = join(projectRoot, ".env.local");
  const envExamplePath = join(projectRoot, ".env.example");

  if (!existsSync(envLocalPath) && existsSync(envExamplePath)) {
    console.log("⚠️  .env.local not found. Creating from .env.example...");
    writeFileSync(envLocalPath, readFileSync(envExamplePath, "utf8"));
    console.log("✅ Created .env.local\n");
  }

  console.log(
    `Connecting to ${connectionString.replace(/:[^:@]+@/, ":***@")}`,
  );

  await waitForPostgres();
  console.log("✅ Connected to PostgreSQL\n");

  if (RESET) {
    console.log("Resetting database schema (--reset)...");
    await client.query("DROP SCHEMA public CASCADE");
    await client.query("CREATE SCHEMA public");
    console.log("✅ Schema reset\n");
  }

  await ensureMigrationsTable();

  const migrationsDir = join(root, "database", "migrations");
  const seedsDir = join(root, "database", "seeds");

  const migrations = readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  console.log(`Found ${migrations.length} migration(s).\n`);

  for (const file of migrations) {
    if (!RESET && (await isApplied(file))) {
      console.log(`⏭  Skipping already applied: ${file}`);
      skippedCount++;
      continue;
    }
    await runSqlFile("migration", file, join(migrationsDir, file), {
      track: true,
    });
  }

  if (!MIGRATE_ONLY) {
    const seeds = readdirSync(seedsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    console.log(`\nFound ${seeds.length} seed file(s).\n`);

    // Seeds are only safe on fresh/reset DBs, or when explicitly resetting.
    // On incremental setup, seed only if core reference roles are missing.
    let shouldSeed = RESET;
    if (!shouldSeed) {
      const roles = await client.query(
        `SELECT COUNT(*)::int AS count FROM roles`,
      );
      shouldSeed = (roles.rows[0]?.count ?? 0) === 0;
    }

    if (!shouldSeed) {
      console.log(
        "⏭  Skipping seeds (database already has reference data). Use --reset to re-seed.",
      );
    } else {
      for (const file of seeds) {
        await runSqlFile("seed", file, join(seedsDir, file));
      }
    }
  }

  console.log("\n======================================");
  console.log(" Database Setup Complete");
  console.log("======================================");
  console.log(`✅ Migrations Applied : ${migrationCount}`);
  console.log(`⏭  Migrations Skipped : ${skippedCount}`);
  if (!MIGRATE_ONLY) {
    console.log(`✅ Seeds Executed     : ${seedCount}`);
  }
  console.log("\n[db] Migrations completed");
  console.log("Database is ready.");

  await client.end();
}

main().catch(async (err) => {
  console.error("\n======================================");
  console.error(" Database Setup Failed");
  console.error("======================================");
  console.error(err);
  try {
    await client.end();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
