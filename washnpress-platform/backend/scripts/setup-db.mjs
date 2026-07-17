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
  process.env.DATABASE_URL ?? "postgresql://washnpress:washnpress@localhost:5434/washnpress";

const client = new pg.Client({ connectionString });

async function runSqlFile(label, filePath) {
  const sql = readFileSync(filePath, "utf8");
  console.log(`  → ${label}`);
  await client.query(sql);
}

async function main() {
  console.log(`Connecting to ${connectionString.replace(/:[^:@]+@/, ":***@")}`);
  await client.connect();
  console.log("Connected.\n");

  const migrationsDir = join(root, "database", "migrations");
  const seedsDir = join(root, "database", "seeds");

  console.log("Running migrations:");
  const migrations = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  for (const file of migrations) {
    await runSqlFile(file, join(migrationsDir, file));
  }

  console.log("\nRunning seeds:");
  const seeds = readdirSync(seedsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  for (const file of seeds) {
    await runSqlFile(file, join(seedsDir, file));
  }

  console.log("\nDone. Database is ready.");
  await client.end();
}

main().catch((err) => {
  console.error("Database setup failed:", err.message);
  process.exit(1);
});
