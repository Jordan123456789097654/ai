"use client";

import { useState } from "react";
import { Copy, Check, Download, Eye, X } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function CodeBlock({
  code,
  language = "bash",
  filename,
}: {
  code: string;
  language?: string;
  filename?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  function copyToClipboard() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadSingleFile() {
    const ext = getExtension(language);
    const fname = filename || `code-snippet.${ext}`;
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fname;
    a.click();
    URL.revokeObjectURL(url);
  }

  const isHtmlPreviewable =
    language.toLowerCase() === "html" ||
    (language.toLowerCase() === "javascript" && code.includes("<html>")) ||
    (language.toLowerCase() === "jsx" && code.includes("return"));

  return (
    <div className="my-4 rounded-lg border border-border bg-[#17161C] overflow-hidden text-sm shadow-lg">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface border-b border-border/60 text-xs text-muted">
        <span className="font-mono font-medium text-accent">
          {filename || language}
        </span>
        <div className="flex items-center gap-2">
          {isHtmlPreviewable && (
            <button
              onClick={() => setIsPreviewOpen(true)}
              className="flex items-center gap-1 hover:text-text px-2 py-1 rounded bg-surface-raised transition-colors"
            >
              <Eye size={13} /> Live Preview
            </button>
          )}
          <button
            onClick={downloadSingleFile}
            className="flex items-center gap-1 hover:text-text px-2 py-1 rounded hover:bg-surface-raised transition-colors"
            title="Download file"
          >
            <Download size={13} /> Save File
          </button>
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1 hover:text-text px-2 py-1 rounded hover:bg-surface-raised transition-colors"
          >
            {copied ? <Check size={13} className="text-success" /> : <Copy size={13} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      {/* Syntax Highlighted Code */}
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{
          margin: 0,
          background: "#17161C",
          padding: "1rem",
          fontSize: "0.85rem",
          lineHeight: "1.5",
        }}
      >
        {code}
      </SyntaxHighlighter>

      {/* HTML Live Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm">
          <div className="w-full max-w-4xl h-[80vh] bg-white rounded-lg flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-2 bg-neutral-900 text-white text-sm">
              <span>Live HTML/JS Preview</span>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
            <iframe
              srcDoc={code}
              title="Preview"
              className="w-full flex-1 border-none bg-white"
              sandbox="allow-scripts"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function getExtension(lang: string): string {
  const map: Record<string, string> = {
    javascript: "js",
    typescript: "ts",
    python: "py",
    html: "html",
    css: "css",
    json: "json",
    bash: "sh",
    sql: "sql",
    markdown: "md",
  };
  return map[lang.toLowerCase()] || "txt";
}
