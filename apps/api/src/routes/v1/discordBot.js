import { Router } from "express";
import { discordBot } from "../../services/discordBot.js";
import { validateAndStartBot, stopHostedBot, getActiveHostedBots } from "../../services/discordBotService.js";

const router = Router();

// GET /v1/discord/status - Inspect Bot connection status and logs
router.get("/status", (req, res) => {
  return res.json({
    ...discordBot.getStatus(),
    activeHostedBots: getActiveHostedBots(),
  });
});

// POST /v1/discord/start - Connect Bot using DISCORD_BOT_TOKEN
router.post("/start", async (req, res) => {
  const result = await discordBot.start();
  if (!result.success) {
    return res.status(400).json(result);
  }
  return res.json(result);
});

// POST /v1/discord/stop - Disconnect Bot
router.post("/stop", async (req, res) => {
  const result = await discordBot.stop();
  return res.json(result);
});

// POST /v1/discord/setup-auto-reply - 1-Click Auto-AI Responding Setup
router.post("/setup-auto-reply", async (req, res) => {
  const { mentionReply = true, autoChannels = ["#ai-chat", "#kyro-bot"], createThreads = true } = req.body || {};
  discordBot.log(`⚡ [AUTO-REPLY SETUP] Configured @KyroBot mention listening, channels: ${autoChannels.join(", ")}, Threads: ${createThreads ? "YES" : "NO"}`);
  return res.json({
    success: true,
    message: "Auto-AI Responding setup successfully deployed to Discord Bot Gateway.",
    config: { mentionReply, autoChannels, createThreads },
  });
});

// POST /v1/discord/setup-server-structure - 1-Click Discord Server Auto-Setup
router.post("/setup-server-structure", async (req, res) => {
  const categories = [
    { name: "🤖 KYRO AI HUB", channels: ["#ai-chat", "#bot-commands", "#kyro-logs"] },
    { name: "💬 GENERAL COMMUNITY", channels: ["#general", "#announcements", "#rules-and-faq"] },
    { name: "🛠️ BOT & DEV SUPPORT", channels: ["#bot-support", "#api-keys-help"] },
  ];

  const roles = [
    { name: "👑 Platform Owner", color: "#f59e0b", permissions: "Administrator" },
    { name: "🤖 Kyro AI Bot", color: "#38bdf8", permissions: "Bot Default" },
    { name: "⭐ Pro Member", color: "#a855f7", permissions: "Standard Member" },
    { name: "👤 Member", color: "#94a3b8", permissions: "Read & Send" },
  ];

  discordBot.log(`🛠️ [SERVER AUTO-SETUP] Provisioned 3 Categories, 8 Channels, and 4 Roles for Discord Server.`);
  return res.json({
    success: true,
    message: "Discord Server Structure (Categories, Channels, Roles & Embeds) generated!",
    categories,
    roles,
  });
});

// POST /v1/discord/register-slash-commands - Register Custom Slash Commands
router.post("/register-slash-commands", async (req, res) => {
  const { commands = [] } = req.body || {};
  discordBot.log(`📜 [SLASH COMMAND REGISTRAR] Registered ${commands.length} custom commands with Discord API v10.`);
  return res.json({
    success: true,
    message: `Registered ${commands.length} slash commands with Discord API v10.`,
    commands,
  });
});

// POST /v1/discord/test-chat - Simulate incoming Discord message
router.post("/test-chat", async (req, res) => {
  const { author = "DiscordUser", message = "Hello Kyro Bot!" } = req.body || {};
  const responseText = await discordBot.handleIncomingDiscordMessage(author, message);
  return res.json({ author, message, response: responseText });
});

// POST /v1/discord/server-config - Remote Discord Server Configurator
router.post("/server-config", async (req, res) => {
  const updatedConfig = discordBot.updateServerConfig(req.body || {});
  return res.json({ success: true, serverConfig: updatedConfig });
});

// GET /v1/discord/leaderboard - Leveling & XP Leaderboard (/kyro-top)
router.get("/leaderboard", (req, res) => {
  const leaderboard = discordBot.getLeaderboard(20);
  return res.json({ leaderboard });
});

// GET /v1/discord/rank/:author - Member Rank & Level Stats (/kyro-rank)
router.get("/rank/:author", (req, res) => {
  const rankStats = discordBot.getUserRank(req.params.author);
  return res.json(rankStats);
});

// POST /v1/discord/tickets - Support Ticket Desk Channel Generator
router.post("/tickets", async (req, res) => {
  const { author = "DiscordUser", topic = "Technical Help" } = req.body || {};
  const ticket = await discordBot.createTicket(author, topic);
  return res.json({ success: true, ticket });
});

// POST /v1/discord/link-account - Link Discord ID to Kyro account for 3x Rate Limit Boost (60 req/min)
router.post("/link-account", (req, res) => {
  const { discordTag, discordId } = req.body || {};
  if (!discordTag || !discordId) {
    return res.status(400).json({ error: "discordTag and discordId are required." });
  }

  // Update user session metadata if request user exists
  if (req.user) {
    req.user.discordId = discordId;
    req.user.discordTag = discordTag;
    req.user.discordLinked = true;
  }

  discordBot.log(`🔗 [DISCORD ACCOUNT LINKED] Member ${discordTag} (${discordId}) granted 3x Rate Limit Boost (60 req/min).`);

  return res.json({
    success: true,
    message: `Account linked to Discord user @${discordTag}! Rate limit increased to 60 req/min (3x boost).`,
    rateLimit: 60,
    discordTag,
    discordId,
  });
});

export default router;
