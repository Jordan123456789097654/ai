"use client";

import Link from "next/link";
import { Cookie, Shield, CheckCircle2, Lock, FileText, Database, Ticket } from "lucide-react";

export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 space-y-10 text-xs leading-relaxed font-sans text-white">
      <div className="border-b border-[#252D40] pb-6 space-y-2">
        <h1 className="font-display text-3xl font-bold text-white flex items-center gap-3">
          <Cookie className="text-purple-400" size={32} /> Cookie & Local Storage Disclosure Policy
        </h1>
        <p className="text-gray-400 text-sm font-mono">
          Document Version 3.1 • Last Revised: September 12, 2026 • Privacy First Standard
        </p>
      </div>

      <div className="space-y-8 text-gray-300">
        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold border-b border-[#252D40] pb-2 flex items-center gap-2 text-white">
            <FileText size={18} className="text-purple-400" /> 1. Introduction & Data Storage Commitment
          </h2>
          <p>
            Kyro AI is committed to transparent data practices. This policy details how we utilize browser cookies, HTTP headers, and local storage (<code className="text-purple-400 font-mono">localStorage</code> / <code className="text-purple-400 font-mono">sessionStorage</code>) across the Kyro Web UI (<code className="text-purple-400 font-mono">kyro-web-rodh.onrender.com</code>) and API Gateways.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-lg font-semibold border-b border-[#252D40] pb-2 flex items-center gap-2 text-white">
            <Database size={18} className="text-purple-400" /> 2. Complete Technical Storage Inventory
          </h2>
          <p>Below is an inventory of browser storage items set by Kyro AI:</p>

          <div className="border border-[#252D40] rounded-xl overflow-hidden font-mono text-[11px] bg-[#131722]">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#1A202C] text-gray-400 border-b border-[#252D40]">
                <tr>
                  <th className="p-3 border-r border-[#252D40]">Storage Key / Name</th>
                  <th className="p-3 border-r border-[#252D40]">Type & Provider</th>
                  <th className="p-3 border-r border-[#252D40]">Purpose & Function</th>
                  <th className="p-3">Expiration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252D40]">
                <tr>
                  <td className="p-3 border-r border-[#252D40] font-bold text-purple-400">sb-access-token</td>
                  <td className="p-3 border-r border-[#252D40] text-gray-400">Cookie (Supabase Auth)</td>
                  <td className="p-3 border-r border-[#252D40] text-gray-200">Session authentication JWT token to maintain secure logged-in state.</td>
                  <td className="p-3 text-gray-400">7 Days</td>
                </tr>
                <tr>
                  <td className="p-3 border-r border-[#252D40] font-bold text-purple-400">sb-refresh-token</td>
                  <td className="p-3 border-r border-[#252D40] text-gray-400">Cookie (Supabase Auth)</td>
                  <td className="p-3 border-r border-[#252D40] text-gray-200">Secure refresh token used to generate new access sessions without requiring password re-entry.</td>
                  <td className="p-3 text-gray-400">30 Days</td>
                </tr>
                <tr>
                  <td className="p-3 border-r border-[#252D40] font-bold text-purple-400">kyro_custom_api_key</td>
                  <td className="p-3 border-r border-[#252D40] text-gray-400">localStorage</td>
                  <td className="p-3 border-r border-[#252D40] text-gray-200">Stores client-side API key preference for Bring Your Own Key (BYOK) developer feature.</td>
                  <td className="p-3 text-gray-400">Persistent</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold border-b border-[#252D40] pb-2 flex items-center gap-2 text-white">
            <Lock size={18} className="text-emerald-400" /> 3. Zero Third-Party Tracker Guarantee
          </h2>
          <div className="border border-emerald-500/30 bg-emerald-950/20 p-5 rounded-xl space-y-2">
            <span className="font-bold text-sm text-emerald-400 flex items-center gap-1.5 font-mono">
              <CheckCircle2 size={16} /> No Cross-Site Trackers or Ad Cookies
            </span>
            <p className="text-gray-300">
              Kyro AI does NOT sell user data, utilize Facebook Pixel, Google AdSense, cross-site behavioral tracking scripts, or invasive analytics cookies. All telemetry collected is strictly operational and privacy-preserving.
            </p>
          </div>
        </section>
      </div>

      {/* Direct Support Ticket Button */}
      <div className="border border-[#252D40] bg-[#131722] rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 mt-10">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Ticket size={18} className="text-purple-400" /> Storage Questions Or Cookie Data Support?
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Open a direct Support Ticket for help with session data or storage settings.
          </p>
        </div>

        <Link
          href="/support?category=Storage+%26+Account"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg transition-all active:scale-95 shrink-0"
        >
          🎫 Open Cookie Support Ticket
        </Link>
      </div>
    </div>
  );
}
