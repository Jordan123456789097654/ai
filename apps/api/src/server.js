import Fastify from "fastify";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { env } from "./config/env.js";

import chatCompletionsRoute from "./routes/v1/chatCompletions.js";
import keysRoutes from "./routes/keys.js";
import adminRoutes from "./routes/admin.js";
import conversationsRoutes from "./routes/conversations.js";

const fastify = Fastify({ logger: true });

await fastify.register(cors, { origin: true });

await fastify.register(swagger, {
  openapi: {
    info: {
      title: "Kyro API",
      description:
        "OpenAI-compatible chat completions, backed by a self-hosted open-source model. " +
        "Swap your OpenAI SDK's baseURL to this host and use a kyro_sk_live_... key — everything else stays the same.",
      version: "1.0.0",
    },
    servers: [{ url: "http://localhost:4000", description: "Local" }],
    tags: [
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

// Public, OpenAI-compatible surface
await fastify.register(chatCompletionsRoute);

// First-party, session-authenticated surfaces
await fastify.register(keysRoutes);
await fastify.register(adminRoutes);
await fastify.register(conversationsRoutes);

fastify.get("/health", async () => ({ status: "ok" }));
fastify.get("/openapi.json", async () => fastify.swagger());

fastify.listen({ port: env.port, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Kyro API gateway listening at ${address}`);
  fastify.log.info(`Docs at ${address}/docs`);
});
