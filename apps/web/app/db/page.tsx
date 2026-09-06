"use client";

import { useState } from "react";
import { Database, Play, Sparkles, Server, Check, AlertCircle, RefreshCw, Table, FileText, ArrowRight } from "lucide-react";

type TableSchema = { name: string; columns: { name: string; type: string }[] };

const SAMPLE_SCHEMAS: TableSchema[] = [
  {
    name: "users",
    columns: [
      { name: "id", type: "uuid (PK)" },
      { name: "email", type: "varchar(255)" },
      { name: "role", type: "enum ('admin', 'user')" },
      { name: "created_at", type: "timestamptz" },
    ],
  },
  {
    name: "api_keys",
    columns: [
      { name: "id", type: "uuid (PK)" },
      { name: "user_id", type: "uuid (FK -> users.id)" },
      { name: "key_prefix", type: "varchar(64)" },
      { name: "rate_limit_override", type: "integer" },
      { name: "created_at", type: "timestamptz" },
    ],
  },
  {
    name: "api_usage_logs",
    columns: [
      { name: "id", type: "uuid (PK)" },
      { name: "api_key_id", type: "uuid (FK -> api_keys.id)" },
      { name: "prompt_tokens", type: "integer" },
      { name: "completion_tokens", type: "integer" },
      { name: "status_code", type: "integer" },
      { name: "timestamp", type: "timestamptz" },
    ],
  },
];

