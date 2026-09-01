"use client";

import { useEffect, useState } from "react";
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

function AdminPageInner() {
  const [config, setConfig] = useState<Config | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([apiFetch("/admin/config"), apiFetch("/admin/analytics")])
      .then(([cfg, ana]) => {
        setConfig(cfg);
        setAnalytics(ana);
      })
      .catch((e) => setError(e.message));
  }, []);

  async function save() {
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

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-12">
        <p className="text-danger">Error: {error}</p>
      </div>
    );
  }

  if (!config || !analytics) {
    return <div className="mx-auto max-w-4xl px-6 py-12 text-muted">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="font-display text-3xl mb-2">Admin control panel</h1>
      <p className="text-muted mb-10">Kyro's live behavior — changes apply immediately, no redeploy.</p>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <Metric label="Total users" value={analytics.totalUsers} />
        <Metric label="Active keys (24h)" value={analytics.dailyActiveKeys} />
        <Metric label="Requests (24h)" value={analytics.requestVolume24h} />
        <Metric
          label="Error rate (24h)"
          value={`${(analytics.errorRate24h * 100).toFixed(1)}%`}
          accent={analytics.errorRate24h > 0.05}
        />
      </section>

      <section className="border border-border rounded p-6 space-y-6">
        <h2 className="font-display text-xl">AI configuration</h2>

        <Field label="Active model">
          <input
            value={config.activeModel}
            onChange={(e) => setConfig({ ...config, activeModel: e.target.value })}
            className="w-full bg-surface border border-border rounded px-3 py-2 text-sm font-mono outline-none focus:border-accent"
          />
        </Field>

        <Field label="Global system prompt / persona">
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

        {error && <p className="text-danger text-sm">{error}</p>}

        <button
          onClick={save}
          disabled={saving}
          className="px-5 py-2.5 bg-accent text-ink rounded font-medium disabled:opacity-50"
        >
          {saved ? "Saved ✓" : saving ? "Saving…" : "Save & publish"}
        </button>
      </section>
    </div>
  );
}

function Metric({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="border border-border rounded p-4">
      <p className="text-muted text-xs mb-1">{label}</p>
      <p className={`font-display text-2xl ${accent ? "text-danger" : ""}`}>{value}</p>
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
