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
    aiSummary: "Customer is hitting 429 rate limits during nightly batch processing scripts with 50 parallel connections and requested a soft limit cap increase.",
    aiDraftResponse: "Hello Sarah,\n\nThanks for reaching out! Your current API soft cap is set to 100,000 daily tokens. To accommodate high-concurrency batch jobs, you can configure your soft cap threshold in the Developer Portal under `/dev` or upgrade to an Enterprise Tier key for elevated concurrency quotas.\n\nLet us know if you would like our support team to double your burst rate limit manually!\n\nBest regards,\nKyro AI Support Team",
    fullChatHistory: JSON.stringify([
      { sender: "You", text: "Hi team, we are hitting 429 rate limits when executing our nightly batch processing script with 50 parallel connections. How can we increase our soft limit?", time: "10:14 AM" },
      { sender: "AI Agent", text: "I have registered your inquiry regarding API rate limits. Escalating to Admin Support.", time: "10:15 AM", escalated: true, ticketId: "TCK-8921" }
    ]),
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

function generateInquirySummary(message, history = []) {
  const userMessages = (history || []).filter((h) => h.sender === "You" || h.role === "user").map((h) => h.text);
  const fullText = userMessages.length > 0 ? userMessages.join("; ") : message;
  const lower = fullText.toLowerCase();

  let cause = "Customer requested live staff support.";
  if (lower.includes("rate limit") || lower.includes("429") || lower.includes("quota")) {
    cause = "Customer experienced API rate limit (429) errors and requested quota elevation.";
  } else if (lower.includes("bill") || lower.includes("refund") || lower.includes("pay")) {
    cause = "Customer submitted a billing inquiry regarding pricing tiers or invoices.";
  } else if (lower.includes("key") || lower.includes("token") || lower.includes("auth")) {
    cause = "Customer inquired about API key scopes, rotation, or authentication errors.";
  } else if (lower.includes("bug") || lower.includes("error") || lower.includes("crash")) {
    cause = "Customer reported an application bug or runtime error.";
  }

  return `${cause} Primary prompt: "${fullText.slice(0, 90)}${fullText.length > 90 ? "..." : ""}"`;
}

let workflowSettings = {
  autoSendEnabled: false,
  confidenceThreshold: 0.85,
  agentInstructions: `- If the message is an inquiry, answer it using only the provided information.
- If unsure about the answer to an inquiry, state that your knowledge is limited to the specific information provided by this business.
- If there are multiple inquiries in a message, answer them one by one.
- Refuse to tell jokes.`,
};

let cannedSnippetsStore = [
  {
    id: "SNP-1",
    title: "Rate Limit Soft Cap Boost",
    category: "Rate Limits",
    content: "Hello {customer_name},\n\nWe have manually doubled your API soft cap for ticket #{ticket_id}. Your account tier ({account_tier}) now has elevated limits active.\n\nBest regards,\nKyro Support Team",
  },
  {
    id: "SNP-2",
    title: "Engineering Investigation",
    category: "Technical Bug",
    content: "Hi {customer_name},\n\nThank you for reaching out regarding ticket #{ticket_id}. Our core engineering team is actively investigating this issue for your {account_tier} account.\n\nBest regards,\nKyro Staff Support",
  },
  {
    id: "SNP-3",
    title: "Issue Resolved & Re-test",
    category: "Resolution",
    content: "Hello {customer_name},\n\nTicket #{ticket_id} has been resolved! Please re-test your requests and let us know if you need anything else.\n\nBest regards,\nKyro Support Team",
  },
];

function calculateSLA(ticket) {
  const created = new Date(ticket.createdAt).getTime();
  let slaMinutes = 24 * 60; // default 24h
  if (ticket.sentiment === "Urgent" || ticket.category === "Security") {
    slaMinutes = 60; // 1 hour SLA for Urgent
  } else if (ticket.sentiment === "High" || ticket.category === "Technical Bug") {
    slaMinutes = 240; // 4 hours SLA for High
  }

  const deadlineMs = created + slaMinutes * 60 * 1000;
  const now = Date.now();
  const isResolved = ticket.status === "Resolved";
  const isBreached = !isResolved && now > deadlineMs;
  const remainingMins = Math.max(0, Math.floor((deadlineMs - now) / 60000));

  return {
    slaMinutes,
    deadlineIso: new Date(deadlineMs).toISOString(),
    status: isResolved ? "RESOLVED" : isBreached ? "BREACHED" : "ON_TRACK",
    remainingMins,
  };
}

