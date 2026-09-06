import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 1,
  retryStrategy(times) {
    if (times > 3) {
      return null; // stop retrying after 3 attempts to prevent infinite log spam
    }
    return Math.min(times * 200, 1000);
  },
  lazyConnect: true,
});

redis.connect().catch((err) => {
  console.warn("[redis] Initial connection warning:", err.message);
});

redis.on("error", (err) => {
  console.warn("[redis] connection error:", err.message);
});
