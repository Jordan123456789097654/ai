"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function CodeBlock({ code, language = "bash" }: { code: string; language?: string }) {
  return (
    <div className="rounded border border-border overflow-hidden text-sm">
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{ margin: 0, background: "#17161C", padding: "1rem" }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
