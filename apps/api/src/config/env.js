import "dotenv/config";

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
  inferenceApiKey: process.env.INFERENCE_API_KEY || "",

  apiKeyPrefix: process.env.API_KEY_PREFIX || "kyro_sk_live_",

  // Custom auth email delivery (replaces Supabase Auth's built-in mailer)
  resendApiKey: process.env.RESEND_API_KEY,
  emailFrom: process.env.EMAIL_FROM || "Kyro <onboarding@resend.dev>",
  appUrl: process.env.APP_URL || "http://localhost:3000",

  rateLimits: {
    free: Number(process.env.RATE_LIMIT_FREE || 20),
    pro: Number(process.env.RATE_LIMIT_PRO || 120),
    enterprise: Number(process.env.RATE_LIMIT_ENTERPRISE || 1000),
  },
};
