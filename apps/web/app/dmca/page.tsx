"use client";

import Link from "next/link";
import { FileText, ShieldAlert, Check, Mail, Scale, FileCheck, Ticket } from "lucide-react";

export default function DmcaPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 space-y-10 text-xs leading-relaxed font-sans text-white">
      <div className="border-b border-[#252D40] pb-6 space-y-2">
        <h1 className="font-display text-3xl font-bold text-white flex items-center gap-3">
          <FileText className="text-purple-400" size={32} /> DMCA Takedown & IP Copyright Policy
        </h1>
        <p className="text-gray-400 text-sm font-mono">
          Document Version 3.1 • Last Revised: September 12, 2026 • 17 U.S.C. § 512 Compliance
        </p>
      </div>

      <div className="space-y-8 text-gray-300">
        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold border-b border-[#252D40] pb-2 flex items-center gap-2 text-white">
            <Scale size={18} className="text-purple-400" /> 1. Compliance Statement
          </h2>
          <p>
            Kyro AI respects the intellectual property rights of creators and expects users of the Kyro Platform, API Gateways, and templates to do the same. In accordance with the Digital Millennium Copyright Act of 1998 (17 U.S.C. § 512) ("DMCA"), Kyro AI maintains a formal process to handle notices of alleged copyright infringement.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-lg font-semibold border-b border-[#252D40] pb-2 flex items-center gap-2 text-white">
            <FileCheck size={18} className="text-purple-400" /> 2. Requirements for Submitting a Valid DMCA Notice
          </h2>
          <p>
            To file a DMCA copyright infringement notice or counter-notice with Kyro AI, open a direct Support Ticket with our Designated Copyright Agent containing the following elements:
          </p>
          <ol className="list-decimal pl-5 space-y-2 text-gray-400">
            <li><strong>Identification of Copyrighted Work:</strong> Description of the copyrighted work claimed to have been infringed.</li>
            <li><strong>Identification of Infringing Material:</strong> Direct URLs or file paths on Kyro AI servers.</li>
            <li><strong>Contact Information:</strong> Your full legal name, address, phone number, and email.</li>
            <li><strong>Good Faith & Perjury Penalty Statements:</strong> Written statements that you have a good-faith belief of unauthorized use and act under penalty of perjury.</li>
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold border-b border-[#252D40] pb-2 text-white">
            3. Repeat Infringer Policy
          </h2>
          <p>
            In accordance with 17 U.S.C. § 512(i), Kyro AI will terminate the accounts and API developer access of users determined to be repeat infringers of intellectual property rights.
          </p>
        </section>
      </div>

      {/* Direct Support Ticket Button */}
      <div className="border border-[#252D40] bg-[#131722] rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 mt-10">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Ticket size={18} className="text-purple-400" /> File A DMCA Takedown Or Counter-Notice?
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Submit a direct Copyright Ticket for immediate processing by our Legal Desk.
          </p>
        </div>

        <Link
          href="/support?category=DMCA+%26+Copyright"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg transition-all active:scale-95 shrink-0"
        >
          🎫 Open DMCA Support Ticket
        </Link>
      </div>
    </div>
  );
}
