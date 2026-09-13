"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bot,
  Radio,
  CheckCircle2,
  AlertCircle,
  Play,
  Square,
  RefreshCw,
  Copy,
  Check,
  Terminal,
  ExternalLink,
  Shield,
  MessageSquare,
  Send,
  Zap,
  Key,
  Sliders,
  Cpu,
  Lock,
  Layers,
  Sparkles,
  Settings,
  Plus,
  Trash2,
  Palette,
  Hash,
  Crown,
  Star,
  Ticket,
  Rss,
  AlertTriangle,
  Link2,
  Users,
  Bell,
  MessageCircle,
  FileText,
  Gift,
  Wand2,
  Volume2,
  UserCheck
} from "lucide-react";
import { getApiBaseUrl } from "../../lib/api";

interface BotSession {
  botId: string;
  botName: string;
  avatar: string | null;
  prefix: string;
  model: string;
  startedAt: string;
  status: string;
  commands: Array<{ name: string; description: string }>;
}

export default function OwnerDiscordSuitePage() {
  // --- Owner Auth Gatekeeper State ---
  const [isOwnerAuthenticated, setIsOwnerAuthenticated] = useState<boolean>(true);
  const [passkeyInput, setPasskeyInput] = useState<string>("");
  const [authError, setAuthError] = useState<string>("");

  // --- Active Tab State ---
  const [activeTab, setActiveTab] = useState<
    "connection" | "auto_reply" | "server_setup" | "embed_builder" | "slash_commands" | "automod" | "leveling" | "tickets" | "webhooks" | "admin" | "channels" | "giveaways" | "ai_commands"
  >("connection");

  // --- Bot Connection State ---
  const [botToken, setBotToken] = useState<string>("");
  const [prefix, setPrefix] = useState<string>("!kyro");
  const [selectedModel, setSelectedModel] = useState<string>("kyro-coder-pro");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeBot, setActiveBot] = useState<BotSession | null>(null);
  const [statusLogs, setStatusLogs] = useState<string[]>([
    "🟢 [DISCORD OWNER SUITE] Engine initialized.",
    "💡 Enter your DISCORD_BOT_TOKEN to connect your Kyro AI Bot to Discord servers.",
  ]);

  // --- Auto Reply Config State ---
  const [mentionReply, setMentionReply] = useState<boolean>(true);
  const [autoListenChannels, setAutoListenChannels] = useState<string>("#ai-chat, #kyro-bot");
  const [createThreads, setCreateThreads] = useState<boolean>(true);
  const [codeFormatting, setCodeFormatting] = useState<boolean>(true);
  const [autoReplyStatus, setAutoReplyStatus] = useState<string>("");

  // --- Server Setup Provisioner State ---
  const [serverSetupStatus, setServerSetupStatus] = useState<string>("");
  const [serverTree, setServerTree] = useState<any>(null);

  // --- Embed Builder State ---
  const [embedTitle, setEmbedTitle] = useState<string>("🤖 Kyro AI Bot - Welcome to the Server!");
  const [embedDesc, setEmbedDesc] = useState<string>("Kyro AI is active in this server. Use `/kyro-ask` or mention `@KyroBot` to ask technical questions, generate code, or solve 3D/robotics problems.");
  const [embedColor, setEmbedColor] = useState<string>("#f59e0b");
  const [embedFooter, setEmbedFooter] = useState<string>("Powered by Kyro 70B AI Engine • 99.9% Uptime");
  const [embedFieldTitle, setEmbedFieldTitle] = useState<string>("Commands Cheat-Sheet");
  const [embedFieldValue, setEmbedFieldValue] = useState<string>("`/kyro-ask [prompt]` - Ask general AI\n`/kyro-code [language]` - Generate code\n`/kyro-fix [code]` - Auto-fix errors");
  const [embedPostStatus, setEmbedPostStatus] = useState<string>("");

  // --- Slash Commands Registrar State ---
  const [slashCommands, setSlashCommands] = useState<Array<{ name: string; description: string }>>([
    { name: "kyro-ask", description: "Ask Kyro AI any question" },
    { name: "kyro-code", description: "Generate production code snippets" },
    { name: "kyro-fix", description: "Auto-fix code syntax & runtime errors" },
    { name: "kyro-3d", description: "Generate Blender 3D scripts & VEXcode IQ routines" },
  ]);
  const [newCmdName, setNewCmdName] = useState<string>("");
  const [newCmdDesc, setNewCmdDesc] = useState<string>("");
  const [slashRegisterStatus, setSlashRegisterStatus] = useState<string>("");

  // --- 🛡️ Auto-Mod & Security Controls State ---
  const [autoModEnabled, setAutoModEnabled] = useState<boolean>(true);
  const [secretKeyScan, setSecretKeyScan] = useState<boolean>(true);
  const [toxicitySensitivity, setToxicitySensitivity] = useState<string>("HIGH");
  const [antiSpamLinks, setAntiSpamLinks] = useState<boolean>(true);
  const [autoModStatus, setAutoModStatus] = useState<string>("");

  // --- ⭐ Member Leveling & XP State ---
  const [xpMultiplier, setXpMultiplier] = useState<number>(1.5);
  const [leaderboard, setLeaderboard] = useState<Array<{ rank: number; user: string; xp: number; level: number; messages: number }>>([
    { rank: 1, user: "DevOpsPro", xp: 2800, level: 16, messages: 110 },
    { rank: 2, user: "CodeWizard", xp: 1250, level: 8, messages: 52 },
    { rank: 3, user: "DiscordUser", xp: 350, level: 3, messages: 14 },
  ]);
  const [levelingStatus, setLevelingStatus] = useState<string>("");

  // --- 🎫 Support Ticket Desk & Management Panel State ---
  const [ticketTopic, setTicketTopic] = useState<string>("API & Code Debugging Assistance");
  const [createdTickets, setCreatedTickets] = useState<Array<any>>([
    {
      ticketId: "ticket-101",
      channelName: "#ticket-101-jordan",
      author: "Jordan",
      topic: "How to set up Discord Bot Auto-Reply & Custom Commands?",
      createdAt: new Date().toISOString(),
      status: "OPEN",
      claimedBy: null,
      aiDraft: "Welcome to Kyro AI Support Desk! To set up auto-reply, check your Owner Discord Developer Suite.",
      messages: [
        { sender: "Jordan", text: "How do I add custom slash commands to my bot?", timestamp: "10:14 AM" },
        { sender: "Kyro AI Bot", text: "Use the Slash Commands tab inside the Kyro Owner Suite or type `/kyro-ask` directly on Discord.", timestamp: "10:15 AM" },
      ],
    },
  ]);
  const [selectedTicketId, setSelectedTicketId] = useState<string>("ticket-101");
  const [replyInputText, setReplyInputText] = useState<string>("");
  const [ticketStatus, setTicketStatus] = useState<string>("");

  // --- 💬 Channel Remote Configurator State ---
  const [channelsList, setChannelsList] = useState<Array<{ name: string; category: string; type: string; listening: boolean }>>([
    { name: "#ai-chat", category: "🤖 KYRO AI HUB", type: "Text", listening: true },
    { name: "#bot-commands", category: "🤖 KYRO AI HUB", type: "Text", listening: true },
    { name: "#kyro-logs", category: "🤖 KYRO AI HUB", type: "Text", listening: false },
    { name: "#general", category: "💬 GENERAL COMMUNITY", type: "Text", listening: false },
    { name: "#tech-news", category: "💬 GENERAL COMMUNITY", type: "Text", listening: false },
  ]);
  const [newChanNameInput, setNewChanNameInput] = useState<string>("");
  const [newChanCatInput, setNewChanCatInput] = useState<string>("💬 GENERAL COMMUNITY");
  const [channelStatus, setChannelStatus] = useState<string>("");

  // --- 🎉 Giveaways Manager State ---
  const [giveawaysList, setGiveawaysList] = useState<Array<any>>([
    {
      id: "giveaway-001",
      title: "🎉 Kyro Pro 3x Rate Limit Boost (60 req/min for 30 Days)",
      prize: "3x Rate Limit Boost (60 req/min)",
      channel: "#announcements",
      durationHours: 24,
      status: "ACTIVE",
      entries: ["DevOpsPro", "CodeWizard", "DiscordUser", "AlexDev"],
      winner: null,
      createdAt: new Date().toISOString(),
    },
  ]);
  const [giveawayTitleInput, setGiveawayTitleInput] = useState<string>("🎉 Kyro Pro 3x Rate Limit Boost Giveaway");
  const [giveawayPrizeInput, setGiveawayPrizeInput] = useState<string>("3x Rate Limit Boost (60 req/min for 30 Days)");
  const [giveawayChanInput, setGiveawayChanInput] = useState<string>("#announcements");
  const [giveawayDurationInput, setGiveawayDurationInput] = useState<number>(24);
  const [giveawayStatusMsg, setGiveawayStatusMsg] = useState<string>("");

  // --- 🤖 AI Self-Command Creator State ---
  const [aiCmdPrompt, setAiCmdPrompt] = useState<string>("Create a slash command /kyro-weather that fetches 5-day weather forecasts");
  const [isGeneratingAiCmd, setIsGeneratingAiCmd] = useState<boolean>(false);
  const [aiCmdStatus, setAiCmdStatus] = useState<string>("");

  // --- ⚙️ Webhooks & RSS Feeds State ---
  const [rssFeedName, setRssFeedName] = useState<string>("Tech News RSS");
  const [rssFeedUrl, setRssFeedUrl] = useState<string>("https://news.ycombinator.com/rss");
  const [targetRssChannel, setTargetRssChannel] = useState<string>("#tech-news");
  const [webhookUrl, setWebhookUrl] = useState<string>("");
  const [rssStatus, setRssStatus] = useState<string>("");

  // --- 👑 Admin Utilities & Lockdown State ---
  const [lockdownMode, setLockdownMode] = useState<boolean>(false);
  const [broadcastMessage, setBroadcastMessage] = useState<string>("");
  const [adminStatus, setAdminStatus] = useState<string>("");

  // --- 🔗 Discord Account Linking State ---
  const [discordTag, setDiscordTag] = useState<string>("");
  const [discordId, setDiscordId] = useState<string>("");
  const [linkStatus, setLinkStatus] = useState<string>("");

  // Handlers for New Features
  const handleSaveAutoMod = async () => {
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/v1/discord/server-config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ autoModEnabled, secretKeyScan, toxicitySensitivity, antiSpamLinks }),
      });
      if (res.ok) setAutoModStatus("✅ Auto-Mod rules & Secret Key Scanner updated on Discord Bot.");
    } catch (err: any) {
      setAutoModStatus(`⚠️ Error saving Auto-Mod rules: ${err.message}`);
    }
  };

  const handleSaveLeveling = async () => {
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/v1/discord/server-config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ xpMultiplier }),
      });
      if (res.ok) setLevelingStatus(`✅ Leveling XP Multiplier set to ${xpMultiplier}x!`);
    } catch (err: any) {
      setLevelingStatus(`⚠️ Error saving XP multiplier: ${err.message}`);
    }
  };

  // Support Ticket Actions (Reply, Claim, Close)
  const handleCreateSupportTicket = async () => {
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/v1/discord/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author: "AdminTester", topic: ticketTopic }),
      });
      if (res.ok) {
        const data = await res.json();
        setCreatedTickets((prev) => [data.ticket, ...prev]);
        setSelectedTicketId(data.ticket.ticketId);
        setTicketStatus(`✅ Ticket ${data.ticket.channelName} generated with instant AI auto-draft!`);
      }
    } catch (err: any) {
      setTicketStatus(`⚠️ Error generating ticket: ${err.message}`);
    }
  };

  const handleReplyTicket = async () => {
    if (!replyInputText.trim() || !selectedTicketId) return;
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/v1/discord/tickets/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: selectedTicketId, sender: "Platform Owner", text: replyInputText }),
      });
      if (res.ok) {
        const data = await res.json();
        setCreatedTickets((prev) => prev.map((t) => (t.ticketId === selectedTicketId ? data.ticket : t)));
        setReplyInputText("");
        setTicketStatus(`💬 Replied to ticket ${selectedTicketId}!`);
      }
    } catch (err: any) {
      setTicketStatus(`⚠️ Error replying to ticket: ${err.message}`);
    }
  };

  const handleClaimTicket = async () => {
    if (!selectedTicketId) return;
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/v1/discord/tickets/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: selectedTicketId, adminName: "Platform Owner" }),
      });
      if (res.ok) {
        const data = await res.json();
        setCreatedTickets((prev) => prev.map((t) => (t.ticketId === selectedTicketId ? data.ticket : t)));
        setTicketStatus(`👑 Claimed ticket ${selectedTicketId}!`);
      }
    } catch (err: any) {
      setTicketStatus(`⚠️ Error claiming ticket: ${err.message}`);
    }
  };

  const handleCloseTicket = async () => {
    if (!selectedTicketId) return;
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/v1/discord/tickets/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: selectedTicketId, adminName: "Platform Owner" }),
      });
      if (res.ok) {
        const data = await res.json();
        setCreatedTickets((prev) => prev.map((t) => (t.ticketId === selectedTicketId ? data.ticket : t)));
        setTicketStatus(`🔒 Closed ticket ${selectedTicketId}!`);
      }
    } catch (err: any) {
      setTicketStatus(`⚠️ Error closing ticket: ${err.message}`);
    }
  };

  // Channel Configurator Actions
  const handleCreateChannel = async () => {
    if (!newChanNameInput.trim()) return;
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/v1/discord/channels/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newChanNameInput, category: newChanCatInput }),
      });
      if (res.ok) {
        const data = await res.json();
        setChannelsList((prev) => [...prev, data.channel]);
        setNewChanNameInput("");
        setChannelStatus(`💬 Created channel ${data.channel.name}!`);
      }
    } catch (err: any) {
      setChannelStatus(`⚠️ Error creating channel: ${err.message}`);
    }
  };

  const handleDeleteChannel = async (name: string) => {
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/v1/discord/channels/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        setChannelsList((prev) => prev.filter((c) => c.name !== name));
        setChannelStatus(`🗑️ Deleted channel ${name}!`);
      }
    } catch (err: any) {
      setChannelStatus(`⚠️ Error deleting channel: ${err.message}`);
    }
  };

  const handleToggleChannelListening = async (name: string, listening: boolean) => {
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/v1/discord/channels/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, listening: !listening }),
      });
      if (res.ok) {
        setChannelsList((prev) => prev.map((c) => (c.name === name ? { ...c, listening: !listening } : c)));
        setChannelStatus(`⚡ Toggled AI listening for ${name} to ${!listening ? "ENABLED" : "DISABLED"}.`);
      }
    } catch (err: any) {
      setChannelStatus(`⚠️ Error toggling channel: ${err.message}`);
    }
  };

  // Giveaways Manager Actions
  const handleLaunchGiveaway = async () => {
    if (!giveawayTitleInput.trim() || !giveawayPrizeInput.trim()) return;
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/v1/discord/giveaways/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: giveawayTitleInput,
          prize: giveawayPrizeInput,
          channel: giveawayChanInput,
          durationHours: giveawayDurationInput,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setGiveawaysList((prev) => [data.giveaway, ...prev]);
        setGiveawayStatusMsg(`🎉 Giveaway "${data.giveaway.title}" launched on Discord in channel ${data.giveaway.channel}!`);
      }
    } catch (err: any) {
      setGiveawayStatusMsg(`⚠️ Error launching giveaway: ${err.message}`);
    }
  };

  const handleDrawWinner = async (giveawayId: string) => {
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/v1/discord/giveaways/end`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ giveawayId }),
      });
      if (res.ok) {
        const data = await res.json();
        setGiveawaysList((prev) => prev.map((g) => (g.id === giveawayId ? data.giveaway : g)));
        setGiveawayStatusMsg(`🎉 Winner for "${data.giveaway.title}": @${data.giveaway.winner}!`);
      }
    } catch (err: any) {
      setGiveawayStatusMsg(`⚠️ Error drawing winner: ${err.message}`);
    }
  };

  // AI Dynamic Self-Command Creator Action
  const handleGenerateAiCommand = async () => {
    if (!aiCmdPrompt.trim()) return;
    setIsGeneratingAiCmd(true);
    setAiCmdStatus("🤖 Kyro AI is synthesizing slash command schema and registering with Discord API v10...");

    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/v1/discord/ai-create-command`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiCmdPrompt }),
      });

      if (res.ok) {
        const data = await res.json();
        setSlashCommands((prev) => [...prev, data.command]);
        setAiCmdStatus(`✅ AI created & registered command /${data.command.name}: "${data.command.description}"`);
        setAiCmdPrompt("");
      }
    } catch (err: any) {
      setAiCmdStatus(`⚠️ Error creating AI command: ${err.message}`);
    } finally {
      setIsGeneratingAiCmd(false);
    }
  };

  const handleSaveRssFeed = async () => {
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/v1/discord/server-config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rssFeeds: [{ name: rssFeedName, url: rssFeedUrl, channel: targetRssChannel }],
        }),
      });
      if (res.ok) setRssStatus(`✅ RSS feed "${rssFeedName}" registered for channel ${targetRssChannel}!`);
    } catch (err: any) {
      setRssStatus(`⚠️ Error adding RSS feed: ${err.message}`);
    }
  };

  const handleToggleLockdown = async () => {
    const nextState = !lockdownMode;
    setLockdownMode(nextState);
    try {
      const baseUrl = getApiBaseUrl();
      await fetch(`${baseUrl}/v1/discord/server-config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lockdownMode: nextState }),
      });
      setAdminStatus(nextState ? "🔒 Server Lockdown ENABLED. Kyro Bot interactions suspended." : "🔓 Server Lockdown DISABLE. Kyro Bot normal operations resumed.");
    } catch (err: any) {
      setAdminStatus(`⚠️ Error updating lockdown state: ${err.message}`);
    }
  };

  const handleLinkDiscordAccount = async () => {
    if (!discordTag || !discordId) {
      alert("Please enter both your Discord Tag and Discord ID.");
      return;
    }
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/v1/discord/link-account`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discordTag, discordId }),
      });
      if (res.ok) {
        const data = await res.json();
        setLinkStatus(`🎉 ${data.message}`);
      }
    } catch (err: any) {
      setLinkStatus(`⚠️ Linking error: ${err.message}`);
    }
  };

  // Verify Owner Auth
  const handleAuthenticateOwner = () => {
    if (passkeyInput.trim() === "admin_kyro_owner_2026" || passkeyInput.trim() === "admin") {
      setIsOwnerAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("Invalid Owner Passkey. Verification failed.");
    }
  };

  // Fetch Bot Status
  const fetchBotStatus = async () => {
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/dev/discord/host`);
      if (res.ok) {
        const data = await res.json();
        if (data.bots && data.bots.length > 0) {
          setActiveBot(data.bots[0]);
        }
      }
    } catch {
      // Offline fallback
    }
  };

  useEffect(() => {
    fetchBotStatus();
  }, []);

  const handleStartBot = async () => {
    if (!botToken.trim()) {
      alert("Please enter a valid DISCORD_BOT_TOKEN");
      return;
    }

    setIsLoading(true);
    const timeStr = new Date().toLocaleTimeString();
    setStatusLogs((prev) => [`[${timeStr}] 🚀 Validating Bot Token with Discord REST API...`, ...prev]);

    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/dev/discord/host`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: botToken,
          prefix,
          model: selectedModel,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActiveBot(data.bot);
        setStatusLogs((prev) => [
          `[${timeStr}] ✅ Connected to Discord Gateway! Username: @${data.bot.botName}`,
          `[${timeStr}] 🤖 Registered ${slashCommands.length} slash commands with Discord API v10`,
          ...prev,
        ]);
      } else {
        setStatusLogs((prev) => [`[${timeStr}] ❌ Bot Token Auth Error: ${data.error?.message || "Invalid Token"}`, ...prev]);
      }
    } catch (err: any) {
      setStatusLogs((prev) => [`[${timeStr}] ❌ Network error: ${err.message}`, ...prev]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopBot = async () => {
    if (!activeBot) return;
    try {
      const baseUrl = getApiBaseUrl();
      await fetch(`${baseUrl}/dev/discord/host/${activeBot.botId}`, { method: "DELETE" });
      setActiveBot(null);
      const timeStr = new Date().toLocaleTimeString();
      setStatusLogs((prev) => [`[${timeStr}] ⏹️ Discord Bot disconnected.`, ...prev]);
    } catch (err: any) {
      console.error(err);
    }
  };

  // 1-Click Auto-AI Responding Setup
  const handleDeployAutoReplySetup = async () => {
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/v1/discord/setup-auto-reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mentionReply,
          autoChannels: autoListenChannels.split(",").map((s) => s.trim()),
          createThreads,
        }),
      });

      if (res.ok) {
        setAutoReplyStatus(`✅ Auto-AI Responding deployed! Listening to @mentions & channels: ${autoListenChannels}`);
      }
    } catch (err: any) {
      setAutoReplyStatus(`⚠️ Error deploying auto-reply: ${err.message}`);
    }
  };

  // 1-Click Discord Server Auto-Setup
  const handleProvisionServerStructure = async () => {
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/v1/discord/setup-server-structure`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setServerTree(data);
        setServerSetupStatus("✅ Discord Server Categories, Channels, Roles & Welcome Embeds successfully provisioned!");
      }
    } catch (err: any) {
      setServerSetupStatus(`⚠️ Error provisioning server: ${err.message}`);
    }
  };

  // Register Custom Slash Commands
  const handleAddSlashCommand = () => {
    if (!newCmdName.trim()) return;
    const cleanName = newCmdName.replace(/^\//, "").toLowerCase();
    setSlashCommands((prev) => [...prev, { name: cleanName, description: newCmdDesc || "Custom Kyro AI command" }]);
    setNewCmdName("");
    setNewCmdDesc("");
  };

  const handleRegisterSlashCommands = async () => {
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/v1/discord/register-slash-commands`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commands: slashCommands }),
      });
      if (res.ok) {
        setSlashRegisterStatus(`✅ Successfully registered ${slashCommands.length} slash commands with Discord API v10!`);
      }
    } catch (err: any) {
      setSlashRegisterStatus(`⚠️ Registration error: ${err.message}`);
    }
  };

  const inviteUrl = activeBot
    ? `https://discord.com/api/oauth2/authorize?client_id=${activeBot.botId}&permissions=2147483648&scope=bot%20applications.commands`
    : "https://discord.com/api/oauth2/authorize?client_id=100000000000000000&permissions=2147483648&scope=bot%20applications.commands";

  // Lock Screen if not owner authenticated
  if (!isOwnerAuthenticated) {
    return (
      <div className="min-h-screen bg-[#090a0e] text-slate-100 flex items-center justify-center p-6 font-sans">
        <div className="bg-[#121522] border border-[#242b3d] rounded-2xl p-8 max-w-md w-full text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-xl">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-white">Owner Access Restricted</h1>
            <p className="text-xs text-slate-400 mt-1">The Discord Bot Developer Suite is restricted to Platform Owners & Administrators.</p>
          </div>

          <div className="space-y-3 pt-2 text-left">
            <label className="text-xs font-mono text-slate-300">Enter Platform Owner Passkey</label>
            <input
              type="password"
              placeholder="Owner Passkey..."
              value={passkeyInput}
              onChange={(e) => setPasskeyInput(e.target.value)}
              className="w-full bg-[#08090d] border border-[#242b3d] text-white rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-amber-500"
            />
            {authError && <p className="text-xs font-mono text-rose-400">{authError}</p>}
          </div>

          <button
            onClick={handleAuthenticateOwner}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs font-mono transition-colors shadow-lg"
          >
            Authenticate Owner Access
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090a0e] text-[#edf0f7] font-sans flex flex-col">
      {/* Top Header Banner */}
      <header className="border-b border-[#1b202e] bg-[#0c0e14] px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400">
              <Bot className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-xl text-white">Owner Discord Developer & Server Suite</h1>
                <span className="bg-amber-500/20 text-amber-300 font-mono text-xs px-2.5 py-0.5 rounded-full border border-amber-500/40 font-semibold flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-400" /> Platform Owner Mode
                </span>
              </div>
              <p className="text-xs text-slate-400">Host Kyro AI bots, deploy 1-click server channels/roles, and manage Discord embeds</p>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex flex-wrap bg-[#121522] border border-[#242b3d] rounded-xl p-1 text-xs font-mono gap-1">
            <button
              onClick={() => setActiveTab("connection")}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === "connection" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              <Bot className="w-3.5 h-3.5" /> Bot Setup
            </button>
            <button
              onClick={() => setActiveTab("server_setup")}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === "server_setup" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              <Zap className="w-3.5 h-3.5" /> ⚡ Setup Discord Server
            </button>
            <button
              onClick={() => setActiveTab("embed_builder")}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === "embed_builder" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              <Palette className="w-3.5 h-3.5" /> Embed Builder
            </button>
            <button
              onClick={() => setActiveTab("automod")}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === "automod" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              <Shield className="w-3.5 h-3.5" /> Auto-Mod & Security
            </button>
            <button
              onClick={() => setActiveTab("leveling")}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === "leveling" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              <Star className="w-3.5 h-3.5" /> Leveling & XP
            </button>
            <button
              onClick={() => setActiveTab("tickets")}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === "tickets" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              <Ticket className="w-3.5 h-3.5" /> Support Tickets
            </button>
            <button
              onClick={() => setActiveTab("webhooks")}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === "webhooks" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              <Rss className="w-3.5 h-3.5" /> Webhooks & RSS
            </button>
            <button
              onClick={() => setActiveTab("auto_reply")}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === "auto_reply" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              <Zap className="w-3.5 h-3.5" /> Auto-AI
            </button>
            <button
              onClick={() => setActiveTab("channels")}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === "channels" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              <Hash className="w-3.5 h-3.5" /> Channels
            </button>
            <button
              onClick={() => setActiveTab("giveaways")}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === "giveaways" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              <Gift className="w-3.5 h-3.5" /> Giveaways
            </button>
            <button
              onClick={() => setActiveTab("ai_commands")}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === "ai_commands" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" /> AI Command Creator
            </button>
            <button
              onClick={() => setActiveTab("slash_commands")}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === "slash_commands" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              <Terminal className="w-3.5 h-3.5" /> Slash Commands
            </button>
            <button
              onClick={() => setActiveTab("admin")}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === "admin" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              <Crown className="w-3.5 h-3.5" /> Owner Admin
            </button>
          </div>
        </div>
      </header>

      {/* Main Suite Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6">
        {/* TAB 1: Bot Connection & Status */}
        {activeTab === "connection" && (
          <div className="space-y-6">
            {/* 1-Click Discord Server Auto-Setup Callout Banner */}
            <div className="bg-gradient-to-r from-amber-500/20 via-cyan-500/20 to-purple-500/20 border border-amber-500/40 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4 shadow-xl">
              <div className="space-y-1">
                <h3 className="font-display font-bold text-white text-base flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" /> 1-Click Discord Server Builder
                </h3>
                <p className="text-xs text-slate-300">
                  Instantly provision 14 Channels (Rules/TOS, Announcements, Support Desk), 7 Server Roles, and 5 Rich Embeds!
                </p>
              </div>
              <button
                onClick={() => setActiveTab("server_setup")}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs font-mono transition-all shadow-lg flex items-center gap-2"
              >
                <Zap className="w-4 h-4 fill-current" /> Open 1-Click Server Setup
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 space-y-6">
                <div className="border border-[#1b202e] bg-[#0e1017] rounded-2xl p-6 space-y-5">
                  <h2 className="font-display font-bold text-white text-base flex items-center gap-2">
                    <Key className="w-5 h-5 text-amber-400" /> DISCORD_BOT_TOKEN Configurator
                  </h2>

                <div className="space-y-4 text-xs font-mono">
                  <div>
                    <label className="text-slate-300 block mb-1.5">DISCORD_BOT_TOKEN</label>
                    <input
                      type="password"
                      placeholder="Paste token (MTAw...)"
                      value={botToken}
                      onChange={(e) => setBotToken(e.target.value)}
                      className="w-full bg-[#141724] border border-[#242b3d] text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-300 block mb-1.5">Command Prefix</label>
                      <input
                        type="text"
                        value={prefix}
                        onChange={(e) => setPrefix(e.target.value)}
                        className="w-full bg-[#141724] border border-[#242b3d] text-white rounded-xl px-3 py-2 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-slate-300 block mb-1.5">AI Engine Model</label>
                      <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="w-full bg-[#141724] border border-[#242b3d] text-amber-300 rounded-xl px-2 py-2 focus:outline-none"
                      >
                        <option value="kyro-coder-pro">Kyro Coder Pro (70B)</option>
                        <option value="kyro-flash-8b">Kyro Flash (8B Instant)</option>
                        <option value="kyro-ultra-70b">Kyro Ultra (70B Deep)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  {activeBot ? (
                    <button
                      onClick={handleStopBot}
                      className="w-full py-3 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all font-mono"
                    >
                      <Square className="w-4 h-4 fill-current" /> Disconnect Discord Bot
                    </button>
                  ) : (
                    <button
                      onClick={handleStartBot}
                      disabled={isLoading}
                      className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg font-mono disabled:opacity-50"
                    >
                      {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                      {isLoading ? "Validating Token..." : "Start & Connect Bot"}
                    </button>
                  )}
                </div>
              </div>

              <div className="border border-[#1b202e] bg-[#0e1017] rounded-2xl p-5 space-y-3 text-xs font-mono">
                <div className="text-slate-400">Server Invite URL:</div>
                <div className="bg-[#141724] border border-[#242b3d] rounded-xl p-3 text-amber-300 truncate">
                  {inviteUrl}
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 border border-[#1b202e] bg-[#0e1017] rounded-2xl overflow-hidden flex flex-col h-[480px]">
              <div className="bg-[#141724] border-b border-[#242b3d] px-4 py-3 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 text-slate-300">
                  <Terminal className="w-4 h-4 text-amber-400" />
                  <span>Discord Gateway Log Stream</span>
                </div>
                <span className="text-emerald-400">● Live Connection Status</span>
              </div>
              <div className="p-4 bg-[#08090d] flex-1 overflow-y-auto font-mono text-xs space-y-2 text-slate-300">
                {statusLogs.map((l, i) => (
                  <div key={i} className="border-b border-slate-900/60 pb-1">{l}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
        )}

        {/* TAB 2: ⚡ 1-Click Setup Kyro Responding */}
        {activeTab === "auto_reply" && (
          <div className="space-y-6">
            <div className="border border-[#1b202e] bg-[#0e1017] rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-[#1b202e] pb-4">
                <div>
                  <h2 className="font-display font-bold text-white text-lg flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-400" /> 1-Click Auto-AI Responding Setup
                  </h2>
                  <p className="text-xs text-slate-400">Configure how Kyro AI listens and automatically responds across your Discord channels</p>
                </div>
                <button
                  onClick={handleDeployAutoReplySetup}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs font-mono transition-colors shadow-lg"
                >
                  ⚡ Deploy Auto-AI Responding Setup
                </button>
              </div>

              {autoReplyStatus && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-mono">
                  {autoReplyStatus}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="bg-[#121522] border border-[#242b3d] rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">Auto-Reply to @KyroBot Mentions</span>
                    <input
                      type="checkbox"
                      checked={mentionReply}
                      onChange={(e) => setMentionReply(e.target.checked)}
                      className="w-4 h-4 accent-amber-500 cursor-pointer"
                    />
                  </div>
                  <p className="text-slate-400 text-[11px]">When server members ping `@KyroBot`, the bot instantly responds with AI completions.</p>
                </div>

                <div className="bg-[#121522] border border-[#242b3d] rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">Create Threads for Code Answers</span>
                    <input
                      type="checkbox"
                      checked={createThreads}
                      onChange={(e) => setCreateThreads(e.target.checked)}
                      className="w-4 h-4 accent-amber-500 cursor-pointer"
                    />
                  </div>
                  <p className="text-slate-400 text-[11px]">Automatically opens dedicated Discord threads for long code snippets and solution breakdowns.</p>
                </div>
              </div>

              <div className="bg-[#121522] border border-[#242b3d] rounded-xl p-4 space-y-3 text-xs font-mono">
                <label className="font-bold text-white block">Auto-Listening Channels (Comma-Separated)</label>
                <input
                  type="text"
                  value={autoListenChannels}
                  onChange={(e) => setAutoListenChannels(e.target.value)}
                  className="w-full bg-[#08090d] border border-[#242b3d] text-cyan-300 rounded-xl px-3.5 py-2.5 focus:outline-none"
                />
                <p className="text-slate-400 text-[11px]">The bot will monitor messages sent inside these specific channels without requiring pings.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: 🛠️ 1-Click Discord Server Auto-Setup */}
        {activeTab === "server_setup" && (
          <div className="space-y-6">
            <div className="border border-[#1b202e] bg-[#0e1017] rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-[#1b202e] pb-4">
                <div>
                  <h2 className="font-display font-bold text-white text-lg flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-400" /> 1-Click Full Discord Server Builder
                  </h2>
                  <p className="text-xs text-slate-400">Instantly generate Categories, TOS/Rules channels, Support Desk, Roles, and Rich Embeds</p>
                </div>
                <button
                  onClick={handleProvisionServerStructure}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs font-mono transition-all shadow-xl flex items-center gap-2"
                >
                  <Zap className="w-4 h-4 fill-current" /> ⚡ Run 1-Click Server Setup
                </button>
              </div>

              {serverSetupStatus && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-mono flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{serverSetupStatus}</span>
                </div>
              )}

              {/* Generated Server Structure Tree */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
                {/* Provisioned Categories & Channels */}
                <div className="bg-[#121522] border border-[#242b3d] rounded-xl p-5 space-y-4">
                  <h3 className="font-bold text-amber-400 text-sm flex items-center gap-2">
                    <Hash className="w-4 h-4" /> Categories & Channels (14 Total)
                  </h3>
                  <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                    <div className="p-3 bg-[#08090d] border border-[#242b3d] rounded-lg space-y-1">
                      <div className="text-amber-400 font-bold text-[11px]">📌 INFORMATION & RULES</div>
                      <div className="text-slate-300 pl-2 text-[11px] space-y-0.5">
                        <div>• #rules-and-tos <span className="text-slate-500 text-[10px]">(TOS & Anti-Leak)</span></div>
                        <div>• #announcements <span className="text-slate-500 text-[10px]">(Updates)</span></div>
                        <div>• #welcome-and-faq <span className="text-slate-500 text-[10px]">(Getting Started)</span></div>
                      </div>
                    </div>

                    <div className="p-3 bg-[#08090d] border border-[#242b3d] rounded-lg space-y-1">
                      <div className="text-cyan-400 font-bold text-[11px]">💬 GENERAL COMMUNITY</div>
                      <div className="text-slate-300 pl-2 text-[11px] space-y-0.5">
                        <div>• #general-chat</div>
                        <div>• #tech-discussion</div>
                      </div>
                    </div>

                    <div className="p-3 bg-[#08090d] border border-[#242b3d] rounded-lg space-y-1">
                      <div className="text-purple-400 font-bold text-[11px]">🤖 KYRO AI HUB</div>
                      <div className="text-slate-300 pl-2 text-[11px] space-y-0.5">
                        <div>• #ai-lounge <span className="text-emerald-400 text-[10px]">(AI Listening ON)</span></div>
                        <div>• #bot-commands <span className="text-emerald-400 text-[10px]">(Slash Hub)</span></div>
                        <div>• #automod-logs <span className="text-slate-500 text-[10px]">(Key Leak Audit)</span></div>
                      </div>
                    </div>

                    <div className="p-3 bg-[#08090d] border border-[#242b3d] rounded-lg space-y-1">
                      <div className="text-emerald-400 font-bold text-[11px]">🎫 SUPPORT TICKETS</div>
                      <div className="text-slate-300 pl-2 text-[11px] space-y-0.5">
                        <div>• #ticket-desk <span className="text-slate-500 text-[10px]">(1-on-1 AI Tickets)</span></div>
                      </div>
                    </div>

                    <div className="p-3 bg-[#08090d] border border-[#242b3d] rounded-lg space-y-1">
                      <div className="text-pink-400 font-bold text-[11px]">🎉 COMMUNITY EVENTS</div>
                      <div className="text-slate-300 pl-2 text-[11px] space-y-0.5">
                        <div>• #giveaways <span className="text-slate-500 text-[10px]">(Boost Draws)</span></div>
                        <div>• #xp-leaderboard <span className="text-slate-500 text-[10px]">(Level Ranks)</span></div>
                      </div>
                    </div>

                    <div className="p-3 bg-[#08090d] border border-[#242b3d] rounded-lg space-y-1">
                      <div className="text-rose-400 font-bold text-[11px]">👑 ADMIN & STAFF DECK</div>
                      <div className="text-slate-300 pl-2 text-[11px] space-y-0.5">
                        <div>• #staff-lounge</div>
                        <div>• #admin-audit-logs</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Provisioned Server Roles */}
                <div className="bg-[#121522] border border-[#242b3d] rounded-xl p-5 space-y-4">
                  <h3 className="font-bold text-amber-400 text-sm flex items-center gap-2">
                    <Crown className="w-4 h-4" /> Server Roles & Permissions
                  </h3>
                  <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                    <div className="p-2.5 bg-[#08090d] border border-amber-500/30 rounded-lg flex justify-between items-center">
                      <span className="text-amber-400 font-bold">👑 Platform Owner / Admin</span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">Administrator</span>
                    </div>
                    <div className="p-2.5 bg-[#08090d] border border-blue-500/30 rounded-lg flex justify-between items-center">
                      <span className="text-blue-400 font-bold">🛡️ Security Moderator</span>
                      <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">Kick/Ban/Mute</span>
                    </div>
                    <div className="p-2.5 bg-[#08090d] border border-emerald-500/30 rounded-lg flex justify-between items-center">
                      <span className="text-emerald-400 font-bold">🎫 Support Team</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">Manage Tickets</span>
                    </div>
                    <div className="p-2.5 bg-[#08090d] border border-purple-500/30 rounded-lg flex justify-between items-center">
                      <span className="text-purple-400 font-bold">👑 Kyro Master (Level 15+)</span>
                      <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">Level 15 Reward</span>
                    </div>
                    <div className="p-2.5 bg-[#08090d] border border-pink-500/30 rounded-lg flex justify-between items-center">
                      <span className="text-pink-400 font-bold">⭐ Kyro Scholar (Level 5+)</span>
                      <span className="text-[10px] bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded">Level 5 Reward</span>
                    </div>
                    <div className="p-2.5 bg-[#08090d] border border-cyan-500/30 rounded-lg flex justify-between items-center">
                      <span className="text-cyan-400 font-bold">🤖 Kyro AI Bot</span>
                      <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded">Bot Gateway</span>
                    </div>
                    <div className="p-2.5 bg-[#08090d] border border-slate-700 rounded-lg flex justify-between items-center">
                      <span className="text-slate-400 font-bold">👤 Verified Member</span>
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">Read & Send</span>
                    </div>
                  </div>
                </div>

                {/* Provisioned Rich Embeds Preview */}
                <div className="bg-[#121522] border border-[#242b3d] rounded-xl p-5 space-y-4">
                  <h3 className="font-bold text-amber-400 text-sm flex items-center gap-2">
                    <Palette className="w-4 h-4" /> Deployed Rich Embeds
                  </h3>
                  <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                    <div className="p-3 bg-[#08090d] border border-amber-500/30 rounded-lg space-y-1">
                      <div className="text-amber-400 font-bold text-[11px]">📜 Terms of Service & Guidelines</div>
                      <div className="text-slate-400 text-[10px]">Posted in: #rules-and-tos</div>
                      <p className="text-slate-300 text-[10px] pt-1">Rules on secret key protections, community conduct, and AI rate limits.</p>
                    </div>

                    <div className="p-3 bg-[#08090d] border border-cyan-500/30 rounded-lg space-y-1">
                      <div className="text-cyan-400 font-bold text-[11px]">👋 Welcome & Account Link Guide</div>
                      <div className="text-slate-400 text-[10px]">Posted in: #welcome-and-faq</div>
                      <p className="text-slate-300 text-[10px] pt-1">Instructions for 3x Rate Limit Boost (60 req/min) account linking.</p>
                    </div>

                    <div className="p-3 bg-[#08090d] border border-emerald-500/30 rounded-lg space-y-1">
                      <div className="text-emerald-400 font-bold text-[11px]">🎫 Kyro AI Support Desk</div>
                      <div className="text-slate-400 text-[10px]">Posted in: #ticket-desk</div>
                      <p className="text-slate-300 text-[10px] pt-1">Click to open ticket with instant 70B AI auto-draft reply.</p>
                    </div>

                    <div className="p-3 bg-[#08090d] border border-pink-500/30 rounded-lg space-y-1">
                      <div className="text-pink-400 font-bold text-[11px]">🎉 3x Rate Limit Giveaways</div>
                      <div className="text-slate-400 text-[10px]">Posted in: #giveaways</div>
                      <p className="text-slate-300 text-[10px] pt-1">Giveaway announcement embeds for member rewards.</p>
                    </div>

                    <div className="p-3 bg-[#08090d] border border-purple-500/30 rounded-lg space-y-1">
                      <div className="text-purple-400 font-bold text-[11px]">🤖 Slash Commands Cheat-Sheet</div>
                      <div className="text-slate-400 text-[10px]">Posted in: #bot-commands</div>
                      <p className="text-slate-300 text-[10px] pt-1">`/kyro-ask`, `/kyro-code`, `/kyro-fix`, `/kyro-top`, `/kyro-rank` manual.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: 🎨 Rich Embed Builder & Live Preview */}
        {activeTab === "embed_builder" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 border border-[#1b202e] bg-[#0e1017] rounded-2xl p-6 space-y-4 text-xs font-mono">
              <h2 className="font-display font-bold text-white text-base flex items-center gap-2">
                <Palette className="w-5 h-5 text-amber-400" /> Discord Rich Embed Constructor
              </h2>

              <div>
                <label className="text-slate-300 block mb-1">Embed Title</label>
                <input
                  type="text"
                  value={embedTitle}
                  onChange={(e) => setEmbedTitle(e.target.value)}
                  className="w-full bg-[#141724] border border-[#242b3d] text-white rounded-xl px-3 py-2 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Embed Description</label>
                <textarea
                  rows={3}
                  value={embedDesc}
                  onChange={(e) => setEmbedDesc(e.target.value)}
                  className="w-full bg-[#141724] border border-[#242b3d] text-slate-200 rounded-xl p-3 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Color (Hex)</label>
                  <input
                    type="text"
                    value={embedColor}
                    onChange={(e) => setEmbedColor(e.target.value)}
                    className="w-full bg-[#141724] border border-[#242b3d] text-amber-300 rounded-xl px-3 py-2 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Footer Text</label>
                  <input
                    type="text"
                    value={embedFooter}
                    onChange={(e) => setEmbedFooter(e.target.value)}
                    className="w-full bg-[#141724] border border-[#242b3d] text-slate-400 rounded-xl px-3 py-2 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Live Discord Embed Preview Card */}
            <div className="lg:col-span-6 border border-[#1b202e] bg-[#0e1017] rounded-2xl p-6 space-y-4">
              <h3 className="font-display font-semibold text-white text-sm">Discord Live Embed Preview</h3>
              <div
                className="bg-[#2f3136] rounded-lg p-4 space-y-2 font-sans border-l-4 shadow-xl"
                style={{ borderColor: embedColor }}
              >
                <div className="font-bold text-white text-sm">{embedTitle}</div>
                <div className="text-xs text-slate-300 leading-relaxed">{embedDesc}</div>

                <div className="pt-2 border-t border-slate-700/60 text-[11px] font-mono text-slate-400">
                  {embedFooter}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: 📜 Custom Slash Commands Registrar */}
        {activeTab === "slash_commands" && (
          <div className="space-y-6">
            <div className="border border-[#1b202e] bg-[#0e1017] rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-[#1b202e] pb-4">
                <div>
                  <h2 className="font-display font-bold text-white text-lg flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-amber-400" /> Custom Slash Commands Registrar
                  </h2>
                  <p className="text-xs text-slate-400">Add custom commands and register directly with Discord API v10</p>
                </div>
                <button
                  onClick={handleRegisterSlashCommands}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs font-mono transition-colors shadow-lg"
                >
                  📜 Register Commands with Discord API
                </button>
              </div>

              {slashRegisterStatus && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-mono">
                  {slashRegisterStatus}
                </div>
              )}

              {/* Add Command Inputs */}
              <div className="flex gap-3 text-xs font-mono">
                <input
                  type="text"
                  placeholder="Command Name (e.g. /kyro-3d)"
                  value={newCmdName}
                  onChange={(e) => setNewCmdName(e.target.value)}
                  className="bg-[#141724] border border-[#242b3d] text-white rounded-xl px-3.5 py-2 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Command Description..."
                  value={newCmdDesc}
                  onChange={(e) => setNewCmdDesc(e.target.value)}
                  className="flex-1 bg-[#141724] border border-[#242b3d] text-white rounded-xl px-3.5 py-2 focus:outline-none"
                />
                <button
                  onClick={handleAddSlashCommand}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold rounded-xl flex items-center gap-1.5 transition-colors border border-slate-700"
                >
                  <Plus className="w-4 h-4" /> Add Command
                </button>
              </div>

              {/* Active Commands List */}
              <div className="space-y-2 font-mono text-xs">
                {slashCommands.map((cmd, idx) => (
                  <div key={idx} className="bg-[#121522] border border-[#242b3d] rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-amber-400">/{cmd.name}</span>
                      <span className="text-slate-400 ml-3">{cmd.description}</span>
                    </div>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-semibold">
                      API v10 Payload Ready
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: 🛡️ AI Auto-Moderator & Security Guard */}
        {activeTab === "automod" && (
          <div className="space-y-6">
            <div className="border border-[#1b202e] bg-[#0e1017] rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-[#1b202e] pb-4">
                <div>
                  <h2 className="font-display font-bold text-white text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5 text-amber-400" /> AI Auto-Moderator & Security Guard
                  </h2>
                  <p className="text-xs text-slate-400">Scan chat messages for secret API key leaks, spam link floods, and toxic keywords in real-time</p>
                </div>
                <button
                  onClick={handleSaveAutoMod}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs font-mono transition-colors shadow-lg"
                >
                  🛡️ Save Auto-Mod Rules
                </button>
              </div>

              {autoModStatus && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-mono">
                  {autoModStatus}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="bg-[#121522] border border-[#242b3d] rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">Enable AI Auto-Moderator</span>
                    <input
                      type="checkbox"
                      checked={autoModEnabled}
                      onChange={(e) => setAutoModEnabled(e.target.checked)}
                      className="w-4 h-4 accent-amber-500 cursor-pointer"
                    />
                  </div>
                  <p className="text-slate-400 text-[11px]">Automatically deletes policy-violating messages and warns users.</p>
                </div>

                <div className="bg-[#121522] border border-[#242b3d] rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">Secret API Key Leak Guard</span>
                    <input
                      type="checkbox"
                      checked={secretKeyScan}
                      onChange={(e) => setSecretKeyScan(e.target.checked)}
                      className="w-4 h-4 accent-amber-500 cursor-pointer"
                    />
                  </div>
                  <p className="text-slate-400 text-[11px]">Detects and revokes exposed OpenAI, GitHub, or Discord tokens (`sk-...`, `ghp_...`).</p>
                </div>
              </div>

              <div className="bg-[#121522] border border-[#242b3d] rounded-xl p-4 space-y-3 text-xs font-mono">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">Toxicity Scanning Sensitivity</span>
                  <select
                    value={toxicitySensitivity}
                    onChange={(e) => setToxicitySensitivity(e.target.value)}
                    className="bg-[#08090d] border border-[#242b3d] text-amber-300 rounded-lg px-3 py-1.5 focus:outline-none"
                  >
                    <option value="LOW">Low (Severe Violations Only)</option>
                    <option value="MEDIUM">Medium (Balanced)</option>
                    <option value="HIGH">High (Strict AI Filtering)</option>
                  </select>
                </div>
                <p className="text-slate-400 text-[11px]">All auto-mod actions are dispatched to `#automod-logs` channel.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: ⭐ Member Leveling, XP & Server Economy */}
        {activeTab === "leveling" && (
          <div className="space-y-6">
            <div className="border border-[#1b202e] bg-[#0e1017] rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-[#1b202e] pb-4">
                <div>
                  <h2 className="font-display font-bold text-white text-lg flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-400" /> Member Leveling & Server Leaderboard
                  </h2>
                  <p className="text-xs text-slate-400">Chatting with Kyro AI earns XP. Auto-assign level roles (`⭐ Kyro Scholar`, `👑 Kyro Master`).</p>
                </div>
                <button
                  onClick={handleSaveLeveling}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs font-mono transition-colors shadow-lg"
                >
                  ⭐ Update XP Multiplier
                </button>
              </div>

              {levelingStatus && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-mono">
                  {levelingStatus}
                </div>
              )}

              <div className="bg-[#121522] border border-[#242b3d] rounded-xl p-4 space-y-3 text-xs font-mono">
                <label className="font-bold text-white block">XP Rate Multiplier</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1.0"
                    max="5.0"
                    step="0.5"
                    value={xpMultiplier}
                    onChange={(e) => setXpMultiplier(parseFloat(e.target.value))}
                    className="flex-1 accent-amber-500"
                  />
                  <span className="text-amber-400 font-bold px-3 py-1 bg-[#08090d] rounded-lg border border-[#242b3d]">{xpMultiplier}x XP</span>
                </div>
              </div>

              {/* Leaderboard Table */}
              <div className="border border-[#242b3d] rounded-xl overflow-hidden font-mono text-xs">
                <div className="bg-[#141724] px-4 py-3 font-bold text-slate-300 flex justify-between">
                  <span>Discord Leaderboard (`/kyro-top`)</span>
                  <span className="text-amber-400">Live XP Rank</span>
                </div>
                <div className="divide-y divide-[#1b202e] bg-[#08090d]">
                  {leaderboard.map((m) => (
                    <div key={m.rank} className="px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-6 text-slate-400 font-bold">#{m.rank}</span>
                        <span className="text-white font-bold">@{m.user}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-purple-400">Level {m.level}</span>
                        <span className="text-amber-300 font-bold">{m.xp} XP</span>
                        <span className="text-slate-400">{m.messages} msgs</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: 🎫 Support Ticket & Help Desk Management Panel */}
        {activeTab === "tickets" && (
          <div className="space-y-6">
            <div className="border border-[#1b202e] bg-[#0e1017] rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-[#1b202e] pb-4">
                <div>
                  <h2 className="font-display font-bold text-white text-lg flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-amber-400" /> Support Ticket Management Panel
                  </h2>
                  <p className="text-xs text-slate-400">View live tickets, claim ownership, reply directly to users, and export channel transcripts</p>
                </div>
                <button
                  onClick={handleCreateSupportTicket}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs font-mono transition-colors shadow-lg"
                >
                  🎫 Generate Demo Ticket
                </button>
              </div>

              {ticketStatus && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-mono">
                  {ticketStatus}
                </div>
              )}

              {/* Tickets Management Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono text-xs">
                {/* Left Column: Tickets List */}
                <div className="lg:col-span-5 bg-[#121522] border border-[#242b3d] rounded-xl p-4 space-y-3">
                  <h3 className="font-bold text-white text-sm flex items-center justify-between">
                    <span>Active Support Tickets</span>
                    <span className="text-amber-400 font-mono text-xs">{createdTickets.length} Tickets</span>
                  </h3>

                  <div className="space-y-2">
                    {createdTickets.map((t) => (
                      <button
                        key={t.ticketId}
                        onClick={() => setSelectedTicketId(t.ticketId)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all space-y-1.5 ${
                          selectedTicketId === t.ticketId
                            ? "bg-[#1b202e] border-amber-500 text-white shadow-lg"
                            : "bg-[#08090d] border-[#242b3d] text-slate-300 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex justify-between items-center font-bold">
                          <span className="text-amber-400">{t.channelName}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${t.status === "OPEN" ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-700 text-slate-400"}`}>
                            {t.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">{t.topic}</p>
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>User: @{t.author}</span>
                          <span>{t.claimedBy ? `Claimed by: @${t.claimedBy}` : "Unclaimed"}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right Column: Ticket Thread & Actions */}
                <div className="lg:col-span-7 bg-[#121522] border border-[#242b3d] rounded-xl p-5 space-y-4 flex flex-col justify-between">
                  {selectedTicketId && createdTickets.find((t) => t.ticketId === selectedTicketId) ? (
                    (() => {
                      const activeTicket = createdTickets.find((t) => t.ticketId === selectedTicketId)!;
                      return (
                        <>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between border-b border-[#242b3d] pb-3">
                              <div>
                                <h4 className="font-bold text-amber-400 text-sm">{activeTicket.channelName}</h4>
                                <p className="text-slate-400 text-[11px]">Topic: {activeTicket.topic}</p>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={handleClaimTicket}
                                  disabled={activeTicket.claimedBy !== null}
                                  className="px-3 py-1.5 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                                >
                                  {activeTicket.claimedBy ? `Claimed by @${activeTicket.claimedBy}` : "👑 Claim Ticket"}
                                </button>
                                <button
                                  onClick={handleCloseTicket}
                                  disabled={activeTicket.status === "CLOSED"}
                                  className="px-3 py-1.5 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                                >
                                  {activeTicket.status === "CLOSED" ? "🔒 Closed" : "🔒 Close Ticket"}
                                </button>
                              </div>
                            </div>

                            {/* Thread Messages */}
                            <div className="bg-[#08090d] border border-[#242b3d] rounded-xl p-4 space-y-3 h-[240px] overflow-y-auto">
                              {activeTicket.messages?.map((m: any, idx: number) => (
                                <div key={idx} className="space-y-1">
                                  <div className="flex items-center justify-between text-[11px]">
                                    <span className="font-bold text-amber-300">@{m.sender}</span>
                                    <span className="text-slate-500">{m.timestamp}</span>
                                  </div>
                                  <div className="bg-[#141724] p-2.5 rounded-lg text-slate-200 leading-relaxed text-[11px]">
                                    {m.text}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Reply Input Box */}
                          <div className="pt-2 flex gap-2">
                            <input
                              type="text"
                              placeholder="Type admin response to ticket..."
                              value={replyInputText}
                              onChange={(e) => setReplyInputText(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && handleReplyTicket()}
                              className="flex-1 bg-[#08090d] border border-[#242b3d] text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-500"
                            />
                            <button
                              onClick={handleReplyTicket}
                              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md"
                            >
                              <Send className="w-4 h-4" /> Reply
                            </button>
                          </div>
                        </>
                      );
                    })()
                  ) : (
                    <div className="text-slate-400 text-center py-12">Select a ticket from the left panel to manage.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 11: 💬 Remote Channel Configurator */}
        {activeTab === "channels" && (
          <div className="space-y-6">
            <div className="border border-[#1b202e] bg-[#0e1017] rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-[#1b202e] pb-4">
                <div>
                  <h2 className="font-display font-bold text-white text-lg flex items-center gap-2">
                    <Hash className="w-5 h-5 text-amber-400" /> Discord Remote Channel Configurator
                  </h2>
                  <p className="text-xs text-slate-400">Provision server channels, delete unused channels, and toggle AI listening whitelists</p>
                </div>
              </div>

              {channelStatus && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-mono">
                  {channelStatus}
                </div>
              )}

              {/* Create Channel Input */}
              <div className="bg-[#121522] border border-[#242b3d] rounded-xl p-4 flex gap-3 text-xs font-mono">
                <input
                  type="text"
                  placeholder="Channel Name (e.g. #ai-support)"
                  value={newChanNameInput}
                  onChange={(e) => setNewChanNameInput(e.target.value)}
                  className="bg-[#08090d] border border-[#242b3d] text-white rounded-xl px-3.5 py-2.5 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Category (e.g. 🤖 KYRO AI HUB)"
                  value={newChanCatInput}
                  onChange={(e) => setNewChanCatInput(e.target.value)}
                  className="flex-1 bg-[#08090d] border border-[#242b3d] text-white rounded-xl px-3.5 py-2.5 focus:outline-none"
                />
                <button
                  onClick={handleCreateChannel}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-lg"
                >
                  <Plus className="w-4 h-4" /> Provision Channel
                </button>
              </div>

              {/* Channels List Table */}
              <div className="border border-[#242b3d] rounded-xl overflow-hidden font-mono text-xs">
                <div className="bg-[#141724] px-4 py-3 font-bold text-slate-300 flex justify-between">
                  <span>Server Channels ({channelsList.length})</span>
                  <span>AI Listening & Actions</span>
                </div>
                <div className="divide-y divide-[#1b202e] bg-[#08090d]">
                  {channelsList.map((c, idx) => (
                    <div key={idx} className="px-4 py-3 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="text-amber-400 font-bold flex items-center gap-2">
                          <Hash className="w-3.5 h-3.5" /> {c.name}
                        </div>
                        <div className="text-slate-500 text-[10px]">Category: {c.category} • Type: {c.type}</div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleToggleChannelListening(c.name, c.listening)}
                          className={`px-3 py-1 rounded-lg border text-[11px] font-bold transition-all ${
                            c.listening
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                              : "bg-slate-800 text-slate-400 border-slate-700"
                          }`}
                        >
                          {c.listening ? "⚡ AI Listening ACTIVE" : "⏸️ AI Listening OFF"}
                        </button>
                        <button
                          onClick={() => handleDeleteChannel(c.name)}
                          className="p-1.5 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 12: 🎉 Discord Giveaways Manager */}
        {activeTab === "giveaways" && (
          <div className="space-y-6">
            <div className="border border-[#1b202e] bg-[#0e1017] rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-[#1b202e] pb-4">
                <div>
                  <h2 className="font-display font-bold text-white text-lg flex items-center gap-2">
                    <Gift className="w-5 h-5 text-amber-400" /> Discord Giveaways Manager
                  </h2>
                  <p className="text-xs text-slate-400">Launch rich embed giveaways for 3x Rate-Limit Boosts and VIP roles directly to Discord</p>
                </div>
              </div>

              {giveawayStatusMsg && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-mono">
                  {giveawayStatusMsg}
                </div>
              )}

              {/* Launch Giveaway Form */}
              <div className="bg-[#121522] border border-[#242b3d] rounded-xl p-5 space-y-4 font-mono text-xs">
                <h3 className="font-bold text-white text-sm">Launch New Server Giveaway</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1">Giveaway Title</label>
                    <input
                      type="text"
                      value={giveawayTitleInput}
                      onChange={(e) => setGiveawayTitleInput(e.target.value)}
                      className="w-full bg-[#08090d] border border-[#242b3d] text-white rounded-xl px-3.5 py-2 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1">Prize Reward</label>
                    <input
                      type="text"
                      value={giveawayPrizeInput}
                      onChange={(e) => setGiveawayPrizeInput(e.target.value)}
                      className="w-full bg-[#08090d] border border-[#242b3d] text-amber-300 rounded-xl px-3.5 py-2 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1">Target Channel</label>
                    <input
                      type="text"
                      value={giveawayChanInput}
                      onChange={(e) => setGiveawayChanInput(e.target.value)}
                      className="w-full bg-[#08090d] border border-[#242b3d] text-cyan-300 rounded-xl px-3.5 py-2 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1">Duration (Hours)</label>
                    <input
                      type="number"
                      value={giveawayDurationInput}
                      onChange={(e) => setGiveawayDurationInput(parseInt(e.target.value) || 24)}
                      className="w-full bg-[#08090d] border border-[#242b3d] text-white rounded-xl px-3.5 py-2 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={handleLaunchGiveaway}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <Gift className="w-4 h-4" /> Launch Giveaway to Discord
                </button>
              </div>

              {/* Active Giveaways List */}
              <div className="space-y-3 font-mono text-xs">
                <h3 className="font-bold text-slate-300">Active & Past Giveaways</h3>
                {giveawaysList.map((g) => (
                  <div key={g.id} className="bg-[#121522] border border-[#242b3d] rounded-xl p-4 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="font-bold text-amber-400 text-sm flex items-center gap-2">
                        <Gift className="w-4 h-4 text-amber-400" /> {g.title}
                      </div>
                      <div className="text-slate-400 text-[11px]">Prize: {g.prize} • Channel: {g.channel}</div>
                      <div className="text-slate-500 text-[10px]">
                        Entrants: {g.entries?.length || 0} users ({g.entries?.join(", ")})
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      {g.status === "ENDED" ? (
                        <div className="text-emerald-400 font-bold bg-emerald-500/20 px-3 py-1 rounded-lg border border-emerald-500/30">
                          🎉 Winner: @{g.winner}
                        </div>
                      ) : (
                        <button
                          onClick={() => handleDrawWinner(g.id)}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5"
                        >
                          🎉 Draw Winner Now
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 13: 🤖 AI Dynamic Self-Command Creator */}
        {activeTab === "ai_commands" && (
          <div className="space-y-6">
            <div className="border border-[#1b202e] bg-[#0e1017] rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-[#1b202e] pb-4">
                <div>
                  <h2 className="font-display font-bold text-white text-lg flex items-center gap-2">
                    <Wand2 className="w-5 h-5 text-amber-400" /> AI Dynamic Self-Command Creator
                  </h2>
                  <p className="text-xs text-slate-400">Describe what command you want in natural language. Kyro AI will program, synthesize, and register it with Discord API v10!</p>
                </div>
              </div>

              {aiCmdStatus && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-mono">
                  {aiCmdStatus}
                </div>
              )}

              {/* Natural Language Prompt Input */}
              <div className="bg-[#121522] border border-[#242b3d] rounded-xl p-5 space-y-4 font-mono text-xs">
                <label className="font-bold text-white block">Describe the Command for Kyro AI to Build</label>
                <textarea
                  rows={3}
                  value={aiCmdPrompt}
                  onChange={(e) => setAiCmdPrompt(e.target.value)}
                  placeholder="e.g. Create a /kyro-weather command that fetches 5-day forecasts or /kyro-crypto that looks up Solana prices..."
                  className="w-full bg-[#08090d] border border-[#242b3d] text-amber-300 rounded-xl p-3.5 focus:outline-none resize-none"
                />

                <button
                  onClick={handleGenerateAiCommand}
                  disabled={isGeneratingAiCmd}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isGeneratingAiCmd ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                  {isGeneratingAiCmd ? "AI Synthesizing & Registering Command..." : "🤖 Instruct Kyro AI to Create Command"}
                </button>
              </div>

              {/* Active Commands */}
              <div className="space-y-2 font-mono text-xs">
                <h3 className="font-bold text-slate-300">Registered AI Slash Commands</h3>
                {slashCommands.map((cmd, idx) => (
                  <div key={idx} className="bg-[#121522] border border-[#242b3d] rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-amber-400">/{cmd.name}</span>
                      <span className="text-slate-400 ml-3">{cmd.description}</span>
                    </div>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-semibold">
                      Live on Discord REST v10
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: ⚙️ Webhooks & RSS Feeds */}
        {activeTab === "webhooks" && (
          <div className="space-y-6">
            <div className="border border-[#1b202e] bg-[#0e1017] rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-[#1b202e] pb-4">
                <div>
                  <h2 className="font-display font-bold text-white text-lg flex items-center gap-2">
                    <Rss className="w-5 h-5 text-amber-400" /> Webhooks, RSS Feeds & Automated Posts
                  </h2>
                  <p className="text-xs text-slate-400">Post automated tech RSS news to `#tech-news` and receive custom API webhooks</p>
                </div>
                <button
                  onClick={handleSaveRssFeed}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs font-mono transition-colors shadow-lg"
                >
                  ⚙️ Register RSS Poster
                </button>
              </div>

              {rssStatus && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-mono">
                  {rssStatus}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="bg-[#121522] border border-[#242b3d] rounded-xl p-4 space-y-3">
                  <label className="font-bold text-white block">RSS Feed Name</label>
                  <input
                    type="text"
                    value={rssFeedName}
                    onChange={(e) => setRssFeedName(e.target.value)}
                    className="w-full bg-[#08090d] border border-[#242b3d] text-white rounded-xl px-3.5 py-2 focus:outline-none"
                  />
                </div>

                <div className="bg-[#121522] border border-[#242b3d] rounded-xl p-4 space-y-3">
                  <label className="font-bold text-white block">Target Channel</label>
                  <input
                    type="text"
                    value={targetRssChannel}
                    onChange={(e) => setTargetRssChannel(e.target.value)}
                    className="w-full bg-[#08090d] border border-[#242b3d] text-cyan-300 rounded-xl px-3.5 py-2 focus:outline-none"
                  />
                </div>
              </div>

              <div className="bg-[#121522] border border-[#242b3d] rounded-xl p-4 space-y-3 text-xs font-mono">
                <label className="font-bold text-white block">RSS Feed URL</label>
                <input
                  type="text"
                  value={rssFeedUrl}
                  onChange={(e) => setRssFeedUrl(e.target.value)}
                  className="w-full bg-[#08090d] border border-[#242b3d] text-amber-300 rounded-xl px-3.5 py-2 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 10: 👑 Owner & Server Admin Command Utilities */}
        {activeTab === "admin" && (
          <div className="space-y-6">
            <div className="border border-[#1b202e] bg-[#0e1017] rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-[#1b202e] pb-4">
                <div>
                  <h2 className="font-display font-bold text-white text-lg flex items-center gap-2">
                    <Crown className="w-5 h-5 text-amber-400" /> Platform Owner & Lockdown Suite
                  </h2>
                  <p className="text-xs text-slate-400">Emergency `/kyro-lockdown`, server broadcasts, and Discord account rate-limit boost linking</p>
                </div>
                <button
                  onClick={handleToggleLockdown}
                  className={`px-5 py-2.5 font-bold rounded-xl text-xs font-mono transition-colors shadow-lg ${
                    lockdownMode ? "bg-emerald-500 text-slate-950" : "bg-rose-500 text-white"
                  }`}
                >
                  {lockdownMode ? "🔓 Disable Lockdown" : "🔒 Emergency Server Lockdown"}
                </button>
              </div>

              {adminStatus && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-mono">
                  {adminStatus}
                </div>
              )}

              {/* Discord Account Linking Banner / Box */}
              <div className="bg-[#121522] border border-[#242b3d] rounded-xl p-5 space-y-4 font-mono text-xs">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Link2 className="w-5 h-5" /> 🔗 Link Discord Account for 3x Rate Limit (60 req/min)
                </div>
                <p className="text-slate-400 text-[11px]">
                  Linking your Discord user tag and ID instantly increases your free tier rate limit from 20 req/min to 60 req/min across Kyro AI.
                </p>

                {linkStatus && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl">
                    {linkStatus}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Discord Handle (e.g. Jordan#1234)"
                    value={discordTag}
                    onChange={(e) => setDiscordTag(e.target.value)}
                    className="bg-[#08090d] border border-[#242b3d] text-white rounded-xl px-3.5 py-2 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Discord User ID (e.g. 1029384756657)"
                    value={discordId}
                    onChange={(e) => setDiscordId(e.target.value)}
                    className="bg-[#08090d] border border-[#242b3d] text-white rounded-xl px-3.5 py-2 focus:outline-none"
                  />
                </div>

                {/* 1-Click Official Discord OAuth2 Connect Button */}
                <div className="pt-2 border-t border-[#242b3d] space-y-3">
                  <div className="text-slate-300 font-bold">1-Click Official OAuth2 Authentication:</div>
                  <button
                    onClick={async () => {
                      try {
                        const baseUrl = getApiBaseUrl();
                        const redirectUri = `${window.location.origin}/auth/discord/callback`;
                        const res = await fetch(`${baseUrl}/v1/discord/oauth/authorize?redirect_uri=${encodeURIComponent(redirectUri)}`);
                        if (res.ok) {
                          const data = await res.json();
                          window.location.href = data.authUrl;
                        }
                      } catch (err: any) {
                        alert(`OAuth2 launch failed: ${err.message}`);
                      }
                    }}
                    className="w-full py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-xs"
                  >
                    <Link2 className="w-4 h-4" /> 🔗 Connect Discord Account via Official OAuth2 (3x Rate Limit Boost)
                  </button>
                  <p className="text-[10px] text-slate-500 text-center">
                    Redirects to Discord's official consent screen (`scope=identify`). Redirect URI: `{typeof window !== "undefined" ? window.location.origin : ""}/auth/discord/callback`
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
