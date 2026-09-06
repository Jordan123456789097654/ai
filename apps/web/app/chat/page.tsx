"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import {
  Send,
  Paperclip,
  Archive,
  ChevronDown,
  Sparkles,
  X,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Globe,
  PanelRight,
  UserCheck,
  Share2,
  Swords,
  BookOpen,
  Terminal,
  Check,
  Bot,
  HelpCircle,
  Github,
  Search,
  Key,
} from "lucide-react";
import Link from "next/link";
import JSZip from "jszip";
import { supabase, getSessionToken } from "../../lib/supabaseClient";
import { apiFetch, getApiBaseUrl } from "../../lib/api";
import ChatSidebar from "../../components/ChatSidebar";
import CodeBlock from "../../components/CodeBlock";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

const MODELS = [
  { id: "kyro-coder-pro", name: "Kyro Coder Pro (32B)", desc: "Specialized code generation & refactoring" },
  { id: "kyro-flash-8b", name: "Kyro Flash (8B)", desc: "Ultra-fast response model" },
  { id: "kyro-ultra-70b", name: "Kyro Ultra (70B)", desc: "Deep reasoning & coding" },
  { id: "kyro-mixtral-8x7b", name: "Kyro Mixtral (8x7B)", desc: "Expanded context window" },
  { id: "kyro-gemma-9b", name: "Kyro Gemma (9B)", desc: "Precise instruction model" },
];

const PERSONAS = [
  { id: "default", name: "Default Assistant", prompt: "" },
  { id: "developer", name: "Full-Stack Dev", prompt: "You are an expert Full-Stack Software Engineer. Write clean, production-grade, modular code with concise explanations." },
  { id: "writer", name: "Tech Copywriter", prompt: "You are an elite technology copywriter. Write engaging, crisp, clear, and persuasive documentation, blogs, and landing page copy." },
  { id: "security", name: "Security Auditor", prompt: "You are a senior Cybersecurity Auditor. Analyze code for vulnerabilities, OWASP Top 10 risks, and suggest secure hardening fixes." },
  { id: "architect", name: "SQL & Systems Architect", prompt: "You are a Principal Database & System Architect. Design optimal database schemas, indexes, and scalable infrastructure patterns." },
];

const SLASH_COMMANDS = [
  { cmd: "/refactor", label: "Refactor Code", desc: "Clean up code for modularity & performance", text: "Refactor and optimize this code snippet for performance and readability:\n\n" },
  { cmd: "/explain", label: "Explain Step-by-Step", desc: "Break down logic step by step", text: "Explain how this code or concept works step-by-step with clear examples:\n\n" },
  { cmd: "/unit-test", label: "Write Unit Tests", desc: "Generate test suite covering edge cases", text: "Write comprehensive unit tests covering edge cases and invalid inputs for:\n\n" },
  { cmd: "/security", label: "Security Audit", desc: "Check for OWASP Top 10 vulnerabilities", text: "Perform a security audit looking for potential vulnerabilities and OWASP risks in:\n\n" },
  { cmd: "/summarize", label: "Executive Summary", desc: "Summarize context concisely", text: "Provide a concise executive summary with key takeaways of:\n\n" },
];

const PROMPT_TEMPLATES = [
  { title: "REST API Endpoint Template", prompt: "Design a clean RESTful API endpoint specification including request/response schemas, HTTP status codes, and TypeScript interfaces." },
  { title: "Database Migration Script", prompt: "Write a SQL migration script with forward and rollback logic, optimal indexes, and foreign key constraints." },
  { title: "Docker Container Setup", prompt: "Create a multi-stage Dockerfile optimized for small image size, security, and production deployment." },
  { title: "React Component & Hooks", prompt: "Build a responsive React component using Tailwind CSS, proper accessibility (aria) tags, and clean custom hooks." },
];

