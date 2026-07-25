import { Pool, type QueryResultRow } from "pg";

const globalForPg = globalThis as unknown as { pgPool?: Pool };

function createPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.warn("[db] DATABASE_URL is not set — database queries will fail");
  }
  return new Pool({
    connectionString: connectionString ?? "postgresql://localhost:5432/washnpress",
    max: 20,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });
}

export const pool = globalForPg.pgPool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  globalForPg.pgPool = pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
) {
  return pool.query<T>(text, params);
}

export async function queryOne<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
) {
  const result = await pool.query<T>(text, params);
  return result.rows[0] ?? null;
}

export async function withTransaction<T>(
  fn: (client: import("pg").PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function checkDbConnection(): Promise<boolean> {
  try {
    await pool.query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}
