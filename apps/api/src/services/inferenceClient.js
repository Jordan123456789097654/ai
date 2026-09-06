import { env } from "../config/env.js";

// In-memory cache of live available models from the provider
let cachedProviderModels = null;
let lastModelFetchTime = 0;

const PREFERRED_MODEL_KEYWORDS = [
  "llama-3.3",
  "llama-3.1",
  "llama-3.2",
  "llama3",
  "mixtral",
  "gemma",
  "qwen",
];

/**
 * Dynamically queries the upstream OpenAI-compatible provider (Groq) for
 * its currently active text generation model list, prioritizing standard LLMs.
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
        const allIds = data.data.map((m) => m.id);
        
        // Filter out non-text (audio/whisper/safeguard) models
        const textModels = allIds.filter(
          (id) =>
            !id.toLowerCase().includes("whisper") &&
            !id.toLowerCase().includes("safeguard") &&
            !id.toLowerCase().includes("orpheus") &&
            !id.toLowerCase().includes("guard")
        );

        // Sort by preferred chat LLM keywords
        textModels.sort((a, b) => {
          const scoreA = PREFERRED_MODEL_KEYWORDS.findIndex((k) => a.toLowerCase().includes(k));
          const scoreB = PREFERRED_MODEL_KEYWORDS.findIndex((k) => b.toLowerCase().includes(k));
          const aVal = scoreA === -1 ? 99 : scoreA;
          const bVal = scoreB === -1 ? 99 : scoreB;
          return aVal - bVal;
        });

        cachedProviderModels = textModels.length > 0 ? textModels : allIds;
        lastModelFetchTime = now;
        console.log("[inference] Prioritized live chat models on provider:", cachedProviderModels);
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
  let primaryModel = model || env.inferenceModel || "llama-3.3-70b-versatile";

  // Specialized coding model mapping
  if (primaryModel === "kyro-coder-pro" || primaryModel === "kyro-coder-70b") {
    primaryModel = "qwen-2.5-coder-32b";
  }

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
