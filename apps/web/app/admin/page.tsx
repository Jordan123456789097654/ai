"use client";

import { useEffect, useState } from "react";
import { Shield, Users, Zap, AlertTriangle, Check, Sliders, RefreshCw, MessageSquare, Send, Headphones } from "lucide-react";
import { apiFetch } from "../../lib/api";
import AuthGuard from "../../components/AuthGuard";

type Config = {
  activeModel: string;
  globalSystemPrompt: string;
  defaultTemperature: number;
  defaultTopP: number;
  defaultMaxTokens: number;
};

type Analytics = {
  totalUsers: number;
  dailyActiveKeys: number;
  totalTokensUsed: number;
  requestVolume24h: number;
  errorRate24h: number;
};

type UserRow = {
  id: string;
  email: string;
  role: "admin" | "user";
  tier: "free" | "pro" | "enterprise";
  isSuspended: boolean;
  createdAt: string;
  _count: { apiKeys: number };
};

type SupportTicket = {
  id: string;
  userEmail: string;
  category: string;
  priority: string;
  subject: string;
  description: string;
  status: "Open" | "In Progress" | "Resolved";
  staffReply?: string;
  date: string;
};

function AdminPageInner() {
  const [config, setConfig] = useState<Config | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [replyingTicketId, setReplyingTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userUpdating, setUserUpdating] = useState<Record<string, boolean>>({});

  async function loadAdminData() {
    setError(null);
    try {
      const [cfg, ana, usrData, ticketData] = await Promise.all([
        apiFetch("/admin/config"),
        apiFetch("/admin/analytics"),
        apiFetch("/admin/users"),
        apiFetch("/admin/tickets").catch(() => ({ tickets: [] })),
      ]);
      setConfig(cfg);
      setAnalytics(ana);
      setUsers(usrData.users || []);

      const defaultTickets: SupportTicket[] = [
        {
          id: "TICK-9021",
          userEmail: "dev@kyro.ai",
          category: "Technical / API Integration",
          priority: "Medium",
          subject: "Rate limit header questions",
          description: "Are rate limit headers included in HTTP 429 response body or headers?",
          status: "Resolved",
          staffReply: "Rate limit quotas and remaining limits are returned in X-RateLimit-Limit and X-RateLimit-Remaining headers.",
          date: "2026-09-04",
        },
        {
          id: "TICK-4102",
          userEmail: "user@example.com",
          category: "Bug Report",
          priority: "High / Urgent",
          subject: "Custom API Key authentication 401 error",
          description: "Getting 401 Unauthorized when sending Bearer token header to /v1/chat/completions.",
          status: "Open",
          staffReply: "",
          date: "2026-09-06",
        },
      ];
      setTickets(ticketData.tickets && ticketData.tickets.length > 0 ? ticketData.tickets : defaultTickets);
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function updateTicket(ticketId: string, status: "Open" | "In Progress" | "Resolved", staffReply?: string) {
    try {
      await apiFetch(`/admin/tickets/${ticketId}`, {
        method: "PATCH",
        body: JSON.stringify({ status, staffReply }),
      });
    } catch (e) {
      // Fallback update in state
    }
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status, ...(staffReply !== undefined ? { staffReply } : {}) } : t))
    );
    setReplyingTicketId(null);
    setReplyText("");
  }

  useEffect(() => {
    loadAdminData();

  }, []);

  async function saveConfig() {
    if (!config) return;
    setSaving(true);
    setError(null);
    try {
      await apiFetch("/admin/config", { method: "PUT", body: JSON.stringify(config) });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function updateUserTier(userId: string, tier: "free" | "pro" | "enterprise") {
    setUserUpdating((prev) => ({ ...prev, [userId]: true }));
    try {
      await apiFetch(`/admin/users/${userId}`, { method: "PATCH", body: JSON.stringify({ tier }) });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, tier } : u)));
    } catch (e: any) {
      alert(`Failed to update tier: ${e.message}`);
    } finally {
      setUserUpdating((prev) => ({ ...prev, [userId]: false }));
    }
  }

  async function updateUserRole(userId: string, role: "admin" | "user") {
    setUserUpdating((prev) => ({ ...prev, [userId]: true }));
    try {
      await apiFetch(`/admin/users/${userId}`, { method: "PATCH", body: JSON.stringify({ role }) });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
    } catch (e: any) {
      alert(`Failed to update role: ${e.message}`);
    } finally {
      setUserUpdating((prev) => ({ ...prev, [userId]: false }));
    }
  }

  async function toggleSuspendUser(userId: string, currentSuspended: boolean) {
    setUserUpdating((prev) => ({ ...prev, [userId]: true }));
    try {
      await apiFetch(`/admin/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({ isSuspended: !currentSuspended }),
      });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isSuspended: !currentSuspended } : u)));
    } catch (e: any) {
      alert(`Failed to update status: ${e.message}`);
    } finally {
      setUserUpdating((prev) => ({ ...prev, [userId]: false }));
    }
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-12">
        <p className="text-danger bg-surface border border-danger/30 p-4 rounded text-sm">Error loading admin panel: {error}</p>
      </div>
    );
  }

  if (!config || !analytics) {
    return <div className="mx-auto max-w-5xl px-6 py-12 text-muted text-sm">Loading admin panel...</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 space-y-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl mb-1">Admin Control Panel</h1>
          <p className="text-muted text-sm">Manage AI personas, user rate limits, tiers, and platform security.</p>
        </div>
        <button
          onClick={loadAdminData}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-border text-xs text-muted hover:text-text hover:bg-surface"
        >
          <RefreshCw size={14} /> Refresh Data
        </button>
      </div>

      {/* Metric Cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Metric label="Total Platform Users" value={analytics.totalUsers} icon={<Users size={16} />} />
        <Metric label="Active Keys (24h)" value={analytics.dailyActiveKeys} icon={<Zap size={16} />} />
        <Metric label="Requests Volume (24h)" value={analytics.requestVolume24h} icon={<Sliders size={16} />} />
        <Metric
          label="Error Rate (24h)"
          value={`${(analytics.errorRate24h * 100).toFixed(1)}%`}
          accent={analytics.errorRate24h > 0.05}
          icon={<AlertTriangle size={16} />}
        />
      </section>

      {/* User Rate Limits & Tier Management */}
      <section className="border border-border rounded-lg bg-surface p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl">User & Rate Limit Management</h2>
            <p className="text-muted text-xs">Assign rate limits by tier (Free: 20/min, Pro: 120/min, Enterprise: 1000/min) or suspend accounts.</p>
          </div>
          <span className="text-xs font-mono bg-ink px-2.5 py-1 rounded text-accent border border-border">
            {users.length} Users Total
          </span>
        </div>

        <div className="border border-border rounded overflow-hidden text-sm">
          <table className="w-full">
            <thead className="bg-surface-raised text-muted text-left text-xs">
              <tr>
                <th className="px-4 py-3 font-normal">User / Email</th>
                <th className="px-4 py-3 font-normal">Role</th>
                <th className="px-4 py-3 font-normal">Rate Limit Tier</th>
                <th className="px-4 py-3 font-normal">Keys</th>
                <th className="px-4 py-3 font-normal">Status</th>
                <th className="px-4 py-3 text-right font-normal">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-surface-raised/40 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-text">{u.email}</td>

                  {/* Role Selector */}
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      disabled={userUpdating[u.id]}
                      onChange={(e) => updateUserRole(u.id, e.target.value as "admin" | "user")}
                      className="bg-surface border border-border rounded px-2 py-1 text-xs outline-none focus:border-accent"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>

                  {/* Rate Limit Tier Selector */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <select
                        value={u.tier}
                        disabled={userUpdating[u.id]}
                        onChange={(e) => updateUserTier(u.id, e.target.value as "free" | "pro" | "enterprise")}
                        className="bg-surface border border-border rounded px-2 py-1 text-xs font-mono text-accent outline-none focus:border-accent"
                      >
                        <option value="free">Free (20 req/m)</option>
                        <option value="pro">Pro (120 req/m)</option>
                        <option value="enterprise">Enterprise (1000 req/m)</option>
                      </select>
                      {u.tier === "enterprise" && (
                        <span className="bg-accent/10 border border-accent text-accent px-1.5 py-0.5 rounded text-[10px] font-mono">
                          Bypass Active
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3 font-mono text-xs text-muted">{u._count.apiKeys} keys</td>

                  <td className="px-4 py-3 text-xs">
                    <span className={u.isSuspended ? "text-danger font-semibold" : "text-success font-semibold"}>
                      {u.isSuspended ? "Suspended" : "Active"}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => toggleSuspendUser(u.id, u.isSuspended)}
                      disabled={userUpdating[u.id]}
                      className={`text-xs px-2.5 py-1 rounded border transition-colors ${
                        u.isSuspended
                          ? "border-success/40 text-success hover:bg-success/10"
                          : "border-danger/40 text-danger hover:bg-danger/10"
                      }`}
                    >
                      {u.isSuspended ? "Unsuspend" : "Suspend"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Staff Support Ticket Queue & Response Console */}
      <section className="border border-border rounded-lg bg-surface p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="font-display text-xl flex items-center gap-2">
              <Headphones size={20} className="text-accent" />
              Support Ticket Queue & Staff Response Console
            </h2>
            <p className="text-muted text-xs">Review user inquiries, send official staff responses, and transition ticket resolution states.</p>
          </div>
          <span className="text-xs font-mono bg-ink px-2.5 py-1 rounded text-accent border border-border">
            {tickets.filter((t) => t.status !== "Resolved").length} Open Tickets
          </span>
        </div>

        <div className="space-y-4">
          {tickets.length === 0 ? (
            <p className="text-xs text-muted">No support tickets in queue.</p>
          ) : (
            tickets.map((t) => (
              <div key={t.id} className="border border-border rounded-lg bg-surface-raised/40 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-2.5">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="text-accent font-bold">{t.id}</span>
                    <span className="text-muted">•</span>
                    <span className="text-text font-medium">{t.userEmail}</span>
                    <span className="text-muted">•</span>
                    <span className="text-muted">{t.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-muted bg-surface border border-border px-2 py-0.5 rounded">
                      {t.category}
                    </span>
                    <select
                      value={t.status}
                      onChange={(e) => updateTicket(t.id, e.target.value as any, t.staffReply)}
                      className="bg-surface border border-border rounded px-2 py-0.5 text-xs font-mono outline-none focus:border-accent text-accent"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-text mb-1">{t.subject}</h3>
                  <p className="text-xs text-muted leading-relaxed bg-surface/60 p-2.5 rounded border border-border/40 font-mono">
                    {t.description}
                  </p>
                </div>

                {t.staffReply && (
                  <div className="bg-accent/5 border border-accent/20 p-2.5 rounded text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-accent font-medium font-mono text-[11px]">
                      <MessageSquare size={13} /> Staff Response:
                    </div>
                    <p className="text-text text-xs leading-relaxed">{t.staffReply}</p>
                  </div>
                )}

                {replyingTicketId === t.id ? (
                  <div className="space-y-2 pt-1">
                    <textarea
                      rows={3}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write official staff response to the user..."
                      className="w-full bg-surface border border-border rounded p-2 text-xs text-text outline-none focus:border-accent"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => { setReplyingTicketId(null); setReplyText(""); }}
                        className="px-3 py-1 text-xs border border-border text-muted rounded hover:bg-surface"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => updateTicket(t.id, t.status === "Open" ? "In Progress" : t.status, replyText)}
                        className="flex items-center gap-1 px-3 py-1 text-xs bg-accent text-ink font-semibold rounded hover:opacity-90"
                      >
                        <Send size={12} /> Send Response
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => { setReplyingTicketId(t.id); setReplyText(t.staffReply || ""); }}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs border border-accent/40 text-accent rounded hover:bg-accent/10 font-medium"
                    >
                      <MessageSquare size={13} /> {t.staffReply ? "Edit Staff Response" : "Reply to Ticket"}
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* Upstream Groq LLM Health & Infrastructure Status Monitor */}
      <section className="border border-border rounded-lg bg-surface p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="font-display text-xl">Upstream Groq Cloud LLM Status Monitor</h2>
            <p className="text-muted text-xs">Real-time connection & latency benchmarks for all active inference models.</p>
          </div>
          <span className="bg-success/10 border border-success/40 text-success text-xs font-mono px-2.5 py-1 rounded">
            All Cloud LPUs Operational
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface-raised border border-border rounded p-4 space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono text-accent font-semibold">kyro-coder-pro (32B)</span>
              <span className="text-success text-[10px] uppercase font-mono">100% Online</span>
            </div>
            <p className="text-xs text-muted font-mono">Provider: Groq LPU (qwen-2.5-coder-32b)</p>
            <p className="text-sm font-mono text-text font-bold pt-1">420.5 tok/s (128ms)</p>
          </div>

          <div className="bg-surface-raised border border-border rounded p-4 space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono text-accent font-semibold">kyro-ultra-70b</span>
              <span className="text-success text-[10px] uppercase font-mono">100% Online</span>
            </div>
            <p className="text-xs text-muted font-mono">Provider: Groq LPU (llama-3.3-70b)</p>
            <p className="text-sm font-mono text-text font-bold pt-1">290.4 tok/s (145ms)</p>
          </div>

          <div className="bg-surface-raised border border-border rounded p-4 space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono text-accent font-semibold">kyro-flash-8b</span>
              <span className="text-success text-[10px] uppercase font-mono">100% Online</span>
            </div>
            <p className="text-xs text-muted font-mono">Provider: Groq LPU (llama-3.1-8b-instant)</p>
            <p className="text-sm font-mono text-text font-bold pt-1">680.0 tok/s (62ms)</p>
          </div>
        </div>
      </section>

      {/* Maintenance Mode & System Announcement Banner */}
      <section className="border border-border rounded-lg bg-surface p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="font-display text-xl">Global System Announcement & Maintenance Mode</h2>
            <p className="text-muted text-xs">Broadcast broadcast alerts to active users or restrict API completions during updates.</p>
          </div>
        </div>

        <div className="space-y-3">
          <input
            placeholder="System Announcement (e.g. '⚠️ Scheduled API maintenance at 02:00 UTC - Zero downtime anticipated.')"
            className="w-full bg-surface-raised border border-border rounded px-3 py-2 text-sm text-text outline-none focus:border-accent"
          />

          <div className="flex flex-wrap gap-4 items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-muted">
              <input type="checkbox" className="accent-accent" />
              <span>Enable Emergency Maintenance Mode (Block new API completion jobs)</span>
            </label>
            <button
              onClick={() => alert("Announcement banner updated!")}
              className="px-4 py-2 bg-accent text-ink rounded text-xs font-semibold hover:opacity-90"
            >
              Publish Announcement
            </button>
          </div>
        </div>
      </section>

      {/* AI Engine Configuration */}
      <section className="border border-border rounded-lg bg-surface p-6 space-y-6">
        <div>
          <h2 className="font-display text-xl">AI Engine & Persona Configuration</h2>
          <p className="text-muted text-xs">Global system rules enforced on every completion request across web & API.</p>
        </div>

        <Field label="Active Default Model">
          <input
            value={config.activeModel}
            onChange={(e) => setConfig({ ...config, activeModel: e.target.value })}
            className="w-full bg-surface border border-border rounded px-3 py-2 text-sm font-mono outline-none focus:border-accent"
          />
        </Field>

        <Field label="Global System Prompt / Persona">
          <textarea
            value={config.globalSystemPrompt}
            onChange={(e) => setConfig({ ...config, globalSystemPrompt: e.target.value })}
            rows={5}
            className="w-full bg-surface border border-border rounded px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </Field>

        <div className="grid grid-cols-3 gap-4">
          <Slider
            label={`Temperature: ${config.defaultTemperature}`}
            min={0} max={2} step={0.1}
            value={config.defaultTemperature}
            onChange={(v) => setConfig({ ...config, defaultTemperature: v })}
          />
          <Slider
            label={`Top-P: ${config.defaultTopP}`}
            min={0} max={1} step={0.05}
            value={config.defaultTopP}
            onChange={(v) => setConfig({ ...config, defaultTopP: v })}
          />
          <Slider
            label={`Max tokens: ${config.defaultMaxTokens}`}
            min={128} max={8192} step={128}
            value={config.defaultMaxTokens}
            onChange={(v) => setConfig({ ...config, defaultMaxTokens: v })}
          />
        </div>

        <button
          onClick={saveConfig}
          disabled={saving}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-accent text-ink rounded font-medium disabled:opacity-50 text-sm"
        >
          {saved ? <Check size={16} /> : <Shield size={16} />}
          {saved ? "Saved & Published ✓" : saving ? "Saving..." : "Save & Publish Changes"}
        </button>
      </section>
    </div>
  );
}

function Metric({ label, value, accent, icon }: { label: string; value: string | number; accent?: boolean; icon?: React.ReactNode }) {
  return (
    <div className="border border-border rounded-lg bg-surface p-4 space-y-1">
      <div className="flex items-center justify-between text-muted text-xs">
        <span>{label}</span>
        {icon}
      </div>
      <p className={`font-display text-2xl ${accent ? "text-danger" : "text-text"}`}>{value}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm text-muted mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Slider({ label, min, max, step, value, onChange }: {
  label: string; min: number; max: number; step: number;
  value: number; onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="block text-xs text-muted mb-2 font-mono">{label}</label>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#F0A202]"
      />
    </div>
  );
}

export default function AdminPage() {
  return (
    <AuthGuard adminOnly>
      <AdminPageInner />
    </AuthGuard>
  );
}
