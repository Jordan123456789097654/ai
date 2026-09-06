import { requireSession } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";

/** Backs the web chat's sidebar history & public conversation sharing. */
export default async function conversationsRoutes(fastify) {
  // Public route for shareable links
  fastify.get("/share/:id", { schema: { tags: ["chat-history"] } }, async (request, reply) => {
    const convo = await prisma.conversation.findUnique({
      where: { id: request.params.id },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
    if (!convo) return reply.code(404).send({ error: { message: "Shared conversation not found" } });
    return { title: convo.title, createdAt: convo.createdAt, messages: convo.messages };
  });

  // Session-protected routes
  fastify.register(async function protectedRoutes(protectedFastify) {
    protectedFastify.addHook("preHandler", requireSession);

    protectedFastify.get("/conversations", { schema: { tags: ["chat-history"] } }, async (request) => {
      return prisma.conversation.findMany({
        where: { userId: request.user.id },
        orderBy: { updatedAt: "desc" },
        select: { id: true, title: true, updatedAt: true },
      });
    });

    protectedFastify.get("/conversations/:id", { schema: { tags: ["chat-history"] } }, async (request, reply) => {
      const convo = await prisma.conversation.findFirst({
        where: { id: request.params.id, userId: request.user.id },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      });
      if (!convo) return reply.code(404).send({ error: { message: "Not found" } });
      return convo;
    });

    protectedFastify.post("/conversations", { schema: { tags: ["chat-history"] } }, async (request) => {
      return prisma.conversation.create({
        data: { userId: request.user.id, title: request.body?.title || "New chat" },
      });
    });

    protectedFastify.post("/conversations/:id/messages", { schema: { tags: ["chat-history"] } }, async (request, reply) => {
      const convo = await prisma.conversation.findFirst({
        where: { id: request.params.id, userId: request.user.id },
      });
      if (!convo) return reply.code(404).send({ error: { message: "Not found" } });

      const { role, content } = request.body;
      const message = await prisma.message.create({ data: { conversationId: convo.id, role, content } });
      await prisma.conversation.update({ where: { id: convo.id }, data: { updatedAt: new Date() } });
      return message;
    });
  });
}
