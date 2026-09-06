"use client";

import { useState } from "react";
import { HelpCircle, MessageSquare, LifeBuoy, Search, Check, Send, ChevronDown, ChevronUp, Bot, User, AlertTriangle, ArrowRight, Sparkles, ShieldAlert } from "lucide-react";
import { apiFetch } from "../../lib/api";

type FAQItem = { question: string; answer: string; category: string };

const FAQS: FAQItem[] = [
  {
    category: "Getting Started",
    question: "How do I start using Kyro AI?",
    answer: "You can start chatting immediately on the /chat page without an account. To generate API keys or access high-concurrency rate limits, sign up for a free account in the Developer Portal.",
  },
  {
    category: "API & Models",
    question: "What OpenAI-compatible endpoints are supported?",
    answer: "Kyro provides a 100% OpenAI-compatible endpoint at POST /v1/chat/completions supporting standard streaming, system prompts, temperature, and top_p. You can pass 'kyro-coder-pro', 'kyro-ultra-70b', or 'kyro-flash-8b'.",
  },
  {
    category: "Rate Limits & Billing",
    question: "What are the rate limit quotas by tier?",
    answer: "Free tier accounts receive 20 requests/min. Pro tier includes 120 requests/min, and Enterprise accounts receive custom high-concurrency rate limits with 1,000+ requests/min.",
  },
  {
    category: "Security & Privacy",
    question: "Are my conversation prompts used for training?",
    answer: "No. Prompts sent to Kyro are processed ephemerally on cloud hardware and are never used to train global base models.",
  },
];

type ChatMessage = { sender: "AI Agent" | "You"; text: string; time: string; escalated?: boolean; ticketId?: string };

export default function SupportPage() {
  const [search, setSearch] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // AI Support Agent Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      sender: "AI Agent",
      text: "Hello! I am Kyro AI Support Agent. Ask me anything about your account, API integration, or billing questions. If I am unable to answer your query, I will automatically route your request to a Human Admin in our Admin Panel.",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [emailInput, setEmailInput] = useState("user@example.com");

  async function handleSendAiChat(e: React.FormEvent) {
    e.preventDefault();
    if (!userInput.trim() || isTyping) return;

    const userText = userInput.trim();
    const userTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const newHistory = [...chatMessages, { sender: "You" as const, text: userText, time: userTime }];
    setChatMessages(newHistory);
    setUserInput("");
    setIsTyping(true);

    try {
      const res = await apiFetch("/v1/support/ai-chat", {
        method: "POST",
        body: JSON.stringify({
          message: userText,
          customerEmail: emailInput,
          history: newHistory,
        }),
      });

      const aiTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "AI Agent",
          text: res.response || "I am processing your inquiry...",
          time: aiTime,
          escalated: res.escalated,
          ticketId: res.ticketId,
        },
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "AI Agent",
          text: "⚠️ System note: Your query has been automatically routed to our Admin Support Queue under /admin.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          escalated: true,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }

  const filteredFaqs = FAQS.filter(
    (f) => f.question.toLowerCase().includes(search.toLowerCase()) || f.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 space-y-10 font-sans">
      <div className="text-center space-y-3">
        <h1 className="font-display text-3xl md:text-4xl text-text font-bold">Help & Support Portal</h1>
        <p className="text-muted text-sm max-w-xl mx-auto">
          Instant support powered by Kyro AI. Ask questions below—if our AI cannot answer, it will automatically escalate your inquiry to an Admin.
        </p>

        <div className="relative max-w-md mx-auto pt-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search help articles & FAQs..."
            className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 pl-10 text-sm outline-none focus:border-accent text-text"
          />
          <Search size={16} className="absolute left-3 top-5 text-muted" />
        </div>
      </div>

      {/* Main Interactive AI Support Chat Agent */}
      <div className="border border-accent/40 bg-surface rounded-xl overflow-hidden shadow-2xl space-y-0">
        {/* Agent Header */}
        <div className="bg-surface-raised border-b border-border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/50 flex items-center justify-center text-accent">
              <Bot size={22} />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-text flex items-center gap-2">
                Kyro AI Support Agent
                <span className="w-2 h-2 rounded-full bg-success animate-ping" />
              </h2>
              <p className="text-xs text-muted">Answers instantly based on business instructions. Escalates to Admin if needed.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted">Your Email:</span>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="bg-bg border border-border rounded px-2.5 py-1 text-xs font-mono text-text outline-none focus:border-accent"
            />
          </div>
        </div>

        {/* Chat Messages Feed */}
        <div className="p-6 space-y-4 max-h-[420px] overflow-y-auto bg-bg/50">
          {chatMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 text-xs leading-relaxed max-w-3xl ${
                msg.sender === "You" ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  msg.sender === "You"
                    ? "bg-surface-raised border border-border text-muted"
                    : "bg-accent text-ink font-bold"
                }`}
              >
                {msg.sender === "You" ? <User size={14} /> : <Bot size={14} />}
              </div>

              <div
                className={`p-4 rounded-xl space-y-1 border shadow-sm ${
                  msg.sender === "You"
                    ? "bg-accent/10 border-accent/30 text-text rounded-tr-none"
                    : msg.escalated
                    ? "bg-warning/10 border-warning/40 text-text rounded-tl-none"
                    : "bg-surface border-border text-text rounded-tl-none"
                }`}
              >
                <div className="flex justify-between items-center font-mono text-[10px] text-muted gap-4">
                  <span className="font-bold">{msg.sender}</span>
                  <span>{msg.time}</span>
                </div>

                <p className="text-sm font-sans whitespace-pre-wrap">{msg.text}</p>

                {msg.escalated && (
                  <div className="mt-2 pt-2 border-t border-warning/30 text-[11px] font-mono text-warning flex items-center gap-1.5 font-semibold">
                    <ShieldAlert size={14} /> Escalated to Admin Panel (Ticket #{msg.ticketId || "TCK-AUTO"})
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-2 text-xs font-mono text-muted items-center">
              <Bot size={14} className="text-accent animate-spin" /> Kyro AI Support Agent is thinking...
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendAiChat} className="p-4 bg-surface border-t border-border flex gap-3">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your support question here... (e.g. 'How do I raise my rate limit?' or 'Talk to human')"
            className="flex-1 bg-bg border border-border rounded-lg px-4 py-2.5 text-sm text-text outline-none focus:border-accent font-sans"
          />
          <button
            type="submit"
            disabled={isTyping || !userInput.trim()}
            className="px-6 py-2.5 bg-accent text-ink rounded-lg font-semibold text-xs flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Send size={14} /> Send
          </button>
        </form>
      </div>

      {/* FAQs Section */}
      <section className="border border-border rounded-lg bg-surface p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <HelpCircle size={18} className="text-accent" />
          <h2 className="font-display text-xl font-bold">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {filteredFaqs.length === 0 && <p className="text-muted text-sm py-4">No matching FAQ articles found.</p>}
          {filteredFaqs.map((faq, idx) => (
            <div key={idx} className="border border-border rounded bg-surface-raised overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-4 text-left font-medium text-sm text-text hover:text-accent"
              >
                <span>{faq.question}</span>
                {openFaq === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {openFaq === idx && (
                <div className="px-4 pb-4 text-xs text-muted leading-relaxed border-t border-border/50 pt-3">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
