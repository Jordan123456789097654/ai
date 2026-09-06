"use client";

import { ShieldCheck, Lock, FileText, CheckCircle, Server, Eye } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 space-y-10 text-xs leading-relaxed">
      <div className="border-b border-border pb-6 space-y-2">
        <h1 className="font-display text-3xl text-text flex items-center gap-2">
          <ShieldCheck className="text-success" size={28} /> Privacy Policy & Data Protection
        </h1>
        <p className="text-muted text-sm">
          Effective Date: September 6, 2026 • Zero Data Training Guarantee
        </p>
      </div>

      <div className="space-y-8 text-text/90">
        {/* Zero Data Training Guarantee */}
        <section className="bg-success/10 border border-success/30 p-4 rounded-lg space-y-2">
          <h2 className="font-display text-base text-success font-semibold flex items-center gap-2">
            <CheckCircle size={18} /> Zero Global AI Model Training Commitment
          </h2>
          <p className="text-text">
            <strong>Kyro AI NEVER uses your private prompts, codebase context files, or API completion outputs to train global foundation base models.</strong> All inference requests sent to our Groq LPU cloud gateways are processed ephemerally in RAM and purged immediately after response delivery.
          </p>
        </section>

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="font-display text-lg text-text font-semibold flex items-center gap-2 border-b border-border/50 pb-1.5">
            1. Information We Collect
          </h2>
          <p>
            We collect only the essential information necessary to authenticate developers, enforce rate limits, and deliver high-performance API services:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-muted">
            <li><strong>Account Information:</strong> When you register for a Kyro account, we store your email address and encrypted authentication tokens (via Supabase Auth).</li>
            <li><strong>API Metadata & Usage Logs:</strong> We collect non-sensitive operational telemetry including API key prefix, endpoint called (<code className="text-accent font-mono">/v1/chat/completions</code>), prompt token counts, completion token counts, latency (ms), and HTTP status codes.</li>
            <li><strong>Technical Diagnostics:</strong> IP addresses and user-agent strings are logged for 7 days solely for rate limiting, DDoS mitigation, and security threat prevention.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="font-display text-lg text-text font-semibold flex items-center gap-2 border-b border-border/50 pb-1.5">
            2. How We Process Your Prompts & Code Data
          </h2>
          <p>
            When you send text or code context to Kyro AI, your payload is handled strictly under the following data flow pipeline:
          </p>
          <div className="bg-surface-raised border border-border p-4 rounded-lg font-mono text-[11px] space-y-2 text-muted">
            <div className="text-accent font-bold">Data Pipeline & Processing Lifecycle:</div>
            <div>1. Client Prompt ➔ Encrypted via TLS 1.3 in Transit</div>
            <div>2. Secret Redaction ➔ PII & RSA Private Key Sanitization Filter</div>
            <div>3. Groq LPU Inference ➔ In-Memory Ephemeral Execution (Zero Persistence)</div>
            <div>4. SSE Streaming Output ➔ Delivered directly to your client application</div>
            <div>5. Cache Cleanup ➔ RAM buffers purged upon stream completion</div>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="font-display text-lg text-text font-semibold flex items-center gap-2 border-b border-border/50 pb-1.5">
            3. Data Retention & Storage Policy
          </h2>
          <p>
            Kyro AI enforces strict data minimisation principles across all storage layers:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-muted">
            <li><strong>Web Chat Conversations:</strong> Stored securely in PostgreSQL only when you are signed in, allowing you to access conversation history. You may delete any chat thread at any time.</li>
            <li><strong>API Key Secrets:</strong> Hashed using SHA-256 before storing. Raw API key secrets are shown only once upon generation and are never stored in plain text.</li>
            <li><strong>Temporary Code Sandboxes:</strong> Execution logs from the WebTerminal are kept strictly in browser memory (<code className="text-accent font-mono">localStorage</code> / React state) and are lost when closing the browser tab.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="font-display text-lg text-text font-semibold flex items-center gap-2 border-b border-border/50 pb-1.5">
            4. International Compliance (GDPR & CCPA Rights)
          </h2>
          <p>
            Under the European General Data Protection Regulation (GDPR) and California Consumer Privacy Act (CCPA), you possess the following rights regarding your personal data:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-muted">
            <div className="border border-border p-3 rounded bg-surface">
              <span className="font-bold text-text">Right to Access & Portability:</span>
              <p className="pt-1">Request a full JSON export of all your account data, API usage logs, and saved conversation threads.</p>
            </div>
            <div className="border border-border p-3 rounded bg-surface">
              <span className="font-bold text-text">Right to Erasure ("Right to be Forgotten"):</span>
              <p className="pt-1">Delete your account and purge all associated API keys, usage logs, and chat records permanently.</p>
            </div>
          </div>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="font-display text-lg text-text font-semibold flex items-center gap-2 border-b border-border/50 pb-1.5">
            5. Contact Privacy Officer
          </h2>
          <p>
            For privacy inquiries, data deletion requests, or compliance audits, contact our Data Protection Officer at:
            <br />
            <code className="text-accent font-mono">privacy@kyro.ai</code> or submit a support ticket via our <a href="/support" className="text-accent hover:underline">Help & Support Portal</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
