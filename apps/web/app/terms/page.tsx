"use client";

import Link from "next/link";
import { Shield, FileText, CheckCircle2, Lock, Scale, Key, Ticket } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 space-y-10 text-xs leading-relaxed font-sans text-white">
      <div className="border-b border-[#252D40] pb-6 space-y-2">
        <h1 className="font-display text-3xl font-bold flex items-center gap-3 text-white">
          <FileText className="text-purple-400" size={32} /> Enterprise Terms of Service (v3.0)
        </h1>
        <p className="text-gray-400 text-sm font-mono">
          Last Revised: September 12, 2026 • Governing Developer Master Services Agreement
        </p>
      </div>

      <div className="space-y-8 text-gray-300">
        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold border-b border-[#252D40] pb-2 flex items-center gap-2 text-white">
            <Scale size={18} className="text-purple-400" /> 1. Acceptance of Master Terms
          </h2>
          <p>
            By creating an account, generating an API key, accessing the Kyro Web UI, executing code in the Live Sandbox (<code className="text-purple-400 font-mono">/sandbox</code>), or making HTTP requests to <code className="text-purple-400 font-mono">https://kyro-api-auou.onrender.com</code>, you ("Customer", "Developer", or "User") agree to be legally bound by these Terms of Service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold border-b border-[#252D40] pb-2 flex items-center gap-2 text-white">
            <Key size={18} className="text-purple-400" /> 2. Developer API Keys & Authentication
          </h2>
          <p>
            Kyro API keys (<code className="text-purple-400 font-mono">kyro_sk_live_...</code>) are confidential credentials. You are solely responsible for maintaining key confidentiality. Any API call authenticated with your key will be billed to your account tier.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold border-b border-[#252D40] pb-2 text-white">
            3. Token Soft Caps & Billing
          </h2>
          <p>
            API usage is calculated based on prompt and completion token consumption across supported models (`kyro-ultra-70b`, `kyro-coder-pro`, `kyro-flash-8b`, `llama-3.3-70b-versatile`). Developers can configure daily token soft caps under Developer Portal (<code className="text-purple-400 font-mono">/dev</code>) to prevent overages.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold border-b border-[#252D40] pb-2 text-white">
            4. Ownership of Code & Input / Output Data
          </h2>
          <p>
            You retain 100% ownership of all prompt inputs, source code files, and model completion outputs generated through your API keys. Kyro AI does NOT claim ownership of your intellectual property and does not use your code for model training.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold border-b border-[#252D40] pb-2 text-white">
            5. Limitation of Liability & Indemnification
          </h2>
          <p>
            To the maximum extent permitted by law, Kyro AI shall not be liable for indirect, incidental, or consequential damages resulting from platform downtime or AI model completion output errors.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold border-b border-[#252D40] pb-2 text-white">
            6. Governing Law & Legal Inquiries
          </h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the State of Delaware. For any questions regarding terms, billing, or master service agreements, please submit a Support Ticket directly to our legal desk.
          </p>
        </section>
      </div>

      {/* Direct Support Ticket Button */}
      <div className="border border-[#252D40] bg-[#131722] rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 mt-10">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Ticket size={18} className="text-purple-400" /> Have Questions Regarding Terms or Billing?
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Instead of emailing, open a direct Support Ticket for fastest resolution by our team.
          </p>
        </div>

        <Link
          href="/support?category=Billing+%26+Terms"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg transition-all active:scale-95 shrink-0"
        >
          🎫 Open Terms Support Ticket
        </Link>
      </div>
    </div>
  );
}
