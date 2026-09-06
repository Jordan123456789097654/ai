"use client";

import { Cookie, Shield, CheckCircle2 } from "lucide-react";

export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 space-y-10 text-xs leading-relaxed">
      <div className="border-b border-border pb-6 space-y-2">
        <h1 className="font-display text-3xl text-text flex items-center gap-2">
          <Cookie className="text-accent" size={28} /> Cookie & Local Storage Policy
        </h1>
        <p className="text-muted text-sm">
          Last Updated: September 6, 2026 • Privacy-Preserving Analytics
        </p>
      </div>

      <div className="space-y-8 text-text/90">
        <section className="space-y-3">
          <h2 className="font-display text-lg text-text font-semibold border-b border-border/50 pb-1.5">
            1. How Kyro AI Uses Cookies & Local Storage
          </h2>
          <p>
            Kyro AI uses essential cookies and browser <code className="text-accent font-mono">localStorage</code> solely to maintain secure user sessions, save developer API key preferences, and preserve temporary UI state.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-muted">
            <li><strong>Essential Auth Cookies (<code className="text-accent font-mono">sb-access-token</code>):</strong> Issued by Supabase Auth to keep you securely signed into your developer account.</li>
            <li><strong>Developer Key Preferences (<code className="text-accent font-mono">kyro_custom_api_key</code>):</strong> Saved locally in your browser when you use the <strong>Bring Your Own Key (PRO+)</strong> feature.</li>
            <li><strong>Zero Third-Party Advertising Trackers:</strong> Kyro AI does NOT use tracking cookies or cross-site behavioral advertising SDKs.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
