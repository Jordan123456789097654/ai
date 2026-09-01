import { requireSession, requireAdmin } from "../middleware/auth.js";
import { getActiveConfig, setActiveConfig } from "../services/systemConfigService.js";
import { revokeKey } from "../services/apiKeyService.js";
import { prisma } from "../lib/prisma.js";

export default async function adminRoutes(fastify) {
  fastify.addHook("preHandler", requireSession);
  fastify.addHook("preHandler", requireAdmin);

  // ---- AI configuration (persona, model, hyperparameters) ----

  fastify.get("/admin/config", { schema: { tags: ["admin"] } }, async () => {
    return getActiveConfig();
  });

  fastify.put(
    "/admin/config",
    {
      schema: {
        tags: ["admin"],
        body: {
          type: "object",
          required: ["activeModel", "globalSystemPrompt"],
          properties: {
            activeModel: { type: "string" },
            globalSystemPrompt: { type: "string" },
            defaultTemperature: { type: "number", minimum: 0, maximum: 2 },
            defaultTopP: { type: "number", minimum: 0, maximum: 1 },
            defaultMaxTokens: { type: "integer", minimum: 1, maximum: 32000 },
          },
        },
      },
    },
    async (request) => {
      // Writes Postgres, then immediately republishes to Redis — live, no redeploy.
      return setActiveConfig({ adminUserId: request.user.id, ...request.body });
    }
  );

  // ---- User & key management ----

  fastify.get("/admin/users", { schema: { tags: ["admin"] } }, async (request) => {
    const { cursor, limit = 50 } = request.query;
    const users = await prisma.user.findMany({
      take: Number(limit),
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        role: true,
        tier: true,
        isSuspended: true,
        createdAt: true,
        _count: { select: { apiKeys: true } },
      },
    });
    return { users };
  });

  fastify.patch(
    "/admin/users/:userId",
    {
      schema: {
        tags: ["admin"],
        body: {
          type: "object",
          properties: {
            isSuspended: { type: "boolean" },
            tier: { type: "string", enum: ["free", "pro", "enterprise"] },
            role: { type: "string", enum: ["admin", "user"] },
          },
        },
      },
    },
    async (request) => {
      return prisma.user.update({ where: { id: request.params.userId }, data: request.body });
    }
  );

  fastify.delete("/admin/keys/:keyId", { schema: { tags: ["admin"] } }, async (request, reply) => {
    await revokeKey({ keyId: request.params.keyId, isAdmin: true });
    return reply.code(204).send();
  });

  // ---- Global analytics ----

  fastify.get("/admin/analytics", { schema: { tags: ["admin"] } }, async () => {
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [totalUsers, activeUsers24h, usageAgg, requestCount24h, errorCount24h] = await Promise.all([
      prisma.user.count(),
      prisma.apiUsageLog.findMany({
        where: { timestamp: { gte: since24h } },
        distinct: ["apiKeyId"],
        select: { apiKeyId: true },
      }),
      prisma.apiUsageLog.aggregate({
        _sum: { promptTokens: true, completionTokens: true },
      }),
      prisma.apiUsageLog.count({ where: { timestamp: { gte: since24h } } }),
      prisma.apiUsageLog.count({ where: { timestamp: { gte: since24h }, statusCode: { gte: 400 } } }),
    ]);

    return {
      totalUsers,
      dailyActiveKeys: activeUsers24h.length,
      totalTokensUsed:
        (usageAgg._sum.promptTokens || 0) + (usageAgg._sum.completionTokens || 0),
      requestVolume24h: requestCount24h,
      errorRate24h: requestCount24h ? errorCount24h / requestCount24h : 0,
    };
  });
}
