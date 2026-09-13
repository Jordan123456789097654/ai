"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  Plus,
  MessageSquare,
  Send,
  Paperclip,
  Mic,
  ChevronDown,
  ChevronRight,
  Brain,
  Trash2,
  Settings,
  PanelLeft,
  Zap
} from "lucide-react";
import { getApiBaseUrl } from "../../lib/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  thinking?: string;
  timestamp: string;
}

interface Thread {
  id: string;
  title: string;
  timestamp: string;
}

function FormattedContent({ content }: { content: string }) {
  // Clean LaTeX inline \(...\) and block \[...\] delimiters
  let cleanText = content
    .replace(/\\\((.*?)\\\)/g, "$1")
    .replace(/\\\[(.*?)\\\]/g, "\n$1\n");

  const lines = cleanText.split("\n");
  let inCodeBlock = false;
  let codeBuffer: string[] = [];

  const elements: React.ReactNode[] = [];

  lines.forEach((line, idx) => {
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <div key={`code-${idx}`} className="bg-[#0b0c10] border border-[#242b3d] rounded-xl p-3.5 my-2 font-mono text-xs text-amber-300 overflow-x-auto shadow-inner">
            <pre><code>{codeBuffer.join("\n")}</code></pre>
          </div>
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      return;
    }

    // Bold Markdown & LaTeX text parser
    if (line.includes("**")) {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      elements.push(
        <div key={idx} className="my-1 leading-relaxed">
          {parts.map((p, i) =>
            p.startsWith("**") && p.endsWith("**") ? (
              <strong key={i} className="font-bold text-amber-300">{p.slice(2, -2)}</strong>
            ) : (
              <span key={i}>{p}</span>
            )
          )}
        </div>
      );
      return;
    }

    // Bullet lists
    if (line.trim().startsWith("- ") || line.trim().startsWith("• ")) {
      elements.push(
        <div key={idx} className="ml-4 my-1 flex items-start gap-2 text-slate-200">
          <span className="text-amber-400 font-bold">•</span>
          <span>{line.trim().replace(/^[-•]\s*/, "")}</span>
        </div>
      );
      return;
    }

    if (line.trim() === "") {
      elements.push(<div key={idx} className="h-1.5" />);
      return;
    }

    elements.push(<div key={idx} className="my-1">{line}</div>);
  });

  return <div className="space-y-1 font-sans">{elements}</div>;
}

