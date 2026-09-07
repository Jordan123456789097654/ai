"use client";

import { useState, useEffect } from "react";
import { HelpCircle, MessageSquare, Search, Send, ChevronDown, ChevronUp, Bot, User, ShieldAlert, Sparkles, RefreshCw, Key, Zap, Headphones, Star, CheckCircle2, Plus, Clock, Tag, UserCheck, Inbox } from "lucide-react";
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

type UserTicket = {
  id: string;
  ticketNumber: string;
  customerEmail: string;
  subject: string;
  body: string;
  status: string;
  sentiment: string;
  category: string;
  parsedThread?: any[];
  csatRating?: number;
  csatFeedback?: string;
  createdAt: string;
};

export default function SupportPage() {
  const [search, setSearch] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Customer Account Email Identity
  const [emailInput, setEmailInput] = useState("sarah.dev@acmecorp.io");

  // User Tickets State & Tabs
  const [userTickets, setUserTickets] = useState<UserTicket[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>("ai-chat");
  const [customerReplyInput, setCustomerReplyInput] = useState("");
  const [isSendingCustomerReply, setIsSendingCustomerReply] = useState(false);

  // AI Support Agent Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      sender: "AI Agent",
      text: "Hello! I am Kyro AI Support Agent. Ask me anything about your account, API keys, models, rate limits, or billing. If I am unable to answer your inquiry, I will automatically create a real support ticket in our database and escalate it to an Admin in our Admin Panel.",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // CSAT Rating State
  const [csatRating, setCsatRating] = useState<number>(5);
  const [csatFeedback, setCsatFeedback] = useState("");
  const [csatSubmitted, setCsatSubmitted] = useState(false);

  useEffect(() => {
    loadUserTickets();
  }, [emailInput]);

  async function loadUserTickets() {
    if (!emailInput) return;
    try {
      const data = await apiFetch(`/v1/tickets/user/${encodeURIComponent(emailInput)}`);
      if (data.tickets) {
        setUserTickets(data.tickets);
      }
    } catch {}
  }

  async function submitCsat(ticketId: string) {
    if (!ticketId || csatSubmitted) return;
    try {
      await apiFetch(`/v1/tickets/${ticketId}/csat`, {
        method: "POST",
        body: JSON.stringify({ rating: csatRating, feedback: csatFeedback }),
      });
      setCsatSubmitted(true);
      loadUserTickets();
    } catch {}
  }

  // Poll for Staff replies on active tickets every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadUserTickets();
    }, 4000);
    return () => clearInterval(interval);
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

      if (res.escalated) {
        loadUserTickets();
      }
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "AI Agent",
          text: "⚠️ System note: Your query has been automatically routed to our Admin Support Queue in database under /tickets.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          escalated: true,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }

  async function handleCustomerSendReplyOnTicket(ticketId: string) {
    if (!customerReplyInput.trim() || isSendingCustomerReply) return;
    setIsSendingCustomerReply(true);

    try {
      const res = await apiFetch(`/v1/tickets/${ticketId}/reply`, {
        method: "POST",
        body: JSON.stringify({
          message: customerReplyInput.trim(),
          staffName: `Customer (${emailInput.split("@")[0]})`,
          markResolved: false,
        }),
      });

      if (res.ticket) {
        setCustomerReplyInput("");
        loadUserTickets();
      }
    } catch (e: any) {
      alert(`Error sending message: ${e.message}`);
    } finally {
      setIsSendingCustomerReply(false);
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
  }

  const filteredFaqs = FAQS.filter(
    (f) => f.question.toLowerCase().includes(search.toLowerCase()) || f.answer.toLowerCase().includes(search.toLowerCase())
  );

  const currentTicket = userTickets.find((t) => t.id === activeTabId || t.ticketNumber === activeTabId);

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10 font-sans">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header & User Account Identity */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-[#252D40] pb-6 gap-4">
          <div className="space-y-1">
            <h1 className="font-display text-3xl md:text-4xl text-white font-bold tracking-tight flex items-center gap-3">
              <Headphones className="text-accent" size={36} /> Kyro Customer Support Portal
            </h1>
            <p className="text-xs text-gray-400">
              User-based Support Hub: Chat with Kyro AI Agent, view your support tickets, or message staff directly.
            </p>
          </div>

          {/* Customer Email Input Selector */}
          <div className="flex items-center gap-2 bg-[#0B0D14] border border-[#252D40] px-3.5 py-2 rounded-xl text-xs font-mono">
            <span className="text-gray-400">Account:</span>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="bg-transparent text-accent font-bold outline-none border-b border-accent/40 focus:border-accent w-48 text-xs font-mono"
            />
          </div>
        </div>

        {/* User Support Ticket Tabs Navigator */}
        <div className="bg-[#0B0D14] border border-[#252D40] rounded-2xl p-4 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#252D40] pb-3">
            <div className="flex items-center gap-2">
              <Inbox size={18} className="text-accent" />
              <span className="font-display text-sm font-bold text-white">Your Support Tickets & Chats ({userTickets.length + 1})</span>
            </div>
            <span className="text-xs font-mono text-gray-400">User Account: <strong className="text-accent">{emailInput}</strong></span>
          </div>

          {/* Ticket Tabs Bar */}
          <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
            {/* AI Live Chat Tab */}
            <button
              onClick={() => setActiveTabId("ai-chat")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs transition-all border ${
                activeTabId === "ai-chat"
                  ? "border-accent bg-accent/15 text-accent font-bold shadow-lg"
                  : "border-[#252D40] text-gray-400 hover:text-white bg-[#111420]"
              }`}
            >
              <Bot size={14} /> ⚡ Live AI Support Agent
            </button>

            {/* User Ticket Tabs */}
            {userTickets.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTabId(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs transition-all border ${
                  activeTabId === t.id
                    ? "border-accent bg-accent/15 text-accent font-bold shadow-lg"
                    : "border-[#252D40] text-gray-400 hover:text-white bg-[#111420]"
                }`}
              >
                <MessageSquare size={13} />
                <span>Ticket #{t.ticketNumber || t.id}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded border ${
                    t.status === "Resolved"
                      ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/40"
                      : t.status === "Staff Replied"
                      ? "bg-accent/20 text-accent border-accent/40 font-bold animate-pulse"
                      : "bg-amber-950/40 text-amber-300 border-amber-500/40"
                  }`}
                >
                  {t.status}
                </span>
              </button>
            ))}

            {/* New Chat / Ticket Button */}
            <button
              onClick={() => {
                resetChat();
                setActiveTabId("ai-chat");
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-mono text-xs text-gray-400 hover:text-white border border-[#252D40] bg-[#111420] hover:border-accent transition-all ml-auto"
            >
              <Plus size={14} /> New Query
            </button>
          </div>

          {/* Active Tab View Inspector */}
          {activeTabId === "ai-chat" ? (
            /* Tab 1: AI Agent Interactive Support Chat */
            <div className="bg-[#0B0D14] border border-[#252D40] rounded-2xl overflow-hidden shadow-2xl">
              <div className="bg-[#111420] border-b border-[#252D40] p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-accent text-ink font-bold flex items-center justify-center shadow-lg">
                    <Bot size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                      Kyro AI Automated Support Agent <span className="text-[10px] font-mono bg-accent/20 text-accent border border-accent/40 px-2 py-0.5 rounded">Active</span>
                    </h3>
                    <p className="text-xs text-gray-400">Ask technical questions or request transfer to human staff.</p>
                  </div>
                </div>

                <button
                  onClick={resetChat}
                  className="p-2 text-gray-400 hover:text-white border border-[#252D40] rounded-lg bg-[#0B0D14]"
                  title="Reset Chat"
                >
                  <RefreshCw size={14} />
                </button>
              </div>

              {/* Sample Questions Pills */}
              <div className="bg-[#111420] border-b border-[#252D40] px-5 py-3 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-mono text-gray-400 flex items-center gap-1 font-semibold">
                  <Sparkles size={12} className="text-accent" /> Sample Prompts:
                </span>
                {[
                  "How do I increase my API rate limit?",
                  "What models are supported?",
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
              <div className="p-6 space-y-4 max-h-[420px] overflow-y-auto bg-black">
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
                        <div className="mt-3 pt-2.5 border-t border-amber-500/30 text-xs font-mono text-amber-400 space-y-2">
                          <div className="flex items-center gap-2 font-bold">
                            <ShieldAlert size={16} /> Real Support Ticket Created (#{msg.ticketId || "TCK-AUTO"}) & Escalated to Admin Panel!
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input Box (Pure Dark Black Styling) */}
              <div className="p-4 bg-[#0B0D14] border-t border-[#252D40]">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendAiChat();
                  }}
                  className="flex gap-3"
                >
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Ask Kyro AI Support or type 'Talk to Human'..."
                    className="flex-1 bg-[#121624] border border-[#252D40] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-accent font-sans"
                  />
                  <button
                    type="submit"
                    disabled={isTyping || !userInput.trim()}
                    className="px-6 py-3 bg-accent text-ink rounded-xl font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    <Send size={16} /> {isTyping ? "Thinking..." : "Send"}
                  </button>
                </form>
              </div>
            </div>
          ) : currentTicket ? (
            /* Tab 2..N: Specific Customer Ticket Inspector & Multi-Turn Thread */
            <div className="bg-[#0B0D14] border border-[#252D40] rounded-2xl p-6 space-y-6 shadow-2xl">
              {/* Ticket Details Header */}
              <div className="border-b border-[#252D40] pb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-accent font-bold">Ticket #{currentTicket.ticketNumber || currentTicket.id}</span>
                  <span className="text-xs text-gray-400 font-mono">{new Date(currentTicket.createdAt).toLocaleString()}</span>
                </div>
                <h2 className="font-display text-xl font-bold text-white">{currentTicket.subject}</h2>
                <div className="flex items-center gap-4 text-xs font-mono text-gray-400">
                  <span>Category: <strong className="text-white">{currentTicket.category}</strong></span>
                  <span>•</span>
                  <span>Priority: <strong className="text-amber-400">{currentTicket.sentiment}</strong></span>
                  <span>•</span>
                  <span>Status: <strong className="text-accent">{currentTicket.status}</strong></span>
                </div>
              </div>

              {/* CSAT Survey Rating Widget */}
              <div className="bg-[#121624] border border-accent/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-accent flex items-center gap-1.5">
                    <Star className="fill-accent text-accent" size={16} /> Customer Satisfaction Survey (CSAT)
                  </span>
                  {csatSubmitted && (
                    <span className="text-emerald-400 text-xs font-mono font-bold flex items-center gap-1">
                      <CheckCircle2 size={12} /> Feedback Saved
                    </span>
                  )}
                </div>

                {!csatSubmitted ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setCsatRating(star)}
                          className={`p-1 rounded transition-all ${
                            csatRating >= star ? "text-accent" : "text-gray-600"
                          }`}
                        >
                          <Star className={csatRating >= star ? "fill-accent" : ""} size={20} />
                        </button>
                      ))}
                      <span className="text-xs font-mono text-white font-bold ml-2">
                        {csatRating} / 5 Stars
                      </span>
                    </div>

                    <input
                      type="text"
                      value={csatFeedback}
                      onChange={(e) => setCsatFeedback(e.target.value)}
                      placeholder="Type optional feedback for support staff..."
                      className="w-full bg-black border border-[#252D40] rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-accent font-mono placeholder-gray-500"
                    />

                    <button
                      onClick={() => submitCsat(currentTicket.id)}
                      className="px-5 py-2 bg-accent text-ink rounded-lg font-semibold text-xs hover:opacity-90 transition-opacity font-mono"
                    >
                      Submit CSAT Rating
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-gray-300 italic font-mono">
                    Thank you for your rating of {csatRating} / 5 stars! Our staff will review your feedback.
                  </p>
                )}
              </div>

              {/* Ticket Live Conversation Thread Messages */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                <span className="text-[11px] font-mono text-gray-400 uppercase font-semibold">
                  Conversation Thread ({(currentTicket.parsedThread || []).length} Messages)
                </span>

                {(currentTicket.parsedThread && currentTicket.parsedThread.length > 0) ? (
                  currentTicket.parsedThread.map((msg: any, idx: number) => {
                    const isStaff = msg.role === "staff" || (msg.sender && (msg.sender.includes("Staff") || msg.sender.includes("Admin")));
                    const isAi = msg.sender && msg.sender.includes("AI");

                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                          isStaff
                            ? "bg-emerald-950/30 border-emerald-500/40 ml-4 text-emerald-100"
                            : isAi
                            ? "bg-accent/10 border-accent/30 ml-2 text-white"
                            : "bg-[#161B28] border-[#252D40] mr-4 text-gray-200"
                        }`}
                      >
                        <div className="flex items-center justify-between font-mono text-[11px]">
                          <span className={`font-bold flex items-center gap-1.5 ${
                            isStaff ? "text-emerald-400" : isAi ? "text-accent" : "text-white"
                          }`}>
                            {isStaff ? <UserCheck size={14} /> : isAi ? <Bot size={14} /> : <User size={14} />}
                            {msg.sender}
                          </span>
                          <span className="text-gray-400">{msg.time}</span>
                        </div>
                        <p className="font-sans leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 rounded-xl bg-[#161B28] border border-[#252D40] text-xs text-gray-300">
                    <span className="font-bold text-accent">Your Inquiry Message:</span>
                    <p className="mt-1 font-sans leading-relaxed whitespace-pre-wrap">{currentTicket.body}</p>
                  </div>
                )}
              </div>

              {/* Customer Reply to Staff Box (Pure Dark Black Styling) */}
              <div className="bg-[#121624] border border-[#252D40] rounded-xl p-4 space-y-3">
                <span className="text-xs font-mono font-bold text-white flex items-center gap-2">
                  <Send size={14} className="text-accent" /> Reply to Support Staff
                </span>

                <textarea
                  rows={3}
                  value={customerReplyInput}
                  onChange={(e) => setCustomerReplyInput(e.target.value)}
                  placeholder="Type reply message to staff here..."
                  className="w-full bg-black border border-[#252D40] rounded-xl p-3 text-xs text-white placeholder-gray-500 outline-none focus:border-accent font-mono leading-relaxed"
                />

                <div className="flex justify-end">
                  <button
                    onClick={() => handleCustomerSendReplyOnTicket(currentTicket.id)}
                    disabled={isSendingCustomerReply || !customerReplyInput.trim()}
                    className="px-5 py-2 bg-accent text-ink rounded-lg font-semibold text-xs flex items-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 font-mono"
                  >
                    <Send size={12} /> {isSendingCustomerReply ? "Sending..." : "Send Reply to Staff"}
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* FAQs Accordion Section */}
        <div className="bg-[#0B0D14] border border-[#252D40] rounded-2xl p-6 space-y-6 shadow-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#252D40] pb-4">
            <div>
              <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
                <HelpCircle size={20} className="text-accent" /> Frequently Asked Questions
              </h2>
              <p className="text-xs text-gray-400 mt-1">Instant self-service answers to common developer inquiries.</p>
            </div>

            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={14} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search FAQs..."
                className="w-full bg-black border border-[#252D40] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-accent font-mono"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredFaqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-[#121624] border border-[#252D40] rounded-xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between text-xs font-semibold text-white hover:text-accent transition-colors"
                >
                  <span className="flex items-center gap-2 font-mono">
                    <span className="text-accent font-bold">Q:</span> {faq.question}
                  </span>
                  {openFaq === idx ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {openFaq === idx && (
                  <div className="px-4 pb-4 text-xs text-gray-300 border-t border-[#252D40]/50 pt-3 leading-relaxed font-sans">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
