"use client";

import { Scale, Shield, AlertTriangle, Lock, FileText, CheckCircle } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 space-y-10 text-xs leading-relaxed">
      <div className="border-b border-border pb-6 space-y-2">
        <h1 className="font-display text-3xl text-text flex items-center gap-2">
          <Scale className="text-accent" size={28} /> Comprehensive Terms of Service & Terms of Use
        </h1>
        <p className="text-muted text-sm">
          Effective Date: September 6, 2026 • Document Version 3.0 (Enterprise Release)
        </p>
      </div>

      <div className="space-y-8 text-text/90">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="font-display text-lg text-text font-semibold flex items-center gap-2 border-b border-border/50 pb-1.5">
            1. Agreement to Terms & Legal Binding Contract
          </h2>
          <p>
            These Terms of Service ("Terms", "Agreement") constitute a legally binding contract entered into by and between you ("User", "Developer", "Client", "you", or "your") and <strong>Kyro AI Platform Inc.</strong> ("Kyro AI", "Company", "we", "us", or "our"), governing your access to and utilization of the Kyro AI platform web application, API Gateway endpoints (<code className="text-accent font-mono">/v1/chat/completions</code>, <code className="text-accent font-mono">/v1/models</code>), hosted Discord & Slack bot infrastructure, command-line interface tools (<code className="text-accent font-mono">kyro-cli</code>), and browser extensions (collectively, the "Services").
          </p>
          <p>
            BY CREATING AN ACCOUNT, GENERATING AN API KEY, OR CONNECTING TO OUR INFERENCE GATEWAY, YOU UNCONDITIONALLY AGREE TO BE BOUND BY ALL TERMS CONTAINED HEREIN. IF YOU ARE AGREEING TO THESE TERMS ON BEHALF OF A COMPANY OR LEGAL ENTITY, YOU REPRESENT THAT YOU HAVE FULL LEGAL AUTHORITY TO BIND SUCH ENTITY TO THIS AGREEMENT.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="font-display text-lg text-text font-semibold flex items-center gap-2 border-b border-border/50 pb-1.5">
            2. Developer Accounts & API Secret Confidentiality
          </h2>
          <p>
            To utilize the Kyro AI Gateway, developers must register for an account or authenticate via OAuth providers. Account security obligations include:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-muted">
            <li><strong>Credential Safeguarding:</strong> You are solely responsible for protecting secret API keys (<code className="text-accent font-mono">kyro_sk_live_...</code>) against unauthorized disclosure. Keys must never be hardcoded into public client-side JavaScript, public GitHub repositories, or mobile app binary bundles.</li>
            <li><strong>Financial & Resource Liability:</strong> You assume 100% financial and operational responsibility for all prompt token completions, bandwidth, and API requests executed using your credentials.</li>
            <li><strong>Compromised Credentials Notification:</strong> You agree to immediately revoke any compromised API keys via the <a href="/dev" className="text-accent hover:underline">Developer Portal</a> and notify Kyro AI Security Support within 24 hours of discovery.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="font-display text-lg text-text font-semibold flex items-center gap-2 border-b border-border/50 pb-1.5">
            3. Tier Quotas, Token Rate Limiting & Concurrency Controls
          </h2>
          <p>
            To ensure high-availability throughput across global Groq LPU inference hardware, API access is governed by automated token-bucket rate limiters:
          </p>
          <div className="border border-border rounded overflow-hidden font-mono text-[11px] my-3">
            <table className="w-full text-left">
              <thead className="bg-surface-raised text-muted">
                <tr>
                  <th className="p-2 border-r border-border">Service Tier</th>
                  <th className="p-2 border-r border-border">Requests/Min (RPM)</th>
                  <th className="p-2 border-r border-border">Tokens/Min (TPM)</th>
                  <th className="p-2">Max Concurrent Connections</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="p-2 border-r border-border text-accent font-bold">Free Tier</td>
                  <td className="p-2 border-r border-border">20 req/min</td>
                  <td className="p-2 border-r border-border">100,000 TPM</td>
                  <td className="p-2">2 parallel requests</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-border text-accent font-bold">Pro Tier / BYOK</td>
                  <td className="p-2 border-r border-border">120 req/min</td>
                  <td className="p-2 border-r border-border">500,000 TPM</td>
                  <td className="p-2">10 parallel requests</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-border text-accent font-bold">Enterprise Tier</td>
                  <td className="p-2 border-r border-border">1,000+ req/min (Custom)</td>
                  <td className="p-2 border-r border-border">Custom Allocated</td>
                  <td className="p-2">50+ parallel requests</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Violations of rate limits will return HTTP status code <code className="text-accent font-mono">429 Too Many Requests</code>. Systematic efforts to bypass rate limit controls using IP proxy rotation will result in immediate API key revocation and permanent subnet blocks.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="font-display text-lg text-text font-semibold flex items-center gap-2 border-b border-border/50 pb-1.5">
            4. Ownership of Intellectual Property & Model Outputs
          </h2>
          <p>
            <strong>Your Content Rights:</strong> As between you and Kyro AI, you retain exclusive ownership of all input prompts, code context files, and AI completion outputs generated through your session. Kyro AI claims no copyright or proprietary rights over software applications or text developed using our Services.
          </p>
          <p>
            <strong>Platform Rights:</strong> Kyro AI reserves all intellectual property rights in the underlying gateway infrastructure, custom fine-tuning model weights, web application source code, API schemas, and trademarks.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="font-display text-lg text-text font-semibold flex items-center gap-2 border-b border-border/50 pb-1.5">
            5. Disclaimers of Warranties & Limitation of Liability
          </h2>
          <div className="bg-warning/10 border border-warning/30 p-4 rounded text-warning text-[11px] font-mono leading-relaxed space-y-2">
            <p className="font-bold">EXPRESS DISCLAIMER OF WARRANTIES:</p>
            <p>
              THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED. KYRO AI DISCLAIMS ALL WARRANTIES, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
          </div>
          <p>
            AI models generate probabilistic completions. You are solely responsible for reviewing, testing, and verifying all AI-generated code snippets for logic errors, vulnerabilities, and performance before deploying to production environments. In no event shall Kyro AI be liable for indirect, punitive, or consequential damages.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="font-display text-lg text-text font-semibold flex items-center gap-2 border-b border-border/50 pb-1.5">
            6. Governing Law, Venue & Severability
          </h2>
          <p>
            These Terms shall be governed by and interpreted under the laws of the State of Delaware, United States, without giving effect to any principles of conflicts of law. Any legal claims or disputes shall be submitted to binding arbitration in Wilmington, Delaware.
          </p>
        </section>
      </div>
    </div>
  );
}
