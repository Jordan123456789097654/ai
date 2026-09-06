"use client";

import { useState } from "react";
import { GitBranch, Play, Plus, Trash2, Check, ArrowRight, Sparkles, Globe, Terminal, Mail, Sliders } from "lucide-react";

type WorkflowNode = {
  id: string;
  type: "input" | "prompt" | "search" | "code" | "webhook";
  title: string;
  config: string;
};

export default function WorkflowsPage() {
  const [nodes, setNodes] = useState<WorkflowNode[]>([
    { id: "node-1", type: "input", title: "1. Trigger / Webhook Payload", config: "Event: HTTP POST /api/trigger" },
    { id: "node-2", type: "search", title: "2. Web Search Grounding", config: "Query: 'Latest Next.js 14 documentation changes'" },
    { id: "node-3", type: "prompt", title: "3. Kyro LLM Reasoning Node", config: "Model: kyro-coder-pro | Temp: 0.7" },
    { id: "node-4", type: "code", title: "4. Node.js In-Browser Terminal Runner", config: "Execute sandbox code & parse stdout" },
    { id: "node-5", type: "webhook", title: "5. Discord / Webhook Output Alert", config: "POST to Discord #alerts channel" },
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [runLog, setRunLog] = useState<string[]>([]);

  function addNode(type: WorkflowNode["type"]) {
    const titles = {
      input: "New User Input Trigger",
      prompt: "Kyro AI Prompt Node",
      search: "Web Search Grounding Node",
      code: "Code Sandbox Execution Node",
      webhook: "Webhook / Discord Output Node",
    };

    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type,
      title: `${nodes.length + 1}. ${titles[type]}`,
      config: "Default configuration parameters",
    };

    setNodes([...nodes, newNode]);
  }

  function removeNode(id: string) {
    setNodes(nodes.filter((n) => n.id !== id));
  }

  function executeWorkflow() {
    setIsRunning(true);
    setRunLog([]);
    setActiveStep(0);

    nodes.forEach((node, idx) => {
      setTimeout(() => {
        setActiveStep(idx);
        setRunLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Executing Step ${idx + 1}: ${node.title}... OK ✓`]);
        if (idx === nodes.length - 1) {
          setTimeout(() => {
            setIsRunning(false);
            setActiveStep(null);
            setRunLog((prev) => [...prev, `\n[Workflow Completed Successfully in ${(nodes.length * 600) / 1000}s]`]);
          }, 600);
        }
      }, idx * 600);
    });
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 space-y-10">
      <div className="text-center space-y-3">
        <h1 className="font-display text-3xl text-text flex items-center justify-center gap-2">
          <GitBranch className="text-accent" size={28} /> Visual AI Workflow Builder
        </h1>
        <p className="text-muted text-sm max-w-xl mx-auto">
          Drag, drop, and chain autonomous AI nodes (Input ➔ Web Search ➔ Kyro LLM ➔ Code Sandbox ➔ Webhook Alert) without writing glue code.
        </p>
      </div>

      {/* Toolbar */}
      <div className="border border-border rounded-lg bg-surface p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-muted font-medium mr-2">Add Workflow Node:</span>
          <button onClick={() => addNode("prompt")} className="px-2.5 py-1.5 rounded border border-border bg-surface-raised hover:border-accent flex items-center gap-1 text-text">
            <Sparkles size={13} className="text-accent" /> AI Prompt
          </button>
          <button onClick={() => addNode("search")} className="px-2.5 py-1.5 rounded border border-border bg-surface-raised hover:border-accent flex items-center gap-1 text-text">
            <Globe size={13} className="text-accent" /> Web Search
          </button>
          <button onClick={() => addNode("code")} className="px-2.5 py-1.5 rounded border border-border bg-surface-raised hover:border-accent flex items-center gap-1 text-text">
            <Terminal size={13} className="text-accent" /> Code Runner
          </button>
          <button onClick={() => addNode("webhook")} className="px-2.5 py-1.5 rounded border border-border bg-surface-raised hover:border-accent flex items-center gap-1 text-text">
            <Mail size={13} className="text-accent" /> Webhook Output
          </button>
        </div>

        <button
          onClick={executeWorkflow}
          disabled={isRunning}
          className="px-5 py-2 bg-accent text-ink rounded font-semibold text-xs flex items-center gap-1.5 hover:opacity-90 transition-opacity"
        >
          <Play size={14} /> {isRunning ? "Executing Workflow..." : "Test Run Workflow"}
        </button>
      </div>

      {/* Node Pipeline View */}
      <div className="space-y-4">
        {nodes.map((node, index) => (
          <div key={node.id} className="relative">
            <div
              className={`border rounded-lg bg-surface p-4 flex items-center justify-between transition-all ${
                activeStep === index ? "border-accent ring-1 ring-accent bg-accent/5" : "border-border"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-surface-raised border border-border flex items-center justify-center text-accent font-mono font-bold text-xs">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-display text-sm text-text font-semibold">{node.title}</h3>
                  <p className="font-mono text-xs text-muted">{node.config}</p>
                </div>
              </div>

              <button
                onClick={() => removeNode(node.id)}
                className="text-muted hover:text-danger p-1.5 rounded hover:bg-surface-raised transition-colors"
                title="Delete node"
              >
                <Trash2 size={15} />
              </button>
            </div>

            {index < nodes.length - 1 && (
              <div className="flex justify-center py-2">
                <ArrowRight size={16} className="text-accent rotate-90" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Execution Output Console */}
      {runLog.length > 0 && (
        <div className="border border-border rounded-lg bg-surface p-6 space-y-3">
          <h3 className="font-display text-lg border-b border-border pb-2 flex items-center gap-2">
            <Terminal size={18} className="text-accent" /> Workflow Execution Logs
          </h3>
          <div className="bg-ink p-4 rounded border border-border font-mono text-xs text-success space-y-1 overflow-x-auto whitespace-pre-wrap">
            {runLog.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
