import { env } from "../config/env.js";

/**
 * Calls the OpenAI-compatible cloud inference provider (Groq).
 * If the requested model ID fails with a 404 (model_not_found due to provider renaming),
 * automatically falls back to 'llama-3.1-8b-instant' or 'llama3-70b-8192' to guarantee a successful completion.
 */
export async function callInference({ messages, model, temperature, topP, maxTokens, stream }) {
  const primaryModel = model || env.inferenceModel || "llama-3.1-8b-instant";

  let response = await makeRequest(primaryModel, { messages, temperature, topP, maxTokens, stream });

  // If primary model returned 404 (model_not_found), try fallback models
  if (response.status === 404) {
    const text = await response.text().catch(() => "");
    if (text.includes("model_not_found") || text.includes("does not exist")) {
      const fallbackModel = primaryModel.includes("70b") ? "llama3-70b-8192" : "llama-3.1-8b-instant";
      console.warn(`[inference] Model '${primaryModel}' not found on provider. Falling back to '${fallbackModel}'.`);

      response = await makeRequest(fallbackModel, { messages, temperature, topP, maxTokens, stream });
    } else {
      const err = new Error(`Inference server error (${response.status}): ${text}`);
      err.status = response.status;
      throw err;
    }
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
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
