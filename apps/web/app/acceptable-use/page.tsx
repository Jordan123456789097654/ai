"use client";

import Link from "next/link";
import { ShieldAlert, CheckCircle2, XCircle, Lock, Server, AlertTriangle, FileText, Ban, Ticket } from "lucide-react";

export default function AcceptableUsePage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 space-y-10 text-xs leading-relaxed font-sans text-white">
      <div className="border-b border-[#252D40] pb-6 space-y-2">
        <h1 className="font-display text-3xl font-bold text-white flex items-center gap-3">
          <ShieldAlert className="text-amber-400" size={32} /> Acceptable Use Policy & Guardrails
        </h1>
        <p className="text-gray-400 text-sm font-mono">
          Document Version 3.2 • Effective Date: September 12, 2026 • Enterprise Security Standard
        </p>
      </div>

      <div className="space-y-8 text-gray-300">
        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold border-b border-[#252D40] pb-2 flex items-center gap-2 text-white">
            <FileText size={18} className="text-purple-400" /> 1. Overview & Core Philosophy
          </h2>
          <p>
            This Acceptable Use Policy ("AUP") governs all access to and use of the Kyro AI Platform, including the Kyro Web Interface, REST API Gateways (<code className="text-purple-400 font-mono">/v1/chat/completions</code>), Live Code Sandbox (<code className="text-purple-400 font-mono">/sandbox</code>), synthetic model aliases, and CLI developer tooling. By using Kyro AI, you agree to adhere strictly to the boundaries and restrictions outlined in this policy.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-lg font-semibold border-b border-[#252D40] pb-2 flex items-center gap-2 text-white">
            <CheckCircle2 size={18} className="text-emerald-400" /> 2. Permitted & Recommended Use Cases
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-emerald-500/30 bg-emerald-950/20 p-5 rounded-xl space-y-2">
              <span className="font-bold text-sm text-emerald-400 flex items-center gap-1.5 font-mono">
                <CheckCircle2 size={16} /> Permitted Use Cases
              </span>
              <ul className="list-disc pl-4 space-y-1.5 text-gray-400">
                <li>Automated software development, code generation, refactoring, and debugging.</li>
                <li>API integration building, unit test synthesis, and technical documentation drafting.</li>
                <li>Enterprise AI agent workflows, data transformation pipelines, and synthetic data generation.</li>
                <li>Educational research, technical problem solving, and architecture design reviews.</li>
              </ul>
            </div>

            <div className="border border-rose-500/30 bg-rose-950/20 p-5 rounded-xl space-y-2">
              <span className="font-bold text-sm text-rose-400 flex items-center gap-1.5 font-mono">
                <XCircle size={16} /> Prohibited Activities
              </span>
              <ul className="list-disc pl-4 space-y-1.5 text-gray-400">
                <li>Developing malware, ransomware, exploits, or automated attack vectors.</li>
                <li>Scraping or harvesting Personally Identifiable Information (PII) without authorization.</li>
                <li>Generating credential phishing campaigns, spam, or deceitful social engineering scripts.</li>
                <li>Attempting to bypass platform authorization or token quota caps.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold border-b border-[#252D40] pb-2 flex items-center gap-2 text-white">
            <Lock size={18} className="text-purple-400" /> 3. Secret Masking & Admin Bypass
          </h2>
          <p>
            All standard API completion requests pass through Kyro's real-time Secret Masking & PII Redaction Engine. Admin API keys and Admin role sessions automatically bypass secret redaction and token-bucket rate limits for maximum execution flexibility.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold border-b border-[#252D40] pb-2 flex items-center gap-2 text-white">
            <Ban size={18} className="text-rose-400" /> 4. Enforcement & Reporting Abuse
          </h2>
          <p>
            Violations of this Acceptable Use Policy may result in API key revocation or account suspension. If you discover potential security vulnerabilities or policy violations, please open a direct Support Ticket to our Security team.
          </p>
        </section>
      </div>

      {/* Direct Support Ticket Button */}
      <div className="border border-[#252D40] bg-[#131722] rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 mt-10">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Ticket size={18} className="text-purple-400" /> Need To Report A Policy Issue Or Security Incident?
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Submit a direct Security Ticket to our engineering desk for immediate review.
          </p>
        </div>

        <Link
          href="/support?category=Security+%26+Abuse"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg transition-all active:scale-95 shrink-0"
        >
          🎫 Open Security Ticket
        </Link>
      </div>
    </div>
  );
}
