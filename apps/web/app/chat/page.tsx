"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Send } from "lucide-react";
import Link from "next/link";
import { supabase, getSessionToken } from "../../lib/supabaseClient";
import { apiFetch, API_BASE } from "../../lib/api";
import ChatSidebar from "../../components/ChatSidebar";

type ChatMessage = { role: "user" | "assistant"; content: string };

export default function ChatPage() {
  // No AuthGuard here on purpose — chat works for signed-out guests too.
  // We still track whether someone's signed in, just to decide whether to
  // show history/sidebar or a "sign in to save your chats" nudge.
  const [signedIn, setSignedIn] = useState<boolean | null>(null); // null = not checked yet

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(!!session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

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
  }

  async function ensureConversation(firstUserMessage: string): Promise<string> {
    if (conversationId) return conversationId;
    const title = firstUserMessage.slice(0, 60);
    const convo = await apiFetch("/conversations", { method: "POST", body: JSON.stringify({ title }) });
    setConversationId(convo.id);
    return convo.id;
  }

  async function persistMessage(convoId: string, role: "user" | "assistant", content: string) {
    // Best-effort — chat should keep working even if history persistence hiccups.
    apiFetch(`/conversations/${convoId}/messages`, { method: "POST", body: JSON.stringify({ role, content }) }).catch(
      () => {}
    );
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || isStreaming) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages([...nextMessages, { role: "assistant", content: "" }]);
    setInput("");
    setIsStreaming(true);
    setError(null);

    // History only exists for signed-in users — guests just chat, nothing
    // to persist, and no point making a doomed authenticated request.
    let convoId: string | null = null;
    if (signedIn) {
      try {
        convoId = await ensureConversation(text);
        await persistMessage(convoId, "user", text);
      } catch {
        // If history persistence fails, the chat itself still works below.
      }
    }

    const token = await getSessionToken();

    try {
      const res = await fetch(`${API_BASE}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ messages: nextMessages, stream: true }),
      });

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
          } catch {
            // ignore partial/non-JSON keep-alive lines
          }
        }
      }

      if (convoId && assistantText) {
        persistMessage(convoId, "assistant", assistantText);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      // Remove the empty assistant placeholder
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsStreaming(false);
    }
  }

  return (
    <div className="flex">
      {signedIn && <ChatSidebar activeId={conversationId} onSelect={selectConversation} onNew={startNewChat} />}

      <div className="mx-auto max-w-3xl px-6 flex flex-col h-[calc(100vh-73px)] flex-1">
        <div className="flex items-center justify-between py-4 border-b border-border">
          <span className="font-mono text-sm text-muted">
            {conversationId ? "conversation" : "new chat"}
          </span>
          {signedIn === false && (
            <span className="text-xs text-muted">
              Chatting as a guest —{" "}
              <Link href="/login" className="text-accent hover:underline">
                sign in
              </Link>{" "}
              to save your chats
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-6 space-y-6">
          {messages.length === 0 && !error && (
            <p className="text-muted text-sm mt-12 text-center">
              Ask Kyro anything — powered by your self-hosted model.
            </p>
          )}
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "text-right" : ""}>
              <div
                className={`inline-block max-w-[85%] rounded-lg px-4 py-2.5 text-left ${
                  m.role === "user" ? "bg-surface-raised" : "bg-surface border border-border"
                }`}
              >
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{m.content || (isStreaming && i === messages.length - 1 ? "…" : "")}</ReactMarkdown>
                </div>
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

        <div className="border-t border-border py-4">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Message Kyro…"
              rows={1}
              className="flex-1 resize-none bg-surface border border-border rounded px-4 py-2.5 text-sm outline-none focus:border-accent"
            />
            <button
              onClick={sendMessage}
              disabled={isStreaming || !input.trim()}
              className="px-4 rounded bg-accent text-ink disabled:opacity-40"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