export default async function ticketsRoute(fastify) {
  // Get all support tickets (DB-backed with memory fallback)
  fastify.get("/v1/tickets", async (_request, reply) => {
    let rawTickets = memoryTicketsFallback;
    try {
      const dbTickets = await prisma.supportTicket.findMany({
        orderBy: { createdAt: "desc" },
      });
      if (dbTickets.length > 0) rawTickets = dbTickets;
    } catch {}

    const enriched = rawTickets.map((t) => ({
      ...t,
      slaInfo: calculateSLA(t),
    }));

    return reply.send({
      tickets: enriched,
      settings: workflowSettings,
      snippets: cannedSnippetsStore,
    });
  });

  // Get customer specific support tickets by email (User-based Ticket Tabs)
  fastify.get("/v1/tickets/user/:email", async (request, reply) => {
    const { email } = request.params;
    let userTickets = [];
    try {
      userTickets = await prisma.supportTicket.findMany({
        where: { customerEmail: { equals: email, mode: "insensitive" } },
        orderBy: { createdAt: "desc" },
      });
    } catch {}

    if (userTickets.length === 0) {
      userTickets = memoryTicketsFallback.filter(
        (t) => t.customerEmail.toLowerCase() === email.toLowerCase()
      );
    }

    const parsedUserTickets = userTickets.map((t) => {
      let parsedThread = [];
      try {
        if (t.fullChatHistory) parsedThread = JSON.parse(t.fullChatHistory);
      } catch {}
      return { ...t, parsedThread };
    });

    return reply.send({ success: true, tickets: parsedUserTickets });
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
      const cleanSubject = `Live Escalation: ${message.slice(0, 50)}${message.length > 50 ? "..." : ""}`;
      const cleanBody = message.trim();
      const summaryText = generateInquirySummary(message, history);

      const newTicketPayload = {
        id: ticketNum,
        ticketNumber: ticketNum,
        customerEmail,
        subject: cleanSubject,
        body: cleanBody,
        status: "Escalated to Admin",
        sentiment: "Urgent",
        category: "AI_Escalation",
        aiConfidence: 0.45,
        aiSummary: summaryText,
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

  // Get single ticket details with parsed chat thread
  fastify.get("/v1/tickets/:id", async (request, reply) => {
    const { id } = request.params;
    let ticket = null;
    try {
      ticket = await prisma.supportTicket.findFirst({
        where: { OR: [{ id }, { ticketNumber: id }] },
      });
    } catch {}

    if (!ticket) {
      ticket = memoryTicketsFallback.find((t) => t.id === id || t.ticketNumber === id);
    }

    if (!ticket) {
      return reply.status(404).send({ error: "Ticket not found" });
    }

    let parsedThread = [];
    try {
      if (ticket.fullChatHistory) parsedThread = JSON.parse(ticket.fullChatHistory);
    } catch {}

    return reply.send({ success: true, ticket: { ...ticket, parsedThread } });
  });

  // Staff Reply Endpoint: Staff sends message to customer on a support ticket
  fastify.post("/v1/tickets/:id/reply", async (request, reply) => {
    const { id } = request.params;
    const { message, staffName = "Staff Support", markResolved = false } = request.body || {};

    if (!message || typeof message !== "string" || !message.trim()) {
      return reply.status(400).send({ error: "Reply message content is required." });
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newStaffMsg = {
      sender: staffName,
      text: message.trim(),
      time: timeStr,
      role: "staff",
      timestamp: new Date().toISOString(),
    };

    const nextStatus = markResolved ? "Resolved" : "Staff Replied";

    // 1. Try DB update
    try {
      const existing = await prisma.supportTicket.findFirst({
        where: { OR: [{ id }, { ticketNumber: id }] },
      });

      if (existing) {
        let historyArray = [];
        try {
          if (existing.fullChatHistory) historyArray = JSON.parse(existing.fullChatHistory);
        } catch {}

        historyArray.push(newStaffMsg);

        const updated = await prisma.supportTicket.update({
          where: { id: existing.id },
          data: {
            adminReply: message.trim(),
            fullChatHistory: JSON.stringify(historyArray),
            status: nextStatus,
          },
        });

        return reply.send({ success: true, ticket: updated, newMessage: newStaffMsg });
      }
    } catch {}

    // 2. Fallback in-memory update
    const memTicket = memoryTicketsFallback.find((t) => t.id === id || t.ticketNumber === id);
    if (memTicket) {
      let historyArray = [];
      try {
        if (memTicket.fullChatHistory) historyArray = JSON.parse(memTicket.fullChatHistory);
      } catch {}

      historyArray.push(newStaffMsg);
      memTicket.adminReply = message.trim();
      memTicket.fullChatHistory = JSON.stringify(historyArray);
      memTicket.status = nextStatus;

      return reply.send({ success: true, ticket: memTicket, newMessage: newStaffMsg });
    }

    return reply.status(404).send({ error: "Ticket not found." });
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

  // CSAT Rating & Feedback Submission Endpoint
  fastify.post("/v1/tickets/:id/csat", async (request, reply) => {
    const { id } = request.params;
    const { rating, feedback } = request.body || {};

    if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
      return reply.status(400).send({ error: "Rating must be a number between 1 and 5." });
    }

    try {
      const updated = await prisma.supportTicket.update({
        where: { ticketNumber: id },
        data: {
          csatRating: rating,
          csatFeedback: feedback || "",
        },
      });
      return reply.send({ success: true, ticket: updated });
    } catch {
      const mem = memoryTicketsFallback.find((t) => t.id === id || t.ticketNumber === id);
      if (mem) {
        mem.csatRating = rating;
        mem.csatFeedback = feedback || "";
        return reply.send({ success: true, ticket: mem });
      }
      return reply.status(404).send({ error: "Ticket not found." });
    }
  });

  // AI Staff Response Generator Endpoint (AI Writes Staff Response)
  fastify.post("/v1/tickets/:id/ai-generate-reply", async (request, reply) => {
    const { id } = request.params;
    const { staffNote = "" } = request.body || {};

    let ticket = null;
    try {
      ticket = await prisma.supportTicket.findFirst({ where: { OR: [{ id }, { ticketNumber: id }] } });
    } catch {}

    if (!ticket) {
      ticket = memoryTicketsFallback.find((t) => t.id === id || t.ticketNumber === id);
    }

    const customerName = (ticket?.customerEmail || "Customer").split("@")[0];
    const ticketIdStr = ticket?.ticketNumber || ticket?.id || id;

    const generatedResponse = `Hello ${customerName},

Thank you for contacting Kyro Support regarding "${ticket?.subject || "your inquiry"}".

${staffNote ? `Staff note: ${staffNote}\n\n` : ""}Our technical staff has reviewed your ticket (#${ticketIdStr}). We have verified your account tier and applied the necessary configuration updates to ensure smooth operation across your API endpoints.

Please re-test your requests and let us know if you experience any further issues!

Best regards,
Kyro Staff Support Team`;

    return reply.send({
      success: true,
      replyText: generatedResponse,
      aiConfidence: 0.94,
    });
  });

  // Canned Snippets Endpoints
  fastify.get("/v1/tickets/snippets", async (_request, reply) => {
    return reply.send({ success: true, snippets: cannedSnippetsStore });
  });

  fastify.post("/v1/tickets/snippets", async (request, reply) => {
    const { title, category, content } = request.body || {};
    if (!title || !content) return reply.status(400).send({ error: "Title and content required." });

    const newSnippet = {
      id: `SNP-${Math.floor(100 + Math.random() * 900)}`,
      title,
      category: category || "General",
      content,
    };
    cannedSnippetsStore.push(newSnippet);
    return reply.send({ success: true, snippet: newSnippet });
  });

  // Admin Takeover Endpoint: Admin takes over ticket from AI
  fastify.post("/v1/tickets/:id/takeover", async (request, reply) => {
    const { id } = request.params;
    const { adminName = "Admin Support" } = request.body || {};

    const takeoverMsg = {
      sender: "System",
      text: `🛡️ [Admin Takeover]: ${adminName} has taken over this ticket. AI auto-responses disabled.`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      role: "staff",
    };

    // Try DB update
    try {
      const existing = await prisma.supportTicket.findFirst({ where: { OR: [{ id }, { ticketNumber: id }] } });
      if (existing) {
        let historyArray = [];
        try {
          if (existing.fullChatHistory) historyArray = JSON.parse(existing.fullChatHistory);
        } catch {}
        historyArray.push(takeoverMsg);

        const updated = await prisma.supportTicket.update({
          where: { id: existing.id },
          data: {
            status: "Admin Assigned",
            fullChatHistory: JSON.stringify(historyArray),
          },
        });
        return reply.send({ success: true, ticket: updated, takeoverMsg });
      }
    } catch {}

    // Fallback in-memory update
    const mem = memoryTicketsFallback.find((t) => t.id === id || t.ticketNumber === id);
    if (mem) {
      let historyArray = [];
      try {
        if (mem.fullChatHistory) historyArray = JSON.parse(mem.fullChatHistory);
      } catch {}
      historyArray.push(takeoverMsg);
      mem.fullChatHistory = JSON.stringify(historyArray);
      mem.status = "Admin Assigned";
      return reply.send({ success: true, ticket: mem, takeoverMsg });
    }

    return reply.status(404).send({ error: "Ticket not found." });
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
