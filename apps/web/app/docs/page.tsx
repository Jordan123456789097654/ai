"use client";

import { useState } from "react";
import CodeBlock from "../../components/CodeBlock";

const PYTHON_SNIPPET = `from openai import OpenAI

# Initialize client pointing to your Kyro deployment
client = OpenAI(
    base_url="https://kyro-api-auou.onrender.com/v1",
    api_key="kyro_sk_live_...",
)

# Call Kyro Chat Completions API
response = client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    messages=[
        {"role": "system", "content": "You are a helpful coding assistant."},
        {"role": "user", "content": "How do I build a high-performance REST API in Node.js?"}
    ],
    stream=True,
)

for chunk in response:
    print(chunk.choices[0].delta.content or "", end="")`;

const NODE_SNIPPET = `import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://kyro-api-auou.onrender.com/v1",
  apiKey: "kyro_sk_live_...",
});

const stream = await client.chat.completions.create({
  model: "llama-3.3-70b-versatile",
  messages: [{ role: "user", content: "Explain token bucket rate limiting." }],
  stream: true,
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || "");
}`;

const CURL_SNIPPET = `curl https://kyro-api-auou.onrender.com/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer kyro_sk_live_..." \\
  -d '{
    "model": "llama-3.3-70b-versatile",
    "messages": [{"role": "user", "content": "Hello, Kyro!"}],
    "stream": false
  }'`;

const GO_SNIPPET = `package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

func main() {
	url := "https://kyro-api-auou.onrender.com/v1/chat/completions"
	payload := map[string]interface{}{
		"model": "llama-3.3-70b-versatile",
		"messages": []map[string]string{
			{"role": "user", "content": "Hello from Go!"},
		},
		"stream": false,
	}
	body, _ := json.Marshal(payload)

	req, _ := http.NewRequest("POST", url, bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer kyro_sk_live_...")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	fmt.Println(string(respBody))
}`;

const RUST_SNIPPET = `use reqwest::header::{HeaderMap, HeaderValue, CONTENT_TYPE, AUTHORIZATION};
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std.error::Error>> {
    let client = reqwest::Client::new();
    let mut headers = HeaderMap::new();
    headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));
    headers.insert(AUTHORIZATION, HeaderValue::from_str("Bearer kyro_sk_live_...")?);

    let body = json!({
        "model": "llama-3.3-70b-versatile",
        "messages": [{"role": "user", "content": "Hello from Rust!"}],
        "stream": false
    });

    let res = client.post("https://kyro-api-auou.onrender.com/v1/chat/completions")
        .headers(headers)
        .json(&body)
        .send()
        .await?;

    println!("{}", res.text().await?);
    Ok(())
}`;

const ENDPOINTS = [
  { method: "POST", path: "/v1/chat/completions", desc: "OpenAI-compatible streaming chat completions", auth: "API Key / Bearer Token" },
  { method: "GET", path: "/v1/models", desc: "List currently active AI model details", auth: "Public" },
  { method: "POST", path: "/v1/sandbox/execute", desc: "Execute JS, Python 3, or SQL code snippets in sandbox", auth: "Public" },
  { method: "POST", path: "/v1/sandbox/ai-assist", desc: "AI code fix, optimization & explanation assistant", auth: "Public" },
  { method: "GET", path: "/me", desc: "Get user account profile, tier, and role", auth: "Session Token" },
  { method: "GET", path: "/keys", desc: "List all developer API keys for current account", auth: "Session Token" },
  { method: "POST", path: "/keys", desc: "Create a new API key with custom scopes & expiration", auth: "Session Token" },
  { method: "DELETE", path: "/keys/:keyId", desc: "Revoke an existing API key", auth: "Session Token" },
  { method: "GET", path: "/admin/groq-pool", desc: "Inspect Groq multi-key pool health & rotation state", auth: "Admin Session" },
  { method: "GET", path: "/health", desc: "System health check (Database, Redis, Uptime)", auth: "Public" },
];

const TIERS = [
  { name: "Free Tier", limit: "20 req/min", price: "$0 / mo", features: "Access to Kyro Flash & Ultra, basic support" },
  { name: "Pro Tier", limit: "120 req/min", price: "$29 / mo", features: "High concurrency, priority inference, 7d/30d key expiration" },
  { name: "Enterprise", limit: "1,000 req/min", price: "Custom", features: "Custom rate limits, dedicated infrastructure, SLA" },
];

