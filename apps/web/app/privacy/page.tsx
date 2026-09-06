"use client";

import { Shield, Lock, CheckCircle2, Eye, Database, Globe } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 space-y-10 text-xs leading-relaxed font-sans">
      <div className="border-b border-border pb-6 space-y-2">
        <h1 className="font-display text-3xl text-text flex items-center gap-3">
          <Shield className="text-accent" size={32} /> Global Privacy Policy (GDPR & CCPA Compliant)
        </h1>
        <p className="text-muted text-sm font-mono">
          Document Version 3.0 • Last Revised: September 6, 2026 • Zero LLM Data Training Policy
        </p>
      </div>

      <div className="space-y-8 text-text/90">
        <section className="space-y-3">
          <h2 className="font-display text-lg text-text font-semibold border-b border-border/50 pb-1.5 flex items-center gap-2">
            <Lock size={18} className="text-success" /> 1. Zero Model Training Guarantee
          </h2>
          <div className="border border-success/30 bg-success/5 p-4 rounded-lg space-y-2">
            <span className="font-bold text-sm text-success flex items-center gap-1.5 font-mono">
              <CheckCircle2 size={16} /> Your Prompts Are Never Used To Train AI Models
            </span>
            <p className="text-muted">
              Kyro AI enforces a strict Zero Training Policy. Prompt inputs, uploaded code files, and model completion outputs generated via API calls or Web Chat are processed in ephemeral memory and are NEVER used to train, fine-tune, or improve public foundation models.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg text-text font-semibold border-b border-border/50 pb-1.5 flex items-center gap-2">
            <Database size={18} className="text-accent" /> 2. Information We Collect
          </h2>
          <p>We collect minimal telemetry necessary to operate the Kyro API Gateway:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-muted">
            <li><strong>Account Credentials:</strong> Email address provided during Supabase sign-up.</li>
            <li><strong>Developer API Metadata:</strong> API Key prefixes, scopes, expiration dates, and token consumption counts.</li>
            <li><strong>Infrastructure Telemetry:</strong> HTTP response codes, latency (ms), and error logs for SLA verification.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg text-text font-semibold border-b border-border/50 pb-1.5 flex items-center gap-2">
            <Globe size={18} className="text-accent" /> 3. GDPR & CCPA Rights
          </h2>
          <p>
            Under GDPR (Regulation EU 2016/679) and CCPA (Cal. Civ. Code § 1798.100), you have the right to request access to, deletion of, or export of your personal data.
          </p>
          <p className="text-muted">
            To submit a privacy data request, email <code className="text-accent font-mono">privacy@kyro.ai</code>. Data erasure requests are processed within 72 hours.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg text-text font-semibold border-b border-border/50 pb-1.5">
            4. Data Security & Encryption
          </h2>
          <p>
            All data in transit is encrypted using TLS 1.3 encryption. Data at rest (PostgreSQL database & Redis token cache) is secured using AES-256 encryption.
          </p>
        </section>
      </div>
    </div>
  );
}
