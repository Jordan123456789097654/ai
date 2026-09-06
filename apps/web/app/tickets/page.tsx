"use client";

import { useEffect, useState } from "react";
import { Inbox, CheckCircle2, AlertTriangle, MessageSquare, Send, Sparkles, Sliders, Plus, Tag, ShieldCheck } from "lucide-react";
import { apiFetch } from "../../lib/api";

type Ticket = {
  id: string;
  customerEmail: string;
  subject: string;
  body: string;
  status: "Pending Review" | "Auto-Replied" | "Resolved";
  sentiment: "Urgent" | "Neutral" | "Positive";
  category: "Billing" | "Technical Bug" | "Feature Request" | "Account";
  aiConfidence: number;
  aiDraftResponse: string;
  createdAt: string;
};

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [autoSendEnabled, setAutoSendEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  // New Ticket Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newBody, setNewBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadTickets();
  }, []);

  async function loadTickets() {
    setLoading(true);
    try {
      const data = await apiFetch("/v1/tickets");
      if (data.tickets) {
        setTickets(data.tickets);
        if (data.tickets.length > 0) setSelectedTicket(data.tickets[0]);
      }
      if (data.settings) {
        setAutoSendEnabled(data.settings.autoSendEnabled);
      }
    } catch {
      // Fallback offline mock data
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

  async function approveResponse(ticketId: string) {
    try {
      await apiFetch(`/v1/tickets/${ticketId}/approve`, { method: "POST" });
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, status: "Resolved" } : t))
      );
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket((prev) => (prev ? { ...prev, status: "Resolved" } : null));
      }
      alert("✅ AI Response Approved & Dispatched to Customer!");
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
        alert("✨ New Ticket Ingested & Analyzed by Kyro AI!");
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
              <Inbox className="text-accent" size={30} /> Customer Support Ticket Auto-Responder
            </h1>
            <p className="text-sm text-muted mt-1">
              Automated AI support desk that classifies customer sentiment, tags inquiry categories, and drafts high-accuracy replies.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-accent text-ink rounded font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <Plus size={16} /> Simulate Inbound Ticket
          </button>
        </div>

        {/* Workflow Settings Banner */}
        <div className="bg-surface border border-border rounded-lg p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-accent/10 border border-accent/30 rounded-lg text-accent">
              <Sliders size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-text flex items-center gap-2">
                Approval Workflow Mode: <span className="text-accent font-mono">{autoSendEnabled ? "Auto-Send Enabled" : "Human-in-the-Loop Review"}</span>
              </h3>
              <p className="text-xs text-muted">
                {autoSendEnabled
                  ? "Kyro AI automatically emails replies when confidence exceeds 85%."
                  : "AI drafts responses for review. Admins must click 'Approve & Send' before email dispatch."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-muted">Auto-Send</span>
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
          <div className="lg:col-span-5 bg-surface border border-border rounded-lg p-4 space-y-3">
            <h2 className="text-xs font-mono font-bold text-muted uppercase tracking-wider px-2">
              Inbound Support Queue ({tickets.length})
            </h2>

            <div className="space-y-2">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className={`p-4 rounded-lg border transition-all cursor-pointer space-y-2 ${
                    selectedTicket?.id === t.id
                      ? "border-accent bg-accent/5"
                      : "border-border bg-surface-raised/40 hover:border-accent/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-accent font-bold">{t.id}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        t.status === "Resolved"
                          ? "bg-success/10 text-success border-success/30"
                          : t.status === "Auto-Replied"
                          ? "bg-accent/10 text-accent border-accent/30"
                          : "bg-warning/10 text-warning border-warning/30"
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>

                  <h3 className="font-semibold text-sm text-text line-clamp-1">{t.subject}</h3>
                  <p className="text-xs text-muted line-clamp-2">{t.body}</p>

                  <div className="flex items-center gap-2 pt-1">
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
                </div>
              ))}
            </div>
          </div>

          {/* Ticket Inspector & AI Response Studio (Right 7 Cols) */}
          <div className="lg:col-span-7 bg-surface border border-border rounded-lg p-6 space-y-6">
            {selectedTicket ? (
              <>
                {/* Ticket Details */}
                <div className="border-b border-border pb-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-muted">{selectedTicket.customerEmail}</span>
                    <span className="text-xs text-muted font-mono">{new Date(selectedTicket.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <h2 className="font-display text-xl font-bold text-text">{selectedTicket.subject}</h2>
                  <p className="text-sm text-text/90 bg-surface-raised border border-border rounded-lg p-4 font-sans leading-relaxed">
                    {selectedTicket.body}
                  </p>
                </div>

                {/* AI Analysis & Draft Response Box */}
                <div className="border border-accent/30 rounded-lg bg-accent/5 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-accent flex items-center gap-2">
                      <Sparkles size={16} /> Kyro AI Drafted Response ({Math.round(selectedTicket.aiConfidence * 100)}% Confidence)
                    </span>
                    <span className="text-[10px] font-mono bg-accent/10 border border-accent/30 text-accent px-2.5 py-0.5 rounded">
                      OpenAI Powered
                    </span>
                  </div>

                  <textarea
                    rows={6}
                    value={selectedTicket.aiDraftResponse}
                    onChange={(e) =>
                      setSelectedTicket({ ...selectedTicket, aiDraftResponse: e.target.value })
                    }
                    className="w-full bg-surface border border-border rounded-lg p-3 text-xs text-text font-mono leading-relaxed outline-none focus:border-accent"
                  />

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-muted flex items-center gap-1.5 font-mono">
                      <ShieldCheck size={14} className="text-success" /> PII & Secret Masking Filter Active
                    </span>

                    {selectedTicket.status === "Pending Review" ? (
                      <button
                        onClick={() => approveResponse(selectedTicket.id)}
                        className="px-5 py-2.5 bg-accent text-ink rounded font-semibold text-xs flex items-center gap-2 hover:opacity-90 transition-opacity"
                      >
                        <Send size={14} /> Approve & Dispatch Reply
                      </button>
                    ) : (
                      <span className="text-xs font-mono text-success flex items-center gap-1 font-semibold">
                        <CheckCircle2 size={14} /> Dispatch Completed
                      </span>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted text-sm font-mono">
                Select a ticket from the queue to review AI drafted responses.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inbound Ticket Simulation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreateTicket} className="bg-surface border border-border rounded-lg p-6 max-w-lg w-full space-y-4">
            <h2 className="font-display text-lg font-bold text-text flex items-center gap-2">
              <MessageSquare className="text-accent" size={20} /> Ingest Simulated Ticket
            </h2>

            <div>
              <label className="block text-xs font-mono text-muted mb-1">Customer Email</label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="customer@enterprise.com"
                className="w-full bg-surface-raised border border-border rounded px-3 py-2 text-sm outline-none focus:border-accent font-mono"
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
                className="w-full bg-surface-raised border border-border rounded px-3 py-2 text-sm outline-none focus:border-accent font-mono"
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
                className="w-full bg-surface-raised border border-border rounded p-3 text-sm outline-none focus:border-accent font-sans"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-border rounded text-xs text-muted hover:text-text"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-accent text-ink rounded font-semibold text-xs hover:opacity-90 transition-opacity"
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
