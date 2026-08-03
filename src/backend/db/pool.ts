import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from "pg";

const globalForPg = globalThis as unknown as {
  pgPool?: Pool;
};

const DEFAULT_DATABASE_URL =
  "postgresql://washnpress:washnpress@localhost:5434/washnpress";

function createPool() {
  const connectionString =
    process.env.DATABASE_URL || DEFAULT_DATABASE_URL;

  if (!process.env.DATABASE_URL) {
    console.warn(
      "[db] DATABASE_URL is not set. Falling back to local development database."
    );
  }

  const pool = new Pool({
    connectionString,
    max: 20,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });

  pool.on("connect", () => {
    console.log("[db] PostgreSQL connection established.");
  });

  pool.on("error", (err) => {
    console.error("[db] Unexpected PostgreSQL pool error:", err);
  });

  return pool;
}

export const pool = globalForPg.pgPool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  globalForPg.pgPool = pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<QueryResult<T>> {
  try {
    return await pool.query<T>(text, params);
  } catch (error) {
    console.error("\n======================================");
    console.error("[db] Query Failed");
    console.error("======================================");
    console.error("Query:");
    console.error(text);

    if (params?.length) {
      console.error("Parameters:");
      console.error(params);
    }

    console.error("Error:");
    console.error(error);

    throw error;
  }
}

export async function queryOne<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<T | null> {
  const result = await query<T>(text, params);
  return result.rows[0] ?? null;
}

export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await fn(client);

    await client.query("COMMIT");

    return result;
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("[db] Transaction rolled back.");
    console.error(error);

    throw error;
  } finally {
    client.release();
  }
}

export async function checkDbConnection(): Promise<boolean> {
  try {
    const result = await pool.query(
      "SELECT current_database() AS database_name, NOW() AS server_time"
    );

    console.log(
      `[db] Connected successfully to "${result.rows[0].database_name}".`
    );

    return true;
  } catch (error) {
    console.error("[db] Database connection failed.");
    console.error(error);

    return false;
  }
}

async function shutdown(signal: string) {
  console.log(`\n[db] ${signal} received.`);
  console.log("[db] Closing PostgreSQL connection pool...");

  try {
    await pool.end();
    console.log("[db] Connection pool closed.");
  } catch (error) {
    console.error("[db] Error while closing pool:", error);
  } finally {
    process.exit(0);
  }
}

process.once("SIGINT", () => {
  void shutdown("SIGINT");
});

process.once("SIGTERM", () => {
  void shutdown("SIGTERM");
});