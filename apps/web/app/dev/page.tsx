"use client";

import { useEffect, useState } from "react";
import { Copy, Trash2, Plus, Check, ChevronDown, ChevronUp } from "lucide-react";
import { apiFetch } from "../../lib/api";
import AuthGuard from "../../components/AuthGuard";

type ApiKeyRow = {
  id: string;
  name: string;
  keyPrefix: string;
  isActive: boolean;
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
    const data = await apiFetch("/keys", { method: "POST", body: JSON.stringify({ name: newKeyName }) });
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
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-3xl mb-2">Developer portal</h1>
      <p className="text-muted mb-10">Manage your API keys and usage.</p>

      {revealedKey && (
        <div className="mb-8 rounded border border-accent bg-surface-raised p-4">
          <p className="text-sm mb-2">Copy this key now — it won't be shown again.</p>
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
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
          <button onClick={() => setRevealedKey(null)} className="text-sm text-muted mt-3 hover:text-text">
            Done
          </button>
        </div>
      )}

      <div className="flex gap-2 mb-8">
        <input
          value={newKeyName}
          onChange={(e) => setNewKeyName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && createKey()}
          placeholder="Key name, e.g. 'production backend'"
          className="flex-1 bg-surface border border-border rounded px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <button
          onClick={createKey}
          className="flex items-center gap-1.5 px-4 py-2 bg-accent text-ink rounded text-sm font-medium"
        >
          <Plus size={14} /> New key
        </button>
      </div>

      <div className="border border-border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface text-muted text-left">
            <tr>
              <th className="px-4 py-2.5 font-normal">Name</th>
              <th className="px-4 py-2.5 font-normal">Key</th>
              <th className="px-4 py-2.5 font-normal">Last used</th>
              <th className="px-4 py-2.5 font-normal">Status</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {!loading && keys.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted">
                  No API keys yet. Create one to start calling the Kyro API.
                </td>
              </tr>
            )}
            {keys.map((k) => (
              <>
                <tr key={k.id} className="border-t border-border">
                  <td className="px-4 py-3">{k.name}</td>
                  <td className="px-4 py-3 font-mono text-muted">{k.keyPrefix}…</td>
                  <td className="px-4 py-3 text-muted">
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
                    <td colSpan={5} className="px-4 py-4">
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
              </>
            ))}
          </tbody>
        </table>
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
