import "dotenv/config";

// ── Groq Multi-Key Pool ────────────────────────────────────────────────────
// Accepts GROQ_API_KEYS as a comma-separated list of keys, falling back to
// INFERENCE_API_KEY.  Automatically filters out empty values and placeholder
// strings (e.g. 'YOUR_GROQ_API_KEY').
function parseGroqKeyPool() {
  const multiKeyVar = process.env.GROQ_API_KEYS || "";
  const singleKey = process.env.INFERENCE_API_KEY || "";

  const rawList = [
    ...multiKeyVar.split(","),
    singleKey,
  ];

  const validKeys = rawList
    .map((k) => k.trim())
    .filter((k) => k && !k.toUpperCase().includes("YOUR_GROQ"));

  return [...new Set(validKeys)];
}

export const env = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || "development",

  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",

  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  supabaseJwtSecret: process.env.SUPABASE_JWT_SECRET,

  inferenceBaseUrl: process.env.INFERENCE_BASE_URL || "https://api.groq.com/openai/v1",
  inferenceModel: process.env.INFERENCE_MODEL || "llama-3.3-70b-versatile",

  inferenceApiKey: process.env.INFERENCE_API_KEY || "",

  // Multi-key pool — resolved at startup with placeholder filtering
  groqKeyPool: parseGroqKeyPool(),

  apiKeyPrefix: process.env.API_KEY_PREFIX || "kyro_sk_live_",

  // Custom auth email delivery
  resendApiKey: process.env.RESEND_API_KEY,
  emailFrom: process.env.EMAIL_FROM || "Kyro <onboarding@resend.dev>",
  appUrl: process.env.APP_URL || "http://localhost:3000",

  rateLimits: {
    free: Number(process.env.RATE_LIMIT_FREE || 20),
    pro: Number(process.env.RATE_LIMIT_PRO || 120),
    enterprise: Number(process.env.RATE_LIMIT_ENTERPRISE || 1000),
    guest: Number(process.env.RATE_LIMIT_GUEST || 8),
  },
};
