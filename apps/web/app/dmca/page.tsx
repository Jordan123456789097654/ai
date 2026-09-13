"use client";

import React from "react";
import Link from "next/link";
import { Scale, FileText, CheckCircle2, ShieldAlert, Ticket, AlertTriangle, Globe } from "lucide-react";

export default function DMCAPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12 space-y-12 text-xs leading-relaxed font-sans text-slate-200">
      {/* Header Banner */}
      <div className="border-b border-[#242b3d] pb-8 space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-2xl text-blue-400">
            <Scale size={32} />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-white">DMCA Copyright & Takedown Policy</h1>
            <p className="text-slate-400 text-sm font-mono mt-1">
              Document Version 3.0 • Digital Millennium Copyright Act (17 U.S.C. § 512) Compliance
            </p>
          </div>
        </div>
      </div>

      {/* Overview */}
      <div className="space-y-8 text-slate-300">
        <section className="space-y-4">
          <h2 className="font-display text-xl font-bold text-white border-b border-[#242b3d] pb-2 flex items-center gap-2">
            <FileText size={20} className="text-blue-400" /> 1. Copyright Protection Overview
          </h2>
          <p>
            Kyro AI Platform respects intellectual property rights and expects all users, developers, and server administrators to do the same. In accordance with the Digital Millennium Copyright Act of 1998 (17 U.S.C. § 512) ("DMCA"), we respond promptly to notices of alleged copyright infringement.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-xl font-bold text-white border-b border-[#242b3d] pb-2 flex items-center gap-2">
            <ShieldAlert size={20} className="text-amber-400" /> 2. Filing a DMCA Takedown Notice
          </h2>
          <p>
            If you are a copyright owner or authorized agent and believe that content hosted on our platform infringes your copyright, submit a written notification containing:
          </p>
          <div className="bg-[#121522] border border-[#242b3d] p-5 rounded-xl space-y-2 font-mono text-xs text-slate-300">
            <div>1. Physical or electronic signature of the copyright owner or authorized representative.</div>
            <div>2. Identification of the copyrighted work claimed to have been infringed.</div>
            <div>3. Identification of the material that is claimed to be infringing and URL location.</div>
            <div>4. Contact information including email address, telephone number, and address.</div>
            <div>5. Statement of good faith belief that use of the material is not authorized.</div>
            <div>6. Statement under penalty of perjury that the information in the notice is accurate.</div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-xl font-bold text-white border-b border-[#242b3d] pb-2 flex items-center gap-2">
            <CheckCircle2 size={20} className="text-emerald-400" /> 3. Counter-Notification Procedure
          </h2>
          <p>
            If you believe your material was removed or disabled by mistake or misidentification, you may submit a counter-notice pursuant to 17 U.S.C. § 512(g)(3).
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-xl font-bold text-white border-b border-[#242b3d] pb-2 flex items-center gap-2">
            <Globe size={20} className="text-cyan-400" /> 4. Repeat Infringer Policy
          </h2>
          <p>
            Company maintains a strict repeat infringer policy and will terminate accounts or API access for users found to repeatedly infringe intellectual property rights.
          </p>
        </section>
      </div>

      {/* Support Ticket Callout Banner */}
      <div className="border border-[#242b3d] bg-[#121522] rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 font-mono">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Ticket size={18} className="text-blue-400" /> Submit A DMCA Takedown Or Copyright Ticket
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Submit formal DMCA notices directly to our Legal Compliance team.
          </p>
        </div>
        <Link
          href="/discord-bot"
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition-all"
        >
          🎫 Open Legal Ticket
        </Link>
      </div>
    </div>
  );
}
