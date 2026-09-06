"use client";

import { Shield, FileText, CheckCircle2, Lock, Scale, Key } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 space-y-10 text-xs leading-relaxed font-sans">
      <div className="border-b border-border pb-6 space-y-2">
        <h1 className="font-display text-3xl text-text flex items-center gap-3">
          <FileText className="text-accent" size={32} /> Enterprise Terms of Service (v3.0)
        </h1>
        <p className="text-muted text-sm font-mono">
          Last Revised: September 6, 2026 • Governing Developer Master Services Agreement
        </p>
      </div>

      <div className="space-y-8 text-text/90">
        <section className="space-y-3">
          <h2 className="font-display text-lg text-text font-semibold border-b border-border/50 pb-1.5 flex items-center gap-2">
            <Scale size={18} className="text-accent" /> 1. Acceptance of Master Terms
          </h2>
          <p>
            By creating an account, generating an API key, accessing the Kyro Web UI, or making HTTP calls to <code className="text-accent font-mono">https://kyro-api-auou.onrender.com</code>, you ("Customer", "Developer", or "User") agree to be legally bound by these Terms of Service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg text-text font-semibold border-b border-border/50 pb-1.5 flex items-center gap-2">
            <Key size={18} className="text-accent" /> 2. Developer API Keys & Authentication
          </h2>
          <p>
            Kyro API keys (<code className="text-accent font-mono">kyro_sk_live_...</code>) are confidential credentials. You are solely responsible for maintaining key confidentiality. Any API call authenticated with your key will be billed to your account.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg text-text font-semibold border-b border-border/50 pb-1.5">
            3. Token Soft Caps & Billing
          </h2>
          <p>
            API usage is calculated based on prompt and completion token consumption across models (`kyro-coder-pro`, `kyro-ultra-70b`, `kyro-flash-8b`). Developers can configure daily token soft caps under `/dev` to prevent overages.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg text-text font-semibold border-b border-border/50 pb-1.5">
            4. Ownership of Code & Input / Output Data
          </h2>
          <p>
            You retain 100% ownership of all prompt inputs, source code files, and model completion outputs generated through your API keys. Kyro AI does NOT claim ownership of your intellectual property.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg text-text font-semibold border-b border-border/50 pb-1.5">
            5. Limitation of Liability & Indemnification
          </h2>
          <p>
            To the maximum extent permitted by law, Kyro AI shall not be liable for indirect, incidental, or consequential damages resulting from platform downtime or AI model completion output errors.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg text-text font-semibold border-b border-border/50 pb-1.5">
            6. Governing Law & Dispute Resolution
          </h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of law principles.
          </p>
        </section>
      </div>
    </div>
  );
}
