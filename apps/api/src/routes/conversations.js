import { requireSession } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";

/** Backs the web chat's sidebar history — session-authenticated only. */
export default async function conversationsRoutes(fastify) {
  fastify.addHook("preHandler", requireSession);

  fastify.get("/conversations", { schema: { tags: ["chat-history"] } }, async (request) => {
    return prisma.conversation.findMany({
      where: { userId: request.user.id },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, updatedAt: true },
    });
  });

  fastify.get("/conversations/:id", { schema: { tags: ["chat-history"] } }, async (request, reply) => {
    const convo = await prisma.conversation.findFirst({
      where: { id: request.params.id, userId: request.user.id },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
    if (!convo) return reply.code(404).send({ error: { message: "Not found" } });
    return convo;
  });

  fastify.post("/conversations", { schema: { tags: ["chat-history"] } }, async (request) => {
    return prisma.conversation.create({
      data: { userId: request.user.id, title: request.body?.title || "New chat" },
    });
  });

  fastify.post("/conversations/:id/messages", { schema: { tags: ["chat-history"] } }, async (request, reply) => {
    const convo = await prisma.conversation.findFirst({
      where: { id: request.params.id, userId: request.user.id },
    });
    if (!convo) return reply.code(404).send({ error: { message: "Not found" } });

    const { role, content } = request.body;
    const message = await prisma.message.create({ data: { conversationId: convo.id, role, content } });
    await prisma.conversation.update({ where: { id: convo.id }, data: { updatedAt: new Date() } });
    return message;
  });
}
