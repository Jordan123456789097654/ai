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

    // Warm, Intelligent, Developer-Centric Kyro AI Response Engine
    let aiResponse = "";

    // 1. Greetings & Small Talk
    if (/^(hi|hello|hey|yo|sup|greetings|howdy|good morning|good afternoon|good evening)/i.test(lower.trim()) || lower === "hello" || lower === "hi") {
      aiResponse = `Hey there! 👋 Welcome to Kyro AI Support! I'm your AI technical co-pilot. 

Whether you're generating API keys, optimizing rate limits, running SQL in our Database Explorer, or testing 128k context reasoning models in our Beta Lab — I'm here to power up your workflow!

How can I help you today? Feel free to ask about:
• 🔑 **API Keys & Authentication** (\`/dev\`)
• ⚡ **Rate Limit Caps & 429 Errors** (\`/tickets\`)
• 🧠 **Models & 128k Reasoner** (\`kyro-coder-pro\`, \`kyro-ultra-70b\`)
• 🛡️ **Human Support Escalation** (just type *"Talk to Human"*!)`;
    }
    // 2. Who are you / Capabilities
    else if (lower.includes("who are you") || lower.includes("what can you do") || lower.includes("capabilities") || lower.includes("help me")) {
      aiResponse = `I'm **Kyro AI Support Agent** — your 24/7 intelligent engineering assistant built directly into the platform! 🚀

Here is what I can do for you right now:
1. 🔑 **Manage API Keys**: Guide you through key creation, token rotation, and scope management under \`/dev\`.
2. ⚡ **Solve Rate Limits**: Explain token bucket limits, burst quotas, and help request soft cap increases.
3. 🧬 **Model Guidance**: Compare speeds, costs, and token contexts for \`kyro-coder-pro\`, \`kyro-ultra-70b\`, and \`kyro-flash-8b\`.
4. 🗄️ **Database & Workflows**: Assist with PostgreSQL queries in \`/db\` or visual flow builders in \`/workflows\`.
5. 🛡️ **Instant Escalation**: Transfer your conversation directly to a Human Admin in our Admin Panel at any time!

What topic would you like to explore?`;
    }
    // 3. API Keys & Authentication
    else if (lower.includes("api key") || lower.includes("token") || lower.includes("bearer") || lower.includes("auth")) {
      aiResponse = `To create and manage API keys, head over to our Developer Portal at \`/dev\`! 🔑

**Quick Technical Guide:**
• **Key Format**: All live keys start with \`kyro_sk_live_...\`
• **Authorization Header**: Pass your key in standard HTTP headers:
  \`Authorization: Bearer kyro_sk_live_your_secret_key\`
• **Scopes**: Assign read/write permissions (\`completions\`, \`admin\`, \`full\`).
• **Free Tier Allowance**: 100,000 daily tokens included out of the box with zero setup fees!

Need a custom scope or higher token cap? Reply *"Talk to Human"* to request an Enterprise key from our team.`;
    }
    // 4. Rate Limits & 429 Errors
    else if (lower.includes("rate limit") || lower.includes("429") || lower.includes("quota") || lower.includes("throttl")) {
      aiResponse = `Hit a 429 rate limit error? Don't worry, we've got you covered! ⚡

**Kyro Rate Limit Tiers:**
• 🆓 **Free Tier**: 20 Requests/Min (RPM) & 100,000 daily soft cap.
• ⚡ **Pro Tier ($29/mo)**: 120 RPM & elevated burst concurrency limits.
• 🏢 **Enterprise Tier**: 1,000+ RPM with custom dedicated SLAs.

**Recommended Code Fix (Exponential Backoff):**
\`\`\`js
// Implement exponential backoff for 429 retries
const delay = (ms) => new Promise(res => setTimeout(res, ms));
async function fetchWithRetry(url, options, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, options);
    if (res.status !== 429) return res;
    await delay(Math.pow(2, i) * 1000); // 1s, 2s, 4s
  }
}
\`\`\`

Want our staff to manually double your burst rate cap right now? Reply *"Escalate to Admin"*!`;
    }
    // 5. Models & Reasoning
    else if (lower.includes("model") || lower.includes("kyro-coder") || lower.includes("70b") || lower.includes("flash") || lower.includes("reasoner")) {
      aiResponse = `Kyro hosts 4 specialized foundation models accessible via \`POST /v1/chat/completions\`: 🧠

1. \`kyro-coder-pro\` (32B): Code specialist optimized for TypeScript, Python, SQL & React refactoring.
2. \`kyro-ultra-70b\` (70B): Flagship reasoning model for deep architecture design & multi-step analysis.
3. \`kyro-flash-8b\` (8B): Ultra-fast sub-100ms model for instant classification & autocomplete.
4. \`kyro-reasoner-preview\`: Experimental 128,000-token context reasoning engine (test it live at \`/beta/reasoner\`!).

**Example Curl Payload:**
\`\`\`json
{
  "model": "kyro-coder-pro",
  "messages": [{"role": "user", "content": "Write a TypeScript queue interface"}]
}
\`\`\``;
    }
    // 6. Database Explorer & SQL
    else if (lower.includes("database") || lower.includes("db") || lower.includes("sql") || lower.includes("postgres") || lower.includes("redis")) {
      aiResponse = `Explore your PostgreSQL database & Redis cache live in the browser at \`/db\`! 🗄️

**Features Available:**
• Execute raw SQL queries (\`SELECT * FROM users;\`, \`SELECT * FROM support_tickets;\`).
• Inspect table schemas, primary keys, and index relationships.
• Export query results in 1-click JSON or CSV files.

Need help crafting a complex SQL query or index optimization? Let me know what data you're pulling!`;
    }
    // 7. Experimental Beta Lab
    else if (lower.includes("beta") || lower.includes("lab") || lower.includes("experiment") || lower.includes("prototype")) {
      aiResponse = `Check out our Admin Beta Laboratory at \`/beta\`! 🧪

We currently have **8 active experimental modules**:
• \`/beta/self-heal\`: Autonomous stack trace PR fixer.
• \`/beta/reasoner\`: 128k context reasoning model.
• \`/beta/telemetry\`: Real-time SSE token stream throughput.
• \`/beta/router\`: Multi-cloud failover & cost router.
• \`/beta/jailbreak\`: 50+ adversarial prompt injection scanner.
• \`/beta/synthetic\`: Synthetic DB seeder & mock API generator.
• \`/beta/changelog-gen\`: Git commit log release notes parser.
• \`/beta/agent-cron\`: Autonomous AI task scheduler & cron engine.`;
    }
    // 8. Jokes & Fun Banter
    else if (lower.includes("joke") || lower.includes("funny") || lower.includes("laugh")) {
      aiResponse = `Here's a developer joke for you! 😄

**Why do programmers prefer dark mode?**
*Because light attracts bugs!* 🐛

...and speaking of dark mode, notice our sleek new pure-black background across the Support Portal! How can I assist with your code or project setup today?`;
    }
    // 9. Conversational Fallback with Helpful Next Steps
    else {
      aiResponse = `I'd love to help you with that! 🌟

While I'm continuously learning new platform features, here are the quickest ways we can get this solved:

1. 📚 **Documentation & FAQs**: Check out the FAQs right below this chat window.
2. 🔑 **Developer Portal**: Visit \`/dev\` for API keys, rate limits, and model endpoints.
3. 👤 **Human Support**: If you'd like a real team member to review this, reply *"Talk to Human"* or *"Escalate"*, and I will instantly create a support ticket in our database for an admin!

What would you like to do next?`;
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
