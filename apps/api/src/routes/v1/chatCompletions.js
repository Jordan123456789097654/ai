import { requireApiKeyOrSessionOrGuest } from "../../middleware/auth.js";
import { enforceRateLimit } from "../../middleware/rateLimit.js";
import { getActiveConfig } from "../../services/systemConfigService.js";
import { callInference } from "../../services/inferenceClient.js";
import { prisma } from "../../lib/prisma.js";

/**
 * POST /v1/chat/completions & GET /v1/chat/completions (info route)
 */
export default async function chatCompletionsRoute(fastify) {
  fastify.get("/v1/chat/completions", async (_request, reply) => {
    return reply.send({
      message: "Kyro OpenAI-compatible Chat Completions API endpoint. Send a POST request with { messages: [...] }.",
      docs: "/docs",
    });
  });

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

      const targetModel = model || config.activeModel;
      const finalMessages = [{ role: "system", content: config.globalSystemPrompt }, ...messages];

      const sanitizedMessages = finalMessages.map((m) => ({
        role: m.role,
        content: redactSecretsAndPII(m.content),
      }));

      const effective = {
        model: targetModel,
        temperature: temperature ?? config.defaultTemperature,
        topP: topP ?? config.defaultTopP,
        maxTokens: maxTokens ?? config.defaultMaxTokens,
      };

      const authHeader = request.headers.authorization || "";
      const rawToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
      const customGroqKey =
        request.headers["x-groq-api-key"] ||
        request.body?.userApiKey ||
        (rawToken.startsWith("gsk_") ? rawToken : undefined);

      let upstream;
      try {
        upstream = await callInference({
          messages: sanitizedMessages,
          ...effective,
          stream: !!stream,
          userApiKey: customGroqKey,
        });
      } catch (err) {
        request.log.error(err, "inference call failed");
        const statusCode = err.status || 502;
        return reply.code(statusCode).send({
          error: {
            message: err.message || "Inference server error. Please check your Groq API key (GROQ_API_KEYS / INFERENCE_API_KEY).",
            type: statusCode === 401 ? "authentication_error" : "upstream_error",
            code: statusCode,
          },
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

      // SSE passthrough — EXPLICITLY set CORS headers on reply.raw to prevent browser streaming blocks!
      reply.raw.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
        "Access-Control-Allow-Headers": "Authorization, Content-Type, X-Requested-With, Accept",
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

function redactSecretsAndPII(text) {
  if (!text || typeof text !== "string") return text;
  return text
    .replace(/-----BEGIN[A-Z\s]+PRIVATE KEY-----[\s\S]*?-----END[A-Z\s]+PRIVATE KEY-----/g, "[REDACTED_PRIVATE_KEY]")
    .replace(/\b(AKIA|ASIA)[0-9A-Z]{16}\b/g, "[REDACTED_AWS_ACCESS_KEY]")
    .replace(/\b(sk_live_|ghp_|gho_|xox[baprs]-)[a-zA-Z0-9_-]{20,}\b/g, "[REDACTED_API_SECRET]")
    .replace(/\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13})\b/g, "[REDACTED_CREDIT_CARD]");
}

