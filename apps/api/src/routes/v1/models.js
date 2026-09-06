import { getActiveConfig } from "../../services/systemConfigService.js";

/**
 * Custom Model Aliases mapping to underlying Groq / Cloud endpoints
 */
export const CUSTOM_MODELS = [
  {
    id: "kyro-ultra-70b",
    name: "Kyro Ultra (70B)",
    providerModel: "llama-3.3-70b-versatile",
    description: "Most capable model for complex reasoning, code generation, and deep analysis.",
  },
  {
    id: "kyro-flash-8b",
    name: "Kyro Flash (8B)",
    providerModel: "llama-3.1-8b-instant",
    description: "Ultra-fast response model suited for quick Q&A and lightweight tasks.",
  },
  {
    id: "kyro-mixtral-8x7b",
    name: "Kyro Mixtral (8x7B)",
    providerModel: "mixtral-8x7b-32768",
    description: "High performance mixture-of-experts model with an expanded context window.",
  },
  {
    id: "kyro-gemma-9b",
    name: "Kyro Gemma (9B)",
    providerModel: "gemma2-9b-it",
    description: "Efficient open weights model fine-tuned for precise instructions.",
  },
];

/**
 * GET /v1/models
 *
 * OpenAI-compatible models listing.
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
      const config = await getActiveConfig();
      const modelsList = CUSTOM_MODELS.map((m) => ({
        id: m.id,
        name: m.name,
        description: m.description,
        object: "model",
        created: Math.floor(Date.now() / 1000),
        owned_by: "kyro",
      }));

      // Also include active model if custom alias not matched
      if (!modelsList.some((m) => m.id === config.activeModel)) {
        modelsList.unshift({
          id: config.activeModel,
          name: `Kyro Default (${config.activeModel})`,
          description: "Default configured model",
          object: "model",
          created: Math.floor(Date.now() / 1000),
          owned_by: "kyro",
        });
      }

      return {
        object: "list",
        data: modelsList,
      };
    }
  );
}
