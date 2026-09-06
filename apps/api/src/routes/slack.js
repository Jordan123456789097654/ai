import { callInference } from "../services/inferenceClient.js";

/**
 * Slack Bot Webhook & Event Handler Route
 * Handles Slack slash commands (/kyro) and app mentions (@Kyro).
 */
export default async function slackRoute(fastify) {
  fastify.post("/webhooks/slack", async (request, reply) => {
    const { type, challenge, event, text } = request.body || {};

    // Slack URL Verification Handshake
    if (type === "url_verification") {
      return reply.send({ challenge });
    }

    // Slack App Mention Event or Slash Command
    const prompt = event?.text || text || "Explain how Kyro AI works.";
    const userHandle = event?.user || "Slack User";

    try {
      const upstream = await callInference({
        messages: [
          { role: "system", content: "You are Kyro AI Slack Assistant. Provide clean, formatted markdown responses suitable for Slack channels." },
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
        response_type: "in_channel",
        text: `*Kyro AI Assistant Response for <@${userHandle}>:*\n\n${replyText}`
      });
    } catch (err) {
      return reply.send({
        response_type: "ephemeral",
        text: `⚠️ *Kyro AI Error:* ${err.message}`
      });
    }
  });
}
