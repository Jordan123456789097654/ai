"use client";

import { useState } from "react";
import { LayoutGrid, Download, Sparkles, Code2, ShieldCheck, FileText, Image as ImageIcon, CreditCard, ArrowRight, Check, Copy } from "lucide-react";
import JSZip from "jszip";

type Template = {
  id: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
  icon: any;
  files: { name: string; content: string }[];
};

const TEMPLATES: Template[] = [
  {
    id: "saas-starter",
    title: "Next.js 14 + Tailwind + Stripe SaaS Starter",
    category: "Full-Stack SaaS",
    description: "Complete SaaS application scaffold with landing page, user authentication, subscription pricing cards, and Stripe checkout integration.",
    tags: ["Next.js 14", "Tailwind CSS", "Stripe", "Supabase Auth"],
    icon: CreditCard,
    files: [
      {
        name: "package.json",
        content: `{\n  "name": "kyro-saas-starter",\n  "version": "1.0.0",\n  "dependencies": {\n    "next": "^14.2.0",\n    "react": "^18.3.0",\n    "stripe": "^15.0.0",\n    "@supabase/supabase-js": "^2.43.0",\n    "lucide-react": "^0.390.0"\n  }\n}`,
      },
      {
        name: "app/page.tsx",
        content: `"use client";\n\nimport { useState } from "react";\nimport { Check, Sparkles } from "lucide-react";\n\nexport default function LandingPage() {\n  return (\n    <main className="max-w-5xl mx-auto px-6 py-20 text-center space-y-8">\n      <h1 className="text-5xl font-bold tracking-tight">Build your SaaS 10x faster with Kyro AI</h1>\n      <p className="text-xl text-gray-400 max-w-2xl mx-auto">Production-ready Next.js 14 starter with Stripe billing, Supabase Auth, and Tailwind CSS.</p>\n      <div className="flex justify-center gap-4">\n        <a href="/checkout" className="px-6 py-3 bg-yellow-500 text-black font-semibold rounded-lg hover:opacity-90">Get Started Now →</a>\n      </div>\n    </main>\n  );\n}`,
      },
      {
        name: "app/api/checkout/route.ts",
        content: `import { NextResponse } from "next/server";\nimport Stripe from "stripe";\n\nconst stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-04-10" });\n\nexport async function POST(req: Request) {\n  const session = await stripe.checkout.sessions.create({\n    payment_method_types: ["card"],\n    line_items: [{ price: "price_pro_monthly", quantity: 1 }],\n    mode: "subscription",\n    success_url: "https://your-app.com/dashboard?success=true",\n    cancel_url: "https://your-app.com/pricing",\n  });\n  return NextResponse.json({ url: session.url });\n}`,
      },
    ],
  },
  {
    id: "doc-qa-saas",
    title: "AI Document & PDF Q&A Portal",
    category: "AI & Vector Search",
    description: "Multi-file PDF and document parser with semantic vector search, chunking, and interactive document Q&A portal.",
    tags: ["LangChain", "PgVector", "PDF.js", "OpenAI SDK"],
    icon: FileText,
    files: [
      {
        name: "lib/vectorStore.ts",
        content: `import { OpenAIEmbeddings } from "@langchain/openai";\n\nexport async function generateDocumentEmbeddings(textChunks: string[]) {\n  const embeddings = new OpenAIEmbeddings({ openAIApiKey: process.env.KYRO_API_KEY });\n  const vectors = await embeddings.embedDocuments(textChunks);\n  return vectors;\n}`,
      },
      {
        name: "app/doc-chat/page.tsx",
        content: `"use client";\n\nimport { useState } from "react";\nimport { FileText, Send } from "lucide-react";\n\nexport default function DocChatPage() {\n  const [query, setQuery] = useState("");\n  return (\n    <div className="p-8 max-w-4xl mx-auto space-y-6">\n      <h1 className="text-3xl font-bold flex items-center gap-2"><FileText className="text-yellow-500"/> AI Document Q&A</h1>\n      <div className="border border-gray-800 rounded-lg p-6 bg-gray-950 space-y-4">\n        <input type="file" accept=".pdf,.csv,.docx" className="text-sm text-gray-400" />\n        <textarea value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ask any question about your uploaded documents..." className="w-full bg-gray-900 p-3 rounded text-sm text-white" />\n      </div>\n    </div>\n  );\n}`,
      },
    ],
  },
  {
    id: "image-gen-app",
    title: "AI Image & Banner Creator Studio",
    category: "Multi-Modal AI",
    description: "Multi-modal graphic and logo generator using FLUX / SDXL inference with prompt enhancer and resolution selector.",
    tags: ["FLUX.1", "SDXL", "Canvas API", "Next.js"],
    icon: ImageIcon,
    files: [
      {
        name: "app/generate/route.ts",
        content: `import { NextResponse } from "next/server";\n\nexport async function POST(req: Request) {\n  const { prompt, aspectRatio } = await req.json();\n  const imageUrl = \`https://image.pollinations.ai/prompt/\${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true\`;\n  return NextResponse.json({ imageUrl, prompt, aspectRatio });\n}`,
      },
    ],
  },
  {
    id: "security-auditor",
    title: "Code Security & Refactoring Auditor",
    category: "Developer Tool",
    description: "SAST security vulnerability scanner that extracts repository ZIP archives, detects OWASP Top 10 bugs, and outputs refactored code.",
    tags: ["SAST Scanner", "OWASP Audit", "TypeScript", "Node.js"],
    icon: ShieldCheck,
    files: [
      {
        name: "lib/sastScanner.ts",
        content: `export function scanCodeForVulnerabilities(code: string) {\n  const vulnerabilities = [];\n  if (code.includes("eval(")) vulnerabilities.push({ type: "CRITICAL", rule: "Unsafe Code Execution (eval)" });\n  if (code.match(/SELECT \\* FROM .* \\+ /i)) vulnerabilities.push({ type: "HIGH", rule: "Potential SQL Injection" });\n  if (code.match(/(sk_live_|AKIA)[0-9a-zA-Z]{16,}/)) vulnerabilities.push({ type: "CRITICAL", rule: "Hardcoded API Secret Key" });\n  return vulnerabilities;\n}`,
      },
    ],
  },
];

