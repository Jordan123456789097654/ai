import Link from "next/link";
import { Shield, Lock, Scale, FileText, Activity, Cookie } from "lucide-react";
import KyroLogo from "../components/KyroLogo";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 mx-auto max-w-4xl px-6 py-24">
        <div className="mb-6 flex items-center gap-3">
          <KyroLogo size="lg" />
        </div>
        <p className="font-mono text-sm text-signal mb-4">self-hosted · OpenAI-compatible</p>
        <h1 className="font-display text-5xl leading-tight mb-6">
          Run your own model.
          <br />
          Keep the API everyone already knows.
        </h1>
        <p className="text-muted text-lg mb-10 max-w-xl leading-relaxed">
          Kyro puts a chat interface, a developer portal, and an admin control panel in front
          of any open-source model you host — Llama 3, Mistral, DeepSeek. Swap one line in the
          OpenAI SDK and you're calling your own infrastructure.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/chat" className="px-5 py-2.5 bg-accent text-ink rounded font-medium hover:opacity-90 transition-opacity">
            Open Chat Interface
          </Link>
          <Link href="/docs" className="px-5 py-2.5 border border-border rounded font-medium hover:border-muted transition-colors">
            Read API Docs
          </Link>
          <Link href="/templates" className="px-5 py-2.5 bg-surface-raised border border-border rounded font-medium text-text hover:border-accent transition-colors">
            Explore Templates
          </Link>
        </div>
      </main>

      {/* Production Homepage Footer with Detailed Legal Documents */}
      <footer className="border-t border-border bg-surface text-xs mt-auto py-12">
        <div className="mx-auto max-w-6xl px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <h3 className="font-display text-sm font-semibold text-text">Kyro AI Platform</h3>
            <p className="text-muted leading-relaxed">
              OpenAI-compatible chat completions API gateway backed by cloud LLM compute. Enterprise security and 99.9% uptime SLA.
            </p>
            <p className="text-[11px] font-mono text-muted pt-2">© 2026 Kyro AI Platform Inc. All rights reserved.</p>
          </div>

          <div className="space-y-2">
            <h4 className="font-mono text-accent font-semibold uppercase tracking-wider text-[11px]">Legal & Compliance</h4>
            <ul className="space-y-1.5 text-muted font-mono text-[11px]">
              <li><Link href="/terms" className="hover:text-text hover:underline">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-text hover:underline">Privacy Policy (GDPR / CCPA)</Link></li>
              <li><Link href="/acceptable-use" className="hover:text-text hover:underline">Acceptable Use Policy</Link></li>
              <li><Link href="/cookies" className="hover:text-text hover:underline">Cookie & Storage Policy</Link></li>
              <li><Link href="/sla" className="hover:text-text hover:underline">SLA & Uptime Guarantee</Link></li>
              <li><Link href="/dmca" className="hover:text-text hover:underline">DMCA & Copyright Policy</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-mono text-accent font-semibold uppercase tracking-wider text-[11px]">Developer Platform</h4>
            <ul className="space-y-1.5 text-muted font-mono text-[11px]">
              <li><Link href="/docs" className="hover:text-text hover:underline">API Documentation</Link></li>
              <li><Link href="/dev" className="hover:text-text hover:underline">Developer Key Portal</Link></li>
              <li><Link href="/templates" className="hover:text-text hover:underline">SaaS Project Starters</Link></li>
              <li><Link href="/status" className="hover:text-text hover:underline">Live System Status</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-mono text-accent font-semibold uppercase tracking-wider text-[11px]">Security & Zero Training</h4>
            <div className="border border-success/30 bg-success/10 p-3 rounded text-[11px] text-text space-y-1">
              <span className="font-bold text-success flex items-center gap-1">🔒 Zero Data Training</span>
              <p className="text-muted leading-relaxed">Prompts & code are never used to train global base models. 100% ephemeral processing.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
