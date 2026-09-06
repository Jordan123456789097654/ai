import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;

class DummyRedis {
  async ping() {
    return "PONG";
  }
  async eval() {
    // Fall back to allowing request if Redis is unavailable
    return [1, 999];
  }
  async get() {
    return null;
  }
  async set() {
    return "OK";
  }
  async del() {
    return 1;
  }
  disconnect() {}
}

let redisInstance;

if (redisUrl && redisUrl.startsWith("redis")) {
  try {
    redisInstance = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      retryStrategy() {
        return null; // stop retrying cleanly if instance is unreachable
      },
    });

    redisInstance.on("error", () => {
      // Suppress unhandled connection error noise
    });
  } catch {
    redisInstance = new DummyRedis();
  }
} else {
  redisInstance = new DummyRedis();
}

export const redis = redisInstance;
