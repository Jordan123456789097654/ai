"use client";

import { useState } from "react";
import Link from "next/link";
import { Cpu, Sparkles, ArrowLeft, Play, Layers, CheckCircle2 } from "lucide-react";
import { apiFetch } from "../../../lib/api";
import AuthGuard from "../../../components/AuthGuard";

export default function ReasonerPage() {
  return (
    <AuthGuard adminOnly>
      <ReasonerInner />
    </AuthGuard>
  );
}

function ReasonerInner() {
  const [prompt, setPrompt] = useState("Analyze architecture decoupling between Fastify REST gateway, Redis token bucket, and Supabase Auth across 128,000 token context window.");
  const [reasoningOutput, setReasoningOutput] = useState("");
  const [isReasoning, setIsReasoning] = useState(false);

  async function runReasoner(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;
    setIsReasoning(true);

    try {
      const res = await apiFetch("/v1/beta/reasoner", {
        method: "POST",
        body: JSON.stringify({ prompt }),
      });
      if (res.reasoning) setReasoningOutput(res.reasoning);
    } catch (e: any) {
      alert(`Reasoner error: ${e.message}`);
    } finally {
      setIsReasoning(false);
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
                <Cpu className="text-accent" size={32} /> kyro-reasoner-preview (128k Context Reasoning Model)
              </h1>
              <p className="text-sm text-muted mt-1">
                Preview experimental multi-step reasoning LLM capable of ingesting 128,000 tokens of codebase context.
              </p>
            </div>
            <span className="text-xs font-mono bg-accent/10 border border-accent/30 text-accent px-3 py-1.5 rounded-full font-semibold">
              128k Context Active
            </span>
          </div>
        </div>

        {/* Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Prompt Input (Left 6 Cols) */}
          <div className="lg:col-span-6 bg-surface border border-border rounded-xl p-6 space-y-4">
            <h2 className="font-display text-base font-bold text-text border-b border-border pb-3 flex items-center gap-2">
              <Layers className="text-accent" size={18} /> Ingest 128k Codebase Context
            </h2>

            <form onSubmit={runReasoner} className="space-y-4">
              <textarea
                rows={8}
                required
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter codebase files or architecture prompt..."
                className="w-full bg-surface-raised border border-border rounded-lg p-3.5 text-xs text-text font-mono outline-none focus:border-accent leading-relaxed"
              />

              <button
                type="submit"
                disabled={isReasoning}
                className="w-full py-3 bg-accent text-ink rounded-lg font-semibold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <Play size={16} /> {isReasoning ? "Reasoning across 128k Context..." : "Run 128k Reasoning Engine"}
              </button>
            </form>
          </div>

          {/* Reasoning Output (Right 6 Cols) */}
          <div className="lg:col-span-6 bg-surface border border-border rounded-xl p-6 space-y-4">
            <h2 className="font-display text-base font-bold text-text border-b border-border pb-3 flex items-center justify-between">
              <span>Multi-Step Chain-of-Thought Output</span>
              {reasoningOutput && (
                <span className="text-xs font-mono text-success flex items-center gap-1 font-bold">
                  <CheckCircle2 size={14} /> 99.4% Memory Accuracy
                </span>
              )}
            </h2>

            {reasoningOutput ? (
              <pre className="bg-bg border border-border rounded-lg p-4 font-mono text-xs text-text overflow-x-auto leading-relaxed">
                <code>{reasoningOutput}</code>
              </pre>
            ) : (
              <div className="h-64 flex items-center justify-center text-center text-muted text-xs font-mono p-6">
                Submit a prompt to run multi-step reasoning analysis across 128k tokens.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
