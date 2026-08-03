#!/usr/bin/env node
/**
 * Runs SQL migrations and seeds against DATABASE_URL.
 * Usage: npm run db:setup
 */

import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://washnpress:washnpress@localhost:5434/washnpress";

const client = new pg.Client({
  connectionString,
});

let migrationCount = 0;
let seedCount = 0;

async function runSqlFile(type, fileName, filePath) {
  const sql = readFileSync(filePath, "utf8");

  console.log(`\n▶ Running ${type}: ${fileName}`);

  const start = Date.now();

  try {
    await client.query("BEGIN");

    await client.query(sql);

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

async function main() {
  console.log("======================================");
  console.log(" Wash N Press Database Setup");
  console.log("======================================");

  console.log(
    `Connecting to ${connectionString.replace(/:[^:@]+@/, ":***@")}`
  );

  await client.connect();

  console.log("✅ Connected to PostgreSQL\n");

  const migrationsDir = join(root, "database", "migrations");
  const seedsDir = join(root, "database", "seeds");

  const migrations = readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  console.log(`Found ${migrations.length} migration(s).\n`);

  for (const file of migrations) {
    await runSqlFile(
      "migration",
      file,
      join(migrationsDir, file)
    );
  }

  const seeds = readdirSync(seedsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  console.log(`\nFound ${seeds.length} seed file(s).\n`);

  for (const file of seeds) {
    await runSqlFile(
      "seed",
      file,
      join(seedsDir, file)
    );
  }

  console.log("\n======================================");
  console.log(" Database Setup Complete");
  console.log("======================================");

  console.log(`✅ Migrations Applied : ${migrationCount}`);
  console.log(`✅ Seeds Executed     : ${seedCount}`);

  console.log("\nDatabase is ready.");

  await client.end();
}

main().catch(async (err) => {
  console.error("\n======================================");
  console.error(" Database Setup Failed");
  console.error("======================================");

  console.error(err);

  try {
    await client.end();
  } catch { }

  process.exit(1);
});