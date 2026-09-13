"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  UserCheck,
  Globe,
  Swords,
  Bot,
  Brain,
  Key,
  BookOpen,
  Share2,
  Plus,
  MessageSquare,
  Trash2,
  Send,
  Paperclip,
  Mic,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Code2,
  Cpu,
  Layers,
  Wrench,
  Search,
  X,
  PanelLeft,
  Settings,
  HelpCircle,
  ExternalLink
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  thinking?: string;
  timestamp: string;
  isStreaming?: boolean;
}

interface Thread {
  id: string;
  title: string;
  updatedAt: string;
}

export default function ChatPage() {
  // --- Sidebar & Layout State ---
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [threads, setThreads] = useState<Thread[]>([
    { id: "1", title: "VEX IQ Color Sorting Autonomous", updatedAt: "10 mins ago" },
    { id: "2", title: "Blender Procedural Spur Gear", updatedAt: "2 hours ago" },
    { id: "3", title: "OpenAI SDK Proxy Config in Python", updatedAt: "Yesterday" },
  ]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  // --- Top Controls Toolbar State (Matching Reference Image) ---
  const [selectedModel, setSelectedModel] = useState<string>("kyro-flash-8b");
  const [selectedAssistant, setSelectedAssistant] = useState<string>("default");
  const [searchActive, setSearchActive] = useState<boolean>(false);
  const [arenaActive, setArenaActive] = useState<boolean>(false);
  const [agentActive, setAgentActive] = useState<boolean>(false);
  const [thinkingActive, setThinkingActive] = useState<boolean>(true);
  
  // Modals
  const [showProKeyModal, setShowProKeyModal] = useState<boolean>(false);
  const [showPromptsModal, setShowPromptsModal] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);
  const [copiedApiKey, setCopiedApiKey] = useState<boolean>(false);

  // Dropdown menus
  const [showModelMenu, setShowModelMenu] = useState<boolean>(false);
  const [showAssistantMenu, setShowAssistantMenu] = useState<boolean>(false);

  // --- Messages & Chat Input State ---
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputPrompt, setInputPrompt] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [expandedThinking, setExpandedThinking] = useState<Record<string, boolean>>({});
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  // Model Options
  const MODELS = [
    { id: "kyro-flash-8b", name: "Kyro Flash (8B)", desc: "Ultra-fast instant completions & general chat" },
    { id: "kyro-ultra-70b", name: "Kyro Ultra (70B)", desc: "High reasoning, complex logic & architecture" },
    { id: "kyro-coder-pro", name: "Kyro Coder Pro", desc: "Full-stack code generation, unit tests & debug" },
    { id: "deepseek-r1-70b", name: "DeepSeek R1 Reasoning", desc: "Mathematical chain-of-thought synthesis" },
  ];

  // Assistant Presets
  const ASSISTANTS = [
    { id: "default", name: "Default Assistant", desc: "Balanced general AI conversation" },
    { id: "coder", name: "Code & Software Engineer", desc: "Strict technical code focus" },
    { id: "robotics", name: "Robotics & 3D Specialist", desc: "VEXcode IQ & Blender python generation" },
    { id: "creative", name: "Creative Writer", desc: "Long-form drafting, stories & essays" },
  ];

  // Prompt Library Presets
  const PROMPTS = [
    "Write an autonomous VEX IQ Python routine that sorts red and blue blocks using an Optical Sensor.",
    "Generate a procedural 24-tooth spur gear Python script for Blender 4.2.",
    "Explain quantum computing principles using a simple analogy.",
    "Create a high-performance REST API wrapper in Node.js with token bucket rate limiting.",
  ];

  // Send Message Handler
  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputPrompt;
    if (!query.trim() || isGenerating) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputPrompt("");
    setIsGenerating(true);

    // Simulate Streaming Response with optional Thinking Process
    setTimeout(() => {
      let thinkingContent = "";
      let responseContent = "";

      if (thinkingActive) {
        thinkingContent = `1. Analyzing query: "${query}"\n2. Context mode: ${selectedAssistant.toUpperCase()} | Target Model: ${selectedModel}\n3. Web Search Enabled: ${searchActive ? "YES" : "NO"}\n4. Synthesizing optimal structured response with clean formatting...`;
      }

      if (query.toLowerCase().includes("vex") || query.toLowerCase().includes("robot")) {
        responseContent = `Here is your optimized VEXcode IQ Python autonomous routine:\n\n\`\`\`python\nimport vex\nfrom vex import Brain, Motor, Optics, Ports, FORWARD, MM, PERCENT\n\nbrain = Brain()\nLeftDrive = Motor(Ports.PORT1, GearSetting.RATIO_18_1, False)\nRightDrive = Motor(Ports.PORT6, GearSetting.RATIO_18_1, True)\nOpticalSensor = Optics(Ports.PORT3)\n\ndef run_autonomous():\n    brain.screen.print("Kyro Autonomous Active")\n    LeftDrive.spin_for(FORWARD, 300, MM, 80, PERCENT, False)\n    RightDrive.spin_for(FORWARD, 300, MM, 80, PERCENT, True)\n\nrun_autonomous()\n\`\`\`\n\n⚡ You can also open this directly in the [Kyro 3D & Robotics Studio](/studio) for live hardware execution!`;
      } else if (query.toLowerCase().includes("blender") || query.toLowerCase().includes("gear")) {
        responseContent = `Here is a procedural Blender Python (\`bpy\`) script to generate a 24-tooth spur gear:\n\n\`\`\`python\nimport bpy\nimport math\n\ndef create_gear(teeth=24, radius=5.0):\n    mesh = bpy.data.meshes.new("KyroGearMesh")\n    obj = bpy.data.objects.new("SpurGear", mesh)\n    bpy.context.collection.objects.link(obj)\n    print(f"Generated {teeth}-tooth gear.")\n\ncreate_gear()\n\`\`\n\n🚀 Push directly to your Blender session via the [Kyro 3D Studio](/studio)!`;
      } else {
        responseContent = `I am **Kyro AI**, running with **${MODELS.find((m) => m.id === selectedModel)?.name}** in **${ASSISTANTS.find((a) => a.id === selectedAssistant)?.name}** mode.\n\nHow else can I assist you with your project today?`;
      }

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseContent,
        thinking: thinkingContent || undefined,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsGenerating(false);

      // Create a thread if new
      if (messages.length === 0) {
        const newThread: Thread = {
          id: Date.now().toString(),
          title: query.slice(0, 30) + (query.length > 30 ? "..." : ""),
          updatedAt: "Just now",
        };
        setThreads((prev) => [newThread, ...prev]);
        setActiveThreadId(newThread.id);
      }
    }, 1000);
  };

  const handleNewChat = () => {
    setMessages([]);
    setActiveThreadId(null);
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  return (
    <div className="flex h-screen bg-[#0b0c10] text-[#edf0f7] font-sans overflow-hidden">
      {/* ── 1. Collapsible Left Sidebar (Gemini-Style History) ───────────────── */}
      <aside
        className={`bg-[#0e1017] border-r border-[#1e2333] transition-all duration-300 flex flex-col ${
          sidebarOpen ? "w-64" : "w-0 -translate-x-full overflow-hidden"
        }`}
      >
        <div className="p-4 border-b border-[#1e2333] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold flex items-center justify-center font-mono text-sm">
              K
            </div>
            <span className="font-display font-bold text-white text-base tracking-tight">Kyro AI</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg hover:bg-[#1a1f2e] text-slate-400 hover:text-white transition-colors"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={handleNewChat}
            className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-500/20 to-amber-600/10 hover:from-amber-500/30 hover:to-amber-600/20 border border-amber-500/30 text-amber-300 rounded-xl font-semibold text-xs flex items-center gap-2 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> New Conversation
          </button>
        </div>

        {/* Recent Conversations */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 text-xs font-medium">
          <div className="text-[11px] font-mono text-slate-500 px-2 py-1 uppercase tracking-wider">Recent Chats</div>
          {threads.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveThreadId(t.id)}
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors group ${
                activeThreadId === t.id ? "bg-[#181d2c] text-white font-semibold" : "text-slate-400 hover:bg-[#141824] hover:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <MessageSquare className="w-3.5 h-3.5 shrink-0 text-slate-500 group-hover:text-amber-400" />
                <span className="truncate">{t.title}</span>
              </div>
              <span className="text-[10px] text-slate-600 font-mono shrink-0">{t.updatedAt}</span>
            </button>
          ))}
        </div>

        {/* Sidebar Footer Navigation */}
        <div className="p-3 border-t border-[#1e2333] space-y-1 text-xs font-mono">
          <Link
            href="/studio"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-cyan-400 hover:bg-[#141824] transition-colors"
          >
            <Box className="w-4 h-4 text-cyan-400" /> 🚀 3D & Robotics Studio
          </Link>
          <Link
            href="/dev"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:bg-[#141824] hover:text-white transition-colors"
          >
            <Key className="w-4 h-4" /> API Keys & Developer Portal
          </Link>
          <Link
            href="/status"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:bg-[#141824] hover:text-white transition-colors"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400"></div> System Status & SLA
          </Link>
        </div>
      </aside>

      {/* ── 2. Main Workspace Surface ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#090a0e]">
        {/* TOP TOOLBAR MATCHING REFERENCE IMAGE */}
        <header className="border-b border-[#1b202e] bg-[#0c0e14] px-4 py-2.5 flex items-center justify-between gap-3 overflow-x-auto select-none">
          <div className="flex items-center gap-2">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-1.5 rounded-lg hover:bg-[#1a1f2e] text-slate-400 hover:text-white mr-1"
              >
                <PanelLeft className="w-4 h-4" />
              </button>
            )}

            {/* Model Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowModelMenu(!showModelMenu)}
                className="px-3 py-1.5 bg-[#141724] border border-[#242b3d] hover:border-amber-500/40 rounded-lg text-xs font-medium text-slate-200 flex items-center gap-2 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{MODELS.find((m) => m.id === selectedModel)?.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
              {showModelMenu && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-[#121522] border border-[#242b3d] rounded-xl shadow-2xl p-1.5 z-50 space-y-1">
                  {MODELS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setSelectedModel(m.id);
                        setShowModelMenu(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg text-xs transition-colors ${
                        selectedModel === m.id ? "bg-amber-500/20 text-amber-300 font-semibold" : "hover:bg-[#1a1f30] text-slate-300"
                      }`}
                    >
                      <div className="font-semibold">{m.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{m.desc}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Assistant Mode Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowAssistantMenu(!showAssistantMenu)}
                className="px-3 py-1.5 bg-[#141724] border border-[#242b3d] hover:border-amber-500/40 rounded-lg text-xs font-medium text-slate-200 flex items-center gap-2 transition-all"
              >
                <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>{ASSISTANTS.find((a) => a.id === selectedAssistant)?.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
              {showAssistantMenu && (
                <div className="absolute top-full left-0 mt-1 w-60 bg-[#121522] border border-[#242b3d] rounded-xl shadow-2xl p-1.5 z-50 space-y-1">
                  {ASSISTANTS.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => {
                        setSelectedAssistant(a.id);
                        setShowAssistantMenu(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg text-xs transition-colors ${
                        selectedAssistant === a.id ? "bg-amber-500/20 text-amber-300 font-semibold" : "hover:bg-[#1a1f30] text-slate-300"
                      }`}
                    >
                      <div className="font-semibold">{a.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{a.desc}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search Toggle Button */}
            <button
              onClick={() => setSearchActive(!searchActive)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
                searchActive
                  ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300"
                  : "bg-[#141724] border-[#242b3d] text-slate-400 hover:text-white"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>

            {/* Arena Mode Button */}
            <button
              onClick={() => setArenaActive(!arenaActive)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
                arenaActive
                  ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                  : "bg-[#141724] border-[#242b3d] text-slate-400 hover:text-white"
              }`}
            >
              <Swords className="w-3.5 h-3.5" />
              <span>Arena</span>
            </button>

            {/* Agent Mode Button */}
            <button
              onClick={() => setAgentActive(!agentActive)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
                agentActive
                  ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                  : "bg-[#141724] border-[#242b3d] text-slate-400 hover:text-white"
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Agent</span>
            </button>

            {/* Thinking Button (Highlighted Amber Box Matching Reference Image) */}
            <button
              onClick={() => setThinkingActive(!thinkingActive)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                thinkingActive
                  ? "bg-amber-500/15 border-amber-500/60 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                  : "bg-[#141724] border-[#242b3d] text-slate-400 hover:text-white"
              }`}
            >
              <Brain className="w-3.5 h-3.5 text-amber-400" />
              <span>Thinking</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Pro+ Key Button */}
            <button
              onClick={() => setShowProKeyModal(true)}
              className="px-3 py-1.5 bg-[#141724] border border-[#242b3d] hover:border-amber-500/40 rounded-lg text-xs font-medium text-slate-300 flex items-center gap-1.5 transition-all"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>Pro+ Key</span>
            </button>

            {/* Prompts Button */}
            <button
              onClick={() => setShowPromptsModal(true)}
              className="px-3 py-1.5 bg-[#141724] border border-[#242b3d] hover:border-amber-500/40 rounded-lg text-xs font-medium text-slate-300 flex items-center gap-1.5 transition-all"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Prompts</span>
            </button>

            {/* Share Button */}
            <button
              onClick={() => setShowShareModal(true)}
              className="px-3 py-1.5 bg-[#141724] border border-[#242b3d] hover:border-amber-500/40 rounded-lg text-xs font-medium text-slate-300 flex items-center gap-1.5 transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          </div>
        </header>

        {/* CHAT MESSAGES CANVAS */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 max-w-4xl mx-auto w-full">
          {/* Welcome Greeting when no messages */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[420px] text-center space-y-6 pt-12">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-amber-400/10 to-cyan-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-2xl">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="space-y-2 max-w-lg">
                <h2 className="font-display font-bold text-3xl text-white tracking-tight">
                  Hello! What would you like to build or explore?
                </h2>
                <p className="text-sm text-slate-400">
                  Kyro AI brings together high-speed conversation, deep reasoning, live web search, and 3D/Robotics tools into one surface.
                </p>
              </div>

              {/* Prompt Suggestion Chips */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-xl text-left font-mono text-xs">
                {PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(p)}
                    className="p-3.5 bg-[#121522] border border-[#22283a] hover:border-amber-500/40 hover:bg-[#171b2e] rounded-xl text-slate-300 hover:text-white transition-all flex items-start justify-between group"
                  >
                    <span className="leading-relaxed">{p}</span>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 shrink-0 mt-0.5" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active Conversation Messages */}
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col space-y-2 ${m.role === "user" ? "items-end" : "items-start"}`}
            >
              <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 px-1">
                <span>{m.role === "user" ? "You" : "Kyro AI"}</span>
                <span>•</span>
                <span>{m.timestamp}</span>
              </div>

              {/* Thinking Accordion if present */}
              {m.thinking && (
                <details className="w-full max-w-2xl bg-[#0e111a] border border-[#22283a] rounded-xl p-3 text-xs font-mono text-amber-300/90 group">
                  <summary className="cursor-pointer font-semibold flex items-center gap-2 text-amber-400 select-none">
                    <Brain className="w-4 h-4" /> 🧠 Extended Thinking Process
                  </summary>
                  <pre className="mt-2 pt-2 border-t border-[#1a2030] text-[11px] leading-relaxed whitespace-pre-wrap text-slate-300">
                    {m.thinking}
                  </pre>
                </details>
              )}

              {/* Message Bubble */}
              <div
                className={`max-w-2xl rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-amber-500 text-slate-950 font-medium shadow-lg"
                    : "bg-[#121522] border border-[#22283a] text-slate-100 shadow-md"
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>
              </div>
            </div>
          ))}

          {isGenerating && (
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 bg-[#121522] border border-[#22283a] rounded-xl p-3 max-w-xs">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Kyro is synthesizing response...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* ── 3. Bottom Floating Chat Input Bar ───────────────────────────────── */}
        <footer className="p-4 border-t border-[#1b202e] bg-[#0c0e14] flex justify-center">
          <div className="w-full max-w-3xl bg-[#121522] border border-[#242b3d] focus-within:border-amber-500/60 rounded-2xl p-2 shadow-2xl flex flex-col transition-all">
            <textarea
              rows={2}
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask Kyro AI anything or type a prompt..."
              className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none p-2 resize-none font-sans"
            />

            <div className="flex items-center justify-between pt-2 px-2 border-t border-[#1a1f2e] text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="p-1.5 hover:bg-[#1c2235] text-slate-400 hover:text-white rounded-lg transition-colors"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="p-1.5 hover:bg-[#1c2235] text-slate-400 hover:text-white rounded-lg transition-colors"
                >
                  <Mic className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-mono text-slate-500 border-l border-[#1a1f2e] pl-2">
                  {MODELS.find((m) => m.id === selectedModel)?.name}
                </span>
              </div>

              <button
                onClick={() => handleSendMessage()}
                disabled={!inputPrompt.trim() || isGenerating}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* ── 4. Modals (Pro+ Key, Prompts, Share) ─────────────────────────────── */}

      {/* Pro+ Key Modal */}
      {showProKeyModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121522] border border-[#242b3d] rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowProKeyModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-amber-400 font-bold font-display text-lg">
              <Key className="w-5 h-5" /> Pro+ API Key Manager
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Configure your personal Kyro Pro+ API key for unlimited request throughput across OpenAI SDK & REST endpoints.
            </p>
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-300">Active API Key</label>
              <div className="bg-[#090b10] border border-[#242b3d] rounded-lg p-2.5 font-mono text-xs text-amber-300 flex items-center justify-between">
                <span>kyro_sk_live_9f82a1738192</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText("kyro_sk_live_9f82a1738192");
                    setCopiedApiKey(true);
                    setTimeout(() => setCopiedApiKey(false), 2000);
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  {copiedApiKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowProKeyModal(false)}
                className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prompts Library Modal */}
      {showPromptsModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121522] border border-[#242b3d] rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowPromptsModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-white font-bold font-display text-lg">
              <BookOpen className="w-5 h-5 text-amber-400" /> Prompt Preset Library
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {PROMPTS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInputPrompt(p);
                    setShowPromptsModal(false);
                  }}
                  className="w-full text-left p-3 bg-[#0a0c12] hover:bg-[#161a2b] border border-[#22283a] rounded-xl text-xs font-mono text-slate-300 hover:text-amber-300 transition-colors flex items-center justify-between"
                >
                  <span>{p}</span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121522] border border-[#242b3d] rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-white font-bold font-display text-lg">
              <Share2 className="w-5 h-5 text-amber-400" /> Share Conversation
            </div>
            <p className="text-xs text-slate-400">Generates a public read-only link to share this chat session.</p>
            <div className="bg-[#090b10] border border-[#242b3d] rounded-lg p-2.5 font-mono text-xs text-cyan-300 flex items-center justify-between">
              <span>https://kyro-web-rodh.onrender.com/share/c_92a18</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText("https://kyro-web-rodh.onrender.com/share/c_92a18");
                  setCopiedShare(true);
                  setTimeout(() => setCopiedShare(false), 2000);
                }}
                className="text-slate-400 hover:text-white"
              >
                {copiedShare ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