export default function DatabasePage() {
  const [dbType, setDbType] = useState("PostgreSQL");
  const [connectionString, setConnectionString] = useState("postgresql://postgres:pass@localhost:5432/kyro_db");
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const [prompt, setPrompt] = useState("Find total tokens used by each user in the last 7 days with user email");
  const [generatedSql, setGeneratedSql] = useState("");
  const [queryPlan, setQueryPlan] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [queryResults, setQueryResults] = useState<any[] | null>(null);

  function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      setConnected(true);
    }, 1200);
  }

  function generateAndOptimizeSql() {
    if (!prompt.trim()) return;
    setIsGenerating(true);

    setTimeout(() => {
      const sql = `-- Generated & Optimized for PostgreSQL by Kyro AI
SELECT 
  u.id AS user_id,
  u.email,
  COUNT(k.id) AS total_active_keys,
  COALESCE(SUM(l.prompt_tokens + l.completion_tokens), 0) AS total_tokens_used
FROM users u
LEFT JOIN api_keys k ON u.id = k.user_id
LEFT JOIN api_usage_logs l ON k.id = l.api_key_id
WHERE l.timestamp >= NOW() - INTERVAL '7 days'
GROUP BY u.id, u.email
ORDER BY total_tokens_used DESC
LIMIT 50;`;

      const plan = `EXPLAIN ANALYZE Summary:
- Index Scan on api_usage_logs_pkey (cost=0.15..12.45)
- Hash Aggregate (cost=45.10..47.20 rows=50)
- Planning Time: 0.145 ms | Execution Time: 1.240 ms
- Optimization Tip: Composite Index (user_id, created_at) is recommended for >1M records.`;

      const mockData = [
        { user_id: "usr_9012", email: "alex@dev.io", total_active_keys: 4, total_tokens_used: 124500 },
        { user_id: "usr_4102", email: "sarah@startup.com", total_active_keys: 2, total_tokens_used: 89120 },
        { user_id: "usr_1092", email: "jordan@kyro.ai", total_active_keys: 6, total_tokens_used: 41200 },
      ];

      setGeneratedSql(sql);
      setQueryPlan(plan);
      setQueryResults(mockData);
      setIsGenerating(false);
    }, 1000);
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 space-y-10">
      <div className="text-center space-y-3">
        <h1 className="font-display text-3xl text-text flex items-center justify-center gap-2">
          <Database className="text-accent" size={28} /> Direct Database Connection & SQL Optimizer
        </h1>
        <p className="text-muted text-sm max-w-xl mx-auto">
          Connect your PostgreSQL, MySQL, or Supabase databases to inspect schemas, generate optimized SQL, and analyze query execution plans.
        </p>
      </div>

      {/* Connection Bar */}
      <div className="border border-border rounded-lg bg-surface p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Server size={18} className="text-accent" />
            <h2 className="font-display text-lg">Database Connection Settings</h2>
          </div>
          {connected ? (
            <span className="bg-success/10 border border-success/40 text-success text-xs font-mono px-2.5 py-1 rounded flex items-center gap-1">
              <Check size={12} /> Connected & Synchronized
            </span>
          ) : (
            <span className="bg-warning/10 border border-warning/40 text-warning text-xs font-mono px-2.5 py-1 rounded flex items-center gap-1">
              <AlertCircle size={12} /> Disconnected
            </span>
          )}
        </div>

        <form onSubmit={handleConnect} className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-muted mb-1 font-medium">Database Engine</label>
            <select
              value={dbType}
              onChange={(e) => setDbType(e.target.value)}
              className="w-full bg-surface-raised border border-border rounded p-2.5 text-text outline-none focus:border-accent"
            >
              <option value="PostgreSQL">PostgreSQL / Supabase</option>
              <option value="MySQL">MySQL / MariaDB</option>
              <option value="MongoDB">MongoDB</option>
              <option value="SQLite">SQLite</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-muted mb-1 font-medium">Connection URI / Host</label>
            <input
              type="text"
              value={connectionString}
              onChange={(e) => setConnectionString(e.target.value)}
              className="w-full bg-surface-raised border border-border rounded p-2.5 text-text font-mono outline-none focus:border-accent"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={connecting}
              className="w-full py-2.5 bg-accent text-ink font-semibold rounded flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
            >
              {connecting ? <RefreshCw size={14} className="animate-spin" /> : <Database size={14} />}
              {connecting ? "Testing Connection..." : connected ? "Reconnect Database" : "Test & Connect"}
            </button>
          </div>
        </form>
      </div>

      {/* Main Grid: Schema Explorer + SQL AI Assistant */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Table Schemas */}
        <div className="border border-border rounded-lg bg-surface p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Table size={18} className="text-accent" />
            <h3 className="font-display text-lg">Discovered Tables</h3>
          </div>

          <div className="space-y-4 text-xs">
            {SAMPLE_SCHEMAS.map((table) => (
              <div key={table.name} className="border border-border rounded bg-surface-raised p-3 space-y-2">
                <div className="font-mono text-accent font-bold flex items-center gap-1">
                  <span>📄 {table.name}</span>
                </div>
                <div className="space-y-1 font-mono text-[11px] text-muted">
                  {table.columns.map((col) => (
                    <div key={col.name} className="flex justify-between border-b border-border/30 pb-0.5">
                      <span>{col.name}</span>
                      <span className="text-text/70">{col.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: SQL AI Prompt & Optimization Playground */}
        <div className="md:col-span-2 space-y-6">
          <div className="border border-border rounded-lg bg-surface p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-accent" />
                <h3 className="font-display text-lg">AI SQL Query Generator & Performance Optimizer</h3>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <label className="block text-muted font-medium">Describe your data query in plain English:</label>
              <textarea
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Find all users who generated more than 10 API keys and spent >$500 in tokens..."
                className="w-full bg-surface-raised border border-border rounded p-3 text-text outline-none focus:border-accent text-sm"
              />

              <button
                onClick={generateAndOptimizeSql}
                disabled={isGenerating}
                className="w-full py-2.5 bg-accent text-ink font-semibold rounded flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                {isGenerating ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
                {isGenerating ? "Generating & Optimizing SQL Query..." : "Generate & Optimize SQL Query"}
              </button>
            </div>

            {generatedSql && (
              <div className="space-y-4 pt-2 border-t border-border/50">
                <div className="space-y-1">
                  <span className="text-xs font-mono text-accent font-medium">Optimized SQL Query:</span>
                  <pre className="bg-ink border border-border p-3 rounded font-mono text-xs text-text overflow-x-auto whitespace-pre-wrap">
                    {generatedSql}
                  </pre>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-mono text-success font-medium">Query Plan & Execution Benchmarks:</span>
                  <pre className="bg-surface-raised border border-border p-3 rounded font-mono text-[11px] text-muted overflow-x-auto whitespace-pre-wrap">
                    {queryPlan}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Results Table */}
          {queryResults && (
            <div className="border border-border rounded-lg bg-surface p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <FileText size={18} className="text-accent" />
                <h3 className="font-display text-lg">Query Preview Results (3 Rows)</h3>
              </div>

              <div className="border border-border rounded overflow-hidden text-xs">
                <table className="w-full text-left font-mono">
                  <thead className="bg-surface-raised text-muted font-normal">
                    <tr>
                      <th className="p-2.5">User ID</th>
                      <th className="p-2.5">Email</th>
                      <th className="p-2.5">Active Keys</th>
                      <th className="p-2.5">Total Tokens Used</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {queryResults.map((r, i) => (
                      <tr key={i} className="hover:bg-surface-raised/40">
                        <td className="p-2.5 text-accent">{r.user_id}</td>
                        <td className="p-2.5 text-text">{r.email}</td>
                        <td className="p-2.5 text-muted">{r.total_active_keys}</td>
                        <td className="p-2.5 text-success font-bold">{r.total_tokens_used.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
