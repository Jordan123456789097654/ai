"use client";

import { Activity, ShieldCheck, Clock, CheckCircle2, AlertCircle, FileText, Percent } from "lucide-react";

export default function SlaPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 space-y-10 text-xs leading-relaxed font-sans">
      <div className="border-b border-border pb-6 space-y-2">
        <h1 className="font-display text-3xl text-text flex items-center gap-3">
          <Activity className="text-success" size={32} /> Enterprise Service Level Agreement (SLA) & Uptime Guarantee
        </h1>
        <p className="text-muted text-sm font-mono">
          Document Version 3.4 • Effective Date: September 6, 2026 • 99.9% Production SLA
        </p>
      </div>

      <div className="space-y-8 text-text/90">
        <section className="space-y-3">
          <h2 className="font-display text-lg text-text font-semibold border-b border-border/50 pb-1.5 flex items-center gap-2">
            <FileText size={18} className="text-accent" /> 1. Commitment Overview
          </h2>
          <p>
            This Service Level Agreement ("SLA") defines the service availability and uptime commitments provided by Kyro AI for all paid Pro and Enterprise API Gateway instances (<code className="text-accent font-mono">https://kyro-api-auou.onrender.com/v1/chat/completions</code>).
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-lg text-text font-semibold border-b border-border/50 pb-1.5 flex items-center gap-2">
            <Percent size={18} className="text-success" /> 2. Monthly Uptime Percentage & SLA Guarantee
          </h2>
          <p>
            Kyro AI guarantees a Monthly Uptime Percentage of at least <strong>99.9%</strong> during any calendar month. Monthly Uptime Percentage is calculated using the following empirical formula:
          </p>
          <div className="bg-surface-raised border border-border rounded-lg p-4 font-mono text-[11px] text-accent font-semibold">
            Monthly Uptime % = ((Total Minutes in Month - Downtime Minutes) / Total Minutes in Month) * 100
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-lg text-text font-semibold border-b border-border/50 pb-1.5 flex items-center gap-2">
            <ShieldCheck size={18} className="text-accent" /> 3. Service Credit Refund Schedule
          </h2>
          <p>
            If Kyro AI fails to meet the 99.9% Uptime Guarantee in any calendar month, eligible customers are entitled to financial SLA Service Credits according to the following schedule:
          </p>

          <div className="border border-border rounded-lg overflow-hidden font-mono text-[11px]">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-raised text-muted border-b border-border">
                <tr>
                  <th className="p-3 border-r border-border">Monthly Uptime Percentage</th>
                  <th className="p-3 border-r border-border">SLA Service Credit Percentage</th>
                  <th className="p-3">Remedy Applied To</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="p-3 border-r border-border text-accent font-bold">99.0% – 99.89%</td>
                  <td className="p-3 border-r border-border text-success font-bold">10% Credit Refund</td>
                  <td className="p-3 text-muted">Monthly API Subscription Fee</td>
                </tr>
                <tr>
                  <td className="p-3 border-r border-border text-accent font-bold">95.0% – 98.99%</td>
                  <td className="p-3 border-r border-border text-success font-bold">25% Credit Refund</td>
                  <td className="p-3 text-muted">Monthly API Subscription Fee</td>
                </tr>
                <tr>
                  <td className="p-3 border-r border-border text-accent font-bold">&lt; 95.0%</td>
                  <td className="p-3 border-r border-border text-success font-bold">50% Credit Refund</td>
                  <td className="p-3 text-muted">Monthly API Subscription Fee</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg text-text font-semibold border-b border-border/50 pb-1.5 flex items-center gap-2">
            <Clock size={18} className="text-warning" /> 4. Scheduled Maintenance & Exclusions
          </h2>
          <p>The calculation of Downtime excludes periods of outage caused by:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-muted">
            <li><strong>Scheduled Maintenance:</strong> Announced at least 24 hours in advance on our Status Page (<code className="text-accent font-mono">/status</code>).</li>
            <li><strong>Force Majeure Events:</strong> Natural disasters, regional internet backbone failures, or upstream cloud provider outage (AWS / GCP / Render).</li>
            <li><strong>Client-Side Factors:</strong> Misconfigured developer API keys, customer network failure, or exceeding soft cap quotas.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg text-text font-semibold border-b border-border/50 pb-1.5">
            5. Submitting SLA Claims
          </h2>
          <p>
            To receive a Service Credit, submit a written claim to <code className="text-accent font-mono">sla@kyro.ai</code> within 30 days of the outage event. Claims must include date, timestamps, request logs, and affected API Key prefix.
          </p>
        </section>
      </div>
    </div>
  );
}
