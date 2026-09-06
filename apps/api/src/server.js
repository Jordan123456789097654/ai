import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";
import { redis } from "./lib/redis.js";

import chatCompletionsRoute from "./routes/v1/chatCompletions.js";
import modelsRoute from "./routes/v1/models.js";
import keysRoutes from "./routes/keys.js";
import adminRoutes from "./routes/admin.js";
import conversationsRoutes from "./routes/conversations.js";
import authRoutes from "./routes/auth.js";

const fastify = Fastify({ logger: true, trustProxy: true });

// ── Global CORS Preflight & Header Hook ──────────────────────────────────────
// Intercepts preflight OPTIONS and injects CORS headers into ALL responses
fastify.addHook("onRequest", (request, reply, done) => {
  reply.header("Access-Control-Allow-Origin", "*");
  reply.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  reply.header("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Requested-With, Accept");

  if (request.method === "OPTIONS") {
    reply.status(200).send();
    return;
  }
  done();
});

// Register plugins
await fastify.register(cors, {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Authorization", "Content-Type", "X-Requested-With", "Accept"],
});

await fastify.register(helmet, { contentSecurityPolicy: false });

// Ensure error responses always include CORS headers
fastify.setErrorHandler((error, request, reply) => {
  reply.header("Access-Control-Allow-Origin", "*");
  reply.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  reply.header("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Requested-With, Accept");

  const statusCode = error.statusCode || 500;
  reply.status(statusCode).send({
    error: {
      message: error.message || "An unexpected error occurred",
      type: error.name || "api_error",
      code: statusCode,
    },
  });
});

await fastify.register(swagger, {
  openapi: {
    info: {
      title: "Kyro API",
      description:
        "OpenAI-compatible chat completions API gateway backed by cloud LLM compute.",
      version: "1.0.0",
    },
    servers: [{ url: "http://localhost:4000", description: "Local" }],
    tags: [
      { name: "auth", description: "Public sign-up / sign-in" },
      { name: "chat", description: "OpenAI-compatible public API" },
      { name: "developer-portal", description: "API key management (requires a Kyro account session)" },
      { name: "admin", description: "Admin control panel (requires the admin role)" },
      { name: "chat-history", description: "Web chat conversation persistence" },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: { type: "http", scheme: "bearer", description: "kyro_sk_live_... developer API key" },
        SessionAuth: { type: "http", scheme: "bearer", description: "Supabase session JWT" },
      },
    },
  },
});

await fastify.register(swaggerUi, { routePrefix: "/docs" });

// ── Routes ───────────────────────────────────────────────────────────────────

// Root probes for load balancers & Render health checks
fastify.route({
  method: ["GET", "HEAD", "OPTIONS"],
  url: "/",
  handler: async () => ({ status: "ok", service: "kyro-api" }),
});

// Public, OpenAI-compatible surface
await fastify.register(chatCompletionsRoute);
await fastify.register(modelsRoute);

// Public auth surface — signup / magic-link
await fastify.register(authRoutes);

// First-party, session-authenticated surfaces
await fastify.register(keysRoutes);
await fastify.register(adminRoutes);
await fastify.register(conversationsRoutes);

// ── Health check ─────────────────────────────────────────────────────────────
fastify.get("/health", async (_request, reply) => {
  const [dbResult, redisResult] = await Promise.allSettled([
    prisma.$queryRaw`SELECT 1`,
    redis.ping(),
  ]);

  const db = dbResult.status === "fulfilled" ? "ok" : "down";
  const cache = redisResult.status === "fulfilled" ? "ok" : "down";
  const healthy = db === "ok";

  return reply.code(healthy ? 200 : 503).send({
    status: healthy ? "ok" : "degraded",
    db,
    cache,
  });
});

fastify.get("/openapi.json", async () => fastify.swagger());

// ── Start ─────────────────────────────────────────────────────────────────────
fastify.listen({ port: env.port, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Kyro API gateway listening at ${address}`);
  fastify.log.info(`Docs at ${address}/docs`);
});

// ── Graceful shutdown ─────────────────────────────────────────────────────────
async function shutdown(signal) {
  fastify.log.info(`${signal} received — shutting down gracefully`);
  try {
    await fastify.close();
    await prisma.$disconnect();
    redis.disconnect();
    fastify.log.info("Clean shutdown complete");
    process.exit(0);
  } catch (err) {
    fastify.log.error(err, "Error during shutdown");
    process.exit(1);
  }
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
