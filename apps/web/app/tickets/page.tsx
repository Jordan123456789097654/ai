"use client";

import { useEffect, useState } from "react";
import { Inbox, CheckCircle2, AlertTriangle, MessageSquare, Send, Sparkles, Sliders, Plus, Tag, ShieldCheck, UserCheck, RefreshCw, Bot, User, CornerDownLeft } from "lucide-react";
import { apiFetch } from "../../lib/api";

type MessageItem = {
  sender: string;
  text: string;
  time: string;
  role?: "staff" | "user" | "ai";
  escalated?: boolean;
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
  adminReply?: string;
  fullChatHistory?: string;
  createdAt: string;
};

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [autoSendEnabled, setAutoSendEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  // Staff Messaging State
  const [staffInput, setStaffInput] = useState("");
  const [isSendingStaff, setIsSendingStaff] = useState(false);
  const [chatThread, setChatThread] = useState<MessageItem[]>([]);

  // New Ticket Simulation Modal State
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

  async function approveAiResponse(ticketId: string) {
    try {
      await apiFetch(`/v1/tickets/${ticketId}/approve`, { method: "POST" });
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, status: "Resolved" } : t))
      );
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket((prev) => (prev ? { ...prev, status: "Resolved" } : null));
      }
    } catch (e: any) {
      alert(`Error approving response: ${e.message}`);
    }
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
              <Inbox className="text-accent" size={30} /> Support Desk & Staff Messaging Portal
            </h1>
            <p className="text-sm text-muted mt-1">
              Staff-end support portal: respond directly to customer inquiries, review AI drafts, and manage live ticket threads.
            </p>
          </div>

          <div className="flex items-center gap-3">
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
              <Plus size={14} /> Ingest Inbound Ticket
            </button>
          </div>
        </div>

        {/* Workflow Settings Banner */}
        <div className="bg-surface border border-border rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-accent/10 border border-accent/30 rounded-lg text-accent">
              <Sliders size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-text flex items-center gap-2">
                Staff Workflow Mode: <span className="text-accent font-mono">{autoSendEnabled ? "Auto-Send AI Mode" : "Staff Review & Reply Mode"}</span>
              </h3>
              <p className="text-xs text-muted">
                {autoSendEnabled
                  ? "AI automatically responds when confidence exceeds threshold."
                  : "Staff can view full conversation threads, type custom replies, or dispatch AI drafts."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-muted">Auto-Send AI</span>
            <button
              onClick={() => toggleWorkflow(!autoSendEnabled)}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${
                autoSendEnabled ? "bg-accent" : "bg-surface-raised border border-border"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-ink transition-transform ${
                  autoSendEnabled ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
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

            <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
              {tickets.map((t) => (
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

                  <h3 className="font-semibold text-sm text-text line-clamp-1">{t.subject}</h3>
                  <p className="text-xs text-muted line-clamp-2">{t.body}</p>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono bg-surface border border-border px-2 py-0.5 rounded text-muted flex items-center gap-1">
                        <Tag size={10} /> {t.category}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                          t.sentiment === "Urgent"
                            ? "bg-danger/10 text-danger border-danger/30"
                            : "bg-surface border border-border text-muted"
                        }`}
                      >
                        {t.sentiment}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono text-muted">{t.customerEmail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ticket Inspector & Staff Messaging Console (Right 7 Cols) */}
          <div className="lg:col-span-7 bg-surface border border-border rounded-xl p-6 space-y-6 shadow-xl flex flex-col justify-between">
            {selectedTicket ? (
              <div className="space-y-6">
                {/* Header Info */}
                <div className="border-b border-border pb-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-accent font-bold">{selectedTicket.id}</span>
                    <span className="text-xs text-muted font-mono">{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                  </div>
                  <h2 className="font-display text-xl font-bold text-text">{selectedTicket.subject}</h2>
                  <div className="text-xs font-mono text-muted flex items-center gap-2">
                    <span>Customer: <strong className="text-text">{selectedTicket.customerEmail}</strong></span>
                    <span>•</span>
                    <span>Status: <strong className="text-accent">{selectedTicket.status}</strong></span>
                  </div>
                </div>

                {/* Conversation Thread Messages Display */}
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
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

                {/* AI Suggestions Quick Insert Banner */}
                {selectedTicket.aiDraftResponse && (
                  <div className="bg-accent/5 border border-accent/30 rounded-lg p-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-accent font-bold flex items-center gap-1.5">
                        <Sparkles size={14} /> Kyro AI Drafted Response ({Math.round((selectedTicket.aiConfidence || 0.85) * 100)}% Confidence)
                      </span>
                      <button
                        onClick={() => setStaffInput(selectedTicket.aiDraftResponse || "")}
                        className="text-[11px] font-mono text-accent hover:underline flex items-center gap-1 font-semibold"
                      >
                        <CornerDownLeft size={12} /> Use Draft in Reply
                      </button>
                    </div>
                    <p className="text-muted line-clamp-2 font-mono text-[11px]">{selectedTicket.aiDraftResponse}</p>
                  </div>
                )}

                {/* Staff Reply Console */}
                <div className="bg-surface-raised border border-border rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-text flex items-center gap-2">
                      <UserCheck size={16} className="text-success" /> Staff Reply Console
                    </span>
                    <span className="text-[10px] font-mono text-muted">Sending as Staff Support</span>
                  </div>

                  {/* Preset Quick Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "API rate limit soft cap increased manually for your account.",
                      "We are investigating this issue with our core engineering team.",
                      "Issue resolved. Please re-test your requests and let us know!",
                    ].map((preset, pIdx) => (
                      <button
                        key={pIdx}
                        onClick={() => setStaffInput(preset)}
                        className="text-[10px] font-mono bg-surface border border-border hover:border-accent/50 px-2 py-1 rounded text-muted hover:text-text transition-all truncate max-w-[220px]"
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={3}
                    value={staffInput}
                    onChange={(e) => setStaffInput(e.target.value)}
                    placeholder="Type official staff response to the customer here..."
                    className="w-full bg-bg border border-border rounded-lg p-3 text-xs text-text font-mono outline-none focus:border-success"
                  />

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-mono text-muted flex items-center gap-1">
                      <ShieldCheck size={12} className="text-success" /> End-to-End Encrypted Customer Dispatch
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
                Select a ticket from the queue to open the Staff Reply Console.
              </div>
            )}
          </div>
        </div>
      </div>

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
                className="w-full bg-surface-raised border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-accent font-mono text-text"
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
                className="w-full bg-surface-raised border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-accent font-mono text-text"
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
                className="w-full bg-surface-raised border border-border rounded-lg p-3 text-xs outline-none focus:border-accent font-sans text-text"
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
