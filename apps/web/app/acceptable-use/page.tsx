"use client";

import { ShieldAlert, CheckCircle2, XCircle, Lock, Server } from "lucide-react";

export default function AcceptableUsePage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 space-y-10 text-xs leading-relaxed">
      <div className="border-b border-border pb-6 space-y-2">
        <h1 className="font-display text-3xl text-text flex items-center gap-2">
          <ShieldAlert className="text-warning" size={28} /> Acceptable Use Policy & Guardrails
        </h1>
        <p className="text-muted text-sm">
          Last Updated: September 6, 2026 • Platform Security Standards
        </p>
      </div>

      <div className="space-y-8 text-text/90">
        <section className="space-y-3">
          <h2 className="font-display text-lg text-text font-semibold border-b border-border/50 pb-1.5">
            1. Allowed Use Cases
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="border border-success/30 bg-success/5 p-3 rounded space-y-1 text-muted">
              <span className="font-bold text-success flex items-center gap-1"><CheckCircle2 size={14}/> Permitted:</span>
              <p>Software development, code generation, refactoring, API integrations, debugging, unit test creation, technical documentation, and AI agent automation.</p>
            </div>
            <div className="border border-danger/30 bg-danger/5 p-3 rounded space-y-1 text-muted">
              <span className="font-bold text-danger flex items-center gap-1"><XCircle size={14}/> Prohibited:</span>
              <p>Malware creation, ransomware development, automated scraping of personal PII, credential harvesting, spam generation, or bypassing authorization controls.</p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg text-text font-semibold border-b border-border/50 pb-1.5">
            2. Security Enforcement & Automated Scans
          </h2>
          <p>
            All API payloads pass through the automated <strong>Secret Masking & PII Redaction Filter</strong> in <code className="text-accent font-mono">apps/api/src/routes/v1/chatCompletions.js</code>. Attempts to inject malicious prompt payloads designed to leak system instructions or extract user tokens will trigger automated IP blocks.
          </p>
        </section>
      </div>
    </div>
  );
}
