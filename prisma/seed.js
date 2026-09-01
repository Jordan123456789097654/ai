/**
 * Kyro seed script — run with: node prisma/seed.js
 * Or via: npm run prisma:seed (in apps/api)
 *
 * Idempotent: safe to run multiple times. Creates:
 *   1. An initial active system config row (if none exists)
 *
 * To promote a Supabase user to admin after first sign-in:
 *   UPDATE users SET role = 'admin' WHERE email = 'you@example.com';
 * Or use the Prisma Studio / psql to do it manually.
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Running Kyro seed...");

  // ── System config ────────────────────────────────────────────────────────
  const existingConfig = await prisma.systemConfig.findFirst({ where: { isActive: true } });

  if (!existingConfig) {
    await prisma.systemConfig.create({
      data: {
        activeModel: process.env.INFERENCE_MODEL || "mistralai/Mistral-7B-Instruct-v0.3",
        globalSystemPrompt:
          "You are Kyro, a helpful AI assistant. Be concise, accurate, and honest about uncertainty.",
        defaultTemperature: 0.7,
        defaultTopP: 1.0,
        defaultMaxTokens: 1024,
        isActive: true,
      },
    });
    console.log("✓ Initial system config created");
  } else {
    console.log("✓ Active system config already exists — skipping");
  }

  console.log("");
  console.log("🎉 Seed complete!");
  console.log("");
  console.log("Next steps:");
  console.log("  1. Sign up via the web UI — this creates your user row.");
  console.log("  2. Promote yourself to admin:");
  console.log('     UPDATE users SET role = \'admin\' WHERE email = \'you@example.com\';');
  console.log("  3. Then use the Admin panel to change the system config live.");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
