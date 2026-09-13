import { env } from "../config/env.js";

// ── Key Pool Round-Robin State ─────────────────────────────────────────────
let keyIndex = 0;

/**
 * Returns the next Groq API key from the pool using round-robin rotation.
 * Falls back to single inferenceApiKey if pool is empty.
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

/**
 * Dynamically queries the upstream provider for its currently active text generation model list.
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

        // Filter out audio / whisper / safeguard models
        const textModels = allIds.filter(
          (id) =>
            !id.toLowerCase().includes("whisper") &&
            !id.toLowerCase().includes("safeguard") &&
            !id.toLowerCase().includes("orpheus") &&
            !id.toLowerCase().includes("guard")
        );

        if (textModels.length > 0) {
          cachedProviderModels = textModels;
          lastModelFetchTime = now;
          console.log("[inference] Active live models on provider:", cachedProviderModels);
          return cachedProviderModels;
        }
      }
    }
  } catch (err) {
    console.warn("[inference] Could not fetch live models list from provider:", err.message);
  }

  return ["groq/compound", "llama-3.3-70b-versatile", "llama-3.1-8b-instant"];
}

/** Maps Kyro model requests to active live models on the provider */
async function resolveModelToUse(requestedModel, customKey) {
  const liveModels = await fetchAvailableModels(customKey);

  if (!liveModels || liveModels.length === 0) {
    return "llama-3.3-70b-versatile";
  }

  // 1. Exact match in live models
  if (requestedModel && liveModels.includes(requestedModel)) {
    return requestedModel;
  }

  const norm = (requestedModel || "").toLowerCase().trim();

  // 2. Keyword matching against live models list
  if (norm.includes("fast") || norm.includes("flash") || norm.includes("mini") || norm.includes("8b")) {
    const fastMatch = liveModels.find((m) => m.includes("mini") || m.includes("8b") || m.includes("fast") || m.includes("instant"));
    if (fastMatch) return fastMatch;
  }

  // 3. Ultra / Pro / Default matching
  const preferredMatch = liveModels.find(
    (m) =>
      m.includes("compound") ||
      m.includes("llama-3.3") ||
      m.includes("70b") ||
      m.includes("120b") ||
      m.includes("qwen") ||
      m.includes("gpt")
  );

  return preferredMatch || liveModels[0];
}

/**
 * Calls the OpenAI-compatible cloud inference provider using key pool or custom user key.
 * Rotates to the next available key in the pool on 429 (rate-limit) or 401 (auth error).
 * Automatically fails over to active live models if the primary model returns 400/404.
 */
export async function callInference({ messages, model, temperature, topP, maxTokens, stream, userApiKey }) {
  const pool = env.groqKeyPool;
  const keyList = userApiKey ? [userApiKey, ...pool] : pool.length > 0 ? pool : [env.inferenceApiKey].filter(Boolean);
  const poolSize = keyList.length || 1;

  let triedKeys = 0;

  while (triedKeys < poolSize) {
    const currentKey = userApiKey && triedKeys === 0 ? userApiKey : getNextKey();
    const keySlot = triedKeys + 1;
    triedKeys++;

    // Dynamically resolve target model against provider's live supported models
    const primaryModel = await resolveModelToUse(model || env.inferenceModel, currentKey);

    console.log(`[inference] Attempt ${keySlot}/${poolSize} using target model '${primaryModel}' (requested: '${model}')`);

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

    // ── Model not found / 400 / 404: automatic live model failover ─────────
    if (!response.ok) {
      const bodyText = await response.text().catch(() => "");

      if (
        response.status === 404 ||
        response.status === 400 ||
        bodyText.includes("decommissioned") ||
        bodyText.includes("model_not_found") ||
        bodyText.includes("does not exist") ||
        bodyText.includes("do not have access")
      ) {
        console.warn(`[inference] Model '${primaryModel}' unavailable (${bodyText}). Querying live active models...`);

        // Reset cached models to force fresh lookup
        cachedProviderModels = null;
        const liveModels = await fetchAvailableModels(currentKey);

        for (const liveModel of liveModels) {
          if (liveModel === primaryModel) continue;

          console.log(`[inference] Retrying completion with active live model: '${liveModel}'`);
          const fbResponse = await makeRequest(liveModel, { messages, temperature, topP, maxTokens, stream }, currentKey);
          if (fbResponse.ok) {
            return fbResponse;
          } else {
            const fbErrText = await fbResponse.text().catch(() => "");
            console.warn(`[inference] Fallback model '${liveModel}' returned HTTP ${fbResponse.status}: ${fbErrText}`);
          }
        }
      }

      const err = new Error(`Inference server error (${response.status}): ${bodyText || "Provider error"}`);
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
