import { prisma } from "../lib/prisma.js";
import { redis } from "../lib/redis.js";
import { env } from "../config/env.js";

const CACHE_KEY = "system_config:active";
const CACHE_TTL_SECONDS = 300; // safety net; every admin write also actively invalidates

const DEFAULT_CONFIG = {
  activeModel: env.inferenceModel,
  globalSystemPrompt:
    "You are Kyro, a helpful AI assistant. Be concise, accurate, and honest about uncertainty.",
  defaultTemperature: 0.7,
  defaultTopP: 1.0,
  defaultMaxTokens: 1024,
};

/**
 * Returns the currently active system configuration (model, persona/system
 * prompt, default hyperparameters). Reads from Redis first — this is what
 * lets the Admin Panel change Kyro's behavior without a redeploy. Falls back
 * to Postgres on a cache miss, then reseeds the cache.
 */
export async function getActiveConfig() {
  const cached = await redis.get(CACHE_KEY).catch(() => null);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // fall through to DB on corrupt cache entry
    }
  }

  const dbConfig = await prisma.systemConfig.findFirst({ where: { isActive: true } });
  const config = dbConfig
    ? {
        activeModel: dbConfig.activeModel,
        globalSystemPrompt: dbConfig.globalSystemPrompt,
        defaultTemperature: dbConfig.defaultTemperature,
        defaultTopP: dbConfig.defaultTopP,
        defaultMaxTokens: dbConfig.defaultMaxTokens,
      }
    : DEFAULT_CONFIG;

  await redis.set(CACHE_KEY, JSON.stringify(config), "EX", CACHE_TTL_SECONDS);
  return config;
}

/**
 * Admin-only: updates the active system configuration. Writes Postgres as
 * the source of truth (deactivating any prior active row), then immediately
 * publishes the new value into Redis so every gateway instance picks it up
 * on its very next request.
 */
export async function setActiveConfig({
  adminUserId,
  activeModel,
  globalSystemPrompt,
  defaultTemperature,
  defaultTopP,
  defaultMaxTokens,
}) {
  const updated = await prisma.$transaction(async (tx) => {
    await tx.systemConfig.updateMany({ where: { isActive: true }, data: { isActive: false } });
    return tx.systemConfig.create({
      data: {
        activeModel,
        globalSystemPrompt,
        defaultTemperature,
        defaultTopP,
        defaultMaxTokens,
        isActive: true,
        updatedBy: adminUserId,
      },
    });
  });

  const config = {
    activeModel: updated.activeModel,
    globalSystemPrompt: updated.globalSystemPrompt,
    defaultTemperature: updated.defaultTemperature,
    defaultTopP: updated.defaultTopP,
    defaultMaxTokens: updated.defaultMaxTokens,
  };

  await redis.set(CACHE_KEY, JSON.stringify(config), "EX", CACHE_TTL_SECONDS);
  return updated;
}
