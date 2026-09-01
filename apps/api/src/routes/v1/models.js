import { getActiveConfig } from "../../services/systemConfigService.js";

/**
 * GET /v1/models
 *
 * OpenAI-compatible models listing. The OpenAI SDK (and many other clients)
 * call this endpoint on initialization. Without it they throw a 404 before
 * making any actual requests. Returns the single active model Kyro is
 * currently configured to serve.
 *
 * No auth required — callers need to know what model to specify.
 */
export default async function modelsRoute(fastify) {
  fastify.get(
    "/v1/models",
    {
      schema: {
        description: "List available models. Returns Kyro's currently active model in OpenAI-compatible format.",
        tags: ["chat"],
      },
    },
    async () => {
      const config = await getActiveConfig();
      return {
        object: "list",
        data: [
          {
            id: config.activeModel,
            object: "model",
            created: Math.floor(Date.now() / 1000),
            owned_by: "kyro",
          },
        ],
      };
    }
  );
}
