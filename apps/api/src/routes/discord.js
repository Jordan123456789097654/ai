import { callInference } from "../services/inferenceClient.js";
import { validateAndStartBot, stopHostedBot, getActiveHostedBots } from "../services/discordBotService.js";

/**
 * Discord Bot Webhook & Hosted Bot Gateway Routes
 */
export default async function discordRoute(fastify) {
  // ---- Webhook Interaction Handler (Type 1 PING / Type 2 Slash Command) ----
  fastify.post("/webhooks/discord", async (request, reply) => {
    const { type, data, member } = request.body || {};

    // Discord PING verification (Type 1)
    if (type === 1) {
      return reply.send({ type: 1 });
    }

    // Slash command /kyro or mention (Type 2 / 3)
    const prompt = data?.options?.[0]?.value || data?.content || "Explain how Kyro AI works.";
    const userHandle = member?.user?.username || "Discord User";

    try {
      const upstream = await callInference({
        messages: [
          { role: "system", content: "You are Kyro AI Discord Assistant. Provide clean, concise markdown responses suitable for Discord chat." },
          { role: "user", content: prompt },
        ],
        model: "kyro-coder-pro",
        temperature: 0.7,
        maxTokens: 1024,
        stream: false,
      });

      const json = await upstream.json();
      const replyText = json.choices?.[0]?.message?.content || "No response generated.";

      return reply.send({
        type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
        data: {
          content: `**[Kyro AI Response for @${userHandle}]:**\n\n${replyText}`,
        },
      });
    } catch (err) {
      return reply.send({
        type: 4,
        data: {
          content: `⚠️ **Kyro AI Error:** ${err.message}`,
        },
      });
    }
  });

  // ---- Hosted Discord Bot Management API Endpoints ----

  fastify.post("/dev/discord/host", async (request, reply) => {
    try {
      const { token, prefix, model, restrictions, commands } = request.body || {};
      const botSession = await validateAndStartBot({ token, prefix, model, restrictions, commands });
      return reply.send({ success: true, bot: botSession });
    } catch (err) {
      return reply.code(400).send({
        error: {
          message: err.message || "Failed to host Discord Bot",
          type: "discord_auth_error",
          code: 400,
        },
      });
    }
  });

  fastify.get("/dev/discord/host", async () => {
    return { bots: getActiveHostedBots() };
  });

  fastify.delete("/dev/discord/host/:botId", async (request, reply) => {
    const { botId } = request.params;
    const stopped = stopHostedBot(botId);
    return reply.send({ success: stopped });
  });
}
