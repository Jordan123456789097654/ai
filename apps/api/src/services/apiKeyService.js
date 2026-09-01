import crypto from "node:crypto";
import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";

function sha256(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function randomSecret(bytes = 24) {
  return crypto.randomBytes(bytes).toString("base64url");
}

/**
 * Generates a new API key for a user. Returns the RAW secret exactly once —
 * callers must show it to the user immediately and never persist the raw value.
 */
export async function createApiKey({ userId, name, rateLimitOverride = null }) {
  const secret = randomSecret();
  const rawKey = `${env.apiKeyPrefix}${secret}`;
  const keyHash = sha256(rawKey);
  const keyPrefix = rawKey.slice(0, env.apiKeyPrefix.length + 8); // safe-to-display prefix

  const record = await prisma.apiKey.create({
    data: {
      userId,
      name,
      keyHash,
      keyPrefix,
      rateLimitOverride,
    },
  });

  return { rawKey, key: record };
}

/** Looks up an active API key by its raw secret (as presented in the Authorization header). */
export async function findActiveKeyByRawSecret(rawKey) {
  const keyHash = sha256(rawKey);
  const key = await prisma.apiKey.findUnique({
    where: { keyHash },
    include: { user: true },
  });

  if (!key || !key.isActive || key.user.isSuspended) return null;
  return key;
}

export async function touchLastUsed(apiKeyId) {
  // Fire-and-forget; not on the hot path's critical latency.
  prisma.apiKey
    .update({ where: { id: apiKeyId }, data: { lastUsedAt: new Date() } })
    .catch((err) => console.error("[apiKeyService] touchLastUsed failed:", err.message));
}

export async function listKeysForUser(userId) {
  return prisma.apiKey.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      isActive: true,
      rateLimitOverride: true,
      createdAt: true,
      lastUsedAt: true,
    },
  });
}

export async function revokeKey({ keyId, userId, isAdmin = false }) {
  const key = await prisma.apiKey.findUnique({ where: { id: keyId } });
  if (!key) throw new Error("Key not found");
  if (!isAdmin && key.userId !== userId) throw new Error("Forbidden");

  return prisma.apiKey.update({ where: { id: keyId }, data: { isActive: false } });
}
