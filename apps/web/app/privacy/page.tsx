"use client";

import Link from "next/link";
import { Shield, Lock, CheckCircle2, Eye, Database, Globe, Ticket } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 space-y-10 text-xs leading-relaxed font-sans text-white">
      <div className="border-b border-[#252D40] pb-6 space-y-2">
        <h1 className="font-display text-3xl font-bold text-white flex items-center gap-3">
          <Shield className="text-purple-400" size={32} /> Global Privacy Policy (GDPR & CCPA Compliant)
        </h1>
        <p className="text-gray-400 text-sm font-mono">
          Document Version 3.0 • Last Revised: September 12, 2026 • Zero LLM Data Training Policy
        </p>
      </div>

      <div className="space-y-8 text-gray-300">
        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold border-b border-[#252D40] pb-2 flex items-center gap-2 text-white">
            <Lock size={18} className="text-emerald-400" /> 1. Zero Model Training Guarantee
          </h2>
          <div className="border border-emerald-500/30 bg-emerald-950/20 p-5 rounded-xl space-y-2">
            <span className="font-bold text-sm text-emerald-400 flex items-center gap-1.5 font-mono">
              <CheckCircle2 size={16} /> Your Prompts Are Never Used To Train AI Models
            </span>
            <p className="text-gray-300">
              Kyro AI enforces a strict Zero Training Policy. Prompt inputs, uploaded code files, and model completion outputs generated via API calls or Web Chat are processed in ephemeral memory and are NEVER used to train, fine-tune, or improve public foundation models.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold border-b border-[#252D40] pb-2 flex items-center gap-2 text-white">
            <Database size={18} className="text-purple-400" /> 2. Information We Collect
          </h2>
          <p>We collect minimal telemetry necessary to operate the Kyro API Gateway:</p>
          <ul className="list-disc pl-5 space-y-2 text-gray-400">
            <li><strong>Account Credentials:</strong> Email address provided during Supabase sign-up.</li>
            <li><strong>Developer API Metadata:</strong> API Key prefixes, scopes, expiration dates, and token consumption counts.</li>
            <li><strong>Infrastructure Telemetry:</strong> HTTP response codes, latency (ms), and error logs for SLA verification.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold border-b border-[#252D40] pb-2 flex items-center gap-2 text-white">
            <Globe size={18} className="text-purple-400" /> 3. GDPR & CCPA Rights
          </h2>
          <p>
            Under GDPR (Regulation EU 2016/679) and CCPA (Cal. Civ. Code § 1798.100), you have the right to request access to, deletion of, or export of your personal data.
          </p>
          <p className="text-gray-400">
            To submit a privacy data request or request data erasure, open a direct Support Ticket. Data erasure requests are processed within 24–72 hours.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold border-b border-[#252D40] pb-2 text-white">
            4. Data Security & Encryption
          </h2>
          <p>
            All data in transit is encrypted using TLS 1.3 encryption. Data at rest (PostgreSQL database & Redis token cache) is secured using AES-256 encryption.
          </p>
        </section>
      </div>

      {/* Direct Support Ticket Button */}
      <div className="border border-[#252D40] bg-[#131722] rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 mt-10">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Ticket size={18} className="text-purple-400" /> Need To Submit A Privacy Or Data Erasure Request?
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Open a direct Privacy Support Ticket for immediate processing by our Compliance team.
          </p>
        </div>

        <Link
          href="/support?category=Privacy+%26+GDPR"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg transition-all active:scale-95 shrink-0"
        >
          🎫 Open Privacy Ticket
        </Link>
      </div>
    </div>
  );
}
