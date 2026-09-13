"use client";

import React from "react";
import Link from "next/link";
import { Cookie, Shield, Eye, Lock, FileText, Ticket, Globe, CheckCircle2 } from "lucide-react";

export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12 space-y-12 text-xs leading-relaxed font-sans text-slate-200">
      {/* Header Banner */}
      <div className="border-b border-[#242b3d] pb-8 space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400">
            <Cookie size={32} />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-white">Kyro AI Cookie & Tracking Technology Policy</h1>
            <p className="text-slate-400 text-sm font-mono mt-1">
              Document Version 3.0 • Effective Date: September 13, 2026 • Minimal Telemetry Disclosure
            </p>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="space-y-8 text-slate-300">
        <section className="space-y-4">
          <h2 className="font-display text-xl font-bold text-white border-b border-[#242b3d] pb-2 flex items-center gap-2">
            <FileText size={20} className="text-amber-400" /> 1. What Are Cookies?
          </h2>
          <p>
            Cookies are small text files placed on your device by web servers to maintain authenticated user sessions, store technical state, and secure platform API gateways.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-xl font-bold text-white border-b border-[#242b3d] pb-2 flex items-center gap-2">
            <CheckCircle2 size={20} className="text-emerald-400" /> 2. Categories of Cookies We Use
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            <div className="bg-[#121522] border border-emerald-500/30 p-5 rounded-xl space-y-2">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <Lock size={14} /> Essential Authentication Cookies
              </span>
              <p className="text-slate-400 text-[11px]">Strictly necessary for Supabase auth sessions, OAuth2 Discord state security tokens, and API key authorization headers.</p>
            </div>

            <div className="bg-[#121522] border border-cyan-500/30 p-5 rounded-xl space-y-2">
              <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                <Globe size={14} /> Preference & UI State Cookies
              </span>
              <p className="text-slate-400 text-[11px]">Remembers active theme selections (Gemini Dark), selected AI model preferences, and active tab states.</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-xl font-bold text-white border-b border-[#242b3d] pb-2 flex items-center gap-2">
            <Eye size={20} className="text-purple-400" /> 3. Third-Party Tracking Disclosure
          </h2>
          <p>
            Kyro AI does **NOT** use third-party advertising cookies, cross-site tracking beacons, or commercial retargeting pixels.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-xl font-bold text-white border-b border-[#242b3d] pb-2 flex items-center gap-2">
            <Globe size={20} className="text-amber-400" /> 4. Next.js Telemetry Opt-Out
          </h2>
          <p>
            For information on Next.js framework telemetry and how to opt-out, visit <a href="https://nextjs.org/telemetry" target="_blank" rel="noopener noreferrer" className="text-amber-400 underline font-mono">https://nextjs.org/telemetry</a>.
          </p>
        </section>
      </div>

      {/* Support Ticket Callout Banner */}
      <div className="border border-[#242b3d] bg-[#121522] rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 font-mono">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Ticket size={18} className="text-amber-400" /> Questions About Cookie Compliance?
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Open a ticket with our Privacy & Legal compliance desk.
          </p>
        </div>
        <Link
          href="/discord-bot"
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all"
        >
          🎫 Open Cookie Inquiry Ticket
        </Link>
      </div>
    </div>
  );
}
