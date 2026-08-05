import Redis from "ioredis";

const globalForRedis = globalThis as unknown as { redis?: Redis };

function createRedis() {
  const url = process.env.REDIS_URL ?? "redis://localhost:6379";
  const client = new Redis(url, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    enableOfflineQueue: false,
    retryStrategy(times) {
      if (times > 10) return null;
      return Math.min(times * 200, 2000);
    },
  });
  client.on("error", (err) => {
    console.error("[redis]", err.message);
  });
  client.on("ready", () => {
    console.log("[redis] Redis connected");
  });
  return client;
}

export const redis = globalForRedis.redis ?? createRedis();

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

export async function checkRedisConnection(): Promise<boolean> {
  try {
    if (redis.status !== "ready") {
      await redis.connect();
    }
    const pong = await redis.ping();
    return pong === "PONG";
  } catch {
    return false;
  }
}

export const OTP_TTL_SECONDS = 5 * 60;
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

export function otpKey(phone: string) {
  return `otp:${phone}`;
}

export function sessionKey(token: string) {
  return `session:${token}`;
}
