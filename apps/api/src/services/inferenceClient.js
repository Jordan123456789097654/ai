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

/**
 * Returns the key at a specific index (for retry-with-next-key logic).
 * Wraps around safely.
 */
function getKeyAtIndex(idx) {
  const pool = env.groqKeyPool;
  if (pool.length === 0) return env.inferenceApiKey || null;
  return pool[idx % pool.length];
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
async function fetchAvailableModels() {
  const now = Date.now();
  if (cachedProviderModels && now - lastModelFetchTime < 300000) {
    return cachedProviderModels;
  }

  const key = getNextKey();
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
 * Calls the OpenAI-compatible cloud inference provider (Groq) using the
 * next key in the round-robin pool.
 *
 * On 429 (rate limited), automatically retries with successive keys in the
 * pool until all keys have been tried or a success is received.
 *
 * On 404/400 model errors, falls back to a live-discovered model.
 */
export async function callInference({ messages, model, temperature, topP, maxTokens, stream }) {
  let primaryModel = model || env.inferenceModel || "llama-3.3-70b-versatile";

  // Specialized coding model mapping
  if (primaryModel === "kyro-coder-pro" || primaryModel === "kyro-coder-70b") {
    primaryModel = "qwen-2.5-coder-32b";
  }

  const pool = env.groqKeyPool;
  const poolSize = pool.length || 1; // at least 1 attempt even with single/no key

  // ── Round-robin + 429 retry across all keys ──────────────────────────────
  // Record the starting key index so we know when we've lapped the full pool
  const startingIndex = keyIndex;
  let triedKeys = 0;

  while (triedKeys < poolSize) {
    const currentKey = getNextKey();
    const keySlot = triedKeys + 1; // 1-based for logging
    triedKeys++;

    console.log(`[inference] Attempt ${keySlot}/${poolSize} — key slot ${keyIndex === 0 ? poolSize : keyIndex}/${poolSize}`);

    let response = await makeRequest(primaryModel, { messages, temperature, topP, maxTokens, stream }, currentKey);

    // ── 429 Rate Limited: try next key in pool ────────────────────────────
    if (response.status === 429) {
      const retryAfter = response.headers.get("retry-after");
      console.warn(`[inference] Key slot ${keySlot} hit 429 rate limit (retry-after: ${retryAfter ?? "N/A"}s). Rotating to next key...`);
      if (triedKeys < poolSize) continue; // loop to next key

      // All keys exhausted — return the 429 to surface the real error
      const err = new Error(`All ${poolSize} Groq API key(s) are rate-limited (429). Add more keys via GROQ_API_KEYS.`);
      err.status = 429;
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
        console.warn(`[inference] Model '${primaryModel}' unavailable. Querying live models from provider...`);

        const liveModels = await fetchAvailableModels();

        for (const liveModel of liveModels) {
          if (liveModel === primaryModel) continue;

          console.log(`[inference] Retrying completion with active live model: '${liveModel}'`);
          // Reuse the same key that just worked for the models list
          const fbResponse = await makeRequest(liveModel, { messages, temperature, topP, maxTokens, stream }, currentKey);
          if (fbResponse.ok) {
            return fbResponse;
          }
        }
      }

      const err = new Error(`Inference server error (${response.status}): ${await response.text().catch(() => "")}`);
      err.status = response.status;
      throw err;
    }

    return response;
  }

  // Should not normally reach here
  const err = new Error("Inference request failed after exhausting all retry strategies.");
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
 * without exposing actual key values — safe to surface in admin endpoints.
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
