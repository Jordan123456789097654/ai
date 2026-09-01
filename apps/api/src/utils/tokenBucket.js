import { redis } from "../lib/redis.js";

// Atomic token-bucket check-and-consume, implemented as a Lua script so the
// read-decrement-write cycle can't race across concurrent gateway instances.
//
// KEYS[1] = bucket key, e.g. "ratelimit:{apiKeyId}"
// ARGV[1] = capacity (max tokens / requests per window)
// ARGV[2] = refill rate (tokens per second)
// ARGV[3] = now (ms)
// ARGV[4] = cost (tokens this request consumes, usually 1)
const TOKEN_BUCKET_SCRIPT = `
local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refill_rate = tonumber(ARGV[2])
local now = tonumber(ARGV[3])
local cost = tonumber(ARGV[4])

local bucket = redis.call("HMGET", key, "tokens", "ts")
local tokens = tonumber(bucket[1])
local ts = tonumber(bucket[2])

if tokens == nil then
  tokens = capacity
  ts = now
end

local elapsed = math.max(0, now - ts) / 1000
tokens = math.min(capacity, tokens + elapsed * refill_rate)

local allowed = 0
if tokens >= cost then
  tokens = tokens - cost
  allowed = 1
end

redis.call("HMSET", key, "tokens", tokens, "ts", now)
redis.call("EXPIRE", key, 3600)

return { allowed, tostring(tokens) }
`;

/**
 * Checks and consumes from a per-key token bucket.
 * @param {string} bucketKey unique id for the caller, e.g. apiKeyId or userId
 * @param {number} requestsPerMinute the bucket capacity / refill target
 * @param {number} cost tokens consumed by this request (default 1)
 * @returns {Promise<{ allowed: boolean, remaining: number }>}
 */
export async function checkTokenBucket(bucketKey, requestsPerMinute, cost = 1) {
  const capacity = requestsPerMinute;
  const refillRate = requestsPerMinute / 60; // tokens per second
  const now = Date.now();

  const [allowed, remaining] = await redis.eval(
    TOKEN_BUCKET_SCRIPT,
    1,
    `ratelimit:${bucketKey}`,
    capacity,
    refillRate,
    now,
    cost
  );

  return { allowed: allowed === 1, remaining: Number(remaining) };
}
