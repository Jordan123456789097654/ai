"use client";

import { useEffect, useState } from "react";
import { Copy, Trash2, Plus, Check } from "lucide-react";
import { apiFetch } from "../../lib/api";

type ApiKeyRow = {
  id: string;
  name: string;
  keyPrefix: string;
  isActive: boolean;
  createdAt: string;
  lastUsedAt: string | null;
};

export default function DevPortalPage() {
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-3xl mb-2">Developer portal</h1>
      <p className="text-muted mb-10">Manage your API keys and usage.</p>

      {revealedKey && (
        <div className="mb-8 rounded border border-accent bg-surface-raised p-4">
          <p className="text-sm mb-2">
            Copy this key now — it won't be shown again.
          </p>
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
                <td className="px-4 py-3 text-right">
                  {k.isActive && (
                    <button onClick={() => revokeKey(k.id)} className="text-muted hover:text-danger">
                      <Trash2 size={14} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
