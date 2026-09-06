"use client";

import { useState } from "react";
import { HelpCircle, MessageSquare, Search, Send, ChevronDown, ChevronUp, Bot, User, ShieldAlert, Sparkles, RefreshCw, Key, Zap, Headphones } from "lucide-react";
import { apiFetch } from "../../lib/api";

type FAQItem = { question: string; answer: string; category: string };

const FAQS: FAQItem[] = [
  {
    category: "Getting Started",
    question: "How do I start using Kyro AI?",
    answer: "You can start chatting immediately on the /chat page without an account. To generate API keys or access high-concurrency rate limits, sign up for a free account in the Developer Portal at /dev.",
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
    answer: "No. Prompts sent to Kyro are processed ephemerally on high-speed hardware and are never used to train global base models.",
  },
];

type ChatMessage = { sender: "AI Agent" | "You"; text: string; time: string; escalated?: boolean; ticketId?: string };

export default function SupportPage() {
  const [search, setSearch] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Remade AI Support Agent Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      sender: "AI Agent",
      text: "Hello! I am Kyro AI Support Agent. Ask me anything about your account, API keys, models, rate limits, or billing. If I am unable to answer your inquiry, I will automatically create a real support ticket in our database and escalate it to an Admin in our Admin Panel.",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [emailInput, setEmailInput] = useState("user@example.com");

  // Load chat history from localStorage on initial page render
  useEffect(() => {
    try {
      const savedChat = localStorage.getItem("kyro_support_chat_history");
      if (savedChat) {
        const parsed = JSON.parse(savedChat);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setChatMessages(parsed);
        }
      }
      const savedEmail = localStorage.getItem("kyro_support_customer_email");
      if (savedEmail) {
        setEmailInput(savedEmail);
      }
    } catch {}
  }, []);

  // Save chat history to localStorage whenever messages update
  useEffect(() => {
    try {
      localStorage.setItem("kyro_support_chat_history", JSON.stringify(chatMessages));
    } catch {}
  }, [chatMessages]);

  // Save email to localStorage whenever email updates
  useEffect(() => {
    try {
      localStorage.setItem("kyro_support_customer_email", emailInput);
    } catch {}
  }, [emailInput]);

  async function handleSendAiChat(textToSend?: string) {
    const query = (textToSend || userInput).trim();
    if (!query || isTyping) return;

    const userTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newHistory = [...chatMessages, { sender: "You" as const, text: query, time: userTime }];
    
    setChatMessages(newHistory);
    if (!textToSend) setUserInput("");
    setIsTyping(true);

    try {
      const res = await apiFetch("/v1/support/ai-chat", {
        method: "POST",
        body: JSON.stringify({
          message: query,
          customerEmail: emailInput,
          history: newHistory,
        }),
      });

      const aiTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "AI Agent",
          text: res.response || "I am processing your request...",
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
          text: "⚠️ System note: Your query has been automatically routed to our Admin Support Queue in PostgreSQL database under /admin.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          escalated: true,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }

  function resetChat() {
    const initial: ChatMessage[] = [
      {
        sender: "AI Agent",
        text: "Hello! I am Kyro AI Support Agent. Ask me anything about your account, API keys, models, rate limits, or billing. If I am unable to answer your inquiry, I will automatically create a real support ticket in our database and escalate it to an Admin in our Admin Panel.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ];
    setChatMessages(initial);
    try {
      localStorage.setItem("kyro_support_chat_history", JSON.stringify(initial));
    } catch {}
  }

  const filteredFaqs = FAQS.filter(
    (f) => f.question.toLowerCase().includes(search.toLowerCase()) || f.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 space-y-10 font-sans">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="font-display text-3xl md:text-4xl text-text font-bold tracking-tight">
          Help & Support Portal
        </h1>
        <p className="text-muted text-sm max-w-xl mx-auto">
          Instant support powered by Kyro AI. Ask questions below—if our AI cannot answer, it automatically creates a real support ticket in PostgreSQL and alerts an Admin.
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

      {/* Remade Sleek AI Support Agent Interface */}
      <div className="border border-accent/40 bg-[#0F121C] rounded-2xl overflow-hidden shadow-2xl space-y-0">
        {/* Agent Header */}
        <div className="bg-[#161B28] border-b border-[#252D40] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-accent/20 border border-accent/50 flex items-center justify-center text-accent shadow-lg shadow-accent/20">
              <Bot size={24} />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-white flex items-center gap-2">
                Kyro AI Support Agent
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              </h2>
              <p className="text-xs text-gray-400">Answers instantly based on business instructions. Escalates to Admin if needed.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-[#252D40] pt-2 sm:pt-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-gray-400">Your Email:</span>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="bg-[#0B0D14] border border-[#252D40] rounded px-3 py-1.5 text-xs font-mono text-gray-200 outline-none focus:border-accent w-48"
              />
            </div>
            <button
              onClick={resetChat}
              className="p-2 text-gray-400 hover:text-white border border-[#252D40] rounded-lg bg-[#0B0D14]"
              title="Reset Chat Conversation"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Quick Question Sample Pills */}
        <div className="bg-[#111420] border-b border-[#252D40] px-5 py-3 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono text-gray-400 flex items-center gap-1 font-semibold">
            <Sparkles size={12} className="text-accent" /> Sample Questions:
          </span>
          {[
            "How do I increase my API rate limit?",
            "How to set up custom model aliases?",
            "What models are available?",
            "Transfer me to a Human Admin",
          ].map((pill, i) => (
            <button
              key={i}
              onClick={() => handleSendAiChat(pill)}
              className="text-[11px] font-mono bg-[#1A2030] hover:bg-accent/20 hover:border-accent/40 border border-[#252D40] text-gray-300 px-3 py-1 rounded-full transition-all"
            >
              {pill}
            </button>
          ))}
        </div>

        {/* Chat Messages Feed */}
        <div className="p-6 space-y-4 max-h-[440px] overflow-y-auto bg-[#0B0D14]/80">
          {chatMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 text-xs leading-relaxed max-w-3xl ${
                msg.sender === "You" ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-md ${
                  msg.sender === "You"
                    ? "bg-[#1E2536] border border-[#2D374E] text-gray-300"
                    : "bg-accent text-ink font-bold"
                }`}
              >
                {msg.sender === "You" ? <User size={15} /> : <Bot size={15} />}
              </div>

              <div
                className={`p-4 rounded-2xl space-y-1.5 border shadow-lg ${
                  msg.sender === "You"
                    ? "bg-accent/10 border-accent/30 text-white rounded-tr-none"
                    : msg.escalated
                    ? "bg-amber-950/30 border-amber-500/40 text-amber-100 rounded-tl-none"
                    : "bg-[#161B28] border-[#252D40] text-gray-200 rounded-tl-none"
                }`}
              >
                <div className="flex justify-between items-center font-mono text-[10px] text-gray-400 gap-4">
                  <span className="font-bold text-accent">{msg.sender}</span>
                  <span>{msg.time}</span>
                </div>

                <p className="text-sm font-sans whitespace-pre-wrap leading-relaxed">{msg.text}</p>

                {msg.escalated && (
                  <div className="mt-3 pt-2.5 border-t border-amber-500/30 text-xs font-mono text-amber-400 flex items-center gap-2 font-bold">
                    <ShieldAlert size={16} /> Real Support Ticket Created in PostgreSQL Database (#{msg.ticketId || "TCK-AUTO"}) & Escalated to Admin Panel!
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-2 text-xs font-mono text-accent items-center p-2">
              <Bot size={16} className="animate-spin" /> Kyro AI Support Agent is generating response...
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={(e) => { e.preventDefault(); handleSendAiChat(); }} className="p-4 bg-[#161B28] border-t border-[#252D40] flex gap-3">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your support question here... (e.g. 'How do I raise my rate limit?' or 'Talk to human')"
            className="flex-1 bg-[#0B0D14] border border-[#252D40] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-accent font-sans"
          />
          <button
            type="submit"
            disabled={isTyping || !userInput.trim()}
            className="px-6 py-3 bg-accent text-ink font-bold rounded-xl text-xs flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-accent/20"
          >
            <Send size={15} /> Send
          </button>
        </form>
      </div>

      {/* FAQs Section */}
      <section className="border border-border rounded-xl bg-surface p-6 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <HelpCircle size={18} className="text-accent" />
          <h2 className="font-display text-xl font-bold">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {filteredFaqs.length === 0 && <p className="text-muted text-sm py-4">No matching FAQ articles found.</p>}
          {filteredFaqs.map((faq, idx) => (
            <div key={idx} className="border border-border rounded-lg bg-surface-raised overflow-hidden">
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