export default function TemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(TEMPLATES[0]);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  async function downloadTemplateZip(template: Template) {
    const zip = new JSZip();
    template.files.forEach((file) => {
      zip.file(file.name, file.content);
    });

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${template.id}_starter_kit.zip`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function copyCode(content: string, filename: string) {
    navigator.clipboard.writeText(content);
    setCopiedFile(filename);
    setTimeout(() => setCopiedFile(null), 1500);
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 space-y-10">
      <div className="text-center space-y-3">
        <h1 className="font-display text-3xl text-text flex items-center justify-center gap-2">
          <LayoutGrid className="text-accent" size={28} /> AI Micro-SaaS Starter Kits & Project Engine
        </h1>
        <p className="text-muted text-sm max-w-xl mx-auto">
          Launch full-stack SaaS applications and developer tools in seconds. Preview code, download ready-to-run `.zip` starter projects, or edit in Canvas.
        </p>
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {TEMPLATES.map((tmpl) => {
          const Icon = tmpl.icon;
          const isSelected = selectedTemplate.id === tmpl.id;
          return (
            <div
              key={tmpl.id}
              onClick={() => setSelectedTemplate(tmpl)}
              className={`border rounded-lg p-6 bg-surface cursor-pointer transition-all space-y-4 ${
                isSelected ? "border-accent ring-1 ring-accent bg-surface-raised/60" : "border-border hover:border-accent/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-surface-raised border border-border text-accent">
                    <Icon size={22} />
                  </div>
                  <div>
                    <h3 className="font-display text-lg text-text font-semibold">{tmpl.title}</h3>
                    <span className="text-xs font-mono text-muted">{tmpl.category}</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted leading-relaxed">{tmpl.description}</p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {tmpl.tags.map((tag) => (
                  <span key={tag} className="text-[11px] font-mono bg-ink px-2 py-0.5 rounded text-accent border border-border">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <span className="text-xs font-mono text-muted">{tmpl.files.length} Project Files Included</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadTemplateZip(tmpl);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-accent text-ink rounded text-xs font-semibold hover:opacity-90 transition-opacity"
                >
                  <Download size={13} /> Download .ZIP
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Template Multi-File Code Viewer */}
      <div className="border border-border rounded-lg bg-surface p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Code2 size={18} className="text-accent" />
            <h2 className="font-display text-lg">Starter Code Explorer: {selectedTemplate.title}</h2>
          </div>
          <button
            onClick={() => downloadTemplateZip(selectedTemplate)}
            className="flex items-center gap-1 px-3 py-1.5 bg-accent text-ink rounded text-xs font-semibold hover:opacity-90"
          >
            <Download size={13} /> Download Project (.ZIP)
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {selectedTemplate.files.map((file) => (
            <div key={file.name} className="border border-border rounded bg-surface-raised overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-ink border-b border-border text-accent font-mono text-xs font-medium">
                <span>📄 {file.name}</span>
                <button
                  onClick={() => copyCode(file.content, file.name)}
                  className="text-muted hover:text-text flex items-center gap-1 text-[11px]"
                >
                  {copiedFile === file.name ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                  <span>{copiedFile === file.name ? "Copied!" : "Copy File"}</span>
                </button>
              </div>
              <pre className="p-4 font-mono text-xs text-text overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {file.content}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
