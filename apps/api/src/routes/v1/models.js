import { env } from "../../config/env.js";

/**
 * GET /v1/models
 * Dynamically queries the provider for available models and wraps them into Kyro aliases.
 */
export default async function modelsRoute(fastify) {
  fastify.get(
    "/v1/models",
    {
      schema: {
        description: "List available custom Kyro AI models in OpenAI-compatible format.",
        tags: ["chat"],
      },
    },
    async () => {
      try {
        const res = await fetch(`${env.inferenceBaseUrl}/models`, {
          headers: {
            ...(env.inferenceApiKey ? { Authorization: `Bearer ${env.inferenceApiKey}` } : {}),
          },
        });

        if (res.ok) {
          const providerData = await res.json();
          if (Array.isArray(providerData?.data)) {
            const liveModels = providerData.data.map((m) => ({
              id: m.id,
              name: `Kyro (${m.id})`,
              description: `Active cloud model: ${m.id}`,
              object: "model",
              created: m.created || Math.floor(Date.now() / 1000),
              owned_by: "kyro",
            }));
            return { object: "list", data: liveModels };
          }
        }
      } catch (err) {
        console.warn("[models] Failed to query provider models:", err.message);
      }

      // Fallback model list
      return {
        object: "list",
        data: [
          {
            id: "llama-3.3-70b-versatile",
            name: "Kyro Ultra (70B)",
            description: "High performance language model",
            object: "model",
            created: Math.floor(Date.now() / 1000),
            owned_by: "kyro",
          },
        ],
      };
    }
  );
}
