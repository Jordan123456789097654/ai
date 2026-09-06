/**
 * Customer Support Ticket & AI Agent Escalation API routes
 */
let ticketsStore = [
  {
    id: "TCK-8921",
    customerEmail: "sarah.dev@acmecorp.io",
    subject: "API Rate limit 429 error on batch job",
    body: "Hi team, we are hitting 429 rate limits when executing our nightly batch processing script with 50 parallel connections. How can we increase our soft limit?",
    status: "Escalated to Admin",
    sentiment: "Urgent",
    category: "Technical Bug",
    aiConfidence: 0.72,
    aiDraftResponse: "Hello Sarah,\n\nThanks for reaching out! Your current API soft cap is set to 100,000 daily tokens. To accommodate high-concurrency batch jobs, you can configure your soft cap threshold in the Developer Portal under `/dev` or upgrade to an Enterprise Tier key for elevated concurrency quotas.\n\nLet us know if you would like our support team to double your burst rate limit manually!\n\nBest regards,\nKyro AI Support Team",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "TCK-8922",
    customerEmail: "alex@fintechlab.com",
    subject: "Billing invoice update for August",
    body: "Can I get an itemized VAT invoice for our company's subscription last month?",
    status: "Auto-Replied",
    sentiment: "Neutral",
    category: "Billing",
    aiConfidence: 0.98,
    aiDraftResponse: "Hi Alex,\n\nItemized VAT invoices are available for download in your Account Settings. You can also view full monthly usage breakdowns per API key in your Developer Dashboard.\n\nBest regards,\nKyro AI Support Team",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

let workflowSettings = {
  autoSendEnabled: false,
  confidenceThreshold: 0.85,
  agentInstructions: `- If the message is an inquiry, answer it using only the provided information.
- If unsure about the answer to an inquiry, state that your knowledge is limited to the specific information provided by this business.
- If there are multiple inquiries in a message, answer them one by one.
- Refuse to tell jokes.`,
};

export default async function ticketsRoute(fastify) {
  // Get tickets & workflow settings
  fastify.get("/v1/tickets", async (_request, reply) => {
    return reply.send({
      tickets: ticketsStore,
      settings: workflowSettings,
    });
  });

  // AI Support Assistant Interactive Endpoint
  fastify.post("/v1/support/ai-chat", async (request, reply) => {
    const { message, customerEmail = "user@example.com", history = [] } = request.body || {};
    if (!message || typeof message !== "string" || !message.trim()) {
      return reply.status(400).send({ error: "Message content is required." });
    }

    const lower = message.toLowerCase();
    const needsEscalation =
      lower.includes("human") ||
      lower.includes("person") ||
      lower.includes("escalate") ||
      lower.includes("admin") ||
      lower.includes("talk to someone") ||
      lower.includes("refund money") ||
      lower.includes("account hack");

    if (needsEscalation) {
      const ticketId = `TCK-${Math.floor(1000 + Math.random() * 9000)}`;
      const escalatedTicket = {
        id: ticketId,
        customerEmail,
        subject: `AI Chat Escalation: "${message.slice(0, 45)}..."`,
        body: `Customer Query: ${message}\n\nFull Chat History:\n${history.map((h) => `${h.sender}: ${h.text}`).join("\n")}`,
        status: "Escalated to Admin",
        sentiment: "Urgent",
        category: "Technical Bug",
        aiConfidence: 0.45,
        aiDraftResponse: `Hello,\n\nOur AI Support Agent has forwarded your request to our Human Admin Team. An administrator is reviewing your inquiry and will reply shortly.\n\nBest regards,\nKyro Support Team`,
        createdAt: new Date().toISOString(),
      };

      ticketsStore.unshift(escalatedTicket);

      return reply.send({
        escalated: true,
        ticketId,
        response: `⚠️ I am transferring your request to our Human Admin Support Team. A ticket (${ticketId}) has been opened in the Admin Panel and an administrator will assist you directly.`,
      });
    }

    // Standard AI Support Answer based on business knowledge
    let aiResponse = "";
    if (lower.includes("api key") || lower.includes("token")) {
      aiResponse = "You can generate and manage developer API keys in the Developer Portal under `/dev`. Free tier accounts receive 100,000 daily tokens.";
    } else if (lower.includes("rate limit") || lower.includes("429")) {
      aiResponse = "Rate limits depend on your account tier: Free Tier allows 20 requests/min, Pro Tier allows 120 requests/min, and Enterprise Tier supports 1,000+ requests/min.";
    } else if (lower.includes("pricing") || lower.includes("cost") || lower.includes("billing")) {
      aiResponse = "Kyro AI offers flexible pricing including a Free Tier, Pro Tier ($29/mo), and Enterprise custom tiers. Itemized invoices are accessible in your Account Settings.";
    } else if (lower.includes("joke")) {
      aiResponse = "As per my instructions, I refuse to tell jokes. Please let me know how I can assist with your technical or account questions!";
    } else {
      aiResponse = "Based on our platform documentation: Kyro provides OpenAI-compatible REST API gateways (`/v1/chat/completions`) powered by high-throughput LLMs. If you need custom assistance beyond this, reply 'Talk to Human' to connect directly with an admin.";
    }

    return reply.send({
      escalated: false,
      response: aiResponse,
    });
  });

  // Create manual support ticket
  fastify.post("/v1/tickets", async (request, reply) => {
    const { customerEmail, subject, body } = request.body || {};
    if (!subject || !body) {
      return reply.status(400).send({ error: "Subject and body are required." });
    }

    const newTicket = {
      id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      customerEmail: customerEmail || "user@example.com",
      subject,
      body,
      status: "Escalated to Admin",
      sentiment: body.toLowerCase().includes("urgent") || body.toLowerCase().includes("error") ? "Urgent" : "Neutral",
      category: subject.toLowerCase().includes("bill") || subject.toLowerCase().includes("pay") ? "Billing" : "Technical Bug",
      aiConfidence: 0.92,
      aiDraftResponse: `Hello,\n\nThank you for reaching out to Kyro Support regarding '${subject}'. An administrator is reviewing your inquiry.\n\nBest regards,\nKyro Support Team`,
      createdAt: new Date().toISOString(),
    };

    ticketsStore.unshift(newTicket);
    return reply.send({ success: true, ticket: newTicket });
  });

  // Approve & Reply ticket
  fastify.post("/v1/tickets/:id/approve", async (request, reply) => {
    const { id } = request.params;
    const ticket = ticketsStore.find((t) => t.id === id);
    if (!ticket) return reply.status(404).send({ error: "Ticket not found." });

    ticket.status = "Resolved";
    return reply.send({ success: true, ticket });
  });

  // Update Settings & System Instructions
  fastify.patch("/v1/tickets/settings", async (request, reply) => {
    const { autoSendEnabled, confidenceThreshold, agentInstructions } = request.body || {};
    if (typeof autoSendEnabled === "boolean") workflowSettings.autoSendEnabled = autoSendEnabled;
    if (typeof confidenceThreshold === "number") workflowSettings.confidenceThreshold = confidenceThreshold;
    if (typeof agentInstructions === "string") workflowSettings.agentInstructions = agentInstructions;

    return reply.send({ success: true, settings: workflowSettings });
  });
}
