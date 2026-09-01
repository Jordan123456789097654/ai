import { checkTokenBucket } from "../utils/tokenBucket.js";
import { env } from "../config/env.js";

const TIER_LIMITS = {
  free: env.rateLimits.free,
  pro: env.rateLimits.pro,
  enterprise: env.rateLimits.enterprise,
};

/**
 * Fastify preHandler: enforces a per-caller token-bucket rate limit.
 *
 * Works in two modes depending on how the caller authenticated:
 *   - API key auth  → bucket key = apiKey.id, limit from key override or tier
 *   - Session auth  → bucket key = "session:{user.id}", limit from user tier
 *
 * Requires requireApiKey or requireApiKeyOrSession to have already run.
 */
export async function enforceRateLimit(request, reply) {
  const { apiKey, user } = request;
  const limit = apiKey?.rateLimitOverride ?? TIER_LIMITS[user.tier] ?? TIER_LIMITS.free;

  // Use a distinct bucket key per auth type so API key and session quotas
  // are tracked independently for the same user.
  const bucketKey = apiKey ? apiKey.id : `session:${user.id}`;

  const { allowed, remaining } = await checkTokenBucket(bucketKey, limit);

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
