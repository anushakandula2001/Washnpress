import { withErrorHandling } from "@/backend/api/response";
import { checkDbConnection } from "@/backend/db/pool";
import { checkRedisConnection } from "@/backend/db/redis";
import { ok, serverError } from "@/backend/api/response";

async function _GET() {
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


export const GET = withErrorHandling(_GET);
