import { checkDbConnection } from "@/backend/db/pool";
import { checkRedisConnection } from "@/backend/db/redis";
import { ok, serverError } from "@/backend/api/response";

export async function GET() {
  try {
    const [db, redis] = await Promise.all([checkDbConnection(), checkRedisConnection()]);

    const status = db && redis ? "healthy" : "degraded";

    return ok({
      status,
      services: {
        database: db ? "up" : "down",
        redis: redis ? "up" : "down",
      },
      timestamp: new Date().toISOString(),
    });
  } catch {
    return serverError("Health check failed");
  }
}
