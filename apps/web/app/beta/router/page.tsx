"use client";

import { useState } from "react";
import Link from "next/link";
import { Activity, ArrowLeft, RefreshCw, CheckCircle2, Zap, DollarSign } from "lucide-react";
import { apiFetch } from "../../../lib/api";
import AuthGuard from "../../../components/AuthGuard";

export default function RouterPage() {
  return (
    <AuthGuard adminOnly>
      <RouterInner />
    </AuthGuard>
  );
}

function RouterInner() {
  const [providers, setProviders] = useState<{ name: string; latencyMs: number; costPer1k: string; status: string }[]>([
    { name: "Kyro LPU Edge (Primary)", latencyMs: 42, costPer1k: "$0.0004", status: "Optimal" },
    { name: "Groq Cloud Fallback", latencyMs: 65, costPer1k: "$0.0006", status: "Standby" },
    { name: "DeepSeek V3 Backup", latencyMs: 140, costPer1k: "$0.0002", status: "Standby" },
  ]);
  const [isBenchmarking, setIsBenchmarking] = useState(false);

  async function runRouterBenchmark() {
    setIsBenchmarking(true);
    try {
      const res = await apiFetch("/v1/beta/router-benchmark", { method: "POST" });
      if (res.providers) setProviders(res.providers);
    } catch (e: any) {
      alert(`Benchmark error: ${e.message}`);
    } finally {
      setIsBenchmarking(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg text-text p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Back Button & Header */}
        <div className="border-b border-border pb-6 space-y-4">
          <Link href="/beta" className="text-xs font-mono text-muted hover:text-accent flex items-center gap-1.5 w-fit">
            <ArrowLeft size={14} /> Back to Beta Lab Hub
          </Link>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-3">
                <Activity className="text-accent" size={32} /> Multi-Cloud Failover & Cost Router Benchmark
              </h1>
              <p className="text-sm text-muted mt-1">
                Dynamic cloud routing engine that shifts API traffic between LLM providers based on real-time cost and speed.
              </p>
            </div>
            <button
              onClick={runRouterBenchmark}
              disabled={isBenchmarking}
              className="px-4 py-2 bg-accent text-ink font-semibold rounded-lg text-xs flex items-center gap-2 hover:opacity-90"
            >
              <RefreshCw size={14} className={isBenchmarking ? "animate-spin" : ""} />
              {isBenchmarking ? "Benchmarking Cloud Latencies..." : "Trigger Latency Benchmark"}
            </button>
          </div>
        </div>

        {/* Provider Latency Benchmark Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {providers.map((p, idx) => (
            <div key={idx} className="bg-surface border border-border rounded-xl p-6 space-y-4 shadow-lg">
              <div className="flex justify-between items-center border-b border-border pb-3">
                <span className="font-bold text-sm text-text font-mono">{p.name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-success/30 bg-success/10 text-success font-bold">
                  {p.status}
                </span>
              </div>

              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted flex items-center gap-1"><Zap size={12} className="text-accent" /> Latency:</span>
                  <span className="text-accent font-bold text-base">{p.latencyMs} ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted flex items-center gap-1"><DollarSign size={12} className="text-success" /> Cost / 1k Tokens:</span>
                  <span className="text-text font-bold">{p.costPer1k}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
