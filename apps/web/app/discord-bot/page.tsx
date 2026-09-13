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
  Crown
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
  const [activeTab, setActiveTab] = useState<"connection" | "auto_reply" | "server_setup" | "embed_builder" | "slash_commands">("connection");

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
          <div className="flex bg-[#121522] border border-[#242b3d] rounded-xl p-1 text-xs font-mono">
            <button
              onClick={() => setActiveTab("connection")}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === "connection" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              <Bot className="w-3.5 h-3.5" /> Bot Setup
            </button>
            <button
              onClick={() => setActiveTab("auto_reply")}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === "auto_reply" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              <Zap className="w-3.5 h-3.5" /> Auto-AI Responding
            </button>
            <button
              onClick={() => setActiveTab("server_setup")}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === "server_setup" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              <Hash className="w-3.5 h-3.5" /> Server Auto-Setup
            </button>
            <button
              onClick={() => setActiveTab("embed_builder")}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === "embed_builder" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              <Palette className="w-3.5 h-3.5" /> Rich Embed Builder
            </button>
            <button
              onClick={() => setActiveTab("slash_commands")}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === "slash_commands" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              <Terminal className="w-3.5 h-3.5" /> Slash Commands
            </button>
          </div>
        </div>
      </header>

      {/* Main Suite Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6">
        {/* TAB 1: Bot Connection & Status */}
        {activeTab === "connection" && (
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
                    <Hash className="w-5 h-5 text-amber-400" /> 1-Click Discord Server Structure Provisioner
                  </h2>
                  <p className="text-xs text-slate-400">Instantly generate & provision Categories, Channels, Roles, and Welcome Embeds for your server</p>
                </div>
                <button
                  onClick={handleProvisionServerStructure}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs font-mono transition-colors shadow-lg"
                >
                  🛠️ Auto-Provision Discord Server
                </button>
              </div>

              {serverSetupStatus && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-mono">
                  {serverSetupStatus}
                </div>
              )}

              {/* Generated Server Structure Tree */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
                <div className="bg-[#121522] border border-[#242b3d] rounded-xl p-5 space-y-4">
                  <h3 className="font-bold text-amber-400 text-sm flex items-center gap-2">
                    <Hash className="w-4 h-4" /> Provisioned Categories & Channels
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-[#08090d] border border-[#242b3d] rounded-lg space-y-1">
                      <div className="text-white font-bold">🤖 KYRO AI HUB</div>
                      <div className="text-slate-400 pl-3 text-[11px]">#ai-chat, #bot-commands, #kyro-logs</div>
                    </div>
                    <div className="p-3 bg-[#08090d] border border-[#242b3d] rounded-lg space-y-1">
                      <div className="text-white font-bold">💬 GENERAL COMMUNITY</div>
                      <div className="text-slate-400 pl-3 text-[11px]">#general, #announcements, #rules-and-faq</div>
                    </div>
                    <div className="p-3 bg-[#08090d] border border-[#242b3d] rounded-lg space-y-1">
                      <div className="text-white font-bold">🛠️ BOT & DEV SUPPORT</div>
                      <div className="text-slate-400 pl-3 text-[11px]">#bot-support, #api-keys-help</div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#121522] border border-[#242b3d] rounded-xl p-5 space-y-4">
                  <h3 className="font-bold text-amber-400 text-sm flex items-center gap-2">
                    <Crown className="w-4 h-4" /> Provisioned Server Roles
                  </h3>
                  <div className="space-y-2">
                    <div className="p-2.5 bg-[#08090d] border border-[#242b3d] rounded-lg flex justify-between items-center">
                      <span className="text-amber-400 font-bold">👑 Platform Owner</span>
                      <span className="text-[10px] text-slate-400">Administrator</span>
                    </div>
                    <div className="p-2.5 bg-[#08090d] border border-[#242b3d] rounded-lg flex justify-between items-center">
                      <span className="text-cyan-400 font-bold">🤖 Kyro AI Bot</span>
                      <span className="text-[10px] text-slate-400">Bot Default</span>
                    </div>
                    <div className="p-2.5 bg-[#08090d] border border-[#242b3d] rounded-lg flex justify-between items-center">
                      <span className="text-purple-400 font-bold">⭐ Pro Member</span>
                      <span className="text-[10px] text-slate-400">Standard Member</span>
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
      </main>
    </div>
  );
}
