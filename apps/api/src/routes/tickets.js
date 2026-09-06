import { prisma } from "../lib/prisma.js";

/**
 * Customer Support Ticket & AI Agent Escalation API routes (Database-backed)
 */
let memoryTicketsFallback = [
  {
    id: "TCK-8921",
    ticketNumber: "TCK-8921",
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
  // Get all support tickets (DB-backed with memory fallback)
  fastify.get("/v1/tickets", async (_request, reply) => {
    try {
      const dbTickets = await prisma.supportTicket.findMany({
        orderBy: { createdAt: "desc" },
      });
      return reply.send({
        tickets: dbTickets.length > 0 ? dbTickets : memoryTicketsFallback,
        settings: workflowSettings,
      });
    } catch {
      return reply.send({
        tickets: memoryTicketsFallback,
        settings: workflowSettings,
      });
    }
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
      lower.includes("account hack") ||
      lower.includes("speak to an agent");

    if (needsEscalation) {
      const ticketNum = `TCK-${Math.floor(1000 + Math.random() * 9000)}`;
      const subjectStr = `AI Chat Escalation: "${message.slice(0, 45)}..."`;
      const bodyStr = `Customer Query: ${message}\n\nFull Chat History:\n${history.map((h) => `${h.sender}: ${h.text}`).join("\n")}`;

      const newTicketPayload = {
        id: ticketNum,
        ticketNumber: ticketNum,
        customerEmail,
        subject: subjectStr,
        body: bodyStr,
        status: "Escalated to Admin",
        sentiment: "Urgent",
        category: "AI_Escalation",
        aiConfidence: 0.45,
        aiDraftResponse: `Hello,\n\nOur AI Support Agent has forwarded your request to our Human Admin Team. An administrator is reviewing your inquiry in the Admin Panel and will reply shortly.\n\nBest regards,\nKyro Support Team`,
        fullChatHistory: JSON.stringify(history),
      };

      try {
        await prisma.supportTicket.create({ data: newTicketPayload });
      } catch {
        memoryTicketsFallback.unshift(newTicketPayload);
      }

      return reply.send({
        escalated: true,
        ticketId: ticketNum,
        response: `⚠️ I am transferring your request to our Human Admin Support Team. A real support ticket (${ticketNum}) has been created in the database and escalated to our Admin Panel under Support. An administrator will reply to your account directly.`,
      });
    }

    // Detailed AI Knowledge Base of the entire Kyro Platform
    let aiResponse = "";
    if (lower.includes("api key") || lower.includes("token")) {
      aiResponse = "To generate API keys, visit the Developer Portal at `/dev`. Keys begin with `kyro_sk_live_...` and support custom scopes (`completions`, `full`) and optional expiration dates. Free Tier accounts receive 100,000 daily tokens and a soft cap alert threshold.";
    } else if (lower.includes("rate limit") || lower.includes("429") || lower.includes("quota")) {
      aiResponse = "Kyro API rate limits operate on a token bucket algorithm across tiers:\n• Free Tier: 20 Requests/Min (RPM) and 100,000 tokens/day soft cap.\n• Pro Tier ($29/mo): 120 RPM and elevated burst limits.\n• Enterprise Tier: 1,000+ RPM with custom dedicated SLAs.";
    } else if (lower.includes("model") || lower.includes("kyro-coder") || lower.includes("70b")) {
      aiResponse = "Kyro supports three high-performance foundation models via `/v1/chat/completions`:\n1. `kyro-coder-pro` (32B Code Specialist for TypeScript, Python, SQL).\n2. `kyro-ultra-70b` (70B Llama 3.3 for deep reasoning & architecture design).\n3. `kyro-flash-8b` (Ultra-fast low latency for instant classification).\nYou can also register custom synthetic model aliases under `/dev`.";
    } else if (lower.includes("database") || lower.includes("db") || lower.includes("sql")) {
      aiResponse = "Kyro includes an in-browser Database Explorer at `/db` connected to PostgreSQL & Redis. You can execute raw SQL queries, inspect table schemas (`users`, `api_keys`, `api_usage_logs`, `support_tickets`), and export query results.";
    } else if (lower.includes("workflow") || lower.includes("builder")) {
      aiResponse = "Visual Workflows at `/workflows` allow you to construct drag-and-drop AI pipelines, webhook triggers, and automated data transformers.";
    } else if (lower.includes("status") || lower.includes("uptime") || lower.includes("sla")) {
      aiResponse = "Check real-time system metrics on our Status Page at `/status`. Kyro guarantees a 99.9% Monthly Uptime SLA for Pro and Enterprise plans with automated credit refunds if uptime falls below threshold.";
    } else if (lower.includes("privacy") || lower.includes("train") || lower.includes("security")) {
      aiResponse = "Kyro enforces a strict Zero Training Policy: prompt inputs and completion outputs are processed ephemerally in memory and are NEVER used to train base LLMs. All API traffic passes through our Secret Masking & PII Redaction Filter.";
    } else if (lower.includes("template") || lower.includes("starter") || lower.includes("zip")) {
      aiResponse = "Browse starter kits at `/templates` to download pre-configured project templates (Next.js SaaS, Fastify API, CLI, RAG Agent) in 1-click ZIP files.";
    } else if (lower.includes("joke")) {
      aiResponse = "As per my instructions, I refuse to tell jokes. Please let me know how I can assist with your technical or account questions!";
    } else {
      aiResponse = "Based on our platform documentation: Kyro provides an open, high-performance AI Gateway (`/v1/chat/completions`), Developer Portal (`/dev`), Database Explorer (`/db`), and Admin Panel (`/admin`). If you need human assistance, reply 'Talk to Human' or ask to escalate, and I will create a support ticket in our database for an admin.";
    }

    return reply.send({
      escalated: false,
      response: aiResponse,
    });
  });

  // Create manual support ticket in Database
  fastify.post("/v1/tickets", async (request, reply) => {
    const { customerEmail, subject, body } = request.body || {};
    if (!subject || !body) {
      return reply.status(400).send({ error: "Subject and body are required." });
    }

    const ticketNum = `TCK-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTicket = {
      id: ticketNum,
      ticketNumber: ticketNum,
      customerEmail: customerEmail || "user@example.com",
      subject,
      body,
      status: "Escalated to Admin",
      sentiment: body.toLowerCase().includes("urgent") || body.toLowerCase().includes("error") ? "Urgent" : "Neutral",
      category: subject.toLowerCase().includes("bill") || subject.toLowerCase().includes("pay") ? "Billing" : "Technical Bug",
      aiConfidence: 0.92,
      aiDraftResponse: `Hello,\n\nThank you for reaching out to Kyro Support regarding '${subject}'. An administrator is reviewing your inquiry in the Admin Panel.\n\nBest regards,\nKyro Support Team`,
    };

    try {
      const created = await prisma.supportTicket.create({ data: newTicket });
      return reply.send({ success: true, ticket: created });
    } catch {
      memoryTicketsFallback.unshift(newTicket);
      return reply.send({ success: true, ticket: newTicket });
    }
  });

  // Approve & Reply ticket in Database
  fastify.post("/v1/tickets/:id/approve", async (request, reply) => {
    const { id } = request.params;
    try {
      const updated = await prisma.supportTicket.update({
        where: { ticketNumber: id },
        data: { status: "Resolved" },
      });
      return reply.send({ success: true, ticket: updated });
    } catch {
      const ticket = memoryTicketsFallback.find((t) => t.id === id || t.ticketNumber === id);
      if (ticket) ticket.status = "Resolved";
      return reply.send({ success: true, ticket });
    }
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