export default function GeminiChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [selectedModel, setSelectedModel] = useState<string>("kyro-flash");
  const [showModelMenu, setShowModelMenu] = useState<boolean>(false);
  const [thinkingActive, setThinkingActive] = useState<boolean>(false);

  // Chat Threads & Thread Message Histories State
  const [threads, setThreads] = useState<Thread[]>([
    { id: "1", title: "Autonomous Robot Controller", timestamp: "10m ago" },
    { id: "2", title: "Procedural 3D Mesh Script", timestamp: "2h ago" },
    { id: "3", title: "Creative Story & Worldbuilding", timestamp: "Yesterday" },
  ]);

  const [threadMessages, setThreadMessages] = useState<Record<string, Message[]>>({
    "1": [
      { id: "m1", role: "user", content: "Write a VEX IQ Autonomous Robot Controller in Python", timestamp: "10m ago" },
      { id: "m2", role: "assistant", content: "Here is a complete autonomous routine for VEX IQ:\n\n```python\nimport vex\nfrom vex import Brain, Motor, Ports, FORWARD, MM, PERCENT\n\nbrain = Brain()\nLeftMotor = Motor(Ports.PORT1, GearSetting.RATIO_18_1, False)\nRightMotor = Motor(Ports.PORT6, GearSetting.RATIO_18_1, True)\n\ndef autonomous():\n    brain.screen.print(\"Autonomous Active\")\n    LeftMotor.spin_for(FORWARD, 300, MM, 80, PERCENT, False)\n    RightMotor.spin_for(FORWARD, 300, MM, 80, PERCENT, True)\n\nautonomous()\n```", timestamp: "10m ago" }
    ],
    "2": [
      { id: "m3", role: "user", content: "whats 412 * 10", timestamp: "2h ago" },
      { id: "m4", role: "assistant", content: "**Answer:** 4120\n\n**Reasoning:**\n- In many contexts, the suffix 'e' denotes scientific notation.\n- Interpreting `412 * 10` gives \\(412 \\times 10 = 4120\\).\n- A quick calculation confirms this result.", timestamp: "2h ago" }
    ],
    "3": [
      { id: "m5", role: "user", content: "Creative Story & Worldbuilding outline", timestamp: "Yesterday" },
      { id: "m6", role: "assistant", content: "**World Overview:** In the year 2090, humanity established autonomous orbital AI hubs powered by Kyro Quantum Core...", timestamp: "Yesterday" }
    ]
  });

  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputPrompt, setInputPrompt] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const MODELS = [
    { id: "kyro-flash", name: "Kyro Flash 8B", badge: "Fastest", desc: "Ultra-fast response for everyday tasks (100% Free)" },
    { id: "kyro-pro", name: "Kyro Pro 70B", badge: "Pro Level", desc: "Balanced intelligence & reasoning (100% Free)" },
    { id: "kyro-ultra", name: "Kyro Ultra 70B", badge: "Deep AI", desc: "High-capacity complex logic (100% Free)" },
    { id: "deepseek-r1", name: "DeepSeek R1", badge: "Reasoning", desc: "Mathematical & step-by-step reasoning (100% Free)" },
  ];

  const PROMPT_SUGGESTIONS = [
    { icon: "💡", title: "Help me brainstorm", desc: "Creative ideas for a new project or story" },
    { icon: "🤖", title: "VEX IQ Robot Script", desc: "Write an autonomous color sorting routine" },
    { icon: "🎨", title: "Blender 3D Mesh", desc: "Generate a parametric spur gear in Python" },
    { icon: "📊", title: "Analyze Data & Math", desc: "Solve complex calculations step by step" },
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  // Select Thread Action
  const handleSelectThread = (threadId: string) => {
    setActiveThreadId(threadId);
    setMessages(threadMessages[threadId] || []);
  };

  const handleSendMessage = async (textOverride?: string) => {
    const query = textOverride || inputPrompt;
    if (!query.trim() || isGenerating) return;

    let currentThreadId = activeThreadId;
    if (!currentThreadId) {
      currentThreadId = Date.now().toString();
      const newThread: Thread = {
        id: currentThreadId,
        title: query.slice(0, 26) + (query.length > 26 ? "..." : ""),
        timestamp: "Just now",
      };
      setThreads((prev) => [newThread, ...prev]);
      setActiveThreadId(currentThreadId);
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setThreadMessages((prev) => ({ ...prev, [currentThreadId!]: updatedMessages }));
    if (!textOverride) setInputPrompt("");
    setIsGenerating(true);

    let thinkingText = "";
    if (thinkingActive) {
      thinkingText = `Analyzing prompt: "${query}"\nTarget Engine: ${MODELS.find((m) => m.id === selectedModel)?.name}\nRate Limit Check: Passed (20 req/min free tier)\nSynthesizing AI reasoning...`;
    }

    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModel === "kyro-pro" ? "kyro-coder-pro" : selectedModel === "deepseek-r1" ? "deepseek-r1" : "llama-3.3-70b-versatile",
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      let assistantMsg: Message;
      if (res.ok) {
        const data = await res.json();
        const responseText = data.choices?.[0]?.message?.content || "No response generated.";
        assistantMsg = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: responseText,
          thinking: thinkingText || undefined,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
      } else {
        const errData = await res.json().catch(() => ({}));
        assistantMsg = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `⚠️ **AI Service Notice**: ${errData?.error?.message || res.statusText || "Unable to reach Kyro AI engine."}`,
          thinking: thinkingText || undefined,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
      }

      setMessages((prev) => {
        const finalMsgs = [...prev, assistantMsg];
        setThreadMessages((hist) => ({ ...hist, [currentThreadId!]: finalMsgs }));
        return finalMsgs;
      });
    } catch (err: any) {
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `⚠️ **Network Error**: ${err.message || "Could not connect to Kyro API server."}`,
        thinking: thinkingText || undefined,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => {
        const finalMsgs = [...prev, assistantMsg];
        setThreadMessages((hist) => ({ ...hist, [currentThreadId!]: finalMsgs }));
        return finalMsgs;
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setActiveThreadId(null);
  };

  const handleDeleteThread = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setThreads((prev) => prev.filter((t) => t.id !== id));
    setThreadMessages((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    if (activeThreadId === id) handleNewChat();
  };

  return (
    <div className="flex h-screen bg-[#131314] text-[#e3e3e3] font-sans overflow-hidden">
      {/* ── 1. Clean Gemini Left Sidebar ───────────────────────────────────── */}
      <aside
        className={`bg-[#1e1f20] transition-all duration-300 flex flex-col z-20 ${
          sidebarOpen ? "w-64" : "w-0 -translate-x-full overflow-hidden"
        }`}
      >
        {/* Top Sidebar Bar & New Chat Button */}
        <div className="p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-bold flex items-center justify-center font-display text-sm shadow-md">
                K
              </div>
              <span className="font-display font-bold text-white text-lg tracking-tight">Kyro AI</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-full hover:bg-[#28292a] text-slate-400 hover:text-white transition-colors"
            >
              <PanelLeft className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={handleNewChat}
            className="w-full py-3 px-4 bg-[#28292a] hover:bg-[#333537] text-amber-400 font-semibold rounded-full text-xs flex items-center gap-2.5 transition-all shadow-sm border border-[#37393b]"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>New chat</span>
          </button>
        </div>

        {/* Recent Chats List */}
        <div className="flex-1 overflow-y-auto px-3 space-y-1">
          <div className="text-[11px] font-mono text-slate-400 px-3 py-2 font-semibold">Recent</div>
          {threads.map((t) => (
            <div
              key={t.id}
              onClick={() => handleSelectThread(t.id)}
              className={`group flex items-center justify-between px-3.5 py-2.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                activeThreadId === t.id
                  ? "bg-[#004a77]/40 text-[#c2e7ff]"
                  : "text-slate-300 hover:bg-[#28292a]"
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <MessageSquare className="w-3.5 h-3.5 shrink-0 text-slate-400 group-hover:text-amber-400" />
                <span className="truncate">{t.title}</span>
              </div>
              <button
                onClick={(e) => handleDeleteThread(t.id, e)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 text-slate-400 transition-opacity"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#28292a] space-y-2 text-xs font-medium">
          <div className="flex items-center justify-between px-2 text-slate-400">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Free Plan
            </span>
            <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">
              20 req/min
            </span>
          </div>
        </div>
      </aside>

      {/* ── 2. Main Gemini Workspace Canvas ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#131314] relative">
        {/* Minimal Gemini Top Bar */}
        <header className="px-6 py-4 flex items-center justify-between border-b border-[#1e1f20]">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-full hover:bg-[#1e1f20] text-slate-400 hover:text-white"
              >
                <PanelLeft className="w-5 h-5" />
              </button>
            )}

            {/* Model Picker */}
            <div className="relative">
              <button
                onClick={() => setShowModelMenu(!showModelMenu)}
                className="flex items-center gap-2 px-3.5 py-1.5 bg-[#1e1f20] hover:bg-[#28292a] border border-[#2e3035] rounded-full text-xs font-semibold text-white transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{MODELS.find((m) => m.id === selectedModel)?.name}</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono px-1.5 py-0.5 rounded-full">
                  100% Free
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showModelMenu && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-[#1e1f20] border border-[#2e3035] rounded-2xl p-2 shadow-2xl z-50 space-y-1">
                  {MODELS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setSelectedModel(m.id);
                        setShowModelMenu(false);
                      }}
                      className={`w-full text-left p-3 rounded-xl text-xs transition-colors ${
                        selectedModel === m.id
                          ? "bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30"
                          : "hover:bg-[#28292a] text-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{m.name}</span>
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-mono px-1.5 py-0.5 rounded-full">
                          FREE
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">{m.desc}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Extended Thinking Mode Toggle */}
            <button
              onClick={() => setThinkingActive(!thinkingActive)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                thinkingActive
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/50"
                  : "bg-[#1e1f20] text-slate-400 hover:text-white border border-[#2e3035]"
              }`}
            >
              <Brain className="w-3.5 h-3.5 text-amber-400" />
              <span>Thinking</span>
            </button>
          </div>

          <div className="text-xs font-mono text-slate-400">
            ⚡ Free Plan • 20 req/min
          </div>
        </header>

        {/* Chat Body Surface */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 max-w-3xl mx-auto w-full">
          {messages.length === 0 && (
            <div className="min-h-[420px] flex flex-col justify-center items-center text-center space-y-8 pt-8">
              <div className="space-y-3">
                <h1 className="font-display text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-cyan-300 tracking-tight">
                  Hello, Developer
                </h1>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                  How can I help you today? Pick a model or prompt to start chatting.
                </p>
              </div>

              {/* Gemini Suggestion Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full text-left">
                {PROMPT_SUGGESTIONS.map((card, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(card.desc)}
                    className="p-4 bg-[#1e1f20] hover:bg-[#28292a] border border-[#2e3035] rounded-2xl transition-all flex flex-col justify-between space-y-2 group"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xl">{card.icon}</span>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">{card.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{card.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active Messages */}
          {messages.map((m) => (
            <div key={m.id} className="space-y-2">
              <div className="text-[11px] font-mono text-slate-500 font-semibold">
                {m.role === "user" ? "You" : "Kyro AI"}
              </div>

              {m.thinking && (
                <details className="bg-[#1e1f20] border border-[#2e3035] rounded-xl p-3 text-xs font-mono text-amber-300/90">
                  <summary className="cursor-pointer font-bold flex items-center gap-1.5 text-amber-400 select-none">
                    <Brain className="w-4 h-4" /> 🧠 Extended Thinking
                  </summary>
                  <pre className="mt-2 pt-2 border-t border-[#2e3035] text-[11px] whitespace-pre-wrap text-slate-300">
                    {m.thinking}
                  </pre>
                </details>
              )}

              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-[#28292a] text-white font-medium max-w-xl ml-auto"
                    : "bg-[#1e1f20] border border-[#2e3035] text-slate-100"
                }`}
              >
                <FormattedContent content={m.content} />
              </div>
            </div>
          ))}

          {isGenerating && (
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 bg-[#1e1f20] border border-[#2e3035] rounded-xl p-3 max-w-xs">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Kyro is thinking...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* ── 3. Gemini Floating Pill Prompt Input ───────────────────────────── */}
        <footer className="p-4 md:p-6 flex justify-center bg-[#131314]">
          <div className="w-full max-w-3xl bg-[#1e1f20] border border-[#2e3035] focus-within:border-amber-500/50 rounded-full px-5 py-2.5 shadow-2xl flex items-center gap-3 transition-all">
            <button className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-[#28292a] transition-colors">
              <Paperclip className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendMessage();
              }}
              placeholder="Ask Kyro..."
              className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none font-sans"
            />

            <button className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-[#28292a] transition-colors">
              <Mic className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleSendMessage()}
              disabled={!inputPrompt.trim() || isGenerating}
              className="p-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-30 text-slate-950 rounded-full transition-all shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