const ERROR_ROWS = [
  { code: "401", meaning: "Unauthorized / Invalid Key / Expired", fix: "Check Authorization header (Bearer kyro_sk_live_...) or verify GROQ_API_KEYS." },
  { code: "403", meaning: "Forbidden / Account Suspended", fix: "Account suspended by administrator or non-admin attempting admin routes." },
  { code: "429", meaning: "Rate Limit Exceeded", fix: "Exceeded requests/min quota for your tier. Check X-RateLimit-Remaining header." },
  { code: "500", meaning: "Internal Gateway Error", fix: "Database or Redis cluster issue. Retry after exponential backoff." },
  { code: "502", meaning: "Upstream Inference Provider Error", fix: "Cloud AI provider issue or unconfigured GROQ_API_KEYS." },
];

export default function DocsPage() {
  const [activeLang, setActiveLang] = useState<"python" | "node" | "curl" | "go" | "rust">("python");

  const SNIPPETS = {
    python: { code: PYTHON_SNIPPET, lang: "python" },
    node: { code: NODE_SNIPPET, lang: "javascript" },
    curl: { code: CURL_SNIPPET, lang: "bash" },
    go: { code: GO_SNIPPET, lang: "go" },
    rust: { code: RUST_SNIPPET, lang: "rust" },
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 space-y-14">
      <div>
        <h1 className="font-display text-3xl mb-2">Developer Documentation</h1>
        <p className="text-muted">
          Kyro provides an ultra-fast, OpenAI-compatible API gateway backed by cloud LLM compute.
          Swap <code className="text-accent bg-surface px-1 py-0.5 rounded">base_url</code> to your Kyro API endpoint and start building.
        </p>
      </div>

      <section>
        <h2 className="font-display text-xl mb-3">API Base URL</h2>
        <div className="bg-surface border border-border rounded p-4 font-mono text-sm text-accent flex items-center justify-between">
          <span>https://kyro-api-auou.onrender.com/v1</span>
          <span className="text-xs text-muted font-sans bg-surface-raised border border-border px-2 py-1 rounded">HTTPS Required</span>
        </div>
      </section>

      {/* Code Quickstart Tabs */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl">Quickstart Code Integration</h2>
          <div className="flex bg-surface border border-border rounded overflow-hidden text-xs">
            {(["python", "node", "curl", "go", "rust"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveLang(lang)}
                className={`px-3 py-1.5 capitalize font-mono ${
                  activeLang === lang ? "bg-accent text-ink font-semibold" : "text-muted hover:text-text"
                }`}
              >
                {lang === "node" ? "Node.js" : lang}
              </button>
            ))}
          </div>
        </div>
        <CodeBlock code={SNIPPETS[activeLang].code} language={SNIPPETS[activeLang].lang} />
      </section>

      {/* Model Specifications & Benchmarks */}
      <section>
        <h2 className="font-display text-xl mb-4">Supported AI Models & Upstream Engine Mapping</h2>
        <div className="border border-border rounded overflow-hidden text-sm">
          <table className="w-full text-left">
            <thead className="bg-surface text-muted text-xs">
              <tr>
                <th className="px-4 py-2.5 font-normal">Model ID</th>
                <th className="px-4 py-2.5 font-normal">Upstream Target Engine</th>
                <th className="px-4 py-2.5 font-normal">Context Window</th>
                <th className="px-4 py-2.5 font-normal">Avg Speed</th>
                <th className="px-4 py-2.5 font-normal">Primary Specialization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr className="hover:bg-surface-raised/40">
                <td className="px-4 py-3 font-mono font-semibold text-accent">kyro-ultra-70b</td>
                <td className="px-4 py-3 font-mono text-xs text-text">Llama 3.3 70B Versatile</td>
                <td className="px-4 py-3 text-xs font-mono text-muted">128,000 tokens</td>
                <td className="px-4 py-3 text-xs font-mono text-success">~290 tok/s</td>
                <td className="px-4 py-3 text-xs text-muted">Complex reasoning, logic, architecture & deep chat</td>
              </tr>
              <tr className="hover:bg-surface-raised/40">
                <td className="px-4 py-3 font-mono font-semibold text-accent">kyro-coder-pro</td>
                <td className="px-4 py-3 font-mono text-xs text-text">Llama 3.3 70B Versatile</td>
                <td className="px-4 py-3 text-xs font-mono text-muted">128,000 tokens</td>
                <td className="px-4 py-3 text-xs font-mono text-success">~420 tok/s</td>
                <td className="px-4 py-3 text-xs text-muted">Full-stack coding, unit tests, refactoring & sandbox</td>
              </tr>
              <tr className="hover:bg-surface-raised/40">
                <td className="px-4 py-3 font-mono font-semibold text-accent">kyro-flash-8b</td>
                <td className="px-4 py-3 font-mono text-xs text-text">Llama 3.1 8B Instant</td>
                <td className="px-4 py-3 text-xs font-mono text-muted">128,000 tokens</td>
                <td className="px-4 py-3 text-xs font-mono text-success">~680 tok/s</td>
                <td className="px-4 py-3 text-xs text-muted">Ultra-fast real-time completions & autocomplete</td>
              </tr>
              <tr className="hover:bg-surface-raised/40">
                <td className="px-4 py-3 font-mono font-semibold text-accent">deepseek-r1-distill-llama-70b</td>
                <td className="px-4 py-3 font-mono text-xs text-text">DeepSeek R1 Reasoning 70B</td>
                <td className="px-4 py-3 text-xs font-mono text-muted">128,000 tokens</td>
                <td className="px-4 py-3 text-xs font-mono text-success">~320 tok/s</td>
                <td className="px-4 py-3 text-xs text-muted">Step-by-step chain-of-thought mathematical reasoning</td>
              </tr>
              <tr className="hover:bg-surface-raised/40">
                <td className="px-4 py-3 font-mono font-semibold text-accent">qwen-qwq-32b</td>
                <td className="px-4 py-3 font-mono text-xs text-text">Qwen QwQ 32B Reasoning</td>
                <td className="px-4 py-3 text-xs font-mono text-muted">32,768 tokens</td>
                <td className="px-4 py-3 text-xs font-mono text-success">~450 tok/s</td>
                <td className="px-4 py-3 text-xs text-muted">Algorithmic problem solving & logic synthesis</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Multi-Key Pool & High Availability */}
      <section className="border border-border rounded-lg bg-surface p-6 space-y-3">
        <h2 className="font-display text-xl">Multi-Key Groq Pool & High Availability</h2>
        <p className="text-sm text-muted">
          Kyro uses a round-robin multi-key pool (<code className="text-accent bg-surface-raised px-1 py-0.5 rounded">GROQ_API_KEYS</code>) with automatic 429 (rate-limit) and 401 (auth) failover rotation. Requests are distributed across all configured keys to maximize per-minute token throughput.
        </p>
        <p className="text-sm text-muted">
          Admin API keys and Admin role sessions automatically bypass token-bucket rate limits (<code className="text-accent bg-surface-raised px-1 py-0.5 rounded">X-RateLimit-Limit: unlimited</code>) and secret redaction filters.
        </p>
      </section>

      {/* Rate Limits & Tiers */}
      <section>
        <h2 className="font-display text-xl mb-4">Rate Limits & Quota Tiers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TIERS.map((tier) => (
            <div key={tier.name} className="border border-border bg-surface rounded p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-text">{tier.name}</span>
                <span className="text-xs font-mono text-accent font-bold">{tier.price}</span>
              </div>
              <p className="text-xs font-mono text-success">{tier.limit}</p>
              <p className="text-xs text-muted">{tier.features}</p>
            </div>
          ))}
        </div>
      </section>

      {/* API Endpoint Reference */}
      <section className="space-y-4">
        <h2 className="font-display text-xl">API Endpoint Reference</h2>
        <div className="border border-border rounded overflow-hidden text-sm">
          <table className="w-full text-left">
            <thead className="bg-surface text-muted text-xs">
              <tr>
                <th className="px-4 py-2.5 font-normal">Method</th>
                <th className="px-4 py-2.5 font-normal">Endpoint Path</th>
                <th className="px-4 py-2.5 font-normal">Description</th>
                <th className="px-4 py-2.5 font-normal">Authentication</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-mono text-xs">
              {ENDPOINTS.map((ep) => (
                <tr key={ep.path} className="hover:bg-surface-raised/40">
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded font-bold ${ep.method === "POST" ? "bg-accent/20 text-accent" : ep.method === "DELETE" ? "bg-danger/20 text-danger" : "bg-success/20 text-success"}`}>
                      {ep.method}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text">{ep.path}</td>
                  <td className="px-4 py-3 font-sans text-muted">{ep.desc}</td>
                  <td className="px-4 py-3 font-sans text-muted">{ep.auth}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* HTTP Status Code Reference */}
      <section className="space-y-4">
        <h2 className="font-display text-xl">HTTP Status Codes & Diagnostics</h2>
        <div className="border border-border rounded overflow-hidden text-sm">
          <table className="w-full text-left">
            <thead className="bg-surface text-muted text-xs">
              <tr>
                <th className="px-4 py-2.5 font-normal">HTTP Code</th>
                <th className="px-4 py-2.5 font-normal">Meaning & Cause</th>
                <th className="px-4 py-2.5 font-normal">Resolution Step</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {ERROR_ROWS.map((err) => (
                <tr key={err.code} className="hover:bg-surface-raised/40">
                  <td className="px-4 py-3 font-mono font-bold text-accent">{err.code}</td>
                  <td className="px-4 py-3 text-text">{err.meaning}</td>
                  <td className="px-4 py-3 text-muted">{err.fix}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
