"use client";

import { useEffect, useState } from "react";
import { Inbox, CheckCircle2, AlertTriangle, MessageSquare, Send, Sparkles, Sliders, Plus, Tag, ShieldCheck, UserCheck, RefreshCw, Bot, User, CornerDownLeft, Clock, Star, FileText, BookmarkPlus, ShieldAlert, Shield } from "lucide-react";
import { apiFetch } from "../../lib/api";

type MessageItem = {
  sender: string;
  text: string;
  time: string;
  role?: "staff" | "user" | "ai";
  escalated?: boolean;
};

type SlaInfo = {
  slaMinutes: number;
  deadlineIso: string;
  status: "ON_TRACK" | "BREACHED" | "RESOLVED";
  remainingMins: number;
};

type Ticket = {
  id: string;
  ticketNumber?: string;
  customerEmail: string;
  subject: string;
  body: string;
  status: string;
  sentiment: string;
  category: string;
  aiConfidence?: number;
  aiDraftResponse?: string;
  aiSummary?: string;
  adminReply?: string;
  fullChatHistory?: string;
  csatRating?: number;
  csatFeedback?: string;
  slaInfo?: SlaInfo;
  createdAt: string;
};

type CannedSnippet = {
  id: string;
  title: string;
  category: string;
  content: string;
};

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [snippets, setSnippets] = useState<CannedSnippet[]>([]);
  const [autoSendEnabled, setAutoSendEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  // Staff Messaging & AI Generator State
  const [staffInput, setStaffInput] = useState("");
  const [isSendingStaff, setIsSendingStaff] = useState(false);
  const [isGeneratingAiStaff, setIsGeneratingAiStaff] = useState(false);
  const [chatThread, setChatThread] = useState<MessageItem[]>([]);

  // Snippet Manager Modal
  const [isSnippetModalOpen, setIsSnippetModalOpen] = useState(false);
  const [newSnippetTitle, setNewSnippetTitle] = useState("");
  const [newSnippetCategory, setNewSnippetCategory] = useState("General");
  const [newSnippetContent, setNewSnippetContent] = useState("");

  // Inbound Ticket Simulation Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newBody, setNewBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    if (selectedTicket) {
      parseThread(selectedTicket);
    }
  }, [selectedTicket?.id, selectedTicket?.fullChatHistory]);

  function parseThread(ticket: Ticket) {
    let parsed: MessageItem[] = [];
    try {
      if (ticket.fullChatHistory) {
        parsed = JSON.parse(ticket.fullChatHistory);
      }
    } catch {}

    if (parsed.length === 0) {
      parsed = [
        {
          sender: "Customer",
          text: ticket.body,
          time: new Date(ticket.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          role: "user",
        },
      ];
      if (ticket.adminReply) {
        parsed.push({
          sender: "Staff Support",
          text: ticket.adminReply,
          time: "Staff Note",
          role: "staff",
        });
      }
    }
    setChatThread(parsed);
  }

  async function loadTickets() {
    setLoading(true);
    try {
      const data = await apiFetch("/v1/tickets");
      if (data.tickets) {
        setTickets(data.tickets);
        if (data.tickets.length > 0 && !selectedTicket) {
          setSelectedTicket(data.tickets[0]);
        }
      }
      if (data.settings) {
        setAutoSendEnabled(data.settings.autoSendEnabled);
      }
      if (data.snippets) {
        setSnippets(data.snippets);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }

  async function toggleWorkflow(enabled: boolean) {
    setAutoSendEnabled(enabled);
    try {
      await apiFetch("/v1/tickets/settings", {
        method: "PATCH",
        body: JSON.stringify({ autoSendEnabled: enabled }),
      });
    } catch {}
  }

  async function handleSendStaffMessage(markResolved = false) {
    if (!selectedTicket || !staffInput.trim() || isSendingStaff) return;
    setIsSendingStaff(true);

    try {
      const ticketId = selectedTicket.id || selectedTicket.ticketNumber || "";
      const res = await apiFetch(`/v1/tickets/${ticketId}/reply`, {
        method: "POST",
        body: JSON.stringify({
          message: staffInput.trim(),
          staffName: "Staff Support",
          markResolved,
        }),
      });

      if (res.ticket) {
        const nextStatus = markResolved ? "Resolved" : "Staff Replied";
        setTickets((prev) =>
          prev.map((t) => (t.id === ticketId ? { ...t, ...res.ticket, status: nextStatus } : t))
        );
        setSelectedTicket((prev) => (prev ? { ...prev, ...res.ticket, status: nextStatus } : null));
        setStaffInput("");
      }
    } catch (e: any) {
      alert(`Error sending staff message: ${e.message}`);
    } finally {
      setIsSendingStaff(false);
    }
  }

  async function handleAdminTakeover() {
    if (!selectedTicket) return;
    const ticketId = selectedTicket.id || selectedTicket.ticketNumber || "";
    try {
      const res = await apiFetch(`/v1/tickets/${ticketId}/takeover`, {
        method: "POST",
        body: JSON.stringify({ adminName: "Admin (You)" }),
      });
      if (res.ticket) {
        setTickets((prev) =>
          prev.map((t) => (t.id === ticketId ? { ...t, ...res.ticket, status: "Admin Assigned" } : t))
        );
        setSelectedTicket((prev) => (prev ? { ...prev, ...res.ticket, status: "Admin Assigned" } : null));
        parseThread({ ...selectedTicket, ...res.ticket, status: "Admin Assigned" });
      }
    } catch (e: any) {
      alert(`Error taking over ticket: ${e.message}`);
    }
  }

  async function handleAiGenerateStaffReply() {
    if (!selectedTicket || isGeneratingAiStaff) return;
    setIsGeneratingAiStaff(true);
    try {
      const ticketId = selectedTicket.id || selectedTicket.ticketNumber || "";
      const res = await apiFetch(`/v1/tickets/${ticketId}/ai-generate-reply`, {
        method: "POST",
        body: JSON.stringify({ staffNote: "Verified customer account tier" }),
      });
      if (res.replyText) {
        setStaffInput(res.replyText);
      }
    } catch (e: any) {
      alert(`Error generating AI staff response: ${e.message}`);
    } finally {
      setIsGeneratingAiStaff(false);
    }
  }

  function applyCannedSnippet(snippet: CannedSnippet) {
    if (!selectedTicket) return;
    const customerName = (selectedTicket.customerEmail || "Customer").split("@")[0];
    const ticketIdStr = selectedTicket.ticketNumber || selectedTicket.id;
    const accountTier = selectedTicket.customerEmail.includes("acme") ? "Enterprise" : "Pro";

    let text = snippet.content;
    text = text.replace(/\{customer_name\}/g, customerName);
    text = text.replace(/\{ticket_id\}/g, ticketIdStr);
    text = text.replace(/\{account_tier\}/g, accountTier);

    setStaffInput(text);
  }

  async function handleCreateSnippet(e: React.FormEvent) {
    e.preventDefault();
    if (!newSnippetTitle || !newSnippetContent) return;
    try {
      const res = await apiFetch("/v1/tickets/snippets", {
        method: "POST",
        body: JSON.stringify({
          title: newSnippetTitle,
          category: newSnippetCategory,
          content: newSnippetContent,
        }),
      });
      if (res.snippet) {
        setSnippets((prev) => [...prev, res.snippet]);
        setIsSnippetModalOpen(false);
        setNewSnippetTitle("");
        setNewSnippetContent("");
      }
    } catch {}
  }

  async function handleCreateTicket(e: React.FormEvent) {
    e.preventDefault();
    if (!newSubject || !newBody) return;
    setIsSubmitting(true);
    try {
      const res = await apiFetch("/v1/tickets", {
        method: "POST",
        body: JSON.stringify({ customerEmail: newEmail, subject: newSubject, body: newBody }),
      });
      if (res.ticket) {
        setTickets((prev) => [res.ticket, ...prev]);
        setSelectedTicket(res.ticket);
        setIsModalOpen(false);
        setNewEmail("");
        setNewSubject("");
        setNewBody("");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg text-text p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-border pb-6 gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-3">
              <Inbox className="text-accent" size={30} /> Support Desk & SLA Escalation Matrix
            </h1>
            <p className="text-sm text-muted mt-1">
              Staff support portal with SLA countdown timers, Canned Snippet Manager, AI Staff Response writer, and CSAT ratings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSnippetModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-surface-raised border border-border hover:border-accent text-text rounded-lg text-xs font-mono font-semibold transition-all"
            >
              <BookmarkPlus size={14} className="text-accent" /> Manage Canned Snippets ({snippets.length})
            </button>

            <button
              onClick={loadTickets}
              className="p-2 bg-surface-raised border border-border hover:border-accent text-muted hover:text-text rounded-lg transition-all"
              title="Refresh Tickets Queue"
            >
              <RefreshCw size={16} className={loading ? "animate-spin text-accent" : ""} />
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-accent text-ink rounded-lg font-semibold text-xs hover:opacity-90 transition-opacity"
            >
              <Plus size={14} /> Ingest Ticket
            </button>
          </div>
        </div>

        {/* SLA Matrix Summary Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-muted uppercase font-semibold">Urgent P1 SLA (1 Hour)</span>
              <div className="text-xl font-bold text-danger font-display flex items-center gap-2">
                <Clock size={18} /> {tickets.filter((t) => t.sentiment === "Urgent" && t.status !== "Resolved").length} Active Tickets
              </div>
            </div>
            <span className="bg-danger/10 text-danger border border-danger/30 text-[10px] font-mono px-2 py-1 rounded font-bold">
              1-HR SLA
            </span>
          </div>

          <div className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-muted uppercase font-semibold">High P2 SLA (4 Hours)</span>
              <div className="text-xl font-bold text-warning font-display flex items-center gap-2">
                <Clock size={18} /> {tickets.filter((t) => (t.sentiment === "High" || t.category === "Technical Bug") && t.status !== "Resolved").length} Active Tickets
              </div>
            </div>
            <span className="bg-warning/10 text-warning border border-warning/30 text-[10px] font-mono px-2 py-1 rounded font-bold">
              4-HR SLA
            </span>
          </div>

          <div className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-muted uppercase font-semibold">Normal SLA (24 Hours)</span>
              <div className="text-xl font-bold text-success font-display flex items-center gap-2">
                <CheckCircle2 size={18} /> {tickets.filter((t) => t.status === "Resolved").length} Resolved Tickets
              </div>
            </div>
            <span className="bg-success/10 text-success border border-success/30 text-[10px] font-mono px-2 py-1 rounded font-bold">
              24-HR SLA
            </span>
          </div>
        </div>

        {/* Main Interface Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Ticket Feed List (Left 5 Cols) */}
          <div className="lg:col-span-5 bg-surface border border-border rounded-xl p-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xs font-mono font-bold text-muted uppercase tracking-wider">
                Support Queue ({tickets.length})
              </h2>
              <span className="text-[10px] font-mono text-accent">Click to inspect</span>
            </div>

            <div className="space-y-2 max-h-[calc(100vh-340px)] overflow-y-auto pr-1">
              {tickets.map((t) => {
                const isBreached = t.slaInfo?.status === "BREACHED";
                const isUrgent = t.sentiment === "Urgent";

                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                      selectedTicket?.id === t.id
                        ? "border-accent bg-accent/5 shadow-md"
                        : "border-border bg-surface-raised/40 hover:border-accent/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-accent font-bold">{t.id}</span>
                      <div className="flex items-center gap-1.5">
                        {isBreached && (
                          <span className="text-[10px] font-mono bg-danger/20 text-danger border border-danger/40 px-2 py-0.5 rounded font-bold animate-pulse">
                            ⚠️ BREACHED
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                            t.status === "Resolved"
                              ? "bg-success/10 text-success border-success/30"
                              : t.status === "Staff Replied"
                              ? "bg-accent/10 text-accent border-accent/30"
                              : "bg-warning/10 text-warning border-warning/30"
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-semibold text-sm text-text line-clamp-1">{t.subject}</h3>
                    <p className="text-xs text-muted line-clamp-2">{t.body}</p>

                    <div className="flex items-center justify-between pt-1 text-[10px] font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-surface border border-border px-2 py-0.5 rounded text-muted flex items-center gap-1">
                          <Tag size={10} /> {t.category}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded border ${
                            isUrgent ? "bg-danger/10 text-danger border-danger/30 font-bold" : "bg-surface border border-border text-muted"
                          }`}
                        >
                          {t.sentiment}
                        </span>
                      </div>

                      <span className="text-muted flex items-center gap-1">
                        <Clock size={10} /> SLA: {isUrgent ? "1h" : "4h"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ticket Inspector & Staff Messaging Console (Right 7 Cols) */}
          <div className="lg:col-span-7 bg-surface border border-border rounded-xl p-6 space-y-6 shadow-xl flex flex-col justify-between">
            {selectedTicket ? (
              <div className="space-y-6">
                {/* Header Info */}
                <div className="border-b border-border pb-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-accent font-bold">{selectedTicket.id}</span>
                    <span className="text-xs text-muted font-mono">{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                  </div>
                  
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                    <h2 className="font-display text-xl font-bold text-text">{selectedTicket.subject}</h2>

                    {selectedTicket.status !== "Admin Assigned" && selectedTicket.status !== "Resolved" ? (
                      <button
                        onClick={handleAdminTakeover}
                        className="px-3 py-1.5 bg-accent text-ink font-semibold rounded-lg text-xs font-mono flex items-center gap-1.5 hover:opacity-90 transition-all shrink-0"
                      >
                        <ShieldAlert size={14} /> Take Over Ticket from AI
                      </button>
                    ) : (
                      <span className="bg-success/10 text-success border border-success/30 px-3 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1">
                        <UserCheck size={12} /> Admin Active
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono text-muted">
                    <span>Customer: <strong className="text-text">{selectedTicket.customerEmail}</strong></span>
                    <span className="flex items-center gap-1">
                      Status: <strong className="text-accent">{selectedTicket.status}</strong>
                    </span>
                  </div>
                </div>

                {/* AI Inquiry Summary Banner (Why Customer Contacted) */}
                <div className="bg-accent/10 border border-accent/40 rounded-xl p-4 space-y-1.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-accent flex items-center gap-1.5">
                      <Sparkles size={16} /> AI Executive Inquiry Summary
                    </span>
                    <span className="text-[10px] font-mono text-accent bg-accent/20 px-2 py-0.5 rounded font-bold">
                      Auto-Summarized
                    </span>
                  </div>
                  <p className="text-xs text-text font-sans leading-relaxed font-semibold">
                    {selectedTicket.aiSummary || `Customer contacted support regarding: "${selectedTicket.subject}". AI Agent ingested prompt and escalated to Admin queue.`}
                  </p>
                </div>

                {/* CSAT Customer Rating Badge if Present */}
                {selectedTicket.csatRating && (
                  <div className="bg-success/10 border border-success/30 rounded-xl p-4 space-y-1 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-success flex items-center gap-1.5">
                        <Star className="fill-success text-success" size={16} /> Customer CSAT Score: {selectedTicket.csatRating} / 5 Stars
                      </span>
                      <span className="text-[10px] text-muted">Verified Feedback</span>
                    </div>
                    {selectedTicket.csatFeedback && (
                      <p className="text-text/90 italic pt-1 text-xs">"{selectedTicket.csatFeedback}"</p>
                    )}
                  </div>
                )}

                {/* Conversation Thread Messages Display */}
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  <span className="text-[11px] font-mono text-muted uppercase font-semibold">Live Ticket Thread ({chatThread.length} Messages)</span>

                  {chatThread.map((msg, idx) => {
                    const isStaff = msg.role === "staff" || msg.sender.includes("Staff") || msg.sender.includes("Admin");
                    const isAi = msg.sender.includes("AI");

                    return (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                          isStaff
                            ? "bg-success/5 border-success/30 ml-4"
                            : isAi
                            ? "bg-accent/5 border-accent/30 ml-2"
                            : "bg-surface-raised border-border mr-4"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`font-bold font-mono flex items-center gap-1.5 ${
                            isStaff ? "text-success" : isAi ? "text-accent" : "text-text"
                          }`}>
                            {isStaff ? <UserCheck size={14} /> : isAi ? <Bot size={14} /> : <User size={14} />}
                            {msg.sender}
                          </span>
                          <span className="text-[10px] font-mono text-muted">{msg.time}</span>
                        </div>
                        <p className="text-text font-sans leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Canned Snippets Toolbar & AI Writer Action */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-text flex items-center gap-1.5">
                      <BookmarkPlus size={14} className="text-accent" /> Canned Response Templates
                    </span>
                    <button
                      onClick={handleAiGenerateStaffReply}
                      disabled={isGeneratingAiStaff}
                      className="px-3 py-1 bg-accent/10 border border-accent/30 text-accent rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 hover:bg-accent/20 transition-all"
                    >
                      <Sparkles size={12} className={isGeneratingAiStaff ? "animate-spin" : ""} />
                      {isGeneratingAiStaff ? "AI Writing Staff Response..." : "⚡ AI Write Staff Response"}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {snippets.map((snp) => (
                      <button
                        key={snp.id}
                        onClick={() => applyCannedSnippet(snp)}
                        className="text-[11px] font-mono bg-surface-raised border border-border hover:border-accent px-2.5 py-1 rounded-lg text-muted hover:text-text transition-all"
                        title={snp.content}
                      >
                        + {snp.title}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Staff Reply Console */}
                <div className="bg-surface-raised border border-border rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-text flex items-center gap-2">
                      <UserCheck size={16} className="text-success" /> Staff Reply Console
                    </span>
                    <span className="text-[10px] font-mono text-muted">Sending as Staff Support</span>
                  </div>

                  <textarea
                    rows={4}
                    value={staffInput}
                    onChange={(e) => setStaffInput(e.target.value)}
                    placeholder="Type official staff response or use AI Write Staff Response..."
                    className="w-full bg-[#0B0D14] border border-[#252D40] rounded-lg p-3 text-xs text-white placeholder-gray-500 font-mono outline-none focus:border-success leading-relaxed"
                  />

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-mono text-muted flex items-center gap-1">
                      <ShieldCheck size={12} className="text-success" /> Encrypted Customer Dispatch
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSendStaffMessage(false)}
                        disabled={isSendingStaff || !staffInput.trim()}
                        className="px-4 py-2 bg-success/20 border border-success/40 text-success rounded-lg font-semibold text-xs flex items-center gap-1.5 hover:bg-success/30 transition-all disabled:opacity-50"
                      >
                        <Send size={12} /> {isSendingStaff ? "Sending..." : "Send Staff Reply"}
                      </button>

                      <button
                        onClick={() => handleSendStaffMessage(true)}
                        disabled={isSendingStaff || !staffInput.trim()}
                        className="px-4 py-2 bg-success text-ink rounded-lg font-semibold text-xs flex items-center gap-1.5 hover:opacity-90 transition-all disabled:opacity-50"
                      >
                        <CheckCircle2 size={12} /> Send & Mark Resolved
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted text-sm font-mono">
                Select a ticket from the queue to inspect SLA metrics and Staff Reply Console.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Canned Snippet Creator Modal */}
      {isSnippetModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreateSnippet} className="bg-surface border border-border rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h2 className="font-display text-lg font-bold text-text flex items-center gap-2">
              <BookmarkPlus className="text-accent" size={20} /> Create New Canned Response Template
            </h2>

            <div>
              <label className="block text-xs font-mono text-muted mb-1">Snippet Title</label>
              <input
                type="text"
                required
                value={newSnippetTitle}
                onChange={(e) => setNewSnippetTitle(e.target.value)}
                placeholder="e.g., API Quota Reset"
                className="w-full bg-[#0B0D14] border border-[#252D40] rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-gray-500 outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-muted mb-1">Category</label>
              <input
                type="text"
                value={newSnippetCategory}
                onChange={(e) => setNewSnippetCategory(e.target.value)}
                placeholder="e.g., Billing, Rate Limits"
                className="w-full bg-[#0B0D14] border border-[#252D40] rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-gray-500 outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-muted mb-1">Template Content (Use {'{customer_name}'}, {'{ticket_id}'}, {'{account_tier}'})</label>
              <textarea
                rows={4}
                required
                value={newSnippetContent}
                onChange={(e) => setNewSnippetContent(e.target.value)}
                placeholder="Hello {customer_name}, regarding ticket #{ticket_id}..."
                className="w-full bg-[#0B0D14] border border-[#252D40] rounded-lg p-3 text-xs font-mono text-white placeholder-gray-500 outline-none focus:border-accent"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsSnippetModalOpen(false)}
                className="px-4 py-2 border border-border rounded-lg text-xs text-muted hover:text-text font-mono"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-accent text-ink rounded-lg font-semibold text-xs hover:opacity-90 transition-opacity font-mono"
              >
                Save Template
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Inbound Ticket Simulation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreateTicket} className="bg-surface border border-border rounded-xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h2 className="font-display text-lg font-bold text-text flex items-center gap-2">
              <MessageSquare className="text-accent" size={20} /> Ingest Simulated Inbound Ticket
            </h2>

            <div>
              <label className="block text-xs font-mono text-muted mb-1">Customer Email</label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="customer@enterprise.com"
                className="w-full bg-[#0B0D14] border border-[#252D40] rounded-lg px-3 py-2 text-xs outline-none focus:border-accent font-mono text-white placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-muted mb-1">Inquiry Subject</label>
              <input
                type="text"
                required
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="e.g., Question regarding custom webhooks retry policy"
                className="w-full bg-[#0B0D14] border border-[#252D40] rounded-lg px-3 py-2 text-xs outline-none focus:border-accent font-mono text-white placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-muted mb-1">Ticket Body Message</label>
              <textarea
                rows={4}
                required
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
                placeholder="Type customer message here..."
                className="w-full bg-[#0B0D14] border border-[#252D40] rounded-lg p-3 text-xs outline-none focus:border-accent font-sans text-white placeholder-gray-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-border rounded-lg text-xs text-muted hover:text-text font-mono"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-accent text-ink rounded-lg font-semibold text-xs hover:opacity-90 transition-opacity font-mono"
              >
                {isSubmitting ? "Ingesting..." : "Ingest Ticket"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
