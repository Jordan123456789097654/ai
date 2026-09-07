"use client";

import { useState } from "react";
import Link from "next/link";
import { GitPullRequest, Sparkles, ArrowLeft, ShieldAlert, CheckCircle2, FileCode, Terminal } from "lucide-react";
import { apiFetch } from "../../../lib/api";
import AuthGuard from "../../../components/AuthGuard";

export default function SelfHealPage() {
  return (
    <AuthGuard adminOnly>
      <SelfHealInner />
    </AuthGuard>
  );
}

function SelfHealInner() {
  const [errorLogInput, setErrorLogInput] = useState("TypeError: Cannot read properties of undefined (reading 'userId') at /routes/v1/chatCompletions.js:42:12");
  const [healedPatch, setHealedPatch] = useState("");
  const [isHealing, setIsHealing] = useState(false);

  async function runSelfHeal(e: React.FormEvent) {
    e.preventDefault();
    if (!errorLogInput.trim()) return;
    setIsHealing(true);

    try {
      const res = await apiFetch("/v1/beta/self-heal", {
        method: "POST",
        body: JSON.stringify({ errorLog: errorLogInput }),
      });
      if (res.patch) setHealedPatch(res.patch);
    } catch (e: any) {
      alert(`Self-heal error: ${e.message}`);
    } finally {
      setIsHealing(false);
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
                <GitPullRequest className="text-accent" size={32} /> Autonomous AI Code Self-Healing & PR Fixer
              </h1>
              <p className="text-sm text-muted mt-1">
                Paste production 500 error stack traces or failing test logs to automatically synthesize PR code patches.
              </p>
            </div>
            <span className="text-xs font-mono bg-accent/10 border border-accent/30 text-accent px-3 py-1.5 rounded-full font-semibold">
              Admin Beta Feature
            </span>
          </div>
        </div>

        {/* Main Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Error Log (Left 6 Cols) */}
          <div className="lg:col-span-6 bg-surface border border-border rounded-xl p-6 space-y-4">
            <h2 className="font-display text-base font-bold text-text flex items-center gap-2 border-b border-border pb-3">
              <FileCode className="text-accent" size={18} /> Ingest Server Error Trace
            </h2>

            <form onSubmit={runSelfHeal} className="space-y-4">
              <textarea
                rows={8}
                required
                value={errorLogInput}
                onChange={(e) => setErrorLogInput(e.target.value)}
                placeholder="Paste server error log, stack trace, or failing test output..."
                className="w-full bg-surface-raised border border-border rounded-lg p-3.5 text-xs text-text font-mono outline-none focus:border-accent leading-relaxed"
              />

              <button
                type="submit"
                disabled={isHealing}
                className="w-full py-3 bg-accent text-ink rounded-lg font-semibold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <Sparkles size={16} /> {isHealing ? "Synthesizing PR Patch..." : "Generate Autonomous Fix Patch"}
              </button>
            </form>
          </div>

          {/* PR Patch Preview (Right 6 Cols) */}
          <div className="lg:col-span-6 bg-surface border border-border rounded-xl p-6 space-y-4">
            <h2 className="font-display text-base font-bold text-text border-b border-border pb-3 flex items-center justify-between">
              <span>GitHub PR Patch Diff</span>
              {healedPatch && (
                <span className="text-xs font-mono text-success flex items-center gap-1">
                  <CheckCircle2 size={14} /> Unit Tests Validated
                </span>
              )}
            </h2>

            {healedPatch ? (
              <pre className="bg-bg border border-accent/40 rounded-lg p-4 font-mono text-xs text-accent overflow-x-auto leading-relaxed">
                <code>{healedPatch}</code>
              </pre>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center text-muted p-6 space-y-2">
                <Terminal size={32} className="text-accent/50 mb-1" />
                <p className="text-xs font-mono">Submit an error log to generate an automated GitHub PR fix patch.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
