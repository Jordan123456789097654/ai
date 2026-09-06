"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import CodeBlock from "../../../components/CodeBlock";
import Link from "next/link";
import { Sparkles, Share2, ArrowLeft } from "lucide-react";
import { getApiBaseUrl } from "../../../lib/api";

type Message = { id: string; role: "user" | "assistant"; content: string; createdAt: string };

export default function SharedConversationPage() {
  const params = useParams();
  const id = params?.id as string;

  const [conversation, setConversation] = useState<{ title: string; createdAt: string; messages: Message[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    const baseUrl = getApiBaseUrl();
    fetch(`${baseUrl}/share/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Shared conversation not found or link has expired.");
        return res.json();
      })
      .then((data) => setConversation(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  function copyShareLink() {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center text-muted text-sm font-mono">
        Loading shared conversation...
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center space-y-4">
        <h1 className="text-xl font-display text-text">Conversation Not Found</h1>
        <p className="text-sm text-muted">{error || "This shared conversation link is invalid or has been deleted."}</p>
        <Link href="/chat" className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-ink rounded text-sm font-medium">
          <ArrowLeft size={14} /> Go to Kyro Chat
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-border pb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-surface-raised border border-border px-2 py-0.5 rounded text-[11px] font-mono text-accent flex items-center gap-1">
              <Sparkles size={12} /> Kyro Shared Chat
            </span>
            <span className="text-xs text-muted">{new Date(conversation.createdAt).toLocaleDateString()}</span>
          </div>
          <h1 className="font-display text-2xl text-text">{conversation.title}</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={copyShareLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-border text-xs text-muted hover:text-text hover:bg-surface transition-colors"
          >
            <Share2 size={14} /> {copied ? "Link Copied!" : "Share Link"}
          </button>
          <Link href="/chat" className="px-3 py-1.5 bg-accent text-ink rounded text-xs font-medium">
            Start New Chat
          </Link>
        </div>
      </div>

      {/* Messages */}
      <div className="space-y-6">
        {conversation.messages.map((m, i) => (
          <div key={m.id || i} className={m.role === "user" ? "text-right" : ""}>
            <div
              className={`inline-block max-w-[90%] rounded-lg px-4 py-3 text-left ${
                m.role === "user" ? "bg-surface-raised text-text" : "bg-surface border border-border"
              }`}
            >
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || "");
                    const codeStr = String(children).replace(/\n$/, "");
                    return !inline && match ? (
                      <div className="my-2">
                        <CodeBlock code={codeStr} language={match[1]} />
                      </div>
                    ) : (
                      <code className="bg-ink px-1.5 py-0.5 rounded text-accent font-mono text-xs" {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {m.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
