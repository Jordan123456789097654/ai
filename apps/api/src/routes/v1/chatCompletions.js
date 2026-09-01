import { requireApiKeyOrSessionOrGuest } from "../../middleware/auth.js";
import { enforceRateLimit } from "../../middleware/rateLimit.js";
import { getActiveConfig } from "../../services/systemConfigService.js";
import { callInference } from "../../services/inferenceClient.js";
import { prisma } from "../../lib/prisma.js";

/**
 * POST /v1/chat/completions
 *
 * OpenAI-compatible endpoint. Accepts a standard chat-completions payload,
 * prepends Kyro's live system prompt (fetched from the Redis-cached active
 * config, set by the Admin Panel), and proxies to the self-hosted inference
 * engine — streaming tokens back over SSE when `stream: true`.
 *
 * Auth: accepts a developer API key (kyro_sk_live_...), a first-party
 * Supabase session JWT from the web chat UI, OR nothing at all — anonymous
 * callers are let through as guests, rate-limited by IP, so people can try
 * Kyro from the web chat without creating an account first.
 */
export default async function chatCompletionsRoute(fastify) {
  fastify.post(
    "/v1/chat/completions",
    {
      preHandler: [requireApiKeyOrSessionOrGuest, enforceRateLimit],
      schema: {
        description: "Create a chat completion. Drop-in compatible with the OpenAI SDK — just change baseURL and apiKey.",
        tags: ["chat"],
        body: {
          type: "object",
          required: ["messages"],
          properties: {
            model: { type: "string", description: "Ignored if omitted; defaults to Kyro's configured active model." },
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

      // Kyro always speaks as Kyro: the admin-configured system prompt is
      // prepended, ahead of anything the caller supplied.
      const finalMessages = [{ role: "system", content: config.globalSystemPrompt }, ...messages];

      const effective = {
        model: model || config.activeModel,
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
        // Only log when using an API key — session-based usage has no key to associate with
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

      // SSE passthrough: forward vLLM's `data: {...}` chunks verbatim.
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
          completionTokenCount += (text.match(/"content":/g) || []).length; // coarse estimate
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
  return Math.ceil(chars / 4); // rough fallback when the upstream doesn't report usage on streamed chunks
}

function logUsage(entry) {
  prisma.apiUsageLog.create({ data: entry }).catch((err) => {
    console.error("[usage log] failed to persist:", err.message);
  });
}
