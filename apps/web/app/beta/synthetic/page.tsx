"use client";

import { useState } from "react";
import Link from "next/link";
import { Database, ArrowLeft, Download, Code2, Sparkles, Check, Copy } from "lucide-react";
import { apiFetch } from "../../../lib/api";
import AuthGuard from "../../../components/AuthGuard";

export default function SyntheticPage() {
  return (
    <AuthGuard adminOnly>
      <SyntheticInner />
    </AuthGuard>
  );
}

function SyntheticInner() {
  const [recordCount, setRecordCount] = useState(5);
  const [syntheticData, setSyntheticData] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  async function generateData() {
    setIsGenerating(true);
    try {
      const res = await apiFetch("/v1/beta/generate-synthetic", {
        method: "POST",
        body: JSON.stringify({ count: recordCount }),
      });
      if (res.data) setSyntheticData(res.data);
    } catch (e: any) {
      alert(`Generation error: ${e.message}`);
    } finally {
      setIsGenerating(false);
    }
  }

  function downloadJson() {
    const blob = new Blob([JSON.stringify(syntheticData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `synthetic-dataset-${Date.now()}.json`;
    a.click();
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
                <Database className="text-accent" size={32} /> Synthetic Database Seeder & Mock API Engine
              </h1>
              <p className="text-sm text-muted mt-1">
                Generate production-ready synthetic test data records and spin up temporary mock REST API endpoints.
              </p>
            </div>
            {syntheticData.length > 0 && (
              <button
                onClick={downloadJson}
                className="px-4 py-2 bg-surface-raised border border-border text-text rounded-lg text-xs font-mono flex items-center gap-1.5 hover:border-accent"
              >
                <Download size={14} /> Export JSON Dataset
              </button>
            )}
          </div>
        </div>

        {/* Main Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls (Left 5 Cols) */}
          <div className="lg:col-span-5 bg-surface border border-border rounded-xl p-6 space-y-6">
            <h2 className="font-display text-base font-bold text-text border-b border-border pb-3 flex items-center gap-2">
              <Sparkles className="text-accent" size={18} /> Generator Controls
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-muted mb-2 font-bold uppercase">Record Count</label>
                <select
                  value={recordCount}
                  onChange={(e) => setRecordCount(Number(e.target.value))}
                  className="w-full bg-surface-raised border border-border rounded-lg p-2.5 text-xs text-text font-mono outline-none focus:border-accent"
                >
                  <option value={5}>5 Test Records</option>
                  <option value={10}>10 Test Records</option>
                  <option value={50}>50 Test Records</option>
                  <option value={100}>100 Test Records</option>
                </select>
              </div>

              <button
                onClick={generateData}
                disabled={isGenerating}
                className="w-full py-3 bg-accent text-ink rounded-lg font-semibold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <Database size={16} /> {isGenerating ? "Synthesizing Dataset..." : "Synthesize Test Records"}
              </button>
            </div>
          </div>

          {/* Generated Data Preview (Right 7 Cols) */}
          <div className="lg:col-span-7 bg-surface border border-border rounded-xl p-6 space-y-4">
            <h2 className="font-display text-base font-bold text-text border-b border-border pb-3 flex items-center justify-between">
              <span>Synthetic Output Preview</span>
              <span className="text-xs font-mono text-muted">{syntheticData.length} Records</span>
            </h2>

            {syntheticData.length > 0 ? (
              <pre className="bg-bg border border-border rounded-lg p-4 font-mono text-xs text-accent overflow-x-auto max-h-[400px]">
                <code>{JSON.stringify(syntheticData, null, 2)}</code>
              </pre>
            ) : (
              <div className="h-64 flex items-center justify-center text-center text-muted text-xs font-mono p-6">
                Click 'Synthesize Test Records' to output fake JSON datasets and mock endpoint data.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