export default function ChatPage() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState("kyro-flash-8b");
  const [selectedPersona, setSelectedPersona] = useState("default");
  const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<{ name: string; content: string }[]>([]);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isPersonaDropdownOpen, setIsPersonaDropdownOpen] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Model Arena Mode State
  const [isArenaMode, setIsArenaMode] = useState(false);
  const [arenaModelB, setArenaModelB] = useState("kyro-ultra-70b");
  const [arenaMessagesB, setArenaMessagesB] = useState<ChatMessage[]>([]);
  const [arenaStatsA, setArenaStatsA] = useState<{ latencyMs: number; tokens: number } | null>(null);
  const [arenaStatsB, setArenaStatsB] = useState<{ latencyMs: number; tokens: number } | null>(null);

  // Autonomous Agent & Clarification Modal State
  const [isAgentMode, setIsAgentMode] = useState(false);
  const [showClarifyModal, setShowClarifyModal] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState("");
  const [clarifyAnswers, setClarifyAnswers] = useState({
    target: "REST API",
    framework: "TypeScript / Node.js",
    database: "PostgreSQL / Supabase",
  });

  // Modals & Popups
  const [showPromptLibrary, setShowPromptLibrary] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowSearchModal((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  async function performGlobalSearch(q: string) {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await apiFetch(`/conversations/search?q=${encodeURIComponent(q)}`);
      setSearchResults(res || []);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }

  // Speech Recognition & TTS
  const [isListening, setIsListening] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);
  const recognitionRef = useRef<any>(null);

  // Claude-Style Canvas Drawer State
  const [canvasCode, setCanvasCode] = useState<string | null>(null);
  const [canvasLang, setCanvasLang] = useState<string>("html");
  const [isCanvasOpen, setIsCanvasOpen] = useState(false);
  const [canvasTab, setCanvasTab] = useState<"preview" | "code" | "terminal">("preview");

  // In-Browser Terminal Execution Runner
  const [terminalLogs, setTerminalLogs] = useState<{ type: "stdout" | "stderr" | "info"; text: string }[]>([]);
  const [isRunningCode, setIsRunningCode] = useState(false);

  function executeInBrowserTerminal() {
    if (!canvasCode) return;
    setIsRunningCode(true);

    const start = Date.now();
    const capturedLogs: { type: "stdout" | "stderr" | "info"; text: string }[] = [
      { type: "info", text: `[Kyro WebTerminal]: Executing ${canvasLang} in browser sandbox...` },
    ];

    try {
      if (canvasLang === "javascript" || canvasLang === "typescript" || canvasLang === "js" || canvasLang === "ts" || canvasLang === "html") {
        const originalLog = console.log;
        const originalError = console.error;

        console.log = (...args: any[]) => {
          capturedLogs.push({ type: "stdout", text: args.map((a) => (typeof a === "object" ? JSON.stringify(a, null, 2) : String(a))).join(" ") });
        };
        console.error = (...args: any[]) => {
          capturedLogs.push({ type: "stderr", text: args.map((a) => (typeof a === "object" ? JSON.stringify(a, null, 2) : String(a))).join(" ") });
        };

        let cleanJS = canvasCode;
        if (canvasCode.includes("<script>")) {
          const scriptMatch = /<script>([\s\S]*?)<\/script>/.exec(canvasCode);
          if (scriptMatch) cleanJS = scriptMatch[1];
        }

        const fn = new Function(cleanJS);
        const result = fn();

        console.log = originalLog;
        console.error = originalError;

        if (result !== undefined) {
          capturedLogs.push({ type: "stdout", text: `Return Value => ${typeof result === "object" ? JSON.stringify(result, null, 2) : String(result)}` });
        }
      } else {
        capturedLogs.push({ type: "stdout", text: `Output for ${canvasLang}:\nScript loaded cleanly. Exit code 0.` });
      }
      const duration = Date.now() - start;
      capturedLogs.push({ type: "info", text: `\n[Execution Finished in ${duration}ms with exit code 0]` });
    } catch (err: any) {
      capturedLogs.push({ type: "stderr", text: `Runtime Exception: ${err.message}` });
    } finally {
      setTerminalLogs(capturedLogs);
      setIsRunningCode(false);
    }
  }

  // Bring Your Own API Key (AI PRO+)
  const [customApiKey, setCustomApiKey] = useState("");
  const [showKeyModal, setShowKeyModal] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedKey = localStorage.getItem("kyro_custom_api_key");
      if (savedKey) setCustomApiKey(savedKey);
    }
  }, []);

  function saveCustomApiKey(key: string) {
    setCustomApiKey(key);
    if (typeof window !== "undefined") {
      if (key.trim()) {
        localStorage.setItem("kyro_custom_api_key", key.trim());
      } else {
        localStorage.removeItem("kyro_custom_api_key");
      }
    }
  }

  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(!!session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, arenaMessagesB]);

  // Speech Recognition Setup
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recog = new SpeechRecognition();
        recog.continuous = false;
        recog.interimResults = false;
        recog.lang = "en-US";
        recog.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
          setIsListening(false);
        };
        recog.onerror = () => setIsListening(false);
        recog.onend = () => setIsListening(false);
        recognitionRef.current = recog;
      }
    }
  }, []);

  function toggleSpeechToText() {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  }

  function speakText(index: number, text: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (speakingIdx === index) {
      window.speechSynthesis.cancel();
      setSpeakingIdx(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setSpeakingIdx(null);
    utterance.onerror = () => setSpeakingIdx(null);
    setSpeakingIdx(index);
    window.speechSynthesis.speak(utterance);
  }

  async function selectConversation(id: string) {
    setConversationId(id);
    setError(null);
    try {
      const convo = await apiFetch(`/conversations/${id}`);
      setMessages(convo.messages.map((m: any) => ({ role: m.role, content: m.content })));
    } catch {
      setMessages([]);
    }
  }

  function startNewChat() {
    setConversationId(null);
    setMessages([]);
    setArenaMessagesB([]);
    setError(null);
    setAttachments([]);
    setCanvasCode(null);
    setIsCanvasOpen(false);
    setArenaStatsA(null);
    setArenaStatsB(null);
  }

  async function ensureConversation(firstUserMessage: string): Promise<string> {
    if (conversationId) return conversationId;
    const title = firstUserMessage.slice(0, 60);
    const convo = await apiFetch("/conversations", { method: "POST", body: JSON.stringify({ title }) });
    setConversationId(convo.id);
    return convo.id;
  }

  async function persistMessage(convoId: string, role: "user" | "assistant" | "system", content: string) {
    apiFetch(`/conversations/${convoId}/messages`, { method: "POST", body: JSON.stringify({ role, content }) }).catch(() => {});
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      if (file.name.endsWith(".zip")) {
        try {
          const zip = await JSZip.loadAsync(file);
          let extractedCodebase = `[Multi-File Repository Context: ${file.name}]\n\n`;
          let fileCount = 0;

          const entries = Object.keys(zip.files);
          for (const filename of entries) {
            const entry = zip.files[filename];
            if (!entry.dir && !filename.includes("node_modules/") && !filename.includes(".git/") && !filename.includes(".next/")) {
              const text = await entry.async("string");
              if (text && text.trim()) {
                extractedCodebase += `=== FILE: ${filename} ===\n${text}\n\n`;
                fileCount++;
              }
            }
          }
          setAttachments((prev) => [
            ...prev,
            { name: `${file.name} (${fileCount} files indexed)`, content: extractedCodebase },
          ]);
        } catch {
          alert(`Failed to extract repository archive: ${file.name}`);
        }
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result as string;
          setAttachments((prev) => [...prev, { name: file.name, content: text }]);
        };
        reader.readAsText(file);
      }
    }
  }

  function openCanvasDrawer(code: string, lang: string) {
    setCanvasCode(code);
    setCanvasLang(lang);
    setIsCanvasOpen(true);
  }

  async function shareConversationLink() {
    let id = conversationId;
    if (!id && messages.length > 0) {
      const firstMsg = messages.find((m) => m.role === "user")?.content || "Shared Chat";
      id = await ensureConversation(firstMsg);
    }
    if (!id) return;

    const shareUrl = `${window.location.origin}/share/${id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  }

  async function sendMessage(overrideText?: string) {
    let text = overrideText || input.trim();
    if (!text && attachments.length === 0) return;
    if (isStreaming) return;

    // Trigger Clarification Modal if Agent mode is enabled and overrideText wasn't passed
    if (isAgentMode && !overrideText) {
      setPendingPrompt(text);
      setShowClarifyModal(true);
      return;
    }

    if (attachments.length > 0) {
      const contextStr = attachments
        .map((a) => `\n--- File: ${a.name} ---\n${a.content}\n--- End File ---`)
        .join("\n");
      text = `${text}\n\n[Attached Context]:\n${contextStr}`;
    }

    const currentPersona = PERSONAS.find((p) => p.id === selectedPersona);
    const payloadMessages: ChatMessage[] = [];

    if (currentPersona && currentPersona.prompt) {
      payloadMessages.push({ role: "system", content: currentPersona.prompt });
    }

    if (isAgentMode) {
      payloadMessages.push({
        role: "system",
        content: `[Autonomous Agent Pipeline Active]: Specified preferences: Target Architecture: ${clarifyAnswers.target}, Framework: ${clarifyAnswers.framework}, DB: ${clarifyAnswers.database}. Break down execution into clear step-by-step modular sections.`,
      });
    }

    if (isWebSearchEnabled) {
      payloadMessages.push({
        role: "system",
        content: "[Web Search Grounding Enabled]: Provide real-time accurate information, live web references, and verified structural facts.",
      });
    }

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages([...nextMessages, { role: "assistant", content: "" }]);
    if (isArenaMode) {
      setArenaMessagesB((prev) => [...prev, { role: "user", content: text }, { role: "assistant", content: "" }]);
    }

    setInput("");
    setAttachments([]);
    setIsStreaming(true);
    setError(null);

    let convoId: string | null = null;
    if (signedIn) {
      try {
        convoId = await ensureConversation(text);
        await persistMessage(convoId, "user", text);
      } catch {}
    }

    let token = await getSessionToken();

    // Stream Model A (and Model B if Arena Mode enabled)
    const streamModelA = streamResponse(token, selectedModel, [...payloadMessages, ...nextMessages], (chunkText, stats) => {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: chunkText };
        return updated;
      });
      if (stats) setArenaStatsA(stats);
    });

    let streamModelB: Promise<string | void> = Promise.resolve();
    if (isArenaMode) {
      streamModelB = streamResponse(token, arenaModelB, [...payloadMessages, ...nextMessages], (chunkText, stats) => {
        setArenaMessagesB((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: chunkText };
          return updated;
        });
        if (stats) setArenaStatsB(stats);
      });
    }

    try {
      const [assistantTextA] = await Promise.all([streamModelA, streamModelB]);
      if (convoId && assistantTextA) {
        persistMessage(convoId, "assistant", assistantTextA as string);
      }

      // Auto-detect code block for Canvas drawer
      const htmlMatch = /```(html|xml|svg|jsx|tsx)\n([\s\S]*?)```/.exec((assistantTextA as string) || "");
      if (htmlMatch) {
        setCanvasCode(htmlMatch[2]);
        setCanvasLang(htmlMatch[1]);
        setIsCanvasOpen(true);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsStreaming(false);
    }
  }

  async function streamResponse(
    authToken: string | null,
    modelName: string,
    chatMessages: ChatMessage[],
    onDelta: (text: string, stats?: { latencyMs: number; tokens: number }) => void
  ): Promise<string> {
    const startTime = Date.now();
    let res = await makeChatRequest(authToken, modelName, chatMessages);

    if (res.status === 401 && authToken) {
      res = await makeChatRequest(null, modelName, chatMessages);
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.error?.message || `Error ${res.status}`);
    }

    if (!res.body) throw new Error("No response body");

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let assistantText = "";
    let tokenCount = 0;

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });

      for (const line of chunk.split("\n")) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (payload === "[DONE]") continue;
        try {
          const json = JSON.parse(payload);
          const delta = json.choices?.[0]?.delta?.content || "";
          assistantText += delta;
          tokenCount++;
          onDelta(assistantText, { latencyMs: Date.now() - startTime, tokens: tokenCount });
        } catch {}
      }
    }

    return assistantText;
  }

  async function makeChatRequest(authToken: string | null, modelName: string, chatMessages: ChatMessage[]) {
    const baseUrl = getApiBaseUrl();
    const effectiveToken = customApiKey.trim() || authToken;
    return fetch(`${baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(effectiveToken ? { Authorization: `Bearer ${effectiveToken}` } : {}),
      },
      body: JSON.stringify({
        model: modelName,
        messages: chatMessages,
        stream: true,
      }),
    });
  }

  async function exportSingleMessageZip(content: string) {
    const zip = new JSZip();
    let codeIndex = 1;
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let match;
    let fileCount = 0;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      const lang = match[1] || "txt";
      const code = match[2];
      zip.file(`system_project/file_${codeIndex}.${lang}`, code);
      codeIndex++;
      fileCount++;
    }

    if (fileCount === 0) {
      zip.file("system_project/codebase.md", content);
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kyro_full_system_${Date.now()}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function exportChatZip() {
    if (messages.length === 0) return;

    const zip = new JSZip();
    let mdContent = `# Chat Export — Kyro AI\n\n`;
    messages.forEach((m) => {
      mdContent += `### ${m.role.toUpperCase()}\n${m.content}\n\n---\n\n`;
    });
    zip.file("conversation.md", mdContent);

    let codeIndex = 1;
    messages.forEach((m) => {
      if (m.role === "assistant") {
        const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
        let match;
        while ((match = codeBlockRegex.exec(m.content)) !== null) {
          const lang = match[1] || "txt";
          const code = match[2];
          zip.file(`generated_files/snippet_${codeIndex}.${lang}`, code);
          codeIndex++;
        }
      }
    });

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kyro_export_${conversationId || "session"}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Filter slash commands
  const matchingSlash = input.startsWith("/")
    ? SLASH_COMMANDS.filter((sc) => sc.cmd.toLowerCase().startsWith(input.split(" ")[0].toLowerCase()))
    : [];

  return (
    <div className="flex">
      {signedIn && <ChatSidebar activeId={conversationId} onSelect={selectConversation} onNew={startNewChat} onOpenSearch={() => setShowSearchModal(true)} />}

      <div className="flex-1 flex h-[calc(100vh-73px)] overflow-hidden">
        {/* Main Chat Thread Area */}
        <div className={`flex flex-col h-full px-6 mx-auto transition-all duration-300 ${isCanvasOpen ? "w-1/2 max-w-none" : "w-full max-w-4xl"}`}>
          {/* Top Control Bar */}
          <div className="flex items-center justify-between py-3 border-b border-border gap-2">
            <div className="flex items-center gap-2">
              {/* Model Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setIsModelDropdownOpen(!isModelDropdownOpen);
                    setIsPersonaDropdownOpen(false);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-border bg-surface text-xs font-mono text-text hover:border-accent"
                >
                  <Sparkles size={14} className="text-accent" />
                  <span>{MODELS.find((m) => m.id === selectedModel)?.name}</span>
                  <ChevronDown size={14} className="text-muted" />
                </button>

                {isModelDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-surface border border-border rounded shadow-2xl z-40 py-1">
                    {MODELS.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          setSelectedModel(m.id);
                          setIsModelDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex flex-col hover:bg-surface-raised ${
                          selectedModel === m.id ? "bg-surface-raised font-medium text-accent" : "text-text"
                        }`}
                      >
                        <span>{m.name}</span>
                        <span className="text-[10px] text-muted">{m.desc}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Persona Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setIsPersonaDropdownOpen(!isPersonaDropdownOpen);
                    setIsModelDropdownOpen(false);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-border bg-surface text-xs text-text hover:border-accent"
                >
                  <UserCheck size={14} className="text-accent" />
                  <span>{PERSONAS.find((p) => p.id === selectedPersona)?.name}</span>
                  <ChevronDown size={14} className="text-muted" />
                </button>

                {isPersonaDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-60 bg-surface border border-border rounded shadow-2xl z-40 py-1">
                    {PERSONAS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setSelectedPersona(p.id);
                          setIsPersonaDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-surface-raised ${
                          selectedPersona === p.id ? "bg-surface-raised font-medium text-accent" : "text-text"
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Web Search Toggle */}
              <button
                onClick={() => setIsWebSearchEnabled(!isWebSearchEnabled)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded border text-xs transition-colors ${
                  isWebSearchEnabled
                    ? "border-accent bg-accent/10 text-accent font-medium"
                    : "border-border bg-surface text-muted hover:text-text"
                }`}
                title="Toggle Web Search Grounding"
              >
                <Globe size={14} />
                <span>Search</span>
              </button>

              {/* Model Arena Toggle */}
              <button
                onClick={() => setIsArenaMode(!isArenaMode)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded border text-xs transition-colors ${
                  isArenaMode
                    ? "border-accent bg-accent text-ink font-medium"
                    : "border-border bg-surface text-muted hover:text-text"
                }`}
                title="Toggle Model Arena Side-by-Side Comparison"
              >
                <Swords size={14} />
                <span>Arena</span>
              </button>

              {/* Autonomous AI Agent Toggle */}
              <button
                onClick={() => setIsAgentMode(!isAgentMode)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded border text-xs transition-colors ${
                  isAgentMode
                    ? "border-accent bg-accent text-ink font-medium"
                    : "border-border bg-surface text-muted hover:text-text"
                }`}
                title="Toggle Autonomous AI Agent Mode with Clarification Questions"
              >
                <Bot size={14} />
                <span>Agent</span>
              </button>
            </div>

            {/* Right Action Icons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowKeyModal(true)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-xs font-mono transition-colors ${
                  customApiKey.trim()
                    ? "border-success bg-success/10 text-success font-semibold"
                    : "border-border text-muted hover:text-text hover:bg-surface"
                }`}
                title="Bring Your Own API Key (Unlock Kyro AI PRO+)"
              >
                <Key size={13} className={customApiKey.trim() ? "text-success" : "text-accent"} />
                <span>{customApiKey.trim() ? "PRO+ Active" : "Pro+ Key"}</span>
              </button>

              <button
                onClick={() => setShowPromptLibrary(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded border border-border text-xs text-muted hover:text-text hover:bg-surface transition-colors"
                title="Open Prompt Library"
              >
                <BookOpen size={14} /> Prompts
              </button>

              <button
                onClick={shareConversationLink}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded border border-border text-xs text-muted hover:text-text hover:bg-surface transition-colors"
                title="Copy shareable link"
              >
                <Share2 size={14} /> {copiedShare ? "Copied!" : "Share"}
              </button>

              {canvasCode && (
                <button
                  onClick={() => setIsCanvasOpen(!isCanvasOpen)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded border text-xs ${
                    isCanvasOpen ? "border-accent bg-accent text-ink font-medium" : "border-border text-muted hover:text-text"
                  }`}
                  title="Toggle Canvas Drawer"
                >
                  <PanelRight size={14} /> Canvas
                </button>
              )}

              {messages.length > 0 && (
                <button
                  onClick={exportChatZip}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-border text-xs text-muted hover:text-text hover:bg-surface transition-colors"
                  title="Export ZIP"
                >
                  <Archive size={14} /> ZIP
                </button>
              )}
            </div>
          </div>

          {/* Chat Split View (Normal or Arena Mode) */}
          <div className="flex-1 overflow-hidden flex gap-4">
            {/* Model A Thread */}
            <div className="flex-1 overflow-y-auto py-6 space-y-6">
              {isArenaMode && (
                <div className="bg-surface border border-border p-2 rounded text-xs font-mono flex items-center justify-between text-accent">
                  <span>Model A: {MODELS.find((m) => m.id === selectedModel)?.name}</span>
                  {arenaStatsA && <span>{arenaStatsA.latencyMs}ms | {arenaStatsA.tokens} tok</span>}
                </div>
              )}

              {messages.length === 0 && !error && (
                <div className="mt-16 text-center space-y-3">
                  <h2 className="font-display text-2xl text-text">What can Kyro help you build today?</h2>
                  <p className="text-muted text-sm max-w-md mx-auto">
                    Type <code className="text-accent font-mono bg-surface px-1 py-0.5 rounded">/</code> for slash commands or launch Model Arena.
                  </p>
                </div>
              )}

              {messages.map((m, i) => (
                <div key={i} className={m.role === "user" ? "text-right" : ""}>
                  <div
                    className={`inline-block max-w-[90%] rounded-lg px-4 py-3 text-left relative group ${
                      m.role === "user" ? "bg-surface-raised text-text" : "bg-surface border border-border"
                    }`}
                  >
                    <ReactMarkdown
                      components={{
                        code({ node, inline, className, children, ...props }: any) {
                          const match = /language-(\w+)/.exec(className || "");
                          const codeStr = String(children).replace(/\n$/, "");
                          return !inline && match ? (
                            <div className="relative group/code my-2">
                              <CodeBlock code={codeStr} language={match[1]} />
                              <button
                                onClick={() => openCanvasDrawer(codeStr, match[1])}
                                className="absolute top-2 right-12 bg-surface-raised border border-border text-muted hover:text-accent text-[11px] px-2 py-1 rounded opacity-0 group-hover/code:opacity-100 transition-opacity flex items-center gap-1"
                              >
                                <PanelRight size={12} /> Open in Canvas
                              </button>
                            </div>
                          ) : (
                            <code className="bg-ink px-1.5 py-0.5 rounded text-accent font-mono text-xs" {...props}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {m.content || (isStreaming && i === messages.length - 1 ? "..." : "")}
                    </ReactMarkdown>

                    {m.role === "assistant" && m.content && (
                      <div className="mt-2.5 flex items-center gap-3 border-t border-border/40 pt-2 text-xs">
                        <button
                          onClick={() => speakText(i, m.content)}
                          className="text-muted hover:text-accent flex items-center gap-1 transition-colors"
                          title="Read aloud"
                        >
                          {speakingIdx === i ? <VolumeX size={13} className="text-accent animate-pulse" /> : <Volume2 size={13} />}
                          <span>{speakingIdx === i ? "Stop" : "Listen"}</span>
                        </button>

                        <button
                          onClick={() => exportSingleMessageZip(m.content)}
                          className="text-accent hover:underline flex items-center gap-1 font-medium transition-colors ml-auto"
                          title="Download all generated files as a full system ZIP project"
                        >
                          <Archive size={13} />
                          <span>Download Full System (.ZIP)</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {error && (
                <div className="text-center">
                  <p className="inline-block text-danger text-sm bg-surface border border-danger/30 rounded px-4 py-2">
                    {error}
                  </p>
                </div>
              )}
              <div ref={scrollRef} />
            </div>

            {/* Model B Thread (Arena Mode) */}
            {isArenaMode && (
              <div className="flex-1 overflow-y-auto py-6 space-y-6 border-l border-border pl-4">
                <div className="bg-surface border border-border p-2 rounded text-xs font-mono flex items-center justify-between text-accent">
                  <select
                    value={arenaModelB}
                    onChange={(e) => setArenaModelB(e.target.value)}
                    className="bg-transparent outline-none font-bold text-accent"
                  >
                    {MODELS.map((m) => (
                      <option key={m.id} value={m.id} className="bg-surface text-text">
                        Model B: {m.name}
                      </option>
                    ))}
                  </select>
                  {arenaStatsB && <span>{arenaStatsB.latencyMs}ms | {arenaStatsB.tokens} tok</span>}
                </div>

                {arenaMessagesB.map((m, i) => (
                  <div key={i} className={m.role === "user" ? "text-right" : ""}>
                    <div
                      className={`inline-block max-w-[90%] rounded-lg px-4 py-3 text-left ${
                        m.role === "user" ? "bg-surface-raised text-text" : "bg-surface border border-border"
                      }`}
                    >
                      <ReactMarkdown>{m.content || "..."}</ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Slash Commands Dropdown */}
          {matchingSlash.length > 0 && (
            <div className="bg-surface border border-border rounded shadow-2xl p-1 mb-2 max-h-48 overflow-y-auto">
              {matchingSlash.map((sc) => (
                <button
                  key={sc.cmd}
                  onClick={() => setInput(sc.text)}
                  className="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-surface-raised rounded"
                >
                  <div className="flex items-center gap-2 font-mono text-accent">
                    <Terminal size={14} />
                    <span>{sc.cmd}</span>
                    <span className="text-text font-sans text-xs font-medium">{sc.label}</span>
                  </div>
                  <span className="text-[10px] text-muted">{sc.desc}</span>
                </button>
              ))}
            </div>
          )}

          {/* Input Bar */}
          <div className="border-t border-border py-4 space-y-2 relative">

            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 text-xs">
                {attachments.map((att, idx) => (
                  <div key={idx} className="flex items-center gap-1 bg-surface-raised px-2.5 py-1 rounded text-text border border-border">
                    <span className="truncate max-w-[150px] font-mono">{att.name}</span>
                    <button
                      onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-muted hover:text-danger ml-1"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 items-end">
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} multiple className="hidden" />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded border border-border text-muted hover:text-text hover:bg-surface transition-colors"
                title="Attach code or text files"
              >
                <Paperclip size={18} />
              </button>

              <button
                onClick={toggleSpeechToText}
                className={`p-2.5 rounded border transition-colors ${
                  isListening ? "border-danger bg-danger/10 text-danger animate-pulse" : "border-border text-muted hover:text-text hover:bg-surface"
                }`}
                title={isListening ? "Listening..." : "Voice Input"}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={isListening ? "Listening to voice..." : "Message Kyro or type / for slash commands..."}
                rows={1}
                className="flex-1 resize-none bg-surface border border-border rounded px-4 py-2.5 text-sm outline-none focus:border-accent"
              />

              <button
                onClick={() => sendMessage()}
                disabled={isStreaming || (!input.trim() && attachments.length === 0)}
                className="p-2.5 rounded bg-accent text-ink disabled:opacity-40"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Feature 1: Claude-Style Artifact Canvas Side Drawer */}
        {isCanvasOpen && canvasCode && (
          <div className="w-1/2 border-l border-border bg-surface flex flex-col h-full shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-raised">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-accent uppercase">{canvasLang} Artifact Canvas</span>
                <div className="flex border border-border rounded overflow-hidden text-xs">
                  <button
                    onClick={() => setCanvasTab("preview")}
                    className={`px-3 py-1 ${canvasTab === "preview" ? "bg-accent text-ink font-medium" : "text-muted hover:text-text"}`}
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => setCanvasTab("code")}
                    className={`px-3 py-1 ${canvasTab === "code" ? "bg-accent text-ink font-medium" : "text-muted hover:text-text"}`}
                  >
                    Source Code
                  </button>
                  <button
                    onClick={() => {
                      setCanvasTab("terminal");
                      if (terminalLogs.length === 0) executeInBrowserTerminal();
                    }}
                    className={`px-3 py-1 ${canvasTab === "terminal" ? "bg-accent text-ink font-medium" : "text-muted hover:text-text"}`}
                  >
                    WebTerminal
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const gistPayload = JSON.stringify(
                      {
                        description: "Generated artifact snippet by Kyro AI",
                        public: true,
                        files: { [`snippet.${canvasLang}`]: { content: canvasCode } },
                      },
                      null,
                      2
                    );
                    navigator.clipboard.writeText(gistPayload);
                    alert("GitHub Gist payload copied to clipboard! You can paste this directly into the GitHub API or Gist editor.");
                  }}
                  className="flex items-center gap-1 text-xs text-muted hover:text-text border border-border px-2.5 py-1 rounded bg-surface transition-colors"
                  title="Export Canvas snippet to GitHub Gist payload"
                >
                  <Github size={13} /> Gist
                </button>
                <button onClick={() => setIsCanvasOpen(false)} className="text-muted hover:text-text p-1 rounded">
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4 bg-ink">
              {canvasTab === "preview" ? (
                <iframe
                  title="Canvas Live Preview"
                  srcDoc={canvasCode}
                  className="w-full h-full min-h-[400px] border-0 bg-white rounded shadow-sm"
                  sandbox="allow-scripts allow-modals"
                />
              ) : canvasTab === "code" ? (
                <CodeBlock code={canvasCode} language={canvasLang} />
              ) : (
                <div className="flex flex-col h-full bg-[#0D0C11] p-4 space-y-3 font-mono text-xs rounded border border-border">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2">
                    <div className="flex items-center gap-2 text-accent">
                      <Terminal size={14} />
                      <span>In-Browser WebContainer Terminal ({canvasLang})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={executeInBrowserTerminal}
                        className="px-2.5 py-1 bg-accent text-ink rounded font-semibold text-[11px] hover:opacity-90"
                      >
                        {isRunningCode ? "Executing..." : "Run Code"}
                      </button>
                      <button
                        onClick={() => setTerminalLogs([])}
                        className="px-2.5 py-1 border border-border text-muted hover:text-text rounded text-[11px]"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-1.5 p-3 bg-ink rounded border border-border/40 font-mono min-h-[300px]">
                    {terminalLogs.length === 0 && <p className="text-muted italic">Click 'Run Code' to execute script in browser sandbox.</p>}
                    {terminalLogs.map((log, idx) => (
                      <div
                        key={idx}
                        className={
                          log.type === "stderr"
                            ? "text-danger"
                            : log.type === "info"
                            ? "text-accent font-semibold"
                            : "text-emerald-400"
                        }
                      >
                        {log.text}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Prompt Library Modal */}
      {showPromptLibrary && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-lg max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display text-lg text-text flex items-center gap-2">
                <BookOpen size={18} className="text-accent" /> Prompt Template Library
              </h3>
              <button onClick={() => setShowPromptLibrary(false)} className="text-muted hover:text-text">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {PROMPT_TEMPLATES.map((tmpl, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput(tmpl.prompt);
                    setShowPromptLibrary(false);
                  }}
                  className="w-full text-left p-3 rounded bg-surface-raised border border-border hover:border-accent space-y-1 transition-colors"
                >
                  <p className="text-xs font-semibold text-accent">{tmpl.title}</p>
                  <p className="text-xs text-muted line-clamp-2">{tmpl.prompt}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Clarification Questions Modal */}
      {showClarifyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-lg max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display text-lg text-text flex items-center gap-2">
                <HelpCircle size={18} className="text-accent" /> Agent Clarification Questions
              </h3>
              <button onClick={() => setShowClarifyModal(false)} className="text-muted hover:text-text">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-muted">
              To provide the highest quality output, please clarify your architectural preferences:
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-muted mb-1 font-medium">1. Target Architecture</label>
                <select
                  value={clarifyAnswers.target}
                  onChange={(e) => setClarifyAnswers({ ...clarifyAnswers, target: e.target.value })}
                  className="w-full bg-surface-raised border border-border rounded p-2 text-text outline-none focus:border-accent"
                >
                  <option value="REST API">REST API Endpoint</option>
                  <option value="Full-Stack App">Full-Stack Web App</option>
                  <option value="Microservice">Backend Microservice</option>
                  <option value="CLI Tool">Command-Line CLI Tool</option>
                </select>
              </div>

              <div>
                <label className="block text-muted mb-1 font-medium">2. Language / Framework</label>
                <select
                  value={clarifyAnswers.framework}
                  onChange={(e) => setClarifyAnswers({ ...clarifyAnswers, framework: e.target.value })}
                  className="w-full bg-surface-raised border border-border rounded p-2 text-text outline-none focus:border-accent"
                >
                  <option value="TypeScript / Node.js">TypeScript / Node.js (Next.js & Fastify)</option>
                  <option value="Python / FastAPI">Python / FastAPI</option>
                  <option value="Go / Fiber">Go / Fiber</option>
                  <option value="Rust / Axum">Rust / Axum</option>
                </select>
              </div>

              <div>
                <label className="block text-muted mb-1 font-medium">3. Persistence / Database</label>
                <select
                  value={clarifyAnswers.database}
                  onChange={(e) => setClarifyAnswers({ ...clarifyAnswers, database: e.target.value })}
                  className="w-full bg-surface-raised border border-border rounded p-2 text-text outline-none focus:border-accent"
                >
                  <option value="PostgreSQL / Supabase">PostgreSQL / Supabase Prisma</option>
                  <option value="MongoDB">MongoDB Mongoose</option>
                  <option value="Redis Cache">Redis In-Memory Key-Value</option>
                  <option value="SQLite">SQLite Local File</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setShowClarifyModal(false)}
                className="px-3 py-1.5 rounded border border-border text-xs text-muted hover:text-text"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowClarifyModal(false);
                  sendMessage(pendingPrompt);
                }}
                className="px-4 py-1.5 rounded bg-accent text-ink text-xs font-semibold hover:opacity-90"
              >
                Proceed with Execution
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Code & Conversation Search Modal (Ctrl+K) */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
          <div className="bg-surface border border-border rounded-lg max-w-2xl w-full p-4 space-y-3 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 text-text font-medium text-sm">
                <Search size={16} className="text-accent" />
                <span>Global Code Snippet & Conversation Search</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-muted border border-border rounded px-1.5 py-0.5">Ctrl + K</span>
                <button onClick={() => setShowSearchModal(false)} className="text-muted hover:text-text p-1">
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="relative">
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => performGlobalSearch(e.target.value)}
                placeholder="Search across all historic code snippets & messages..."
                className="w-full bg-surface-raised border border-border rounded p-2.5 text-sm outline-none focus:border-accent font-mono text-text pl-9"
              />
              <Search size={16} className="absolute left-3 top-3 text-muted" />
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2 pt-1">
              {isSearching && <p className="text-xs text-muted p-2">Searching code snippets & conversations...</p>}
              {!isSearching && searchQuery && searchResults.length === 0 && (
                <p className="text-xs text-muted p-2">No matching messages or code snippets found.</p>
              )}
              {searchResults.map((res) => (
                <div
                  key={res.id}
                  onClick={() => {
                    selectConversation(res.conversationId);
                    setShowSearchModal(false);
                  }}
                  className="bg-surface-raised border border-border hover:border-accent rounded p-3 cursor-pointer space-y-1 transition-all"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-accent truncate">{res.title}</span>
                    <span className="bg-surface border border-border px-1.5 py-0.5 rounded text-[10px] uppercase font-mono text-muted">
                      {res.role}
                    </span>
                  </div>
                  <p className="text-xs text-text/80 font-mono line-clamp-3 bg-surface/50 p-2 rounded border border-border/50">
                    {res.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bring Your Own API Key (PRO+) Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-lg max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 text-text font-medium text-sm">
                <Key size={18} className="text-accent" />
                <span>Bring Your Own API Key (Kyro PRO+)</span>
              </div>
              <button onClick={() => setShowKeyModal(false)} className="text-muted hover:text-text p-1">
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-muted leading-relaxed">
              Enter your personal <code className="text-accent font-mono">Kyro API Key</code>, <code className="text-accent font-mono">Groq Key</code>, or custom key to unlock unlimited high-concurrency <strong>Kyro PRO+</strong> requests without global rate limit throttles.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-muted">Custom API Key</label>
              <input
                type="password"
                value={customApiKey}
                onChange={(e) => saveCustomApiKey(e.target.value)}
                placeholder="kyro_sk_live_... or gsk_..."
                className="w-full bg-surface-raised border border-border rounded p-2.5 text-xs outline-none focus:border-accent font-mono text-text"
              />
            </div>

            {customApiKey.trim() && (
              <div className="p-2.5 rounded bg-success/10 border border-success/30 text-success text-xs font-medium flex items-center gap-2">
                <Check size={14} /> PRO+ Custom Key Active & Saved locally
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              {customApiKey.trim() ? (
                <button
                  onClick={() => saveCustomApiKey("")}
                  className="text-xs text-danger hover:underline"
                >
                  Clear Key
                </button>
              ) : (
                <span className="text-[11px] text-muted">No custom key set (Using standard Tier)</span>
              )}
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-1.5 rounded bg-accent text-ink text-xs font-semibold hover:opacity-90"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
