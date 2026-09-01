import { requireSession } from "../middleware/auth.js";
import { createApiKey, listKeysForUser, revokeKey } from "../services/apiKeyService.js";
import { prisma } from "../lib/prisma.js";

/**
 * Developer portal routes — require a Supabase session (first-party web
 * login), not an API key. This is where users manage their own keys.
 */
export default async function keysRoutes(fastify) {
  fastify.addHook("preHandler", requireSession);

  // ── Current user profile ─────────────────────────────────────────────────

  fastify.get(
    "/me",
    { schema: { tags: ["developer-portal"] } },
    async (request) => {
      return {
        id: request.user.id,
        email: request.user.email,
        role: request.user.role,
        tier: request.user.tier,
        isSuspended: request.user.isSuspended,
        createdAt: request.user.createdAt,
      };
    }
  );

  // ── API key management ────────────────────────────────────────────────────

  fastify.get("/keys", { schema: { tags: ["developer-portal"] } }, async (request) => {
    return { keys: await listKeysForUser(request.user.id) };
  });

  fastify.post(
    "/keys",
    {
      schema: {
        tags: ["developer-portal"],
        body: {
          type: "object",
          required: ["name"],
          properties: { name: { type: "string", minLength: 1, maxLength: 100 } },
        },
      },
    },
    async (request, reply) => {
      const { rawKey, key } = await createApiKey({ userId: request.user.id, name: request.body.name });
      // The raw secret is returned exactly once — the frontend must show a
      // "copy this now" dialog, since it's never retrievable again.
      return reply.code(201).send({ rawKey, key });
    }
  );

  fastify.delete("/keys/:keyId", { schema: { tags: ["developer-portal"] } }, async (request, reply) => {
    try {
      await revokeKey({ keyId: request.params.keyId, userId: request.user.id });
      return reply.code(204).send();
    } catch (err) {
      return reply.code(err.message === "Forbidden" ? 403 : 404).send({ error: { message: err.message } });
    }
  });

  // ── Per-key usage breakdown ───────────────────────────────────────────────

  fastify.get(
    "/keys/:keyId/usage",
    {
      schema: {
        tags: ["developer-portal"],
        querystring: {
          type: "object",
          properties: {
            days: { type: "integer", minimum: 1, maximum: 90, default: 7 },
          },
        },
      },
    },
    async (request, reply) => {
      // Verify the key belongs to the requesting user
      const key = await prisma.apiKey.findUnique({
        where: { id: request.params.keyId },
        select: { userId: true, name: true, keyPrefix: true },
      });
      if (!key || key.userId !== request.user.id) {
        return reply.code(404).send({ error: { message: "Key not found" } });
      }

      const days = Number(request.query.days ?? 7);
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const logs = await prisma.apiUsageLog.findMany({
        where: { apiKeyId: request.params.keyId, timestamp: { gte: since } },
        orderBy: { timestamp: "asc" },
        select: { promptTokens: true, completionTokens: true, statusCode: true, timestamp: true },
      });

      // Aggregate by UTC day
      const byDay = {};
      for (const log of logs) {
        const day = log.timestamp.toISOString().slice(0, 10);
        if (!byDay[day]) byDay[day] = { date: day, promptTokens: 0, completionTokens: 0, requests: 0, errors: 0 };
        byDay[day].promptTokens += log.promptTokens;
        byDay[day].completionTokens += log.completionTokens;
        byDay[day].requests += 1;
        if (log.statusCode >= 400) byDay[day].errors += 1;
      }

      const totals = logs.reduce(
        (acc, l) => ({
          promptTokens: acc.promptTokens + l.promptTokens,
          completionTokens: acc.completionTokens + l.completionTokens,
          requests: acc.requests + 1,
          errors: acc.errors + (l.statusCode >= 400 ? 1 : 0),
        }),
        { promptTokens: 0, completionTokens: 0, requests: 0, errors: 0 }
      );

      return {
        keyId: request.params.keyId,
        keyPrefix: key.keyPrefix,
        name: key.name,
        days,
        totals,
        daily: Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date)),
      };
    }
  );
}
