"use client";

import { FileText, ShieldAlert, Check, Mail, Scale, FileCheck } from "lucide-react";

export default function DmcaPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 space-y-10 text-xs leading-relaxed font-sans">
      <div className="border-b border-border pb-6 space-y-2">
        <h1 className="font-display text-3xl text-text flex items-center gap-3">
          <FileText className="text-accent" size={32} /> DMCA Takedown & Intellectual Property Policy
        </h1>
        <p className="text-muted text-sm font-mono">
          Document Version 3.1 • Last Revised: September 6, 2026 • 17 U.S.C. § 512 Compliance
        </p>
      </div>

      <div className="space-y-8 text-text/90">
        <section className="space-y-3">
          <h2 className="font-display text-lg text-text font-semibold border-b border-border/50 pb-1.5 flex items-center gap-2">
            <Scale size={18} className="text-accent" /> 1. Compliance Statement
          </h2>
          <p>
            Kyro AI respects the intellectual property rights of creators and expects users of the Kyro Platform, API Gateways, and template downloads to do the same. In accordance with the Digital Millennium Copyright Act of 1998 (17 U.S.C. § 512) ("DMCA"), Kyro AI maintains a formal process to handle notices of alleged copyright infringement.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-lg text-text font-semibold border-b border-border/50 pb-1.5 flex items-center gap-2">
            <FileCheck size={18} className="text-accent" /> 2. Requirements for Submitting a Valid DMCA Notice
          </h2>
          <p>
            To file a valid DMCA copyright infringement notice with Kyro AI, you must provide a written communication to our Designated Copyright Agent (<code className="text-accent font-mono">dmca@kyro.ai</code>) containing the following mandatory elements:
          </p>
          <ol className="list-decimal pl-5 space-y-2 text-muted">
            <li><strong>Identification of Copyrighted Work:</strong> Description of the copyrighted work claimed to have been infringed, or a representative list if multiple works are involved.</li>
            <li><strong>Identification of Infringing Material:</strong> Specific identification of the material claimed to be infringing, including direct URLs or file paths on Kyro AI servers.</li>
            <li><strong>Contact Information:</strong> Your full legal name, physical address, telephone number, and official email address.</li>
            <li><strong>Good Faith Statement:</strong> A statement that you have a good-faith belief that use of the material is not authorized by the copyright owner, its agent, or the law.</li>
            <li><strong>Perjury Penalty Statement:</strong> A statement made under penalty of perjury that the information in the notification is accurate and that you are authorized to act on behalf of the owner.</li>
            <li><strong>Signature:</strong> A physical or electronic signature of the copyright owner or authorized representative.</li>
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg text-text font-semibold border-b border-border/50 pb-1.5 flex items-center gap-2">
            <Mail size={18} className="text-accent" /> 3. Designated DMCA Agent Contact
          </h2>
          <div className="bg-surface-raised border border-border rounded-lg p-4 font-mono text-[11px] space-y-1">
            <p className="font-bold text-accent">Kyro AI Copyright Agent</p>
            <p className="text-muted">Email: dmca@kyro.ai</p>
            <p className="text-muted">Legal Department: Kyro AI Platform LLC</p>
            <p className="text-muted">Response Time: Within 24-48 business hours</p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg text-text font-semibold border-b border-border/50 pb-1.5">
            4. Counter-Notification Procedure
          </h2>
          <p>
            If you believe your content was wrongly removed due to mistake or misidentification, you may submit a written DMCA Counter-Notice to <code className="text-accent font-mono">dmca@kyro.ai</code> stating your consent to jurisdiction of Federal District Court and your statement under penalty of perjury.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg text-text font-semibold border-b border-border/50 pb-1.5">
            5. Repeat Infringer Policy
          </h2>
          <p>
            In accordance with 17 U.S.C. § 512(i), Kyro AI will terminate the accounts and API developer access of users determined to be repeat infringers of intellectual property rights.
          </p>
        </section>
      </div>
    </div>
  );
}
