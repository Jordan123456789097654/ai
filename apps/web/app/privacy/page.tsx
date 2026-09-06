"use client";

import { ShieldCheck, Lock, CheckCircle, Server, Eye, Database } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 space-y-10 text-xs leading-relaxed">
      <div className="border-b border-border pb-6 space-y-2">
        <h1 className="font-display text-3xl text-text flex items-center gap-2">
          <ShieldCheck className="text-success" size={28} /> Global Privacy Policy & Data Protection Standard
        </h1>
        <p className="text-muted text-sm">
          Effective Date: September 6, 2026 • Document Version 3.0 (GDPR & CCPA Compliant)
        </p>
      </div>

      <div className="space-y-8 text-text/90">
        {/* Zero Data Training Guarantee Banner */}
        <section className="bg-success/10 border border-success/40 p-5 rounded-lg space-y-2">
          <h2 className="font-display text-base text-success font-semibold flex items-center gap-2">
            <CheckCircle size={20} /> Zero Global AI Model Training Guarantee
          </h2>
          <p className="text-text leading-relaxed">
            <strong>Kyro AI ABSOLUTELY NEVER utilizes your private prompts, uploaded codebase context files, repository ZIP archives, or API completion output for training global base LLM models.</strong> All inference jobs executed on our Groq LPU hardware clusters are processed ephemerally in RAM and purged immediately upon stream completion.
          </p>
        </section>

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="font-display text-lg text-text font-semibold flex items-center gap-2 border-b border-border/50 pb-1.5">
            1. Information Collection Categories
          </h2>
          <p>
            We adhere to strict data minimisation standards under GDPR Article 5. We collect only the data required to authenticate accounts, enforce quota limits, and maintain service security:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-muted">
            <li><strong>Developer Account Data:</strong> Email address and encrypted authentication tokens (managed via Supabase Auth with bcrypt hashing).</li>
            <li><strong>Operational Telemetry Logs:</strong> API key prefix, target model, request timestamp, prompt token count, completion token count, latency (ms), and HTTP status code.</li>
            <li><strong>Security Incident Logs:</strong> Transient IP addresses and User-Agent headers logged for 7 days solely for DDoS defense, rate limit calculation, and bot detection.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="font-display text-lg text-text font-semibold flex items-center gap-2 border-b border-border/50 pb-1.5">
            2. Ephemeral Prompt Data Processing Lifecycle
          </h2>
          <div className="bg-surface-raised border border-border p-4 rounded-lg font-mono text-[11px] space-y-2 text-muted">
            <div className="text-accent font-bold">Encrypted Data Flow Pipeline:</div>
            <div>1. Client Request ➔ Encrypted via TLS 1.3 in Transit</div>
            <div>2. Sanitization Engine ➔ PII & RSA Private Key Masking Filter</div>
            <div>3. Groq LPU Inference ➔ In-Memory Ephemeral Execution (Zero Persistence)</div>
            <div>4. SSE Streaming Output ➔ Delivered directly to client application</div>
            <div>5. RAM Flush ➔ Memory buffer cleared immediately after closing stream connection</div>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="font-display text-lg text-text font-semibold flex items-center gap-2 border-b border-border/50 pb-1.5">
            3. Data Retention & Erasure Standards
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-muted">
            <li><strong>Chat History:</strong> Saved in PostgreSQL only when signed into a user account. You may delete any chat thread at any time from the chat sidebar.</li>
            <li><strong>API Secret Hashing:</strong> API key secrets are stored using SHA-256 cryptographic hashes. Plaintext keys are shown only once at creation time.</li>
            <li><strong>WebTerminal Logs:</strong> Browser execution logs exist strictly in local React state and <code className="text-accent font-mono">localStorage</code> and are discarded when closing your browser tab.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="font-display text-lg text-text font-semibold flex items-center gap-2 border-b border-border/50 pb-1.5">
            4. International Data Rights (GDPR & CCPA)
          </h2>
          <p>
            Under European (GDPR) and California (CCPA) privacy frameworks, users possess enforceable data rights:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-muted">
            <div className="border border-border p-3.5 rounded bg-surface">
              <span className="font-bold text-text">Right to Access & Portability:</span>
              <p className="pt-1">Request a complete JSON dump of your account profile, API usage logs, and saved chat threads.</p>
            </div>
            <div className="border border-border p-3.5 rounded bg-surface">
              <span className="font-bold text-text">Right to Permanent Erasure:</span>
              <p className="pt-1">Delete your account and permanently purge all associated API keys, usage logs, and conversations from our databases.</p>
            </div>
          </div>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="font-display text-lg text-text font-semibold flex items-center gap-2 border-b border-border/50 pb-1.5">
            5. Contact Data Protection Officer
          </h2>
          <p>
            For privacy questions or data deletion requests, contact our Data Protection Officer at <code className="text-accent font-mono">privacy@kyro.ai</code> or open a ticket on our <a href="/support" className="text-accent hover:underline">Help Portal</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
