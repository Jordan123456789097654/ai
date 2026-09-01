# syntax=docker/dockerfile:1

# ── 1. Install all deps (including devDeps needed for build) ──────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json ./
RUN npm install

# ── 2. Build the Next.js app ──────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_ vars must be available at build time when baked into the bundle.
# Pass them as build args so Render can inject them.
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
RUN npm run build

# ── 3. Minimal production runner (standalone output only) ─────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# standalone/ contains a self-contained server.js + its minimal node_modules.
COPY --from=builder /app/.next/standalone ./
# Static assets must be copied separately.
COPY --from=builder /app/.next/static ./.next/static
# Public folder (favicons, robots.txt, etc.)
COPY --from=builder /app/public ./public
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
