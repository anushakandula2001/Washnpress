import { redis } from "@/backend/db/redis";
import Redis from "ioredis";
import { EventEmitter } from "events";

const url = process.env.REDIS_URL ?? "redis://localhost:6379";

const globalForSubscriber = globalThis as unknown as { 
  redisSubscriber?: Redis;
  realtimeEmitter?: EventEmitter;
};

export const redisSubscriber = globalForSubscriber.redisSubscriber ?? new Redis(url, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  enableOfflineQueue: false,
  retryStrategy(times) {
    if (times > 10) return null;
    return Math.min(times * 200, 2000);
  },
});

export const realtimeEmitter = globalForSubscriber.realtimeEmitter ?? new EventEmitter();

// Allow unlimited listeners for SSE
realtimeEmitter.setMaxListeners(0);

if (process.env.NODE_ENV !== "production") {
  globalForSubscriber.redisSubscriber = redisSubscriber;
  globalForSubscriber.realtimeEmitter = realtimeEmitter;
}

// Ensure the subscriber listens to patterns
redisSubscriber.on("pmessage", (pattern, channel, message) => {
  realtimeEmitter.emit(channel, message);
});
// Subscribe to all sync channels
redisSubscriber.psubscribe("sync:*").catch(console.error);


export type SyncChannel = "sync:admin" | "sync:operations" | "sync:resident" | `sync:resident:${string}`;

export async function publishEvent(channel: SyncChannel, eventType: string, payload?: any) {
  try {
    await redis.publish(channel, JSON.stringify({ type: eventType, payload, timestamp: Date.now() }));
  } catch (err) {
    console.error(`[realtime] Failed to publish event to ${channel}:`, err);
  }
}
