import { requireSession } from "../middleware/auth.js";
import { createApiKey, listKeysForUser, revokeKey } from "../services/apiKeyService.js";

/**
 * Developer portal routes — require a Supabase session (first-party web
 * login), not an API key. This is where users manage their own keys.
 */
export default async function keysRoutes(fastify) {
  fastify.addHook("preHandler", requireSession);

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
}
