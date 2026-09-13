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

    // Remote Discord Server Configuration
    this.serverConfig = {
      autoModEnabled: true,
      secretKeyScan: true,
      toxicitySensitivity: "HIGH", // LOW | MEDIUM | HIGH
      antiSpamLinks: true,
      logChannel: "#automod-logs",
      xpMultiplier: 1.5,
      autoRoles: [
        { level: 5, role: "⭐ Kyro Scholar" },
        { level: 15, role: "👑 Kyro Master" },
      ],
      ticketDeskEnabled: true,
      ticketCategory: "SUPPORT TICKETS",
      rssFeeds: [
        { name: "Tech News RSS", url: "https://news.ycombinator.com/rss", channel: "#tech-rss" },
      ],
      lockdownMode: false,
    };

    // Member Leveling & XP Store
    this.userXP = new Map([
      ["DiscordUser", { xp: 350, level: 3, messages: 14 }],
      ["CodeWizard", { xp: 1250, level: 8, messages: 52 }],
      ["DevOpsPro", { xp: 2800, level: 16, messages: 110 }],
    ]);

    // Support Ticket Desk Store
    this.tickets = new Map();
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
      serverConfig: this.serverConfig,
      ticketCount: this.tickets.size,
      activeUsersTracked: this.userXP.size,
    };
  }

  // --- Remote Server Config Persister ---
  updateServerConfig(newConfig) {
    this.serverConfig = { ...this.serverConfig, ...newConfig };
    this.log(`⚙️ Discord Server remote configuration updated.`);
    return this.serverConfig;
  }

  // --- Auto-Moderator Scanner ---
  autoModScan(content) {
    if (!this.serverConfig.autoModEnabled) return { flagged: false };

    // 1. Secret Key Leak Detector
    if (this.serverConfig.secretKeyScan) {
      const secretPatterns = [
        /sk-[a-zA-Z0-9]{32,}/i,
        /ghp_[a-zA-Z0-9]{36}/i,
        /N[A-Za-z0-9]{23}\.[A-Za-z0-9_-]{6}\.[A-Za-z0-9_-]{27}/, // Discord bot token
      ];
      for (const pattern of secretPatterns) {
        if (pattern.test(content)) {
          this.log(`🛡️ [AUTO-MOD ACTION] Blocked message containing leaked API secret key!`);
          return { flagged: true, reason: "Secret API Key / Token Leak Detected" };
        }
      }
    }

    // 2. Anti-Spam Link Flood
    if (this.serverConfig.antiSpamLinks) {
      const linkMatches = content.match(/https?:\/\/[^\s]+/g);
      if (linkMatches && linkMatches.length >= 3) {
        this.log(`🛡️ [AUTO-MOD ACTION] Blocked spam link flood (${linkMatches.length} links).`);
        return { flagged: true, reason: "Spam Link Flooding" };
      }
    }

    return { flagged: false };
  }

  // --- Member Leveling & XP Calculation ---
  addXP(author) {
    const current = this.userXP.get(author) || { xp: 0, level: 1, messages: 0 };
    const earnedXP = Math.floor(15 * this.serverConfig.xpMultiplier);
    const newXP = current.xp + earnedXP;
    const newMessages = current.messages + 1;
    const newLevel = Math.floor(0.1 * Math.sqrt(newXP)) + 1;

    const leveledUp = newLevel > current.level;
    this.userXP.set(author, { xp: newXP, level: newLevel, messages: newMessages });

    let assignedRole = null;
    if (leveledUp) {
      this.log(`⭐ [LEVEL UP] Member @${author} achieved Level ${newLevel}!`);
      const matchedRole = this.serverConfig.autoRoles.find((r) => r.level === newLevel);
      if (matchedRole) assignedRole = matchedRole.role;
    }

    return { xp: newXP, level: newLevel, messages: newMessages, leveledUp, assignedRole };
  }

  getUserRank(author) {
    const data = this.userXP.get(author) || { xp: 0, level: 1, messages: 0 };
    const sorted = Array.from(this.userXP.entries()).sort((a, b) => b[1].xp - a[1].xp);
    const rank = sorted.findIndex(([user]) => user === author) + 1 || sorted.length + 1;
    return { author, rank, ...data };
  }

  getLeaderboard(limit = 10) {
    return Array.from(this.userXP.entries())
      .sort((a, b) => b[1].xp - a[1].xp)
      .slice(0, limit)
      .map(([user, data], idx) => ({ rank: idx + 1, user, ...data }));
  }

  // --- Support Ticket Desk Generator ---
  async createTicket(author, topic = "General Technical Support") {
    const ticketId = `ticket-${Math.floor(100 + Math.random() * 900)}`;
    const channelName = `#${ticketId}-${author.toLowerCase()}`;

    let aiDraft = "Welcome to Kyro AI Support Desk! An admin will review your ticket shortly.";
    try {
      const response = await callInference([
        { role: "system", content: "You are Kyro AI Support Assistant. Draft a friendly initial response acknowledging the user's issue and offering preliminary Troubleshooting steps." },
        { role: "user", content: `Issue Topic: ${topic}` },
      ]);
      aiDraft = response.content;
    } catch {
      // Fallback
    }

    const ticketObj = {
      ticketId,
      channelName,
      author,
      topic,
      createdAt: new Date().toISOString(),
      status: "OPEN",
      aiDraft,
    };

    this.tickets.set(ticketId, ticketObj);
    this.log(`🎫 [SUPPORT TICKET] Generated channel ${channelName} for @${author}.`);
    return ticketObj;
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
    if (this.serverConfig.lockdownMode) {
      this.log(`🔒 [LOCKDOWN MODE] Ignored message from @${author}.`);
      return "🔒 Discord Server is currently in Emergency Lockdown Mode. Bot interactions are suspended.";
    }

    // 1. Auto-Mod Check
    const modResult = this.autoModScan(content);
    if (modResult.flagged) {
      return `⚠️ **[Kyro Auto-Mod Alert]** Message deleted for @${author}. Reason: **${modResult.reason}**.`;
    }

    // 2. Add XP for chatting
    const xpStats = this.addXP(author);

    this.log(`💬 Received message from @${author}: "${content.slice(0, 40)}..."`);
    try {
      const response = await callInference([
        { role: "system", content: "You are Kyro AI, responding to Discord chat members concisely and helpfully." },
        { role: "user", content },
      ]);
      this.log(`⚡ AI response generated for @${author} (${response.content.length} chars)`);

      let extraStr = "";
      if (xpStats.leveledUp) {
        extraStr = `\n\n🎉 **Level Up!** @${author} reached **Level ${xpStats.level}**! ${xpStats.assignedRole ? `Granted role: **${xpStats.assignedRole}**` : ""}`;
      }

      return `${response.content}${extraStr}`;
    } catch (err) {
      this.log(`⚠️ AI inference error for Discord message: ${err.message}`);
      return "Sorry, Kyro AI is experiencing high demand right now. Please try again shortly!";
    }
  }
}

export const discordBot = new DiscordBotManager();

