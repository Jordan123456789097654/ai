import Link from "next/link";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24">
      <p className="font-mono text-sm text-signal mb-4">self-hosted · OpenAI-compatible</p>
      <h1 className="font-display text-5xl leading-tight mb-6">
        Run your own model.
        <br />
        Keep the API everyone already knows.
      </h1>
      <p className="text-muted text-lg mb-10 max-w-xl">
        Kyro puts a chat interface, a developer portal, and an admin control panel in front
        of any open-source model you host — Llama 3, Mistral, DeepSeek. Swap one line in the
        OpenAI SDK and you're calling your own infrastructure.
      </p>
      <div className="flex gap-3">
        <Link href="/chat" className="px-5 py-2.5 bg-accent text-ink rounded font-medium">
          Open chat
        </Link>
        <Link href="/docs" className="px-5 py-2.5 border border-border rounded font-medium hover:border-muted">
          Read the docs
        </Link>
      </div>
    </div>
  );
}
