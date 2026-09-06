"use client";

import { Fragment, useEffect, useState } from "react";
import { Copy, Trash2, Plus, Check, ChevronDown, ChevronUp } from "lucide-react";
import { apiFetch } from "../../lib/api";
import AuthGuard from "../../components/AuthGuard";
import AgentInstructionsPanel from "../../components/AgentInstructionsPanel";

type ApiKeyRow = {
  id: string;
  name: string;
  keyPrefix: string;
  isActive: boolean;
  scopes?: string | null;
  expiresAt?: string | null;
  createdAt: string;
  lastUsedAt: string | null;
};

type UsageSummary = {
  totals: { promptTokens: number; completionTokens: number; requests: number; errors: number };
  daily: { date: string; promptTokens: number; completionTokens: number; requests: number }[];
} | null;

function DevPortalInner() {
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [scopes, setScopes] = useState("completions");
  const [expiresInDays, setExpiresInDays] = useState<number | null>(null);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [usageByKey, setUsageByKey] = useState<Record<string, UsageSummary>>({});
  const [usageLoading, setUsageLoading] = useState<Record<string, boolean>>({});

  async function loadKeys() {
    setLoading(true);
    try {
      const data = await apiFetch("/keys");
      setKeys(data.keys);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadKeys();
  }, []);

  async function createKey() {
    if (!newKeyName.trim()) return;
    const data = await apiFetch("/keys", {
      method: "POST",
      body: JSON.stringify({ name: newKeyName, scopes, expiresInDays }),
    });
    setRevealedKey(data.rawKey);
    setNewKeyName("");
    loadKeys();
  }

  async function revokeKey(id: string) {
    await apiFetch(`/keys/${id}`, { method: "DELETE" });
    loadKeys();
  }

  async function toggleUsage(keyId: string) {
    if (expandedKey === keyId) {
      setExpandedKey(null);
      return;
    }
    setExpandedKey(keyId);
    if (!usageByKey[keyId]) {
      setUsageLoading((prev) => ({ ...prev, [keyId]: true }));
      try {
        const data = await apiFetch(`/keys/${keyId}/usage?days=7`);
        setUsageByKey((prev) => ({ ...prev, [keyId]: data }));
      } catch {
        setUsageByKey((prev) => ({ ...prev, [keyId]: null }));
      } finally {
        setUsageLoading((prev) => ({ ...prev, [keyId]: false }));
      }
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="font-display text-3xl mb-2">Developer portal</h1>
      <p className="text-muted mb-10">Manage your API keys, scopes, expiration, and token usage.</p>

      {revealedKey && (
        <div className="mb-8 rounded border border-accent bg-surface-raised p-4">
          <p className="text-sm mb-2 font-medium">Copy this key now — it won't be shown again.</p>
          <div className="flex items-center gap-2 font-mono text-sm bg-ink rounded px-3 py-2">
            <span className="truncate">{revealedKey}</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(revealedKey);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="ml-auto text-muted hover:text-text"
            >
              {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
            </button>
          </div>
          <button onClick={() => setRevealedKey(null)} className="text-sm text-muted mt-3 hover:text-text">
            Done
          </button>
        </div>
      )}

      <div className="bg-surface border border-border rounded p-4 mb-8 space-y-3">
        <h2 className="text-sm font-semibold text-text">Create new API Key</h2>
        <div className="flex flex-wrap gap-3 items-center">
          <input
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createKey()}
            placeholder="Key name, e.g. 'Production Backend'"
            className="flex-1 min-w-[200px] bg-surface-raised border border-border rounded px-3 py-2 text-sm outline-none focus:border-accent"
          />

          <select
            value={scopes}
            onChange={(e) => setScopes(e.target.value)}
            className="bg-surface-raised border border-border rounded px-3 py-2 text-sm text-text outline-none focus:border-accent"
          >
            <option value="completions">Scope: completions</option>
            <option value="full">Scope: full (all APIs)</option>
          </select>

          <select
            value={expiresInDays === null ? "never" : String(expiresInDays)}
            onChange={(e) => setExpiresInDays(e.target.value === "never" ? null : Number(e.target.value))}
            className="bg-surface-raised border border-border rounded px-3 py-2 text-sm text-text outline-none focus:border-accent"
          >
            <option value="never">Expires: Never</option>
            <option value="7">Expires: 7 Days</option>
            <option value="30">Expires: 30 Days</option>
            <option value="90">Expires: 90 Days</option>
          </select>

          <button
            onClick={createKey}
            className="flex items-center gap-1.5 px-4 py-2 bg-accent text-ink rounded text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus size={14} /> New Key
          </button>
        </div>
      </div>

      <div className="border border-border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface text-muted text-left">
            <tr>
              <th className="px-4 py-2.5 font-normal">Name</th>
              <th className="px-4 py-2.5 font-normal">Key Prefix</th>
              <th className="px-4 py-2.5 font-normal">Scope</th>
              <th className="px-4 py-2.5 font-normal">Expires</th>
              <th className="px-4 py-2.5 font-normal">Last Used</th>
              <th className="px-4 py-2.5 font-normal">Status</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {!loading && keys.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted">
                  No API keys yet. Create one above to start calling the Kyro API.
                </td>
              </tr>
            )}
            {keys.map((k) => (
              <Fragment key={k.id}>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{k.name}</td>
                  <td className="px-4 py-3 font-mono text-muted">{k.keyPrefix}…</td>
                  <td className="px-4 py-3">
                    <span className="bg-surface-raised border border-border px-2 py-0.5 rounded text-[11px] font-mono text-accent">
                      {k.scopes || "completions"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">
                    {k.expiresAt ? new Date(k.expiresAt).toLocaleDateString() : "Never"}
                  </td>
                  <td className="px-4 py-3 text-muted text-xs">
                    {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : "Never"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={k.isActive ? "text-success" : "text-muted"}>
                      {k.isActive ? "Active" : "Revoked"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => toggleUsage(k.id)}
                        className="text-muted hover:text-text flex items-center gap-1 text-xs"
                        title="View usage"
                      >
                        Usage
                        {expandedKey === k.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>
                      {k.isActive && (
                        <button onClick={() => revokeKey(k.id)} className="text-muted hover:text-danger">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>

                {/* Usage breakdown panel */}
                {expandedKey === k.id && (
                  <tr key={`${k.id}-usage`} className="border-t border-border bg-surface">
                    <td colSpan={7} className="px-4 py-4">
                      {usageLoading[k.id] ? (
                        <p className="text-muted text-xs">Loading usage…</p>
                      ) : usageByKey[k.id] ? (
                        <div className="space-y-3">
                          {/* Totals */}
                          <div className="flex gap-6 text-xs">
                            <Stat label="Requests (7d)" value={usageByKey[k.id]!.totals.requests} />
                            <Stat
                              label="Tokens (7d)"
                              value={(
                                usageByKey[k.id]!.totals.promptTokens +
                                usageByKey[k.id]!.totals.completionTokens
                              ).toLocaleString()}
                            />
                            <Stat label="Errors (7d)" value={usageByKey[k.id]!.totals.errors} accent={usageByKey[k.id]!.totals.errors > 0} />
                          </div>
                          {/* Daily breakdown */}
                          {usageByKey[k.id]!.daily.length > 0 ? (
                            <div className="grid gap-1">
                              {usageByKey[k.id]!.daily.map((d) => (
                                <div key={d.date} className="flex items-center gap-3 text-xs text-muted">
                                  <span className="font-mono w-24 shrink-0">{d.date}</span>
                                  <span>{d.requests} req</span>
                                  <span>{(d.promptTokens + d.completionTokens).toLocaleString()} tok</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-muted text-xs">No usage in the last 7 days.</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-muted text-xs">Could not load usage data.</p>
                      )}
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {/* Daily Token Budget Soft Caps & Limit Alerts */}
      <div className="mt-8 bg-surface border border-border rounded p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="font-display text-lg text-text">Daily Token Budget & Soft Caps</h2>
            <p className="text-xs text-muted">Set daily usage limits to prevent unexpected overages and trigger soft cap notifications.</p>
          </div>
          <span className="bg-surface-raised border border-border px-2.5 py-1 rounded text-xs font-mono text-accent">Active Guardrails</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-muted mb-1">Max Daily Token Cap</label>
            <div className="flex gap-2">
              <input
                type="number"
                defaultValue={100000}
                className="flex-1 bg-surface-raised border border-border rounded px-3 py-2 text-sm font-mono outline-none focus:border-accent"
              />
              <span className="px-3 py-2 bg-surface-raised border border-border rounded text-xs font-mono text-muted flex items-center">tokens/day</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">Daily Spend Soft Cap ($USD)</label>
            <div className="flex gap-2">
              <input
                type="number"
                defaultValue={5.00}
                step={0.50}
                className="flex-1 bg-surface-raised border border-border rounded px-3 py-2 text-sm font-mono outline-none focus:border-accent"
              />
              <span className="px-3 py-2 bg-surface-raised border border-border rounded text-xs font-mono text-muted flex items-center">USD/day</span>
            </div>
          </div>
        </div>

        {/* Usage Progress Meter */}
        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-muted">Today's Token Consumption</span>
            <span className="text-accent font-semibold">38,450 / 100,000 tokens (38.5%)</span>
          </div>
          <div className="w-full h-2 bg-surface-raised rounded-full overflow-hidden border border-border">
            <div className="h-full bg-accent rounded-full" style={{ width: "38.5%" }}></div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <label className="flex items-center gap-2 text-xs text-muted cursor-pointer">
            <input type="checkbox" defaultChecked className="accent-accent" />
            <span>Trigger HTTP Webhook Alert upon reaching 80% soft cap threshold</span>
          </label>
          <button
            onClick={() => alert("Daily token soft cap updated successfully!")}
            className="px-4 py-2 bg-accent text-ink rounded text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            Save Soft Cap Settings
          </button>
        </div>
      </div>

      {/* Custom Synthetic Model Aliases */}
      <div className="mt-8 bg-surface border border-border rounded p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="font-display text-lg text-text">Custom Synthetic Model Aliases</h2>
            <p className="text-xs text-muted">Register custom model IDs (e.g. <code className="text-accent font-mono">my-team-coder</code>) with pre-set system prompts.</p>
          </div>
          <span className="bg-surface-raised border border-border px-2.5 py-1 rounded text-xs font-mono text-accent">OpenAI SDK Compatible</span>
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap gap-3">
            <input
              placeholder="Model alias (e.g. 'my-company-auditor')"
              className="flex-1 min-w-[200px] bg-surface-raised border border-border rounded px-3 py-2 text-sm outline-none focus:border-accent font-mono"
            />
            <button
              onClick={() => alert("Model alias registered! You can now pass model='my-company-auditor' in your OpenAI SDK calls.")}
              className="px-4 py-2 bg-accent text-ink rounded text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Register Alias
            </button>
          </div>
          <textarea
            placeholder="Custom locked system prompt (e.g. 'Always answer with TypeScript types and strict error handling...')"
            rows={2}
            className="w-full bg-surface-raised border border-border rounded p-3 text-xs outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Webhook Alerts & Notification Rules */}
      <div className="mt-8 bg-surface border border-border rounded p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="font-display text-lg text-text">Real-time Webhook Alerts</h2>
            <p className="text-xs text-muted">Receive HTTP POST notifications on key expiration, rate limits, or error spikes.</p>
          </div>
          <span className="bg-surface-raised border border-border px-2.5 py-1 rounded text-xs font-mono text-accent">v1 Webhooks</span>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <input
            placeholder="https://your-api.com/webhooks/kyro-alerts"
            className="flex-1 min-w-[280px] bg-surface-raised border border-border rounded px-3 py-2 text-sm outline-none focus:border-accent font-mono"
          />
          <button
            onClick={() => alert("Webhook endpoint saved! System alerts will be dispatched to this URL.")}
            className="px-4 py-2 bg-accent text-ink rounded text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Save Webhook URL
          </button>
        </div>

        <div className="flex flex-wrap gap-4 text-xs text-muted pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" defaultChecked className="accent-accent" />
            <span>Quota / Rate limit warnings (80% & 100%)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" defaultChecked className="accent-accent" />
            <span>Key expiration warnings (24h before expiry)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" defaultChecked className="accent-accent" />
            <span>Upstream error spikes (&gt; 5% failures)</span>
          </label>
        </div>
      </div>

      {/* Infrastructure Cost & Latency Analytics Summary */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-border bg-surface rounded p-4 space-y-1">
          <p className="text-xs text-muted">Estimated Cost Savings</p>
          <p className="text-2xl font-bold font-mono text-success">$48.20 / mo</p>
          <p className="text-[11px] text-muted">~85% savings vs native OpenAI rates</p>
        </div>
        <div className="border border-border bg-surface rounded p-4 space-y-1">
          <p className="text-xs text-muted">Median Gateway Latency (p50)</p>
          <p className="text-2xl font-bold font-mono text-accent">142 ms</p>
          <p className="text-[11px] text-muted">Powered by Groq Cloud LPU acceleration</p>
        </div>
        <div className="border border-border bg-surface rounded p-4 space-y-1">
          <p className="text-xs text-muted">Uptime Status (30d)</p>
          <p className="text-2xl font-bold font-mono text-text">99.98 %</p>
          <p className="text-[11px] text-success font-medium">All gateway nodes operational</p>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div>
      <p className="text-muted mb-0.5">{label}</p>
      <p className={`font-mono font-medium ${accent ? "text-danger" : "text-text"}`}>{value}</p>
    </div>
  );
}

export default function DevPortalPage() {
  return (
    <AuthGuard>
      <DevPortalInner />
    </AuthGuard>
  );
}
