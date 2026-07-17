import Redis from "ioredis";

const globalForRedis = globalThis as unknown as { redis?: Redis };

function createRedis() {
  const url = process.env.REDIS_URL ?? "redis://localhost:6379";
  return new Redis(url, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });
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
