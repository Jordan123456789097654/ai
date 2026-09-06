"use client";

import { ShieldCheck, Activity, Clock, CheckCircle } from "lucide-react";

export default function SlaPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 space-y-10 text-xs leading-relaxed">
      <div className="border-b border-border pb-6 space-y-2">
        <h1 className="font-display text-3xl text-text flex items-center gap-2">
          <Activity className="text-success" size={28} /> Service Level Agreement (SLA) & Uptime Commitment
        </h1>
        <p className="text-muted text-sm">
          Last Updated: September 6, 2026 • 99.9% Uptime SLA Commitment
        </p>
      </div>

      <div className="space-y-8 text-text/90">
        <section className="space-y-3">
          <h2 className="font-display text-lg text-text font-semibold border-b border-border/50 pb-1.5">
            1. 99.9% Monthly Uptime Guarantee
          </h2>
          <p>
            Kyro AI guarantees a Monthly Uptime Percentage of at least <strong>99.9%</strong> for all Pro and Enterprise API Gateway endpoints (<code className="text-accent font-mono">/v1/chat/completions</code>).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg text-text font-semibold border-b border-border/50 pb-1.5">
            2. Service Credits & Remedies
          </h2>
          <div className="border border-border rounded overflow-hidden font-mono text-[11px]">
            <table className="w-full text-left">
              <thead className="bg-surface-raised text-muted">
                <tr>
                  <th className="p-2 border-r border-border">Monthly Uptime Percentage</th>
                  <th className="p-2">SLA Service Credit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="p-2 border-r border-border text-accent">99.0% – 99.89%</td>
                  <td className="p-2 text-success font-bold">10% Credit Refund</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-border text-accent">95.0% – 98.99%</td>
                  <td className="p-2 text-success font-bold">25% Credit Refund</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-border text-accent">&lt; 95.0%</td>
                  <td className="p-2 text-success font-bold">50% Credit Refund</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
