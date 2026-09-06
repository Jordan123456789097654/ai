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
        {"role": "user", "content": "How do I build a REST API in Node.js?"}
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

const ENDPOINTS = [
  { method: "POST", path: "/v1/chat/completions", desc: "OpenAI-compatible streaming chat completions", auth: "API Key or Session Token" },
  { method: "GET", path: "/v1/models", desc: "List currently active AI model details", auth: "Public" },
  { method: "GET", path: "/me", desc: "Get user account profile, tier, and role", auth: "Session Token" },
  { method: "GET", path: "/keys", desc: "List all developer API keys for current account", auth: "Session Token" },
  { method: "POST", path: "/keys", desc: "Create a new kyro_sk_live_... API key", auth: "Session Token" },
  { method: "DELETE", path: "/keys/:keyId", desc: "Revoke an existing API key", auth: "Session Token" },
  { method: "GET", path: "/keys/:keyId/usage", desc: "Get daily token usage and request analytics", auth: "Session Token" },
  { method: "GET", path: "/health", desc: "System health check (Database & Redis status)", auth: "Public" },
];

const ERROR_ROWS = [
  { code: "401", meaning: "Unauthorized / Missing key", fix: "Provide a valid Authorization: Bearer kyro_sk_live_... header or log in to the web app." },
  { code: "403", meaning: "Forbidden / Suspended", fix: "Account suspended by admin, or non-admin attempting admin endpoint." },
  { code: "429", meaning: "Rate Limit Exceeded", fix: "Exceeded requests/min quota for your tier. Check X-RateLimit-Remaining." },
  { code: "500", meaning: "Server Error", fix: "Internal gateway failure. Check database connection or server logs." },
  { code: "502", meaning: "Upstream Inference Failure", fix: "Cloud AI provider issue or invalid INFERENCE_API_KEY." },
];

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 space-y-14">
      <div>
        <h1 className="font-display text-3xl mb-2">Developer Documentation</h1>
        <p className="text-muted">
          Kyro provides an ultra-fast, OpenAI-compatible API gateway backed by cloud LLM compute.
          Swap `base_url` to your Kyro API endpoint and start building.
        </p>
      </div>

      <section>
        <h2 className="font-display text-xl mb-3">API Base URL</h2>
        <div className="bg-surface border border-border rounded p-4 font-mono text-sm text-accent">
          https://kyro-api-auou.onrender.com/v1
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl mb-3">Quickstart — Python</h2>
        <CodeBlock code={PYTHON_SNIPPET} language="python" />
      </section>

      <section>
        <h2 className="font-display text-xl mb-3">Quickstart — Node.js</h2>
        <CodeBlock code={NODE_SNIPPET} language="javascript" />
      </section>

      <section>
        <h2 className="font-display text-xl mb-3">cURL Request</h2>
        <CodeBlock code={CURL_SNIPPET} language="bash" />
      </section>

      <section>
        <h2 className="font-display text-xl mb-4">REST API Endpoint Reference</h2>
        <div className="border border-border rounded overflow-hidden text-sm">
          <table className="w-full">
            <thead className="bg-surface text-muted text-left">
              <tr>
                <th className="px-4 py-2.5 font-normal">Method</th>
                <th className="px-4 py-2.5 font-normal">Endpoint</th>
                <th className="px-4 py-2.5 font-normal">Description</th>
                <th className="px-4 py-2.5 font-normal">Auth</th>
              </tr>
            </thead>
            <tbody>
              {ENDPOINTS.map((ep) => (
                <tr key={ep.path + ep.method} className="border-t border-border align-top">
                  <td className="px-4 py-3 font-mono text-accent font-semibold">{ep.method}</td>
                  <td className="px-4 py-3 font-mono">{ep.path}</td>
                  <td className="px-4 py-3 text-muted">{ep.desc}</td>
                  <td className="px-4 py-3 text-xs font-mono">{ep.auth}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl mb-4">HTTP Status & Error Codes</h2>
        <div className="border border-border rounded overflow-hidden text-sm">
          <table className="w-full">
            <thead className="bg-surface text-muted text-left">
              <tr>
                <th className="px-4 py-2.5 font-normal">Code</th>
                <th className="px-4 py-2.5 font-normal">Meaning</th>
                <th className="px-4 py-2.5 font-normal">Resolution</th>
              </tr>
            </thead>
            <tbody>
              {ERROR_ROWS.map((row) => (
                <tr key={row.code} className="border-t border-border align-top">
                  <td className="px-4 py-3 font-mono text-accent font-semibold">{row.code}</td>
                  <td className="px-4 py-3">{row.meaning}</td>
                  <td className="px-4 py-3 text-muted">{row.fix}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
