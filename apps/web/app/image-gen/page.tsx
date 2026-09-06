"use client";

import { useState } from "react";
import { Image as ImageIcon, Sparkles, Download, Copy, RefreshCw, Code2, Layers, Check } from "lucide-react";
import { apiFetch } from "../../lib/api";

type GeneratedImage = {
  id: string;
  prompt: string;
  url: string;
  aspectRatio: string;
  style: string;
  createdAt: string;
};

export default function ImageGenPage() {
  const [prompt, setPrompt] = useState("Futuristic cyberpunk city at sunset with neon reflections on rainy streets");
  const [aspectRatio, setAspectRatio] = useState("1024x1024");
  const [style, setStyle] = useState("cyberpunk");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const [history, setHistory] = useState<GeneratedImage[]>([
    {
      id: "img-101",
      prompt: "Futuristic cyberpunk city at sunset with neon reflections on rainy streets",
      url: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDI0IiBoZWlnaHQ9IjEwMjQiIHZpZXdCb3g9IjAgMCA4MDAgODAwIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgZmlsbD0iIzA5MEQxNiIvPjxjaXJjbGUgY3g9IjQwMCIgY3k9IjQwMCIgcj0iMjAwIiBmaWxsPSIjMDA1NUZGIiBvcGFjaXR5PSIwLjMiLz48dGV4dCB4PSI2MCIgeT0iNzQwIiBmaWxsPSIjMDBFNUZGIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyMCI+S1lSTyBBSSBJTUFHRSBTVFVESU88L3RleHQ+PC9zdmc+",
      aspectRatio: "1024x1024",
      style: "cyberpunk",
      createdAt: new Date().toISOString(),
    },
  ]);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;
    setIsGenerating(true);

    try {
      const res = await apiFetch("/v1/images/generations", {
        method: "POST",
        body: JSON.stringify({ prompt, size: aspectRatio, style }),
      });

      if (res.data && res.data.length > 0) {
        const newImg: GeneratedImage = {
          id: `img-${Date.now()}`,
          prompt,
          url: res.data[0].url,
          aspectRatio,
          style,
          createdAt: new Date().toISOString(),
        };
        setHistory((prev) => [newImg, ...prev]);
      }
    } catch (e: any) {
      alert(`Image generation error: ${e.message}`);
    } finally {
      setIsGenerating(false);
    }
  }

  function copyCodeSnippet() {
    const code = `import { OpenAI } from "openai";

const client = new OpenAI({
  baseURL: "https://kyro-api-auou.onrender.com/v1",
  apiKey: "kyro_sk_live_your_key"
});

const response = await client.images.generate({
  prompt: "${prompt}",
  n: 1,
  size: "${aspectRatio}"
});

console.log(response.data[0].url);`;

    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  }

  return (
    <div className="min-h-screen bg-bg text-text p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-border pb-6">
          <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-3">
            <ImageIcon className="text-accent" size={30} /> AI Image Generation Studio
          </h1>
          <p className="text-sm text-muted mt-1">
            Generate high-resolution visual artwork & digital assets directly via Web UI or the OpenAI SDK compatible API (`POST /v1/images/generations`).
          </p>
        </div>

        {/* Main Interface Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Panel (Left 5 Cols) */}
          <div className="lg:col-span-5 bg-surface border border-border rounded-lg p-6 space-y-6">
            <form onSubmit={handleGenerate} className="space-y-5">
              <div>
                <label className="block text-xs font-mono font-bold text-muted mb-2 uppercase tracking-wider">
                  Text Prompt
                </label>
                <textarea
                  rows={4}
                  required
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the image you want to create in detail..."
                  className="w-full bg-surface-raised border border-border rounded-lg p-3 text-sm text-text outline-none focus:border-accent font-sans leading-relaxed"
                />
              </div>

              {/* Aspect Ratio Selector */}
              <div>
                <label className="block text-xs font-mono font-bold text-muted mb-2 uppercase tracking-wider">
                  Aspect Ratio & Dimension
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Square (1:1)", value: "1024x1024" },
                    { label: "Landscape (16:9)", value: "1280x720" },
                    { label: "Portrait (9:16)", value: "720x1280" },
                  ].map((ratio) => (
                    <button
                      key={ratio.value}
                      type="button"
                      onClick={() => setAspectRatio(ratio.value)}
                      className={`p-2.5 rounded text-xs font-mono border transition-all text-center ${
                        aspectRatio === ratio.value
                          ? "border-accent bg-accent/10 text-accent font-bold"
                          : "border-border text-muted hover:text-text bg-surface-raised/40"
                      }`}
                    >
                      {ratio.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Style Presets */}
              <div>
                <label className="block text-xs font-mono font-bold text-muted mb-2 uppercase tracking-wider">
                  Visual Art Style Preset
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["cyberpunk", "photorealistic", "3d-render", "anime", "oil-painting", "line-art"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStyle(s)}
                      className={`p-2 rounded text-[11px] font-mono capitalize border transition-all ${
                        style === s
                          ? "border-accent bg-accent/10 text-accent font-bold"
                          : "border-border text-muted hover:text-text bg-surface-raised/40"
                      }`}
                    >
                      {s.replace("-", " ")}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-3 bg-accent text-ink rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <Sparkles size={16} /> {isGenerating ? "Generating Artwork..." : "Generate AI Image"}
              </button>
            </form>

            {/* OpenAI SDK Code Snippet Preview */}
            <div className="border border-border rounded-lg bg-surface-raised/50 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-accent flex items-center gap-1.5">
                  <Code2 size={14} /> OpenAI SDK Code snippet
                </span>
                <button
                  onClick={copyCodeSnippet}
                  className="text-xs font-mono text-muted hover:text-text flex items-center gap-1"
                >
                  {copiedCode ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                  {copiedCode ? "Copied" : "Copy"}
                </button>
              </div>
              <pre className="text-[11px] font-mono text-muted overflow-x-auto p-2 bg-bg rounded border border-border">
                <code>{`await openai.images.generate({\n  prompt: "${prompt.slice(0, 30)}...",\n  size: "${aspectRatio}"\n});`}</code>
              </pre>
            </div>
          </div>

          {/* Image Display Gallery (Right 7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-xs font-mono font-bold text-muted uppercase tracking-wider flex items-center gap-2">
              <Layers size={14} /> Generated Artwork Gallery ({history.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {history.map((img) => (
                <div
                  key={img.id}
                  className="bg-surface border border-border rounded-lg overflow-hidden flex flex-col justify-between group hover:border-accent/50 transition-all shadow-lg"
                >
                  <div className="relative bg-black/40 aspect-square flex items-center justify-center overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={img.prompt} className="w-full h-full object-cover" />
                  </div>

                  <div className="p-4 space-y-3 bg-surface">
                    <p className="text-xs text-text line-clamp-2 font-sans font-medium">{img.prompt}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className="text-[10px] font-mono text-muted uppercase">{img.style} • {img.aspectRatio}</span>
                      <a
                        href={img.url}
                        download={`kyro-${img.id}.svg`}
                        className="p-1.5 text-muted hover:text-accent rounded transition-colors"
                        title="Download Image File"
                      >
                        <Download size={15} />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
