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
  Cpu
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

export default function DiscordBotAdminPage() {
  const [botToken, setBotToken] = useState<string>("");
  const [prefix, setPrefix] = useState<string>("!kyro");
  const [selectedModel, setSelectedModel] = useState<string>("kyro-coder-pro");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeBot, setActiveBot] = useState<BotSession | null>(null);
  const [statusLogs, setStatusLogs] = useState<string[]>([
    "🟢 [DISCORD HOSTING ENGINE] Ready to host Discord bots.",
    "💡 Provide your DISCORD_BOT_TOKEN below to launch your AI bot into your Discord servers.",
  ]);
  const [copiedInvite, setCopiedInvite] = useState<boolean>(false);

  // Live Test Chat Simulation State
  const [testUserPrompt, setTestUserPrompt] = useState<string>("!kyro explain how to build a VEX IQ autonomous bot");
  const [testChatLog, setTestChatLog] = useState<Array<{ sender: string; text: string; isBot?: boolean }>>([
    { sender: "System", text: "Discord Bot Test Sandbox Initialized.", isBot: true },
  ]);
  const [isTestGenerating, setIsTestGenerating] = useState<boolean>(false);

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
    setStatusLogs((prev) => [`[${timeStr}] 🚀 Validating Discord Bot Token with Discord REST API...`, ...prev]);

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
          `[${timeStr}] 🤖 Registered global slash commands: /kyro-ask, /kyro-code, /kyro-fix`,
          ...prev,
        ]);
      } else {
        setStatusLogs((prev) => [
          `[${timeStr}] ❌ Failed to start Discord Bot: ${data.error?.message || "Invalid Token"}`,
          ...prev,
        ]);
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
      setStatusLogs((prev) => [`[${timeStr}] ⏹️ Discord Bot stopped.`, ...prev]);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleRunTestMessage = async () => {
    if (!testUserPrompt.trim() || isTestGenerating) return;

    const userText = testUserPrompt;
    setTestChatLog((prev) => [...prev, { sender: "DiscordUser", text: userText }]);
    setTestUserPrompt("");
    setIsTestGenerating(true);

    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            { role: "system", content: "You are Kyro AI, responding to Discord chat members concisely and helpfully." },
            { role: "user", content: userText },
          ],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const replyText = data.choices?.[0]?.message?.content || "No response generated.";
        setTestChatLog((prev) => [
          ...prev,
          { sender: activeBot?.botName || "KyroBot#0001", text: replyText, isBot: true },
        ]);
      }
    } catch (err: any) {
      setTestChatLog((prev) => [
        ...prev,
        { sender: "System", text: `⚠️ Error: ${err.message}`, isBot: true },
      ]);
    } finally {
      setIsTestGenerating(false);
    }
  };

  const inviteUrl = activeBot
    ? `https://discord.com/api/oauth2/authorize?client_id=${activeBot.botId}&permissions=2147483648&scope=bot%20applications.commands`
    : "https://discord.com/api/oauth2/authorize?client_id=100000000000000000&permissions=2147483648&scope=bot%20applications.commands";

  return (
    <div className="min-h-screen bg-[#0b0c10] text-[#edf0f7] font-sans flex flex-col">
      {/* Header Banner */}
      <div className="border-b border-[#1b202e] bg-[#0e1017] px-6 py-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-2xl text-purple-400">
              <Bot className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-2xl text-white">Discord Bot Hosting & Admin Control Panel</h1>
                <span className="bg-purple-500/20 text-purple-300 font-mono text-xs px-2.5 py-0.5 rounded-full border border-purple-500/40 font-semibold">
                  Discord Gateway v10
                </span>
              </div>
              <p className="text-xs text-slate-400">Host, connect, and manage your Kyro-powered Discord AI bot with zero server overhead</p>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="text-slate-400">Bot Status:</span>
            {activeBot ? (
              <span className="px-3 py-1 bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> ONLINE (@{activeBot.botName})
              </span>
            ) : (
              <span className="px-3 py-1 bg-slate-800 border border-slate-700 text-slate-400 font-bold rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-500"></span> OFFLINE / READY
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Token Configurator & Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div className="border border-[#1b202e] bg-[#0e1017] rounded-2xl p-6 space-y-5">
            <h2 className="font-display font-bold text-white text-base flex items-center gap-2">
              <Key className="w-5 h-5 text-purple-400" /> Bot Token & Connection Setup
            </h2>

            <div className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-slate-300 block mb-1.5">DISCORD_BOT_TOKEN</label>
                <input
                  type="password"
                  placeholder="Paste your Discord Bot Token (MTAw...)"
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  className="w-full bg-[#141724] border border-[#242b3d] text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-purple-500"
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

            <div className="pt-2 flex gap-3">
              {activeBot ? (
                <button
                  onClick={handleStopBot}
                  className="w-full py-3 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all font-mono"
                >
                  <Square className="w-4 h-4 fill-current" /> Stop Hosted Bot
                </button>
              ) : (
                <button
                  onClick={handleStartBot}
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-amber-500 hover:opacity-90 text-slate-950 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg font-mono disabled:opacity-50"
                >
                  {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                  {isLoading ? "Validating Token..." : "Start & Connect Discord Bot"}
                </button>
              )}
            </div>
          </div>

          {/* Bot Invite Link Box */}
          <div className="border border-[#1b202e] bg-[#0e1017] rounded-2xl p-6 space-y-4">
            <h3 className="font-display font-semibold text-white text-sm flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-purple-400" /> Discord Server Invite URL
            </h3>
            <p className="text-xs text-slate-400">Use this official link to add your Kyro AI Bot to your Discord servers with slash command permissions:</p>
            <div className="bg-[#141724] border border-[#242b3d] rounded-xl p-3 flex items-center justify-between text-xs font-mono">
              <span className="truncate text-purple-300">{inviteUrl}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(inviteUrl);
                  setCopiedInvite(true);
                  setTimeout(() => setCopiedInvite(false), 2000);
                }}
                className="p-1.5 text-slate-400 hover:text-white shrink-0 ml-2"
              >
                {copiedInvite ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Logs & Discord Test Simulator */}
        <div className="lg:col-span-7 space-y-6">
          {/* Console Log Window */}
          <div className="border border-[#1b202e] bg-[#0e1017] rounded-2xl overflow-hidden flex flex-col h-[280px]">
            <div className="bg-[#141724] border-b border-[#242b3d] px-4 py-3 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-slate-300">
                <Terminal className="w-4 h-4 text-purple-400" />
                <span>Discord Gateway Runtime Console</span>
              </div>
              <span className="text-emerald-400">● Live Connection Stream</span>
            </div>

            <div className="p-4 bg-[#08090d] flex-1 overflow-y-auto font-mono text-xs space-y-1.5 text-slate-300">
              {statusLogs.map((log, i) => (
                <div key={i} className="leading-relaxed border-b border-slate-900/60 pb-1">
                  {log}
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Discord Chat Simulator */}
          <div className="border border-[#1b202e] bg-[#0e1017] rounded-2xl p-5 space-y-4">
            <h3 className="font-display font-semibold text-white text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-400" /> Interactive Discord Command Test Sandbox
            </h3>

            <div className="bg-[#090b10] border border-[#242b3d] rounded-xl p-4 h-[220px] overflow-y-auto space-y-3 font-mono text-xs">
              {testChatLog.map((msg, idx) => (
                <div key={idx} className={`p-2.5 rounded-lg border ${msg.isBot ? "bg-purple-950/20 border-purple-800/30 text-purple-200" : "bg-[#141724] border-[#242b3d] text-slate-200"}`}>
                  <div className="font-bold text-[11px] text-slate-400 mb-1">@{msg.sender}</div>
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={testUserPrompt}
                onChange={(e) => setTestUserPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRunTestMessage();
                }}
                placeholder="Type a test command for Discord Bot..."
                className="flex-1 bg-[#141724] border border-[#242b3d] text-white rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={handleRunTestMessage}
                disabled={isTestGenerating}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all font-mono disabled:opacity-50"
              >
                {isTestGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isTestGenerating ? "Processing..." : "Test Bot"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
