"use client";

import React from "react";
import Link from "next/link";
import { Shield, Lock, CheckCircle2, Eye, Database, Globe, Ticket, FileText, Scale, RefreshCw } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12 space-y-12 text-xs leading-relaxed font-sans text-slate-200">
      {/* Header Banner */}
      <div className="border-b border-[#242b3d] pb-8 space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-2xl text-purple-400">
            <Shield size={32} />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-white">Kyro AI Global Privacy Policy & Data Sovereignty</h1>
            <p className="text-slate-400 text-sm font-mono mt-1">
              Document Version 4.0 • Effective Date: September 13, 2026 • GDPR (EU 2016/679) & CCPA Compliant
            </p>
          </div>
        </div>
      </div>

      {/* Zero Training Guarantee Highlight Banner */}
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 space-y-3 font-mono">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
          <CheckCircle2 size={20} /> Zero Foundation Model Training Guarantee
        </div>
        <p className="text-slate-300 text-xs leading-relaxed">
          Kyro AI enforces a strict **Zero Model Training Policy**. Prompts, uploaded code files, completion outputs, and Discord chat interactions processed by our API or Web Interface are evaluated strictly in ephemeral RAM and are **NEVER** used to train, fine-tune, or retrain public or foundation LLM models.
        </p>
      </div>

      {/* Table of Contents */}
      <div className="bg-[#121522] border border-[#242b3d] rounded-2xl p-6 space-y-3 font-mono">
        <h2 className="font-bold text-white text-sm flex items-center gap-2">
          <FileText size={16} className="text-purple-400" /> Table of Contents
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-400 text-xs">
          <a href="#p-section-1" className="hover:text-purple-400 transition-colors">1. Data Controller & Legal Scope</a>
          <a href="#p-section-2" className="hover:text-purple-400 transition-colors">2. Categories of Information We Collect</a>
          <a href="#p-section-3" className="hover:text-purple-400 transition-colors">3. How We Process & Secure Personal Data</a>
          <a href="#p-section-4" className="hover:text-purple-400 transition-colors">4. GDPR Rights (EU Data Subjects)</a>
          <a href="#p-section-5" className="hover:text-purple-400 transition-colors">5. CCPA Rights (California Residents)</a>
          <a href="#p-section-6" className="hover:text-purple-400 transition-colors">6. Data Retention & Erasure Workflows</a>
          <a href="#p-section-7" className="hover:text-purple-400 transition-colors">7. Next.js Telemetry & Analytics Opt-Out</a>
          <a href="#p-section-8" className="hover:text-purple-400 transition-colors">8. Contact Information & Data Requests</a>
        </div>
      </div>

      {/* Main Legal Policy Body */}
      <div className="space-y-10 text-slate-300">
        {/* Section 1 */}
        <section id="p-section-1" className="space-y-4">
          <h2 className="font-display text-xl font-bold text-white border-b border-[#242b3d] pb-2 flex items-center gap-2">
            <Scale size={20} className="text-purple-400" /> 1. Data Controller & Legal Scope
          </h2>
          <p>
            This Privacy Policy details how Kyro AI Platform ("We", "Us", or "Company") collects, processes, stores, and protects personal data obtained through your use of the Kyro Web Dashboard (`https://kyro-web-rodh.onrender.com`), API Gateway (`/v1/*`), and Discord Developer Suite (`Kyro AI#8149`).
          </p>
        </section>

        {/* Section 2 */}
        <section id="p-section-2" className="space-y-4">
          <h2 className="font-display text-xl font-bold text-white border-b border-[#242b3d] pb-2 flex items-center gap-2">
            <Database size={20} className="text-cyan-400" /> 2. Categories of Information We Collect
          </h2>
          <p>We restrict data collection exclusively to metadata required for system reliability, authentication, and rate limiting:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs pt-2">
            <div className="bg-[#121522] border border-[#242b3d] p-4 rounded-xl space-y-2">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Lock size={14} className="text-amber-400" /> Account & Auth Data
              </span>
              <p className="text-slate-400 text-[11px]">Email addresses, hashed passkeys, and Supabase auth session tokens required for account verification.</p>
            </div>
            <div className="bg-[#121522] border border-[#242b3d] p-4 rounded-xl space-y-2">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Globe size={14} className="text-cyan-400" /> Discord Linking Metadata
              </span>
              <p className="text-slate-400 text-[11px]">Verified Discord ID and tag (`User#0000`) obtained via 1-Click Discord OAuth2 (`scope=identify`) to grant 3x Rate Limit Boosts (60 req/min).</p>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section id="p-section-3" className="space-y-4">
          <h2 className="font-display text-xl font-bold text-white border-b border-[#242b3d] pb-2 flex items-center gap-2">
            <Lock size={20} className="text-emerald-400" /> 3. Data Encryption & Storage Security
          </h2>
          <p>
            All data in transit is encrypted using **TLS 1.3** encryption. Data at rest (PostgreSQL database & Redis token cache) is secured using **AES-256** encryption. Secret keys are automatically redacted by our Auto-Mod Engine.
          </p>
        </section>

        {/* Section 4 */}
        <section id="p-section-4" className="space-y-4">
          <h2 className="font-display text-xl font-bold text-white border-b border-[#242b3d] pb-2 flex items-center gap-2">
            <Globe size={20} className="text-purple-400" /> 4. GDPR Rights (EU Regulation 2016/679)
          </h2>
          <p>EU data subjects possess the following non-negotiable data rights under GDPR:</p>
          <ul className="list-disc pl-6 space-y-1.5 text-slate-400 font-mono text-[11px]">
            <li><strong>Right of Access (Article 15):</strong> Request a complete copy of stored account metadata.</li>
            <li><strong>Right to Erasure (Article 17):</strong> Request permanent deletion of your account and Discord linked profile ("Right to be Forgotten").</li>
            <li><strong>Right to Restriction (Article 18):</strong> Pause telemetry processing.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section id="p-section-5" className="space-y-4">
          <h2 className="font-display text-xl font-bold text-white border-b border-[#242b3d] pb-2 flex items-center gap-2">
            <Eye size={20} className="text-amber-400" /> 5. CCPA Rights (California Civil Code § 1798.100)
          </h2>
          <p>
            California residents have the right to request disclosure of collected personal information categories. **Kyro AI does NOT sell personal information to third parties.**
          </p>
        </section>

        {/* Section 6 */}
        <section id="p-section-6" className="space-y-4">
          <h2 className="font-display text-xl font-bold text-white border-b border-[#242b3d] pb-2 flex items-center gap-2">
            <RefreshCw size={20} className="text-cyan-400" /> 6. Data Retention & Erasure Workflows
          </h2>
          <p>
            Data erasure requests submitted via our Support Ticket Desk are automatically executed within **24 to 72 hours**. Once purged, user records cannot be recovered.
          </p>
        </section>

        {/* Section 7 */}
        <section id="p-section-7" className="space-y-4">
          <h2 className="font-display text-xl font-bold text-white border-b border-[#242b3d] pb-2 flex items-center gap-2">
            <FileText size={20} className="text-amber-400" /> 7. Next.js Telemetry Disclosure
          </h2>
          <p>
            Our web client is built on Next.js 14. For complete information regarding Next.js telemetry and opt-out procedures, visit <a href="https://nextjs.org/telemetry" target="_blank" rel="noopener noreferrer" className="text-purple-400 underline font-mono">https://nextjs.org/telemetry</a>.
          </p>
        </section>
      </div>

      {/* Support Ticket Callout Banner */}
      <div className="border border-[#242b3d] bg-[#121522] rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 font-mono">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Ticket size={18} className="text-purple-400" /> Submit A GDPR / Data Erasure Request
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Open a direct Privacy Support Ticket for immediate compliance handling.
          </p>
        </div>
        <Link
          href="/discord-bot"
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg transition-all"
        >
          🎫 Open Privacy Ticket
        </Link>
      </div>
    </div>
  );
}
