"use client";

import { useState, useEffect } from "react";
import SiteNav from "../../components/SiteNav";

const STARTER_SNIPPETS: Record<string, { name: string; code: string }[]> = {
  javascript: [
    {
      name: "⚡ Async Data Processing & API Sim",
      code: `// Kyro Live JS Sandbox - Data Processing Pipeline
const rawTransactions = [
  { id: 101, user: "Alice", amount: 149.99, category: "API Tier Pro" },
  { id: 102, user: "Bob", amount: 29.50, category: "Token Topup" },
  { id: 103, user: "Charlie", amount: 499.00, category: "Enterprise SLA" },
  { id: 104, user: "Diana", amount: 12.00, category: "Token Topup" }
];

console.log("🚀 Starting Kyro Data Processor...");

const totalRevenue = rawTransactions.reduce((sum, item) => sum + item.amount, 0);
console.log(\`📊 Total Revenue Processed: $\${totalRevenue.toFixed(2)}\`);

const enterpriseClients = rawTransactions.filter(t => t.amount > 100);
console.log("🏢 Enterprise Transactions (> $100):", enterpriseClients);

// Return processed stats
({
  processedCount: rawTransactions.length,
  totalVolume: totalRevenue,
  topCategory: "Enterprise SLA"
});`,
    },
    {
      name: "🧮 Fibonacci Algorithm Benchmark",
      code: `// High-Performance Fibonacci & Execution Benchmark
function fibonacci(n, memo = {}) {
  if (n in memo) return memo[n];
  if (n <= 1) return n;
  memo[n] = fibonacci(n - 1, memo) + fibonacci(n - 2, memo);
  return memo[n];
}

console.log("⚡ Calculating Fibonacci sequence (n=40)...");
const startTime = Date.now();
const result = fibonacci(40);
const duration = Date.now() - startTime;

console.log(\`✅ Result: \${result}\`);
console.log(\`⏱️ Computed in \${duration}ms using memoization\`);`,
    },
  ],
  python: [
    {
      name: "🐍 Python Data Analysis & Statistics",
      code: `# Kyro Live Python 3 Sandbox
data = [12.5, 45.2, 98.1, 33.4, 88.0, 102.5, 67.3]

print("📊 Analyzing dataset metrics...")

count = len(data)
total = sum(data)
mean = total / count
sorted_data = sorted(data)
median = sorted_data[count // 2]

print(f"Sample Count: {count}")
print(f"Sum: {total:.2f}")
print(f"Mean Average: {mean:.2f}")
print(f"Median Value: {median:.2f}")
print(f"Max Value: {max(data)}")
print(f"Min Value: {min(data)}")`,
    },
    {
      name: "🔒 HMAC & Token Security Validator",
      code: `# Kyro Token Digest Validator Simulation
import hashlib
import time

user_id = "usr_kyro_9921"
secret_key = "kyro_live_secret_key"
timestamp = int(time.time())

payload = f"{user_id}:{timestamp}:{secret_key}"
token_hash = hashlib.sha256(payload.encode()).hexdigest()

print("🔐 Generating secure access signature...")
print(f"User ID: {user_id}")
print(f"Timestamp: {timestamp}")
print(f"SHA-256 Digest Token: {token_hash}")`,
    },
  ],
  sql: [
    {
      name: "🐬 Active Users & Revenue Join Query",
      code: `-- Kyro PostgreSQL Sandbox Engine
SELECT 
    u.id, 
    u.name, 
    u.email, 
    u.tier
FROM users u
WHERE u.tier IN ('Enterprise', 'Pro')
ORDER BY u.id ASC;`,
    },
    {
      name: "📊 AI Model Pricing & Cost Analysis",
      code: `-- Kyro LLM Gateway Metrics & Cost Query
SELECT 
    m.id, 
    m.model_name, 
    m.provider, 
    m.cost_per_1k
FROM models m
ORDER BY m.cost_per_1k ASC;`,
    },
  ],
};

