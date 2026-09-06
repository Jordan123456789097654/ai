"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Send, Paperclip, Download, Archive, ChevronDown, Sparkles, X } from "lucide-react";
import Link from "next/link";
import JSZip from "jszip";
import { supabase, getSessionToken } from "../../lib/supabaseClient";
import { apiFetch, API_BASE } from "../../lib/api";
import ChatSidebar from "../../components/ChatSidebar";
import CodeBlock from "../../components/CodeBlock";

type ChatMessage = { role: "user" | "assistant"; content: string };

const MODELS = [
  { id: "kyro-flash-8b", name: "Kyro Flash (8B)", desc: "Ultra-fast response model" },
  { id: "kyro-ultra-70b", name: "Kyro Ultra (70B)", desc: "Deep reasoning & coding" },
  { id: "kyro-mixtral-8x7b", name: "Kyro Mixtral (8x7B)", desc: "Expanded context window" },
  { id: "kyro-gemma-9b", name: "Kyro Gemma (9B)", desc: "Precise instruction model" },
];

export default function ChatPage() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState("kyro-flash-8b");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<{ name: string; content: string }[]>([]);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

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
  }, [messages]);

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
    setError(null);
    setAttachments([]);
  }

  async function ensureConversation(firstUserMessage: string): Promise<string> {
    if (conversationId) return conversationId;
    const title = firstUserMessage.slice(0, 60);
    const convo = await apiFetch("/conversations", { method: "POST", body: JSON.stringify({ title }) });
    setConversationId(convo.id);
    return convo.id;
  }

  async function persistMessage(convoId: string, role: "user" | "assistant", content: string) {
    apiFetch(`/conversations/${convoId}/messages`, { method: "POST", body: JSON.stringify({ role, content }) }).catch(() => {});
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setAttachments((prev) => [...prev, { name: file.name, content: text }]);
      };
      reader.readAsText(file);
    });
  }

  async function sendMessage() {
    let text = input.trim();
    if (!text && attachments.length === 0) return;
    if (isStreaming) return;

    if (attachments.length > 0) {
      const contextStr = attachments
        .map((a) => `\n--- File: ${a.name} ---\n${a.content}\n--- End File ---`)
        .join("\n");
      text = `${text}\n\n[Attached Context]:\n${contextStr}`;
    }

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages([...nextMessages, { role: "assistant", content: "" }]);
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

    try {
      let res = await makeChatRequest(token, selectedModel, nextMessages);

      // If token expired/invalid (401), retry without token as a guest
      if (res.status === 401 && token) {
        console.warn("[chat] Token invalid, retrying request as guest...");
        res = await makeChatRequest(null, selectedModel, nextMessages);
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error?.message || `Error ${res.status}`);
      }

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

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
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = { role: "assistant", content: assistantText };
              return updated;
            });
          } catch {}
        }
      }

      if (convoId && assistantText) {
        persistMessage(convoId, "assistant", assistantText);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsStreaming(false);
    }
  }

  async function makeChatRequest(authToken: string | null, modelName: string, chatMessages: ChatMessage[]) {
    return fetch(`${API_BASE}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: JSON.stringify({
        model: modelName,
        messages: chatMessages,
        stream: true,
      }),
    });
  }

  /** Export entire chat & generated code blocks as a ZIP archive */
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

  return (
    <div className="flex">
      {signedIn && <ChatSidebar activeId={conversationId} onSelect={selectConversation} onNew={startNewChat} />}

      <div className="mx-auto max-w-4xl px-6 flex flex-col h-[calc(100vh-73px)] flex-1">
        {/* Top bar */}
        <div className="flex items-center justify-between py-3 border-b border-border">
          <div className="relative">
            <button
              onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded border border-border bg-surface text-xs font-mono text-text hover:border-accent"
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

          <div className="flex items-center gap-3">
            {messages.length > 0 && (
              <button
                onClick={exportChatZip}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-border text-xs text-muted hover:text-text hover:bg-surface transition-colors"
                title="Export chat & generated files as a ZIP archive"
              >
                <Archive size={14} /> Export ZIP
              </button>
            )}

            {signedIn === false && (
              <span className="text-xs text-muted">
                Chatting as guest —{" "}
                <Link href="/login" className="text-accent hover:underline">
                  sign in
                </Link>
              </span>
            )}
          </div>
        </div>

        {/* Messages view */}
        <div className="flex-1 overflow-y-auto py-6 space-y-6">
          {messages.length === 0 && !error && (
            <div className="mt-16 text-center space-y-3">
              <h2 className="font-display text-2xl text-text">What can Kyro help you build today?</h2>
              <p className="text-muted text-sm max-w-md mx-auto">
                Powered by custom AI models. Upload code, generate apps, and export generated files as ZIPs.
              </p>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "text-right" : ""}>
              <div
                className={`inline-block max-w-[90%] rounded-lg px-4 py-3 text-left ${
                  m.role === "user" ? "bg-surface-raised text-text" : "bg-surface border border-border"
                }`}
              >
                <ReactMarkdown
                  components={{
                    code({ node, inline, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || "");
                      return !inline && match ? (
                        <CodeBlock
                          code={String(children).replace(/\n$/, "")}
                          language={match[1]}
                        />
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

        {/* Input Bar */}
        <div className="border-t border-border py-4 space-y-2">
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
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded border border-border text-muted hover:text-text hover:bg-surface transition-colors"
              title="Attach code or text files"
            >
              <Paperclip size={18} />
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
              placeholder="Message Kyro or attach files..."
              rows={1}
              className="flex-1 resize-none bg-surface border border-border rounded px-4 py-2.5 text-sm outline-none focus:border-accent"
            />

            <button
              onClick={sendMessage}
              disabled={isStreaming || (!input.trim() && attachments.length === 0)}
              className="p-2.5 rounded bg-accent text-ink disabled:opacity-40"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
