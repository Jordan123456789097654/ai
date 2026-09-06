"use client";

import { FileText, ShieldAlert, Check } from "lucide-react";

export default function DmcaPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 space-y-10 text-xs leading-relaxed">
      <div className="border-b border-border pb-6 space-y-2">
        <h1 className="font-display text-3xl text-text flex items-center gap-2">
          <FileText className="text-accent" size={28} /> DMCA & Intellectual Property Policy
        </h1>
        <p className="text-muted text-sm">
          Last Updated: September 6, 2026 • Copyright Takedown Procedure
        </p>
      </div>

      <div className="space-y-8 text-text/90">
        <section className="space-y-3">
          <h2 className="font-display text-lg text-text font-semibold border-b border-border/50 pb-1.5">
            1. Digital Millennium Copyright Act Compliance
          </h2>
          <p>
            Kyro AI respects intellectual property rights and expects its users to do the same. In accordance with the Digital Millennium Copyright Act of 1998 (17 U.S.C. § 512), Kyro AI will respond expeditiously to notices of alleged copyright infringement submitted to our designated Designated Agent.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg text-text font-semibold border-b border-border/50 pb-1.5">
            2. Filing a Takedown Notice
          </h2>
          <p>
            To submit a valid DMCA takedown notice, please provide written notice to <code className="text-accent font-mono">dmca@kyro.ai</code> including:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-muted">
            <li>Physical or electronic signature of the copyright owner.</li>
            <li>Identification of the copyrighted work claimed to have been infringed.</li>
            <li>Direct URL or location of the infringing material on Kyro AI servers.</li>
            <li>Your contact information (name, address, telephone, email).</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
