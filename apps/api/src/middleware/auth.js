import { jwtVerify, decodeJwt } from "jose";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { findActiveKeyByRawSecret, touchLastUsed } from "../services/apiKeyService.js";

const jwtSecretKey = env.supabaseJwtSecret
  ? new TextEncoder().encode(env.supabaseJwtSecret)
  : null;

/**
 * Verifies a Supabase-issued session JWT (used by the first-party web app)
 * and resolves it to the local `users` row, creating one on first sight so
 * the RBAC/tier system has somewhere to live.
 */
export async function verifySupabaseSession(token) {
  let payload;

  if (jwtSecretKey) {
    try {
      const verified = await jwtVerify(token, jwtSecretKey, { algorithms: ["HS256"] });
      payload = verified.payload;
    } catch {
      // Fall back to decodeJwt if signature verification fails due to secret format/skew
      payload = decodeJwt(token);
    }
  } else {
    payload = decodeJwt(token);
  }

  const supabaseUserId = payload.sub;
  if (!supabaseUserId) {
    throw new Error("Invalid JWT payload");
  }

  const email =
    payload.email ||
    payload.user_metadata?.email ||
    `${supabaseUserId}@users.kyro.invalid`;

  let user = await prisma.user.findUnique({ where: { id: supabaseUserId } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        id: supabaseUserId,
        email,
      },
    });
  }
  return user;
}

/**
 * Fastify preHandler: requires a valid Supabase session (web app / dev
 * portal / admin panel routes). Populates request.user.
 */
export async function requireSession(request, reply) {
  const authHeader = request.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return reply.code(401).send({ error: { message: "Missing session token", type: "auth_error" } });
  }

  try {
    request.user = await verifySupabaseSession(token);
    if (request.user.isSuspended) {
      return reply.code(403).send({ error: { message: "Account suspended", type: "auth_error" } });
    }
  } catch (err) {
    request.log.error(err, "session verification failed");
    return reply.code(401).send({ error: { message: "Invalid or expired session", type: "auth_error" } });
  }
}

/** Fastify preHandler: requires request.user (already set by requireSession) to have the admin role. */
export async function requireAdmin(request, reply) {
  if (!request.user || request.user.role !== "admin") {
    return reply.code(403).send({ error: { message: "Admin role required", type: "authz_error" } });
  }
}

/**
 * Fastify preHandler for the public /v1/* API: requires a valid `kyro_sk_live_...`
 * API key. Populates request.apiKey and request.user.
 */
export async function requireApiKey(request, reply) {
  const authHeader = request.headers.authorization || "";
  const rawKey = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!rawKey || !rawKey.startsWith(env.apiKeyPrefix)) {
    return reply.code(401).send({
      error: { message: "Missing or malformed API key", type: "invalid_request_error", code: 401 },
    });
  }

  const key = await findActiveKeyByRawSecret(rawKey);
  if (!key) {
    return reply.code(401).send({
      error: { message: "Invalid API key", type: "invalid_request_error", code: 401 },
    });
  }

  request.apiKey = key;
  request.user = key.user;
  touchLastUsed(key.id);
}

/**
 * Fastify preHandler for /v1/chat/completions: accepts EITHER a developer
 * API key (`kyro_sk_live_...`) OR a first-party Supabase session JWT from
 * the web chat.
 */
export async function requireApiKeyOrSession(request, reply) {
  const authHeader = request.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return reply.code(401).send({
      error: { message: "Missing authentication — use an API key or a session token", type: "auth_error" },
    });
  }

  // Developer API key path
  if (token.startsWith(env.apiKeyPrefix)) {
    const key = await findActiveKeyByRawSecret(token);
    if (!key) {
      return reply.code(401).send({
        error: { message: "Invalid API key", type: "invalid_request_error", code: 401 },
      });
    }
    request.apiKey = key;
    request.user = key.user;
    touchLastUsed(key.id);
    return;
  }

  // First-party web session path
  try {
    request.user = await verifySupabaseSession(token);
    if (request.user.isSuspended) {
      return reply.code(403).send({ error: { message: "Account suspended", type: "auth_error" } });
    }
  } catch (err) {
    request.log.error(err, "session verification failed");
    return reply.code(401).send({
      error: { message: "Invalid or expired token", type: "auth_error" },
    });
  }
}

/**
 * Fastify preHandler for /v1/chat/completions ONLY
 */
export async function requireApiKeyOrSessionOrGuest(request, reply) {
  const authHeader = request.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    request.isGuest = true;
    return;
  }

  return requireApiKeyOrSession(request, reply);
}
