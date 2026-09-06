/**
 * Customer Support Ticket Auto-Responder API routes
 */
let ticketsStore = [
  {
    id: "TCK-8921",
    customerEmail: "sarah.dev@acmecorp.io",
    subject: "API Rate limit 429 error on batch job",
    body: "Hi team, we are hitting 429 rate limits when executing our nightly batch processing script with 50 parallel connections. How can we increase our soft limit?",
    status: "Pending Review",
    sentiment: "Urgent",
    category: "Technical Bug",
    aiConfidence: 0.94,
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
};

export default async function ticketsRoute(fastify) {
  fastify.get("/v1/tickets", async (_request, reply) => {
    return reply.send({
      tickets: ticketsStore,
      settings: workflowSettings,
    });
  });

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
      status: workflowSettings.autoSendEnabled ? "Auto-Replied" : "Pending Review",
      sentiment: body.toLowerCase().includes("urgent") || body.toLowerCase().includes("error") ? "Urgent" : "Neutral",
      category: subject.toLowerCase().includes("bill") || subject.toLowerCase().includes("pay") ? "Billing" : "Technical Bug",
      aiConfidence: 0.92,
      aiDraftResponse: `Hello,\n\nThank you for reaching out to Kyro Support regarding '${subject}'.\n\nBased on your message, our AI system has categorized this request as a ${subject.toLowerCase().includes("bill") ? "Billing" : "Technical Support"} inquiry. We are reviewing your account details and will assist you immediately.\n\nBest regards,\nKyro AI Support Team`,
      createdAt: new Date().toISOString(),
    };

    ticketsStore.unshift(newTicket);
    return reply.send({ success: true, ticket: newTicket });
  });

  fastify.post("/v1/tickets/:id/approve", async (request, reply) => {
    const { id } = request.params;
    const ticket = ticketsStore.find((t) => t.id === id);
    if (!ticket) return reply.status(404).send({ error: "Ticket not found." });

    ticket.status = "Resolved";
    return reply.send({ success: true, ticket });
  });

  fastify.patch("/v1/tickets/settings", async (request, reply) => {
    const { autoSendEnabled, confidenceThreshold } = request.body || {};
    if (typeof autoSendEnabled === "boolean") workflowSettings.autoSendEnabled = autoSendEnabled;
    if (typeof confidenceThreshold === "number") workflowSettings.confidenceThreshold = confidenceThreshold;
    return reply.send({ success: true, settings: workflowSettings });
  });
}
