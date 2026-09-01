import { checkTokenBucket } from "../utils/tokenBucket.js";
import { env } from "../config/env.js";

const TIER_LIMITS = {
  free: env.rateLimits.free,
  pro: env.rateLimits.pro,
  enterprise: env.rateLimits.enterprise,
};

/**
 * Fastify preHandler: enforces a per-API-key token-bucket rate limit.
 * Precedence: key-level override > user's tier default.
 * Requires requireApiKey to have already run (needs request.apiKey / request.user).
 */
export async function enforceRateLimit(request, reply) {
  const { apiKey, user } = request;
  const limit = apiKey.rateLimitOverride ?? TIER_LIMITS[user.tier] ?? TIER_LIMITS.free;

  const { allowed, remaining } = await checkTokenBucket(apiKey.id, limit);

  reply.header("X-RateLimit-Limit", limit);
  reply.header("X-RateLimit-Remaining", Math.floor(remaining));

  if (!allowed) {
    return reply.code(429).send({
      error: {
        message: `Rate limit exceeded. Your ${user.tier} tier allows ${limit} requests/min.`,
        type: "rate_limit_error",
        code: 429,
      },
    });
  }
}
