import { env } from "../config/env.js";

// ── Key Pool Round-Robin State ─────────────────────────────────────────────
let keyIndex = 0;

/**
 * Returns the next Groq API key from the pool using round-robin rotation.
 * Falls back to the single inferenceApiKey if pool is empty.
 */
function getNextKey() {
  const pool = env.groqKeyPool;
  if (pool.length === 0) return env.inferenceApiKey || null;
  const key = pool[keyIndex % pool.length];
  keyIndex = (keyIndex + 1) % pool.length;
  return key;
}

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
async function fetchAvailableModels(customKey) {
  const now = Date.now();
  if (cachedProviderModels && now - lastModelFetchTime < 300000) {
    return cachedProviderModels;
  }

  const key = customKey || getNextKey();
  try {
    const res = await fetch(`${env.inferenceBaseUrl}/models`, {
      headers: {
        ...(key ? { Authorization: `Bearer ${key}` } : {}),
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
 * Calls the OpenAI-compatible cloud inference provider (Groq) using key pool or custom user key.
 * Rotates to the next available key in the pool on 429 (rate-limit) or 401 (auth error).
 */
export async function callInference({ messages, model, temperature, topP, maxTokens, stream, userApiKey }) {
  let primaryModel = model || env.inferenceModel || "llama-3.3-70b-versatile";

  // Specialized coding model mapping
  if (primaryModel === "kyro-coder-pro" || primaryModel === "kyro-coder-70b") {
    primaryModel = "qwen-2.5-coder-32b";
  }

  const pool = env.groqKeyPool;
  // If user passed a custom Groq API key (e.g. starting with gsk_), prioritize it
  const keyList = userApiKey ? [userApiKey, ...pool] : pool.length > 0 ? pool : [env.inferenceApiKey].filter(Boolean);
  const poolSize = keyList.length || 1;

  let triedKeys = 0;

  while (triedKeys < poolSize) {
    const currentKey = userApiKey && triedKeys === 0 ? userApiKey : getNextKey();
    const keySlot = triedKeys + 1;
    triedKeys++;

    console.log(`[inference] Attempt ${keySlot}/${poolSize} with model ${primaryModel}`);

    let response;
    try {
      response = await makeRequest(primaryModel, { messages, temperature, topP, maxTokens, stream }, currentKey);
    } catch (netErr) {
      console.error(`[inference] Network error connecting to inference gateway:`, netErr.message);
      if (triedKeys < poolSize) continue;
      const err = new Error(`Inference connection failed: ${netErr.message}`);
      err.status = 502;
      throw err;
    }

    // ── 429 Rate Limited: try next key in pool ────────────────────────────
    if (response.status === 429) {
      const retryAfter = response.headers.get("retry-after");
      console.warn(`[inference] Key slot ${keySlot} hit 429 rate limit (${retryAfter ?? "N/A"}s). Trying next key...`);
      if (triedKeys < poolSize) continue;

      const err = new Error(`All ${poolSize} Groq API key(s) are rate-limited (429). Please add more keys via GROQ_API_KEYS.`);
      err.status = 429;
      throw err;
    }

    // ── 401 Unauthorized: key is invalid or expired ───────────────────────
    if (response.status === 401) {
      const bodyText = await response.text().catch(() => "");
      console.warn(`[inference] Key slot ${keySlot} returned 401 Unauthorized: ${bodyText}. Trying next key...`);
      if (triedKeys < poolSize) continue;

      const err = new Error(`Groq API key authentication failed (401 Unauthorized). Please verify GROQ_API_KEYS or INFERENCE_API_KEY in Render. Details: ${bodyText || "Invalid API key"}`);
      err.status = 401;
      throw err;
    }

    // ── Model not found: fall back to live model discovery ───────────────
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
        console.warn(`[inference] Model '${primaryModel}' unavailable. Querying live active models from provider...`);

        const liveModels = await fetchAvailableModels(currentKey);

        for (const liveModel of liveModels) {
          if (liveModel === primaryModel) continue;

          console.log(`[inference] Retrying completion with active live model: '${liveModel}'`);
          const fbResponse = await makeRequest(liveModel, { messages, temperature, topP, maxTokens, stream }, currentKey);
          if (fbResponse.ok) {
            return fbResponse;
          }
        }
      }

      const err = new Error(`Inference server error (${response.status}): ${text || "Provider error"}`);
      err.status = response.status;
      throw err;
    }

    return response;
  }

  const err = new Error("Inference request failed after exhausting all available keys.");
  err.status = 502;
  throw err;
}

async function makeRequest(modelName, { messages, temperature, topP, maxTokens, stream }, apiKey) {
  return fetch(`${env.inferenceBaseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
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

/**
 * Returns sanitized pool diagnostics (key count, current rotation index)
 */
export function getKeyPoolStats() {
  const pool = env.groqKeyPool;
  return {
    totalKeys: pool.length,
    currentIndex: keyIndex % (pool.length || 1),
    rotationStrategy: "round-robin",
    rateLimitRetry: true,
  };
}
