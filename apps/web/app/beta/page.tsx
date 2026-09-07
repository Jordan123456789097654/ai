"use client";

import { useEffect, useState } from "react";
import { FlaskConical, Sparkles, ToggleLeft, ToggleRight, Play, Terminal, ShieldAlert, CheckCircle2, Cpu, Wrench, Layers, Plus, Code2 } from "lucide-react";
import { apiFetch } from "../../lib/api";
import AuthGuard from "../../components/AuthGuard";

type BetaFeature = {
  id: string;
  name: string;
  category: string;
  enabled: boolean;
  description: string;
  version: string;
};

type ExperimentLog = {
  id: string;
  name: string;
  status: string;
  timestamp: string;
  result: string;
};

export default function BetaPage() {
  return (
    <AuthGuard adminOnly>
      <BetaLabInner />
    </AuthGuard>
  );
}

function BetaLabInner() {
  const [features, setFeatures] = useState<BetaFeature[]>([]);
  const [experiments, setExperiments] = useState<ExperimentLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Custom Prototype Testing State
  const [customPrompt, setCustomPrompt] = useState("Execute multi-step code refactoring on 128k context window");
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    loadBetaData();
  }, []);

  async function loadBetaData() {
    setLoading(true);
    try {
      const data = await apiFetch("/v1/beta/features");
      if (data.features) setFeatures(data.features);
      if (data.experiments) setExperiments(data.experiments);
    } catch {
      // Fallback offline mock data
      setFeatures([
        {
          id: "FEAT-EXPERIMENTAL-MODEL",
          name: "kyro-reasoner-preview (128k Context Reasoning Model)",
          category: "AI Inference Engine",
          enabled: true,
          description: "Preview experimental multi-step reasoning LLM model alias before public rollout.",
          version: "v0.9-beta",
        },
        {
          id: "FEAT-STREAMING-WEBHOOKS",
          name: "Real-time SSE Webhook Event Streaming",
          category: "API Gateway",
          enabled: true,
          description: "Stream token execution metrics via Server-Sent Events to external developer dashboards.",
          version: "v0.8-beta",
        },
        {
          id: "FEAT-AUTO-HEAL",
          name: "Autonomous AI Code Self-Healing Engine",
          category: "DevSecOps",
          enabled: false,
          description: "Automatically generate PR fix patches when 500 error spikes are detected in API usage logs.",
          version: "v0.5-alpha",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function toggleFeature(featureId: string, currentStatus: boolean) {
    const nextStatus = !currentStatus;
    setFeatures((prev) =>
      prev.map((f) => (f.id === featureId ? { ...f, enabled: nextStatus } : f))
    );

    try {
      await apiFetch("/v1/beta/toggle", {
        method: "POST",
        body: JSON.stringify({ featureId, enabled: nextStatus }),
      });
    } catch {}
  }

  async function runExperiment(e: React.FormEvent) {
    e.preventDefault();
    if (!customPrompt.trim()) return;
    setIsTesting(true);

    try {
      const res = await apiFetch("/v1/beta/run-experiment", {
        method: "POST",
        body: JSON.stringify({ prompt: customPrompt }),
      });

      if (res.log) {
        setExperiments((prev) => [res.log, ...prev]);
        alert("✨ Experimental Prototype Execution Complete!");
      }
    } finally {
      setIsTesting(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg text-text p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-border pb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-3">
              <FlaskConical className="text-accent" size={32} /> Admin Beta Laboratory (`/beta`)
            </h1>
            <p className="text-sm text-muted mt-1">
              Restricted Admin Testing Sandbox for experimental feature flags, custom AI prototypes, and early access model benchmarks.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-accent bg-accent/10 border border-accent/30 px-3 py-1.5 rounded-full font-semibold">
            <ShieldAlert size={14} /> Admin Access Only
          </div>
        </div>

        {/* Feature Flags Grid */}
        <div className="bg-surface border border-border rounded-xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="font-display text-lg font-bold text-text flex items-center gap-2">
              <Cpu className="text-accent" size={20} /> Experimental Feature Flags ({features.length})
            </h2>
            <span className="text-xs font-mono text-muted">Admin Toggle Sandbox</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feat) => (
              <div
                key={feat.id}
                className={`p-5 rounded-lg border transition-all space-y-3 ${
                  feat.enabled
                    ? "border-accent/50 bg-accent/5"
                    : "border-border bg-surface-raised/40 opacity-75"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-text">{feat.name}</span>
                      <span className="text-[10px] font-mono bg-surface border border-border px-2 py-0.5 rounded text-accent font-semibold">
                        {feat.version}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-muted uppercase tracking-wider">{feat.category}</span>
                  </div>

                  <button
                    onClick={() => toggleFeature(feat.id, feat.enabled)}
                    className={`text-2xl transition-all ${
                      feat.enabled ? "text-accent" : "text-muted"
                    }`}
                    title={feat.enabled ? "Disable Feature" : "Enable Feature"}
                  >
                    {feat.enabled ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                  </button>
                </div>

                <p className="text-xs text-muted leading-relaxed font-sans">{feat.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Prototype Experiment Runner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Runner Input (Left 6 Cols) */}
          <div className="lg:col-span-6 bg-surface border border-border rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display text-base font-bold text-text flex items-center gap-2">
                <Wrench className="text-accent" size={18} /> Run Custom Beta Prototype
              </h3>
              <span className="text-xs font-mono text-muted">Admin Staging Area</span>
            </div>

            <form onSubmit={runExperiment} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-muted mb-2 uppercase tracking-wider">
                  Experimental Directive / Prompt
                </label>
                <textarea
                  rows={4}
                  required
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Type any custom experimental directive to test on the beta engine..."
                  className="w-full bg-surface-raised border border-border rounded-lg p-3.5 text-xs text-text font-mono outline-none focus:border-accent leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={isTesting}
                className="w-full py-3 bg-accent text-ink rounded-lg font-semibold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <Sparkles size={16} /> {isTesting ? "Executing Prototype..." : "Execute Beta Experiment"}
              </button>
            </form>
          </div>

          {/* Experiment Execution Log (Right 6 Cols) */}
          <div className="lg:col-span-6 bg-surface border border-border rounded-xl p-6 space-y-4">
            <h3 className="font-display text-base font-bold text-text border-b border-border pb-3 flex items-center justify-between">
              <span>Beta Execution Logs</span>
              <span className="text-xs font-mono text-muted">{experiments.length} Runs</span>
            </h3>

            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {experiments.map((exp) => (
                <div key={exp.id} className="p-4 rounded-lg border border-border bg-surface-raised/50 space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-accent font-bold">{exp.name}</span>
                    <span className="text-[10px] text-success font-bold flex items-center gap-1">
                      <CheckCircle2 size={12} /> {exp.status}
                    </span>
                  </div>
                  <p className="text-text font-sans text-xs">{exp.result}</p>
                  <span className="text-[10px] text-muted block pt-1">{new Date(exp.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
