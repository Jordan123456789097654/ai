import "dotenv/config";

// ── Groq Multi-Key Pool ────────────────────────────────────────────────────
// Accepts GROQ_API_KEYS as a comma-separated list of keys, falling back to
// the legacy single-key INFERENCE_API_KEY.  Keys are deduplicated and
// round-robined across every inference request so each key's per-minute
// rate-limit budget is shared evenly across your key pool.
function parseGroqKeyPool() {
  const multiKeyVar = process.env.GROQ_API_KEYS || "";
  const singleKey = process.env.INFERENCE_API_KEY || "";

  const poolFromMulti = multiKeyVar
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  const pool = poolFromMulti.length > 0 ? poolFromMulti : singleKey ? [singleKey] : [];

  // Deduplicate
  return [...new Set(pool)];
}

export const env = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || "development",

  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",

  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  supabaseJwtSecret: process.env.SUPABASE_JWT_SECRET,

  inferenceBaseUrl: process.env.INFERENCE_BASE_URL || "http://localhost:8000/v1",
  inferenceModel: process.env.INFERENCE_MODEL || "mistralai/Mistral-7B-Instruct-v0.3",

  // Single key kept for backwards compatibility (used if GROQ_API_KEYS not set)
  inferenceApiKey: process.env.INFERENCE_API_KEY || "",

  // Multi-key pool — resolved at startup
  groqKeyPool: parseGroqKeyPool(),

  apiKeyPrefix: process.env.API_KEY_PREFIX || "kyro_sk_live_",

  // Custom auth email delivery (replaces Supabase Auth's built-in mailer)
  resendApiKey: process.env.RESEND_API_KEY,
  emailFrom: process.env.EMAIL_FROM || "Kyro <onboarding@resend.dev>",
  appUrl: process.env.APP_URL || "http://localhost:3000",

  rateLimits: {
    free: Number(process.env.RATE_LIMIT_FREE || 20),
    pro: Number(process.env.RATE_LIMIT_PRO || 120),
    enterprise: Number(process.env.RATE_LIMIT_ENTERPRISE || 1000),
    // Unauthenticated visitors on the web chat — no account at all. Kept
    // tight since it's keyed by IP and has no account behind it to suspend.
    guest: Number(process.env.RATE_LIMIT_GUEST || 8),
  },
};
