import CodeBlock from "../../components/CodeBlock";

const PYTHON_SNIPPET = `from openai import OpenAI

client = OpenAI(
    base_url="https://api.kyro.com/v1",
    api_key="kyro_sk_live_...",
)

response = client.chat.completions.create(
    model="kyro-default",
    messages=[{"role": "user", "content": "Explain token buckets."}],
    stream=True,
)

for chunk in response:
    print(chunk.choices[0].delta.content or "", end="")`;

const NODE_SNIPPET = `import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.kyro.com/v1",
  apiKey: "kyro_sk_live_...",
});

const stream = await client.chat.completions.create({
  model: "kyro-default",
  messages: [{ role: "user", content: "Explain token buckets." }],
  stream: true,
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || "");
}`;

const CURL_SNIPPET = `curl https://api.kyro.com/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer kyro_sk_live_..." \\
  -d '{
    "model": "kyro-default",
    "messages": [{"role": "user", "content": "Hello, Kyro"}],
    "stream": false
  }'`;

const ERROR_ROWS = [
  { code: "401", meaning: "Missing or invalid API key", fix: "Check the key is active in the developer portal and sent as Authorization: Bearer kyro_sk_live_..." },
  { code: "403", meaning: "Account suspended", fix: "Contact support — the account behind this key has been suspended by an admin." },
  { code: "429", meaning: "Rate limit exceeded", fix: "Back off using the X-RateLimit-Remaining header, or request a tier upgrade." },
  { code: "500", meaning: "Unexpected server-side error", fix: "Something failed on Kyro's side outside the normal error paths (e.g. a database or config issue). Retry once; if it persists, contact support with the request timestamp." },
  { code: "502", meaning: "Inference server unavailable", fix: "Transient upstream issue — retry with backoff." },
];

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-14">
      <div>
        <h1 className="font-display text-3xl mb-2">Developer documentation</h1>
        <p className="text-muted">
          Kyro's API is OpenAI-compatible. If you already use the OpenAI SDK, change two lines
          and you're calling your own infrastructure.
        </p>
      </div>

      <section>
        <h2 className="font-display text-xl mb-3">Quickstart — Python</h2>
        <CodeBlock code={PYTHON_SNIPPET} language="python" />
      </section>

      <section>
        <h2 className="font-display text-xl mb-3">Quickstart — Node.js</h2>
        <CodeBlock code={NODE_SNIPPET} language="javascript" />
      </section>

      <section>
        <h2 className="font-display text-xl mb-3">cURL</h2>
        <CodeBlock code={CURL_SNIPPET} language="bash" />
      </section>

      <section>
        <h2 className="font-display text-xl mb-3">Interactive reference</h2>
        <p className="text-muted mb-3">
          Full request/response schemas, generated from the live OpenAPI spec, are at{" "}
          <code className="font-mono text-signal">/docs</code> on the API gateway itself
          (Swagger UI) — separate from this page.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl mb-4">Error codes</h2>
        <div className="border border-border rounded overflow-hidden text-sm">
          <table className="w-full">
            <thead className="bg-surface text-muted text-left">
              <tr>
                <th className="px-4 py-2.5 font-normal">Code</th>
                <th className="px-4 py-2.5 font-normal">Meaning</th>
                <th className="px-4 py-2.5 font-normal">What to do</th>
              </tr>
            </thead>
            <tbody>
              {ERROR_ROWS.map((row) => (
                <tr key={row.code} className="border-t border-border align-top">
                  <td className="px-4 py-3 font-mono text-accent">{row.code}</td>
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
