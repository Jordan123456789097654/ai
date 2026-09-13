"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, CheckCircle2, XCircle, Lock, Server, AlertTriangle, FileText, Ban, Ticket, Terminal, Scale, Eye, Globe } from "lucide-react";

export default function AcceptableUsePage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12 space-y-12 text-xs leading-relaxed font-sans text-slate-200">
      {/* Header Banner */}
      <div className="border-b border-[#242b3d] pb-8 space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400">
            <ShieldAlert size={32} />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-white">Kyro AI Acceptable Use Policy (AUP)</h1>
            <p className="text-slate-400 text-sm font-mono mt-1">
              Document Version 4.0 • Effective Date: September 13, 2026 • Enterprise Compliance & Guardrails Standard
            </p>
          </div>
        </div>
      </div>

      {/* Table of Contents */}
      <div className="bg-[#121522] border border-[#242b3d] rounded-2xl p-6 space-y-3 font-mono">
        <h2 className="font-bold text-white text-sm flex items-center gap-2">
          <FileText size={16} className="text-amber-400" /> Table of Contents
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-400 text-xs">
          <a href="#section-1" className="hover:text-amber-400 transition-colors">1. Scope & Legal Binding Agreement</a>
          <a href="#section-2" className="hover:text-amber-400 transition-colors">2. Permitted & Recommended Uses</a>
          <a href="#section-3" className="hover:text-amber-400 transition-colors">3. Prohibited Conduct & Content Restrictions</a>
          <a href="#section-4" className="hover:text-amber-400 transition-colors">4. Secret Key Protection & Auto-Mod Engine</a>
          <a href="#section-5" className="hover:text-amber-400 transition-colors">5. AI Rate Limits & Token Throttling Rules</a>
          <a href="#section-6" className="hover:text-amber-400 transition-colors">6. Automated Escalation & License Revocation</a>
          <a href="#section-7" className="hover:text-amber-400 transition-colors">7. Reporting Violations & Support Escalations</a>
          <a href="#section-8" className="hover:text-amber-400 transition-colors">8. Telemetry & Next.js Policy Disclosure</a>
        </div>
      </div>

      {/* Main Document Content */}
      <div className="space-y-10 text-slate-300">
        {/* Section 1 */}
        <section id="section-1" className="space-y-4">
          <h2 className="font-display text-xl font-bold text-white border-b border-[#242b3d] pb-2 flex items-center gap-2">
            <Scale size={20} className="text-amber-400" /> 1. Scope & Legal Binding Agreement
          </h2>
          <p>
            This Acceptable Use Policy ("AUP") constitutes a legally binding agreement between you ("User", "Licensee", or "Organization") and Kyro AI Platform ("Company", "We", "Us", or "Our"). This AUP governs all access to and interaction with the Kyro AI suite of products, including:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-400 font-mono text-[11px]">
            <li>The Kyro Web Dashboard (`https://kyro-web-rodh.onrender.com`), Chat Studio, and Admin Owner Suite.</li>
            <li>The REST API Gateways (`/v1/chat/completions`, `/v1/embeddings`, `/v1/discord/*`).</li>
            <li>The Kyro AI Discord Bot (`Kyro AI#8149`, Application ID `1548576579872100374`) and Gateway WebSocket connection (`wss://gateway.discord.gg`).</li>
            <li>All SDKs, CLI tools, automated agent workflows, code sandboxes, and synthetic model routers.</li>
          </ul>
          <p>
            By invoking any API endpoint, initiating a Discord bot command, or interacting with the Kyro Web Interface, you unreservedly agree to comply with this AUP. Failure to adhere to these terms constitutes a breach of service and will result in immediate suspension or permanent key revocation.
          </p>
        </section>

        {/* Section 2 */}
        <section id="section-2" className="space-y-4">
          <h2 className="font-display text-xl font-bold text-white border-b border-[#242b3d] pb-2 flex items-center gap-2">
            <CheckCircle2 size={20} className="text-emerald-400" /> 2. Permitted & Recommended Uses
          </h2>
          <p>
            Kyro AI is engineered for software development, technical research, automation, and collaborative discord engineering. The following use cases are explicitly permitted and encouraged:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-[#121522] border border-emerald-500/30 rounded-xl p-5 space-y-3">
              <h3 className="font-bold text-emerald-400 font-mono text-sm flex items-center gap-1.5">
                <CheckCircle2 size={16} /> Technical & Code Engineering
              </h3>
              <ul className="list-disc pl-4 space-y-1.5 text-slate-400 text-[11px]">
                <li>Synthesis of clean TypeScript, React, Python, Rust, Go, C++, and VEXcode IQ robotics code.</li>
                <li>Automated syntax refactoring, unit test generation, and architectural design reviews.</li>
                <li>Debugging complex stack trace log files and memory leak investigations.</li>
              </ul>
            </div>

            <div className="bg-[#121522] border border-emerald-500/30 rounded-xl p-5 space-y-3">
              <h3 className="font-bold text-emerald-400 font-mono text-sm flex items-center gap-1.5">
                <CheckCircle2 size={16} /> Automation & Community Ops
              </h3>
              <ul className="list-disc pl-4 space-y-1.5 text-slate-400 text-[11px]">
                <li>Deploying 1-Click Discord Server Structures, categories, channels, and support desks.</li>
                <li>Running non-spam community XP leveling, leaderboards, and ticket desk workflows.</li>
                <li>Building custom AI agent tools via `/v1/discord/ai-create-command`.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section id="section-3" className="space-y-4">
          <h2 className="font-display text-xl font-bold text-white border-b border-[#242b3d] pb-2 flex items-center gap-2">
            <XCircle size={20} className="text-rose-400" /> 3. Prohibited Conduct & Content Restrictions
          </h2>
          <p>
            You are strictly prohibited from utilizing Kyro AI for any illegal, malicious, or unethical activities. Prohibited conduct includes, without limitation:
          </p>

          <div className="bg-[#121522] border border-rose-500/30 rounded-xl p-5 space-y-3 font-mono text-xs">
            <div className="text-rose-400 font-bold flex items-center gap-2">
              <Ban size={16} /> Expressly Forbidden Operations:
            </div>
            <ul className="list-disc pl-5 space-y-2 text-slate-300">
              <li><strong>Cyberattack Tooling:</strong> Generating malware, ransomware, keyloggers, botnet C2 scripts, zero-day exploit payloads, or automated phishing engines.</li>
              <li><strong>Unpermitted Data Harvesting:</strong> Scraping, harvesting, or indexing Personally Identifiable Information (PII), credit card numbers, or medical records.</li>
              <li><strong>Secret Key Exposure:</strong> Posting exposed API tokens (`sk-...`, `ghp_...`, `discord_token`, AWS/Supabase keys) in public channels or prompts.</li>
              <li><strong>Infrastructure Abuse:</strong> Performing Denial-of-Service (DoS) attacks, link flooding, or bypass attempts on token-bucket rate limit controls.</li>
              <li><strong>Deceitful Social Engineering:</strong> Generating impersonation scripts, deepfake text streams, or fraudulent financial scams.</li>
            </ul>
          </div>
        </section>

        {/* Section 4 */}
        <section id="section-4" className="space-y-4">
          <h2 className="font-display text-xl font-bold text-white border-b border-[#242b3d] pb-2 flex items-center gap-2">
            <Lock size={20} className="text-amber-400" /> 4. Secret Key Protection & Auto-Mod Engine
          </h2>
          <p>
            Kyro AI operates a real-time **Secret Key Leak Protection & Auto-Moderator Engine**. Any prompt, message, or Discord post containing regex patterns matching API secret keys (`sk-...`, `ghp_...`, `N...`, `Bot MT...`) is instantly intercepted and deleted before reaching AI completion pipelines.
          </p>
          <div className="bg-[#08090d] border border-[#242b3d] p-4 rounded-xl font-mono text-[11px] space-y-1 text-slate-400">
            <div>• All auto-mod flags are logged to <span className="text-amber-400">#automod-logs</span>.</div>
            <div>• Repeat secret leak violations trigger automatic account rate-limit degradation.</div>
          </div>
        </section>

        {/* Section 5 */}
        <section id="section-5" className="space-y-4">
          <h2 className="font-display text-xl font-bold text-white border-b border-[#242b3d] pb-2 flex items-center gap-2">
            <Server size={20} className="text-cyan-400" /> 5. AI Rate Limits & Token Throttling Rules
          </h2>
          <p>
            To guarantee equitable resource distribution and 99.98% system availability across all users, Kyro AI enforces token-bucket rate limits:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            <div className="bg-[#121522] border border-[#242b3d] p-4 rounded-xl space-y-2">
              <div className="text-slate-300 font-bold">Default Member Tier</div>
              <div className="text-amber-400 font-bold text-base">20 requests / min</div>
              <p className="text-slate-400 text-[11px]">Standard rate limit for non-linked Discord accounts and anonymous visitors.</p>
            </div>
            <div className="bg-[#121522] border border-emerald-500/30 p-4 rounded-xl space-y-2">
              <div className="text-emerald-400 font-bold">Discord Linked Tier (3x Boost)</div>
              <div className="text-emerald-400 font-bold text-base">60 requests / min</div>
              <p className="text-slate-400 text-[11px]">Granted automatically upon 1-Click Discord OAuth2 account linking (`/auth/discord/callback`).</p>
            </div>
          </div>
        </section>

        {/* Section 6 */}
        <section id="section-6" className="space-y-4">
          <h2 className="font-display text-xl font-bold text-white border-b border-[#242b3d] pb-2 flex items-center gap-2">
            <Ban size={20} className="text-rose-400" /> 6. Automated Escalation & License Revocation
          </h2>
          <p>
            Company reserves the absolute right to suspend, terminate, or restrict access to any API key, Discord user ID, or IP address that violates this AUP without prior notification.
          </p>
        </section>

        {/* Section 7 */}
        <section id="section-7" className="space-y-4">
          <h2 className="font-display text-xl font-bold text-white border-b border-[#242b3d] pb-2 flex items-center gap-2">
            <Ticket size={20} className="text-purple-400" /> 7. Reporting Violations & Support Escalations
          </h2>
          <p>
            If you identify a security vulnerability, prompt injection exploit, or policy violation, please notify our Security & Operations desk immediately.
          </p>
        </section>

        {/* Section 8 */}
        <section id="section-8" className="space-y-4">
          <h2 className="font-display text-xl font-bold text-white border-b border-[#242b3d] pb-2 flex items-center gap-2">
            <Globe size={20} className="text-cyan-400" /> 8. Telemetry & Next.js Disclosure
          </h2>
          <p>
            Kyro AI is built on Next.js 14. For details regarding Next.js telemetry collection, feature prioritization, and opt-out instructions, please review the official Next.js Telemetry Documentation at <a href="https://nextjs.org/telemetry" target="_blank" rel="noopener noreferrer" className="text-amber-400 underline">https://nextjs.org/telemetry</a>.
          </p>
        </section>
      </div>

      {/* Support Callout Banner */}
      <div className="border border-[#242b3d] bg-[#121522] rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 font-mono">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Ticket size={18} className="text-amber-400" /> Need Assistance Or Security Incident Reporting?
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Open a direct ticket in our Support Desk or visit our Discord Bot Owner Suite.
          </p>
        </div>
        <Link
          href="/discord-bot"
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all"
        >
          🎫 Open Support Suite
        </Link>
      </div>
    </div>
  );
}
