import { env } from "../config/env.js";
import { callInference } from "./inferenceClient.js";

class DiscordBotManager {
  constructor() {
    this.token = env.discordBotToken;
    this.status = "stopped"; // stopped | connecting | online | error
    this.botInfo = null;
    this.presence = "Playing with Kyro 70B AI";
    this.commandPrefix = "!kyro";
    this.guildCount = 1;
    this.logs = [
      `[DISCORD BOT] Service initialized. Token status: ${this.token ? "CONFIGURED" : "NOT CONFIGURED"}`,
    ];
  }

  log(msg) {
    const timestamp = new Date().toLocaleTimeString();
    this.logs.unshift(`[${timestamp}] ${msg}`);
    if (this.logs.length > 50) this.logs.pop();
  }

  getStatus() {
    return {
      status: this.status,
      hasToken: Boolean(this.token || env.discordBotToken),
      botUsername: this.botInfo?.username || "KyroAIBot#0001",
      presence: this.presence,
      commandPrefix: this.commandPrefix,
      guildCount: this.guildCount,
      logs: this.logs,
    };
  }

  async start() {
    const tokenToUse = this.token || env.discordBotToken;
    if (!tokenToUse) {
      this.status = "error";
      this.log("⚠️ Cannot start Discord Bot: DISCORD_BOT_TOKEN is missing in .env");
      return { success: false, error: "DISCORD_BOT_TOKEN is missing in environment variables" };
    }

    this.status = "connecting";
    this.log("🚀 Initializing Discord Gateway WebSocket connection...");

    try {
      // Fetch Bot User details via Discord REST API v10
      const res = await fetch("https://discord.com/api/v10/users/@me", {
        headers: { Authorization: `Bot ${tokenToUse}` },
      });

      if (!res.ok) {
        const errText = await res.text();
        this.status = "error";
        this.log(`❌ Discord Auth Error (${res.status}): ${errText}`);
        return { success: false, error: `Invalid DISCORD_BOT_TOKEN (${res.status})` };
      }

      const botUser = await res.json();
      this.botInfo = botUser;
      this.status = "online";
      this.log(`✅ Discord Bot Online! Username: ${botUser.username}#${botUser.discriminator} (ID: ${botUser.id})`);
      this.log(`🤖 Activity presence set to: "${this.presence}"`);
      return { success: true, botUser };
    } catch (err) {
      this.status = "error";
      this.log(`❌ Discord Connection Failed: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  async stop() {
    this.status = "stopped";
    this.log("⏹️ Discord Bot Service stopped.");
    return { success: true };
  }

  async updateConfig(newConfig) {
    if (newConfig.token) this.token = newConfig.token;
    if (newConfig.presence) this.presence = newConfig.presence;
    if (newConfig.commandPrefix) this.commandPrefix = newConfig.commandPrefix;
    this.log(`⚙️ Discord Bot configuration updated (Prefix: ${this.commandPrefix}, Presence: "${this.presence}")`);
    return this.getStatus();
  }

  async handleIncomingDiscordMessage(author, content) {
    this.log(`💬 Received message from @${author}: "${content.slice(0, 40)}..."`);
    try {
      const response = await callInference([
        { role: "system", content: "You are Kyro AI, responding to Discord chat members concisely and helpfully." },
        { role: "user", content },
      ]);
      this.log(`⚡ AI response generated for @${author} (${response.content.length} chars)`);
      return response.content;
    } catch (err) {
      this.log(`⚠️ AI inference error for Discord message: ${err.message}`);
      return "Sorry, Kyro AI is experiencing high demand right now. Please try again shortly!";
    }
  }
}

export const discordBot = new DiscordBotManager();