export default function SandboxPage() {
  const [language, setLanguage] = useState<"javascript" | "python" | "sql">("javascript");
  const [code, setCode] = useState(STARTER_SNIPPETS.javascript[0].code);
  const [selectedSnippetIdx, setSelectedSnippetIdx] = useState(0);

  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState<{
    stdout: string;
    stderr: string;
    exitCode: number;
    latencyMs: number;
    timestamp?: string;
  } | null>(null);

  // AI Assist state
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAssistData, setAiAssistData] = useState<{
    code: string;
    explanation: string;
    action: string;
  } | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

  // Switch language and load first template
  const handleLanguageChange = (lang: "javascript" | "python" | "sql") => {
    setLanguage(lang);
    setSelectedSnippetIdx(0);
    setCode(STARTER_SNIPPETS[lang][0].code);
    setExecutionResult(null);
  };

  const handleSnippetSelect = (idx: number) => {
    setSelectedSnippetIdx(idx);
    setCode(STARTER_SNIPPETS[language][idx].code);
  };

  const runCode = async () => {
    setIsRunning(true);
    setExecutionResult(null);

    try {
      const res = await fetch(`${API_BASE}/v1/sandbox/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code }),
      });

      const data = await res.json();
      if (res.ok) {
        setExecutionResult({
          stdout: data.stdout || "",
          stderr: data.stderr || "",
          exitCode: data.exitCode ?? 0,
          latencyMs: data.latencyMs ?? 0,
          timestamp: data.timestamp,
        });
      } else {
        setExecutionResult({
          stdout: "",
          stderr: data.error || "Failed to execute code",
          exitCode: 1,
          latencyMs: 0,
        });
      }
    } catch (err: any) {
      setExecutionResult({
        stdout: "",
        stderr: `Network/API Error: ${err.message || "Server unreachable"}`,
        exitCode: 1,
        latencyMs: 0,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const requestAiAssist = async (action: "fix" | "optimize" | "explain") => {
    setIsAiLoading(true);
    setShowAiModal(true);
    try {
      const res = await fetch(`${API_BASE}/v1/sandbox/ai-assist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code, action }),
      });

      const data = await res.json();
      if (res.ok) {
        setAiAssistData({
          code: data.code,
          explanation: data.explanation,
          action,
        });
      } else {
        setAiAssistData({
          code,
          explanation: `⚠️ AI Assist Error: ${data.error || "Failed to process code"}`,
          action,
        });
      }
    } catch (err: any) {
      setAiAssistData({
        code,
        explanation: `⚠️ Network Error: ${err.message}`,
        action,
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const applyAiCode = () => {
    if (aiAssistData?.code) {
      setCode(aiAssistData.code);
      setShowAiModal(false);
    }
  };

  // Keyboard shortcut Ctrl+Enter or Cmd+Enter to execute
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        runCode();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [code, language]);

  const lineNumbers = code.split("\n").map((_, i) => i + 1);

  return (
    <div className="min-h-screen bg-[#0B0D14] text-white selection:bg-purple-500/30">
      <SiteNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 border-b border-[#252D40] pb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                Live Code Sandbox & In-Browser Runner
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                ACTIVE
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              Write, execute, and AI-optimize JavaScript, Python, and SQL snippets directly in real time.
            </p>
          </div>

          {/* Language selector tabs */}
          <div className="flex items-center bg-[#131722] p-1.5 rounded-xl border border-[#252D40]">
            <button
              onClick={() => handleLanguageChange("javascript")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                language === "javascript"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <span className="text-base">🟨</span> JavaScript
            </button>
            <button
              onClick={() => handleLanguageChange("python")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                language === "python"
                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <span className="text-base">🐍</span> Python 3
            </button>
            <button
              onClick={() => handleLanguageChange("sql")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                language === "sql"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <span className="text-base">🐬</span> SQL Engine
            </button>
          </div>
        </div>

        {/* Main Grid: Code Editor & Terminal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Code Editor (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between bg-[#131722] p-3 rounded-t-xl border border-[#252D40] gap-3">
              {/* Starter Snippets Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Templates:</span>
                <select
                  value={selectedSnippetIdx}
                  onChange={(e) => handleSnippetSelect(Number(e.target.value))}
                  className="bg-[#1A1F2C] text-gray-200 text-xs rounded-md px-2.5 py-1.5 border border-[#252D40] focus:outline-none focus:border-purple-500"
                >
                  {STARTER_SNIPPETS[language].map((snip, idx) => (
                    <option key={idx} value={idx}>
                      {snip.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* AI & Editor Utility Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => requestAiAssist("fix")}
                  className="px-2.5 py-1.5 rounded-md bg-purple-900/30 hover:bg-purple-800/40 text-purple-300 text-xs font-medium border border-purple-500/30 transition-all flex items-center gap-1"
                  title="Auto-fix syntax and runtime errors"
                >
                  ⚡ AI Fix
                </button>
                <button
                  onClick={() => requestAiAssist("optimize")}
                  className="px-2.5 py-1.5 rounded-md bg-blue-900/30 hover:bg-blue-800/40 text-blue-300 text-xs font-medium border border-blue-500/30 transition-all flex items-center gap-1"
                  title="Optimize algorithm performance and memory"
                >
                  🚀 Optimize
                </button>
                <button
                  onClick={() => requestAiAssist("explain")}
                  className="px-2.5 py-1.5 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium border border-gray-700 transition-all flex items-center gap-1"
                  title="Explain code logic"
                >
                  💡 Explain
                </button>
                <button
                  onClick={() => navigator.clipboard.writeText(code)}
                  className="px-2 py-1.5 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium transition-all"
                  title="Copy code"
                >
                  📋
                </button>
              </div>
            </div>

            {/* Editor Input Area */}
            <div className="relative bg-[#0F121A] border-x border-b border-[#252D40] rounded-b-xl overflow-hidden min-h-[380px] flex">
              {/* Line Numbers */}
              <div className="select-none py-4 px-3 bg-[#0A0C12] text-gray-600 font-mono text-xs text-right border-r border-[#1E2536] min-w-[40px]">
                {lineNumbers.map((n) => (
                  <div key={n} className="leading-6">
                    {n}
                  </div>
                ))}
              </div>

              {/* Code Textarea */}
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                className="w-full h-[380px] py-4 px-4 bg-transparent text-gray-100 font-mono text-sm leading-6 resize-none focus:outline-none focus:ring-0 selection:bg-purple-500/30"
                placeholder="Write code here..."
              />
            </div>

            {/* Run Button Bar */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-mono">
                Shortcut: <kbd className="px-1.5 py-0.5 bg-[#1A1F2C] border border-[#252D40] rounded text-gray-400">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-[#1A1F2C] border border-[#252D40] rounded text-gray-400">Enter</kbd>
              </span>

              <button
                onClick={runCode}
                disabled={isRunning}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center gap-2 ${
                  isRunning
                    ? "bg-purple-700/50 text-gray-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-purple-500/20 active:scale-95"
                }`}
              >
                {isRunning ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    Running Code...
                  </>
                ) : (
                  <>
                    <span className="text-lg">▶</span> Run Code
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Live Terminal Execution Console (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-[#131722] rounded-xl border border-[#252D40] overflow-hidden flex flex-col h-full min-h-[480px]">
              {/* Terminal Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#1A1F2C] border-b border-[#252D40]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  <span className="ml-2 text-xs font-mono font-semibold text-gray-300">
                    Terminal Console ({language})
                  </span>
                </div>

                {executionResult && (
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      executionResult.exitCode === 0
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    }`}>
                      EXIT {executionResult.exitCode}
                    </span>
                    <span className="text-gray-400 font-medium">
                      ⏱️ {executionResult.latencyMs}ms
                    </span>
                  </div>
                )}
              </div>

              {/* Terminal Screen Output */}
              <div className="p-4 bg-[#0A0C10] font-mono text-xs flex-1 overflow-y-auto min-h-[360px] text-gray-200">
                {!executionResult && !isRunning && (
                  <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 py-16">
                    <span className="text-4xl mb-3 opacity-40">🖥️</span>
                    <p className="font-sans font-medium text-sm text-gray-400">Ready to execute</p>
                    <p className="font-sans text-xs text-gray-600 max-w-xs mt-1">
                      Click <strong className="text-purple-400">▶ Run Code</strong> or press <kbd className="px-1 bg-[#1A1F2C] border border-[#252D40] rounded text-gray-400">Ctrl+Enter</kbd> to see real-time console output.
                    </p>
                  </div>
                )}

                {isRunning && (
                  <div className="flex items-center gap-2 text-purple-400 animate-pulse py-4">
                    <span>⚡ Executing code in isolated Kyro Sandbox container...</span>
                  </div>
                )}

                {executionResult && (
                  <div className="space-y-3">
                    {/* Stdout */}
                    {executionResult.stdout && (
                      <div>
                        <div className="text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1">
                          --- Standard Output (stdout) ---
                        </div>
                        <pre className="whitespace-pre-wrap text-emerald-400 bg-emerald-950/20 p-3 rounded border border-emerald-900/30">
                          {executionResult.stdout}
                        </pre>
                      </div>
                    )}

                    {/* Stderr */}
                    {executionResult.stderr && (
                      <div>
                        <div className="text-[10px] uppercase font-bold tracking-wider text-rose-500 mb-1">
                          --- Error Output (stderr) ---
                        </div>
                        <pre className="whitespace-pre-wrap text-rose-400 bg-rose-950/20 p-3 rounded border border-rose-900/30">
                          {executionResult.stderr}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Terminal Footer Controls */}
              {executionResult && (
                <div className="flex items-center justify-between p-3 bg-[#131722] border-t border-[#252D40]">
                  <span className="text-[11px] text-gray-500 font-mono">
                    {executionResult.timestamp ? new Date(executionResult.timestamp).toLocaleTimeString() : ""}
                  </span>
                  <button
                    onClick={() => setExecutionResult(null)}
                    className="text-xs text-gray-400 hover:text-white px-2.5 py-1 rounded bg-[#1E2536] hover:bg-[#283248] transition-all"
                  >
                    🧹 Clear Console
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* AI Assist Modal / Side Drawer */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#131722] border border-[#252D40] rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAiModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl"
            >
              ✕
            </button>

            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400 mb-4">
              ⚡ Kyro AI Code Assistant
            </h3>

            {isAiLoading ? (
              <div className="py-12 text-center text-purple-400 animate-pulse flex flex-col items-center">
                <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="font-semibold text-sm">Analyzing code AST & performance patterns...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-[#0D1017] p-4 rounded-xl border border-[#252D40] font-sans text-xs leading-relaxed text-gray-300 whitespace-pre-line">
                  {aiAssistData?.explanation}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    AI Suggested Code:
                  </label>
                  <pre className="bg-[#0A0C10] p-4 rounded-xl border border-[#252D40] text-xs font-mono text-emerald-400 overflow-x-auto max-h-[220px]">
                    {aiAssistData?.code}
                  </pre>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setShowAiModal(false)}
                    className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={applyAiCode}
                    className="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-purple-500/20 transition-all"
                  >
                    ✨ Apply AI Changes to Editor
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
