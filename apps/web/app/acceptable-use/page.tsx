"use client";

import { ShieldAlert, CheckCircle2, XCircle, Lock, Server, AlertTriangle, FileText, Ban } from "lucide-react";

export default function AcceptableUsePage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 space-y-10 text-xs leading-relaxed font-sans">
      <div className="border-b border-border pb-6 space-y-2">
        <h1 className="font-display text-3xl text-text flex items-center gap-3">
          <ShieldAlert className="text-warning" size={32} /> Acceptable Use Policy & Platform Guardrails
        </h1>
        <p className="text-muted text-sm font-mono">
          Document Version 3.2 • Effective Date: September 6, 2026 • Enterprise Security Standard
        </p>
      </div>

      <div className="space-y-8 text-text/90">
        <section className="space-y-3">
          <h2 className="font-display text-lg text-text font-semibold border-b border-border/50 pb-1.5 flex items-center gap-2">
            <FileText size={18} className="text-accent" /> 1. Overview & Core Philosophy
          </h2>
          <p>
            This Acceptable Use Policy ("AUP") governs all access to and use of the Kyro AI Platform, including the Kyro Web Interface, REST API Gateways (<code className="text-accent font-mono">/v1/chat/completions</code>), synthetic model aliases, Chrome extensions, and CLI developer tooling. By using Kyro AI, you agree to adhere strictly to the boundaries and restrictions outlined in this policy.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-lg text-text font-semibold border-b border-border/50 pb-1.5 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-success" /> 2. Permitted & Recommended Use Cases
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-success/30 bg-success/5 p-4 rounded-lg space-y-2">
              <span className="font-bold text-sm text-success flex items-center gap-1.5 font-mono">
                <CheckCircle2 size={16} /> Permitted Use Cases
              </span>
              <ul className="list-disc pl-4 space-y-1.5 text-muted">
                <li>Automated software development, code generation, refactoring, and debugging.</li>
                <li>API integration building, unit test synthesis, and technical documentation drafting.</li>
                <li>Enterprise AI agent workflows, data transformation pipelines, and synthetic data generation.</li>
                <li>Educational research, technical problem solving, and architecture design reviews.</li>
              </ul>
            </div>

            <div className="border border-danger/30 bg-danger/5 p-4 rounded-lg space-y-2">
              <span className="font-bold text-sm text-danger flex items-center gap-1.5 font-mono">
                <XCircle size={16} /> Prohibited Activities
              </span>
              <ul className="list-disc pl-4 space-y-1.5 text-muted">
                <li>Developing malware, ransomware, exploits, or automated attack vectors.</li>
                <li>Scraping or harvesting Personally Identifiable Information (PII) without authorization.</li>
                <li>Generating credential phishing campaigns, spam, or deceitful social engineering scripts.</li>
                <li>Attempting to bypass platform authorization, rate limits, or token quota caps.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg text-text font-semibold border-b border-border/50 pb-1.5 flex items-center gap-2">
            <Lock size={18} className="text-accent" /> 3. Automated Secret Masking & PII Redaction
          </h2>
          <p>
            All API completion requests pass through Kyro's real-time <strong>Secret Masking & PII Redaction Engine</strong>. This filter automatically inspects prompts and completions to redact sensitive patterns, including:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-muted">
            <li>Unmasked API keys (<code className="text-accent font-mono">kyro_sk_...</code>, <code className="text-accent font-mono">sk-proj-...</code>, <code className="text-accent font-mono">ghp_...</code>).</li>
            <li>Social Security Numbers, Credit Card Numbers, and Banking IBAN codes.</li>
            <li>Private RSA/SSH SSH keys and database connection passwords.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg text-text font-semibold border-b border-border/50 pb-1.5 flex items-center gap-2">
            <Ban size={18} className="text-danger" /> 4. Zero-Tolerance Enforcement & Suspension
          </h2>
          <p>
            Kyro AI enforces automated threat detection systems. Violations of this Acceptable Use Policy will result in immediate escalation steps:
          </p>
          <ol className="list-decimal pl-5 space-y-1.5 text-muted font-mono">
            <li><strong>Soft Warning & Temporary Rate Limit Reduction:</strong> For non-malicious minor quota overages.</li>
            <li><strong>API Key Revocation:</strong> Immediate invalidation of active developer API keys involved in unauthorized payload generation.</li>
            <li><strong>Permanent Account Suspension & IP Block:</strong> For deliberate exploit development, secret harvesting, or infrastructure attack attempts.</li>
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg text-text font-semibold border-b border-border/50 pb-1.5">
            5. Reporting Abuse
          </h2>
          <p>
            If you discover potential abuse, security vulnerabilities, or unauthorized payload generation on the Kyro platform, please report it immediately to our Security Response Team at <code className="text-accent font-mono">security@kyro.ai</code>. Reports are acknowledged within 4 business hours.
          </p>
        </section>
      </div>
    </div>
  );
}
