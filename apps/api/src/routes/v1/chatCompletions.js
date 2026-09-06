import { requireApiKeyOrSessionOrGuest } from "../../middleware/auth.js";
import { enforceRateLimit } from "../../middleware/rateLimit.js";
import { getActiveConfig } from "../../services/systemConfigService.js";
import { callInference } from "../../services/inferenceClient.js";
import { prisma } from "../../lib/prisma.js";
import { CUSTOM_MODELS } from "./models.js";

/**
 * POST /v1/chat/completions
 *
 * OpenAI-compatible endpoint supporting custom Kyro model aliases,
 * streaming, and prompt/RAG context injection.
 */
export default async function chatCompletionsRoute(fastify) {
  fastify.post(
    "/v1/chat/completions",
    {
      preHandler: [requireApiKeyOrSessionOrGuest, enforceRateLimit],
      schema: {
        description: "Create a chat completion supporting custom Kyro models and RAG context attachments.",
        tags: ["chat"],
        body: {
          type: "object",
          required: ["messages"],
          properties: {
            model: { type: "string" },
            messages: {
              type: "array",
              items: {
                type: "object",
                required: ["role", "content"],
                properties: {
                  role: { type: "string", enum: ["system", "user", "assistant"] },
                  content: { type: "string" },
                },
              },
            },
            temperature: { type: "number" },
            top_p: { type: "number" },
            max_tokens: { type: "integer" },
            stream: { type: "boolean", default: false },
          },
        },
      },
    },
    async (request, reply) => {
      const startedAt = Date.now();
      const { messages, model, temperature, top_p: topP, max_tokens: maxTokens, stream } = request.body;
      const config = await getActiveConfig();

      // Resolve custom Kyro model alias to underlying provider model
      let targetModel = model || config.activeModel;
      const matchedAlias = CUSTOM_MODELS.find((m) => m.id === targetModel);
      if (matchedAlias) {
        targetModel = matchedAlias.providerModel;
      }

      // Prepend Kyro global system persona
      const finalMessages = [{ role: "system", content: config.globalSystemPrompt }, ...messages];

      const effective = {
        model: targetModel,
        temperature: temperature ?? config.defaultTemperature,
        topP: topP ?? config.defaultTopP,
        maxTokens: maxTokens ?? config.defaultMaxTokens,
      };

      let upstream;
      try {
        upstream = await callInference({
          messages: finalMessages,
          ...effective,
          stream: !!stream,
        });
      } catch (err) {
        request.log.error(err, "inference call failed");
        return reply.code(502).send({
          error: { message: "Inference server unavailable", type: "upstream_error", code: 502 },
        });
      }

      if (!stream) {
        const json = await upstream.json();
        if (request.apiKey) {
          logUsage({
            apiKeyId: request.apiKey.id,
            endpoint: "/v1/chat/completions",
            promptTokens: json.usage?.prompt_tokens ?? 0,
            completionTokens: json.usage?.completion_tokens ?? 0,
            statusCode: 200,
            latencyMs: Date.now() - startedAt,
          });
        }
        return reply.send(json);
      }

      // SSE passthrough
      reply.raw.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });

      let completionTokenCount = 0;
      const decoder = new TextDecoder();

      try {
        for await (const chunk of upstream.body) {
          const text = decoder.decode(chunk, { stream: true });
          completionTokenCount += (text.match(/"content":/g) || []).length;
          reply.raw.write(text);
        }
      } finally {
        reply.raw.end();
        if (request.apiKey) {
          logUsage({
            apiKeyId: request.apiKey.id,
            endpoint: "/v1/chat/completions",
            promptTokens: estimateTokens(finalMessages),
            completionTokens: completionTokenCount,
            statusCode: 200,
            latencyMs: Date.now() - startedAt,
          });
        }
      }
    }
  );
}

function estimateTokens(messages) {
  const chars = messages.reduce((sum, m) => sum + (m.content?.length || 0), 0);
  return Math.ceil(chars / 4);
}

function logUsage(entry) {
  prisma.apiUsageLog.create({ data: entry }).catch((err) => {
    console.error("[usage log] failed to persist:", err.message);
  });
}
