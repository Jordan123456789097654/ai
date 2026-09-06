import { env } from "../config/env.js";

// In-memory cache of live available models from the provider
let cachedProviderModels = null;
let lastModelFetchTime = 0;

/**
 * Dynamically queries the upstream OpenAI-compatible provider (Groq) for
 * its currently active, non-decommissioned model list.
 */
async function fetchAvailableModels() {
  const now = Date.now();
  if (cachedProviderModels && now - lastModelFetchTime < 300000) {
    return cachedProviderModels;
  }

  try {
    const res = await fetch(`${env.inferenceBaseUrl}/models`, {
      headers: {
        ...(env.inferenceApiKey ? { Authorization: `Bearer ${env.inferenceApiKey}` } : {}),
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.data)) {
        cachedProviderModels = data.data.map((m) => m.id);
        lastModelFetchTime = now;
        console.log("[inference] Live models available on provider:", cachedProviderModels);
        return cachedProviderModels;
      }
    }
  } catch (err) {
    console.warn("[inference] Could not fetch live models list from provider:", err.message);
  }

  return [];
}

/**
 * Calls the OpenAI-compatible cloud inference provider (Groq).
 * Dynamically discovers live active models from Groq if a requested model
 * is decommissioned or returns an error.
 */
export async function callInference({ messages, model, temperature, topP, maxTokens, stream }) {
  const primaryModel = model || env.inferenceModel || "llama-3.3-70b-versatile";

  let response = await makeRequest(primaryModel, { messages, temperature, topP, maxTokens, stream });

  if (!response.ok) {
    const text = await response.text().catch(() => "");

    if (
      response.status === 404 ||
      response.status === 400 ||
      text.includes("model_decommissioned") ||
      text.includes("model_not_found") ||
      text.includes("does not exist") ||
      text.includes("do not have access")
    ) {
      console.warn(`[inference] Model '${primaryModel}' unavailable. Querying live models from provider...`);

      const liveModels = await fetchAvailableModels();

      for (const liveModel of liveModels) {
        if (liveModel === primaryModel) continue;

        console.log(`[inference] Retrying completion with active live model: '${liveModel}'`);
        const fbResponse = await makeRequest(liveModel, { messages, temperature, topP, maxTokens, stream });
        if (fbResponse.ok) {
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
