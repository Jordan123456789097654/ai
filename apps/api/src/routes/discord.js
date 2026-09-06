import { callInference } from "../services/inferenceClient.js";

/**
 * Discord Bot Webhook & Event Handler Route
 * Handles slash commands (/kyro) and bot mentions from Discord servers.
 */
export default async function discordRoute(fastify) {
  fastify.post("/webhooks/discord", async (request, reply) => {
    const { type, data, member, channel_id } = request.body || {};

    // Discord PING verification (Type 1)
    if (type === 1) {
      return reply.send({ type: 1 });
    }

    // Slash command /kyro or mention (Type 2 / 3)
    const prompt = data?.options?.[0]?.value || data?.content || "Explain how Kyro AI works.";
    const userHandle = member?.user?.username || "Discord User";

    try {
      // Call Kyro LLM inference
      const upstream = await callInference({
        messages: [
          { role: "system", content: "You are Kyro AI Discord Assistant. Provide clean, concise markdown responses suitable for Discord chat." },
          { role: "user", content: prompt }
        ],
        model: "kyro-coder-pro",
        temperature: 0.7,
        maxTokens: 1024,
        stream: false
      });

      const json = await upstream.json();
      const replyText = json.choices?.[0]?.message?.content || "No response generated.";

      return reply.send({
        type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
        data: {
          content: `**[Kyro AI Response for @${userHandle}]:**\n\n${replyText}`
        }
      });
    } catch (err) {
      return reply.send({
        type: 4,
        data: {
          content: `⚠️ **Kyro AI Error:** ${err.message}`
        }
      });
    }
  });
}
