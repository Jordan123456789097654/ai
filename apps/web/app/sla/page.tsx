"use client";

import Link from "next/link";
import { Activity, ShieldCheck, Clock, CheckCircle2, AlertCircle, FileText, Percent, Ticket } from "lucide-react";

export default function SlaPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 space-y-10 text-xs leading-relaxed font-sans text-white">
      <div className="border-b border-[#252D40] pb-6 space-y-2">
        <h1 className="font-display text-3xl font-bold text-white flex items-center gap-3">
          <Activity className="text-emerald-400" size={32} /> Enterprise Service Level Agreement (SLA) & Uptime Guarantee
        </h1>
        <p className="text-gray-400 text-sm font-mono">
          Document Version 3.4 • Effective Date: September 12, 2026 • 99.9% Production SLA
        </p>
      </div>

      <div className="space-y-8 text-gray-300">
        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold border-b border-[#252D40] pb-2 flex items-center gap-2 text-white">
            <FileText size={18} className="text-purple-400" /> 1. Commitment Overview
          </h2>
          <p>
            This Service Level Agreement ("SLA") defines the service availability and uptime commitments provided by Kyro AI for all paid Pro and Enterprise API Gateway instances (<code className="text-purple-400 font-mono">https://kyro-api-auou.onrender.com/v1/chat/completions</code>).
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-lg font-semibold border-b border-[#252D40] pb-2 flex items-center gap-2 text-white">
            <Percent size={18} className="text-emerald-400" /> 2. Monthly Uptime Percentage & SLA Guarantee
          </h2>
          <p>
            Kyro AI guarantees a Monthly Uptime Percentage of at least <strong>99.9%</strong> during any calendar month. Monthly Uptime Percentage is calculated using the following formula:
          </p>
          <div className="bg-[#131722] border border-[#252D40] rounded-xl p-4 font-mono text-[11px] text-purple-400 font-semibold">
            Monthly Uptime % = ((Total Minutes in Month - Downtime Minutes) / Total Minutes in Month) * 100
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-lg font-semibold border-b border-[#252D40] pb-2 flex items-center gap-2 text-white">
            <ShieldCheck size={18} className="text-purple-400" /> 3. Service Credit Refund Schedule
          </h2>
          <p>
            If Kyro AI fails to meet the 99.9% Uptime Guarantee in any calendar month, eligible customers are entitled to financial SLA Service Credits according to the following schedule:
          </p>

          <div className="border border-[#252D40] rounded-xl overflow-hidden font-mono text-[11px] bg-[#131722]">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#1A202C] text-gray-400 border-b border-[#252D40]">
                <tr>
                  <th className="p-3 border-r border-[#252D40]">Monthly Uptime Percentage</th>
                  <th className="p-3 border-r border-[#252D40]">SLA Service Credit Percentage</th>
                  <th className="p-3">Remedy Applied To</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252D40]">
                <tr>
                  <td className="p-3 border-r border-[#252D40] text-purple-400 font-bold">99.0% – 99.89%</td>
                  <td className="p-3 border-r border-[#252D40] text-emerald-400 font-bold">10% Credit Refund</td>
                  <td className="p-3 text-gray-400">Monthly API Subscription Fee</td>
                </tr>
                <tr>
                  <td className="p-3 border-r border-[#252D40] text-purple-400 font-bold">95.0% – 98.99%</td>
                  <td className="p-3 border-r border-[#252D40] text-emerald-400 font-bold">25% Credit Refund</td>
                  <td className="p-3 text-gray-400">Monthly API Subscription Fee</td>
                </tr>
                <tr>
                  <td className="p-3 border-r border-[#252D40] text-purple-400 font-bold">&lt; 95.0%</td>
                  <td className="p-3 border-r border-[#252D40] text-emerald-400 font-bold">50% Credit Refund</td>
                  <td className="p-3 text-gray-400">Monthly API Subscription Fee</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold border-b border-[#252D40] pb-2 flex items-center gap-2 text-white">
            <Clock size={18} className="text-amber-400" /> 4. Submitting SLA Claims
          </h2>
          <p>
            To submit an SLA credit claim, open a direct Support Ticket within 30 days of the outage event. Include the date, timestamps, request logs, and affected API key prefix.
          </p>
        </section>
      </div>

      {/* Direct Support Ticket Button */}
      <div className="border border-[#252D40] bg-[#131722] rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 mt-10">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Ticket size={18} className="text-purple-400" /> Need To Submit An SLA Credit Claim Or Incident Report?
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Submit a direct SLA Support Ticket for priority processing by our operations team.
          </p>
        </div>

        <Link
          href="/support?category=SLA+%26+Uptime+Credit"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg transition-all active:scale-95 shrink-0"
        >
          🎫 Open SLA Credit Ticket
        </Link>
      </div>
    </div>
  );
}
