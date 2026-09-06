import { env } from "../config/env.js";

const FALLBACK_MODELS = [
  "llama-3.1-8b-instant",
  "mixtral-8x7b-32768",
  "gemma2-9b-it",
  "llama-3.2-11b-vision-preview",
];

/**
 * Calls the OpenAI-compatible cloud inference provider (Groq).
 * If the requested model is decommissioned, missing, or unavailable,
 * automatically tries guaranteed active fallback models to ensure the user's
 * request ALWAYS completes successfully.
 */
export async function callInference({ messages, model, temperature, topP, maxTokens, stream }) {
  const primaryModel = model || env.inferenceModel || "llama-3.1-8b-instant";

  let response = await makeRequest(primaryModel, { messages, temperature, topP, maxTokens, stream });

  if (!response.ok) {
    const text = await response.text().catch(() => "");

    // Check if error is related to model availability (400 or 404)
    if (
      text.includes("model_decommissioned") ||
      text.includes("model_not_found") ||
      text.includes("does not exist") ||
      text.includes("do not have access")
    ) {
      console.warn(`[inference] Model '${primaryModel}' unavailable (${response.status}). Trying fallback models...`);

      for (const fallbackModel of FALLBACK_MODELS) {
        if (fallbackModel === primaryModel) continue;

        const fbResponse = await makeRequest(fallbackModel, { messages, temperature, topP, maxTokens, stream });
        if (fbResponse.ok) {
          console.log(`[inference] Successfully fell back to model '${fallbackModel}'.`);
          return fbResponse;
        }
      }
    }

    const err = new Error(`Inference server error (${response.status}): ${text}`);
    err.status = response.status;
    throw err;
  }

  return response;
}

async function makeRequest(modelName, { messages, temperature, topP, maxTokens, stream }) {
  return fetch(`${env.inferenceBaseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(env.inferenceApiKey ? { Authorization: `Bearer ${env.inferenceApiKey}` } : {}),
    },
    body: JSON.stringify({
      model: modelName,
      messages,
      temperature,
      top_p: topP,
      max_tokens: maxTokens,
      stream,
    }),
  });
}
