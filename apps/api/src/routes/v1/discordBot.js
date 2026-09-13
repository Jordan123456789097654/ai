import { Router } from "express";
import { discordBot } from "../../services/discordBot.js";

const router = Router();

// GET /v1/discord/status - Inspect Bot connection status and logs
router.get("/status", (req, res) => {
  return res.json(discordBot.getStatus());
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

// POST /v1/discord/config - Update bot settings (token, presence, commandPrefix)
router.post("/config", async (req, res) => {
  const newConfig = req.body || {};
  const status = await discordBot.updateConfig(newConfig);
  return res.json(status);
});

// POST /v1/discord/test-chat - Simulate incoming Discord message
router.post("/test-chat", async (req, res) => {
  const { author = "DiscordUser", message = "Hello Kyro Bot!" } = req.body || {};
  const responseText = await discordBot.handleIncomingDiscordMessage(author, message);
  return res.json({ author, message, response: responseText });
});

export default router;
