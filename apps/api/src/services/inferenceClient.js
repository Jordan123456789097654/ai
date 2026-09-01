import { env } from "../config/env.js";

/**
 * Calls the self-hosted, OpenAI-compatible inference server (vLLM / TGI /
 * Ollama) and returns the raw fetch Response so the caller can stream its
 * body straight through — the gateway never buffers a full completion in
 * memory when streaming is requested.
 */
export async function callInference({ messages, model, temperature, topP, maxTokens, stream }) {
  const response = await fetch(`${env.inferenceBaseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(env.inferenceApiKey ? { Authorization: `Bearer ${env.inferenceApiKey}` } : {}),
    },
    body: JSON.stringify({
      model: model || env.inferenceModel,
      messages,
      temperature,
      top_p: topP,
      max_tokens: maxTokens,
      stream,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    const err = new Error(`Inference server error (${response.status}): ${text}`);
    err.status = response.status;
    throw err;
  }

  return response;
}
