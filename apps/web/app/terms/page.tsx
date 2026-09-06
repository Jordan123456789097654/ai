"use client";

import { Shield, FileText, Lock, Scale, AlertCircle } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 space-y-10 text-xs leading-relaxed">
      <div className="border-b border-border pb-6 space-y-2">
        <h1 className="font-display text-3xl text-text flex items-center gap-2">
          <Scale className="text-accent" size={28} /> Terms of Service & Terms of Use
        </h1>
        <p className="text-muted text-sm">
          Last Updated: September 6, 2026 • Version 2.4 (Production Release)
        </p>
      </div>

      <div className="space-y-8 text-text/90">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="font-display text-lg text-text font-semibold flex items-center gap-2 border-b border-border/50 pb-1.5">
            1. Agreement to Terms & Acceptance
          </h2>
          <p>
            These Terms of Service ("Terms", "Agreement") constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("User", "you", "your"), and Kyro AI Platform Inc. ("Kyro AI", "company", "we", "us", "our"), concerning your access to and use of the <strong>Kyro AI Platform</strong> web application, developer API gateways (including <code className="text-accent font-mono">/v1/chat/completions</code> and <code className="text-accent font-mono">/v1/models</code>), hosted Discord & Slack bots, CLI tools, and associated software services (collectively, the "Services").
          </p>
          <p>
            By accessing, creating an account, or consuming API endpoints provided by Kyro AI, you explicitly acknowledge that you have read, understood, and agree to be bound by all of these Terms of Service. If you do not agree with all of these terms, you are expressly prohibited from using the Services and must discontinue use immediately.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="font-display text-lg text-text font-semibold flex items-center gap-2 border-b border-border/50 pb-1.5">
            2. Developer Credentials & API Key Security
          </h2>
          <p>
            Kyro AI provides developer API keys (<code className="text-accent font-mono">kyro_sk_live_...</code>) for authenticated access to cloud LLM inference clusters. You are solely responsible for maintaining the confidentiality of your API keys, credentials, and authentication tokens.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-muted">
            <li><strong>Secret Exposure:</strong> You agree not to expose, commit to public GitHub repositories, or client-side web bundles any live secret keys.</li>
            <li><strong>Unauthorized Usage:</strong> You are fully liable for all API traffic, token consumption, and rate limit usage incurred under your developer API keys.</li>
            <li><strong>Revocation Right:</strong> Kyro AI reserves the right to immediately revoke any API key detected in public data leaks or violating rate limit guardrails.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="font-display text-lg text-text font-semibold flex items-center gap-2 border-b border-border/50 pb-1.5">
            3. Rate Limits, Quotas & Service Tiers
          </h2>
          <p>
            Usage of the Kyro AI Gateway is governed by tier-based concurrency caps and token rate limits to maintain optimal system stability across all global clusters:
          </p>
          <div className="border border-border rounded overflow-hidden font-mono text-[11px] my-3">
            <table className="w-full text-left">
              <thead className="bg-surface-raised text-muted">
                <tr>
                  <th className="p-2 border-r border-border">Account Tier</th>
                  <th className="p-2 border-r border-border">Requests per Minute (RPM)</th>
                  <th className="p-2 border-r border-border">Tokens per Minute (TPM)</th>
                  <th className="p-2">Concurrency Limit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="p-2 border-r border-border text-accent font-bold">Free Tier</td>
                  <td className="p-2 border-r border-border">20 req/min</td>
                  <td className="p-2 border-r border-border">100,000 TPM</td>
                  <td className="p-2">2 concurrent jobs</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-border text-accent font-bold">Pro Tier / BYOK</td>
                  <td className="p-2 border-r border-border">120 req/min</td>
                  <td className="p-2 border-r border-border">500,000 TPM</td>
                  <td className="p-2">10 concurrent jobs</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-border text-accent font-bold">Enterprise Tier</td>
                  <td className="p-2 border-r border-border">1,000+ req/min (Custom)</td>
                  <td className="p-2 border-r border-border">Custom High-Volume</td>
                  <td className="p-2">50+ concurrent jobs</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Attempts to bypass, circumvent, or distributed denial-of-service (DDoS) rate limiting systems using proxy networks will result in permanent account termination and IP subnet blocks.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="font-display text-lg text-text font-semibold flex items-center gap-2 border-b border-border/50 pb-1.5">
            4. Proprietary Rights & Content Ownership
          </h2>
          <p>
            <strong>Your Output Rights:</strong> Between you and Kyro AI, you retain full ownership of all prompts, codebase context files, and text completions generated by Kyro AI through your API or web sessions.
          </p>
          <p>
            <strong>Platform Intellectual Property:</strong> Kyro AI retains all rights, titles, and interests in the web architecture, API gateway routing protocols, custom fine-tuned adapters, branding, and user interface components.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="font-display text-lg text-text font-semibold flex items-center gap-2 border-b border-border/50 pb-1.5">
            5. Disclaimers of Warranties & Limitation of Liability
          </h2>
          <div className="bg-warning/10 border border-warning/30 p-3 rounded text-warning text-[11px] font-mono leading-relaxed">
            THE SERVICES ARE PROVIDED ON AN "AS-IS" AND "AS-AVAILABLE" BASIS. TO THE FULLEST EXTENT PERMISSIBLE PURSUANT TO APPLICABLE LAW, KYRO AI DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
          </div>
          <p>
            Kyro AI makes no representations or warranties regarding the accuracy, completeness, or reliability of code generated by AI models. You are solely responsible for testing, verifying, and validating AI-generated code prior to deploying to production environments.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="font-display text-lg text-text font-semibold flex items-center gap-2 border-b border-border/50 pb-1.5">
            6. Governing Law & Dispute Resolution
          </h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of law principles. Any legal action or proceeding arising under these Terms will be brought exclusively in the federal or state courts located in Delaware.
          </p>
        </section>
      </div>
    </div>
  );
}
