"use client";

import { Cookie, Shield, CheckCircle2, Lock, FileText, Database } from "lucide-react";

export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 space-y-10 text-xs leading-relaxed font-sans">
      <div className="border-b border-border pb-6 space-y-2">
        <h1 className="font-display text-3xl text-text flex items-center gap-3">
          <Cookie className="text-accent" size={32} /> Cookie & Local Storage Disclosure Policy
        </h1>
        <p className="text-muted text-sm font-mono">
          Document Version 3.1 • Last Revised: September 6, 2026 • Privacy First Standard
        </p>
      </div>

      <div className="space-y-8 text-text/90">
        <section className="space-y-3">
          <h2 className="font-display text-lg text-text font-semibold border-b border-border/50 pb-1.5 flex items-center gap-2">
            <FileText size={18} className="text-accent" /> 1. Introduction & Data Storage Commitment
          </h2>
          <p>
            Kyro AI is committed to transparent data practices. This policy details how we utilize browser cookies, HTTP headers, and local storage (<code className="text-accent font-mono">localStorage</code> / <code className="text-accent font-mono">sessionStorage</code>) across the Kyro Web UI (<code className="text-accent font-mono">kyro-web-rodh.onrender.com</code>) and API Gateways.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-lg text-text font-semibold border-b border-border/50 pb-1.5 flex items-center gap-2">
            <Database size={18} className="text-accent" /> 2. Complete Technical Storage Inventory
          </h2>
          <p>Below is an exhaustive inventory of all browser storage items set by Kyro AI:</p>

          <div className="border border-border rounded-lg overflow-hidden font-mono text-[11px]">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-raised text-muted border-b border-border">
                <tr>
                  <th className="p-3 border-r border-border">Storage Key / Name</th>
                  <th className="p-3 border-r border-border">Type & Provider</th>
                  <th className="p-3 border-r border-border">Purpose & Function</th>
                  <th className="p-3">Expiration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="p-3 border-r border-border font-bold text-accent">sb-access-token</td>
                  <td className="p-3 border-r border-border text-muted">Cookie (Supabase Auth)</td>
                  <td className="p-3 border-r border-border text-text">Session authentication JWT token to maintain secure logged-in state.</td>
                  <td className="p-3 text-muted">7 Days</td>
                </tr>
                <tr>
                  <td className="p-3 border-r border-border font-bold text-accent">sb-refresh-token</td>
                  <td className="p-3 border-r border-border text-muted">Cookie (Supabase Auth)</td>
                  <td className="p-3 border-r border-border text-text">Secure refresh token used to generate new access sessions without requiring password re-entry.</td>
                  <td className="p-3 text-muted">30 Days</td>
                </tr>
                <tr>
                  <td className="p-3 border-r border-border font-bold text-accent">kyro_custom_api_key</td>
                  <td className="p-3 border-r border-border text-muted">localStorage</td>
                  <td className="p-3 border-r border-border text-text">Stores client-side API key preference for Bring Your Own Key (BYOK) developer feature.</td>
                  <td className="p-3 text-muted">Persistent</td>
                </tr>
                <tr>
                  <td className="p-3 border-r border-border font-bold text-accent">kyro_theme_mode</td>
                  <td className="p-3 border-r border-border text-muted">localStorage</td>
                  <td className="p-3 border-r border-border text-text">Saves dark/light mode visual theme user interface preferences.</td>
                  <td className="p-3 text-muted">Persistent</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg text-text font-semibold border-b border-border/50 pb-1.5 flex items-center gap-2">
            <Lock size={18} className="text-success" /> 3. Zero Third-Party Tracker Guarantee
          </h2>
          <div className="border border-success/30 bg-success/5 p-4 rounded-lg space-y-2">
            <span className="font-bold text-sm text-success flex items-center gap-1.5 font-mono">
              <CheckCircle2 size={16} /> No Cross-Site Trackers or Ad Cookies
            </span>
            <p className="text-muted">
              Kyro AI does NOT sell user data, utilize Facebook Pixel, Google AdSense, cross-site behavioral tracking scripts, or invasive analytics cookies. All telemetry collected is strictly operational (error rates, token counts) and privacy-preserving.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg text-text font-semibold border-b border-border/50 pb-1.5">
            4. Managing & Clearing Storage
          </h2>
          <p>
            You can clear or block cookies at any time via your browser settings (*Settings ➔ Privacy & Security ➔ Cookies & Site Data*). Note that clearing essential authentication cookies will sign you out of your Kyro developer account.
          </p>
        </section>
      </div>
    </div>
  );
}
