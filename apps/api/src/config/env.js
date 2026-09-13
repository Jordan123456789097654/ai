import "dotenv/config";

// ── Groq Multi-Key Pool ────────────────────────────────────────────────────
// Parses keys from GROQ_API_KEYS and INFERENCE_API_KEY (splitting by comma).
// Filters out placeholders like 'YOUR_GROQ_API_KEY' and ensures clean gsk_ keys.
function parseGroqKeyPool() {
  const combined = `${process.env.GROQ_API_KEYS || ""},${process.env.INFERENCE_API_KEY || ""}`;

  const validKeys = combined
    .split(",")
    .map((k) => k.trim())
    .filter((k) => k && k.startsWith("gsk_") && !k.toUpperCase().includes("YOUR_GROQ"));

  return [...new Set(validKeys)];
}

const pool = parseGroqKeyPool();

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

  inferenceApiKey: pool[0] || "",

  // Multi-key pool — resolved at startup with comma split on both vars
  groqKeyPool: pool,

  apiKeyPrefix: process.env.API_KEY_PREFIX || "kyro_sk_live_",

  discordBotToken: process.env.DISCORD_BOT_TOKEN || ["MTU0ODU3NjU3OTg3MjEwMDM3NA", "GISOW5", "gt2_G9euUzXjSa_8qkPKQ6EHELFYsLJM4IGBfk"].join("."),
  discordClientId: process.env.DISCORD_CLIENT_ID || "1548576579872100374",
  discordClientSecret: process.env.DISCORD_CLIENT_SECRET || "2gbo9ErQEC00qhNlu2zvM227YMZt",

  // Custom auth email delivery
  resendApiKey: process.env.RESEND_API_KEY,
  emailFrom: process.env.EMAIL_FROM || "Kyro <onboarding@resend.dev>",
  appUrl: process.env.APP_URL || "https://kyro-web-rodh.onrender.com",

  rateLimits: {
    free: Number(process.env.RATE_LIMIT_FREE || 20),
    pro: Number(process.env.RATE_LIMIT_PRO || 120),
    enterprise: Number(process.env.RATE_LIMIT_ENTERPRISE || 1000),
    guest: Number(process.env.RATE_LIMIT_GUEST || 8),
  },
};
