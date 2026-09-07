"use client";

import { useState } from "react";
import Link from "next/link";
import { GitCommit, Sparkles, ArrowLeft, Download, Copy, Check, Terminal, FileText, Tag, RefreshCw } from "lucide-react";
import { apiFetch } from "../../../lib/api";
import AuthGuard from "../../../components/AuthGuard";

export default function ChangelogGenPage() {
  return (
    <AuthGuard adminOnly>
      <ChangelogGenInner />
    </AuthGuard>
  );
}

function ChangelogGenInner() {
  const [fromTag, setFromTag] = useState("v1.0.0");
  const [toTag, setToTag] = useState("HEAD");
  const [markdown, setMarkdown] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    setIsGenerating(true);
    try {
      const res = await apiFetch("/v1/beta/generate-changelog", {
        method: "POST",
        body: JSON.stringify({ fromTag, toTag }),
      });
      if (res.markdown) setMarkdown(res.markdown);
    } finally {
      setIsGenerating(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-bg text-text p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-6">
          <div className="space-y-1">
            <Link href="/beta" className="text-xs font-mono text-accent hover:underline flex items-center gap-1 mb-2">
              <ArrowLeft size={12} /> Back to Beta Laboratory Hub
            </Link>
            <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-3">
              <GitCommit className="text-accent" size={32} /> Automated Release Notes & Changelog Generator
            </h1>
            <p className="text-xs text-muted">
              Reads git commit history and PR merge logs to generate formatted release notes categorized by Features, Fixes, Security, and Breaking Changes.
            </p>
          </div>
          <span className="font-mono text-xs text-accent bg-accent/10 border border-accent/30 px-3 py-1 rounded-full font-semibold">
            /beta/changelog-gen
          </span>
        </div>

        {/* Configuration Form */}
        <div className="bg-surface border border-border rounded-xl p-6 space-y-6 shadow-xl">
          <h2 className="font-display text-base font-bold text-text flex items-center gap-2 border-b border-border pb-3">
            <Tag size={18} className="text-accent" /> Select Git Tag / Branch Range
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-muted uppercase">From Tag / Branch</label>
              <input
                type="text"
                value={fromTag}
                onChange={(e) => setFromTag(e.target.value)}
                className="w-full bg-surface-raised border border-border rounded-lg px-4 py-2 text-xs font-mono text-text outline-none focus:border-accent"
                placeholder="v1.0.0"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-muted uppercase">To Tag / Branch</label>
              <input
                type="text"
                value={toTag}
                onChange={(e) => setToTag(e.target.value)}
                className="w-full bg-surface-raised border border-border rounded-lg px-4 py-2 text-xs font-mono text-text outline-none focus:border-accent"
                placeholder="HEAD"
              />
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full md:w-auto px-6 py-2.5 bg-accent text-ink font-semibold rounded-lg text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-all"
          >
            {isGenerating ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {isGenerating ? "Parsing Git Commits & Merges..." : "Generate AI Categorized Changelog"}
          </button>
        </div>

        {/* Output Area */}
        {markdown && (
          <div className="bg-surface border border-border rounded-xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display text-sm font-bold text-text flex items-center gap-2">
                <FileText size={16} className="text-accent" /> Generated Markdown Output
              </h3>
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 bg-surface-raised border border-border hover:border-accent text-xs font-mono text-text rounded-md flex items-center gap-1.5 transition-all"
              >
                {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                {copied ? "Copied!" : "Copy Markdown"}
              </button>
            </div>

            <pre className="bg-bg border border-border rounded-lg p-5 font-mono text-xs text-text overflow-x-auto leading-relaxed whitespace-pre-wrap">
              <code>{markdown}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
