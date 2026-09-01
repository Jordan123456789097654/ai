# syntax=docker/dockerfile:1
# Build context: repo root (set via docker-compose or render.yaml dockerContext)
# This allows COPY of both apps/api/ source and prisma/ schema in one build.

# ── 1. Install production dependencies ───────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY apps/api/package.json ./
# prisma CLI is in dependencies (not devDependencies) so --omit=dev keeps it
RUN npm install --omit=dev

# ── 2. Generate Prisma client ─────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl
COPY --from=deps /app/node_modules ./node_modules
# Copy the schema first (at the path the generate command expects)
COPY prisma ./prisma
# Copy API source
COPY apps/api/src ./src
COPY apps/api/package.json ./package.json
RUN npx prisma generate --schema=./prisma/schema.prisma

# ── 3. Lean production runner ─────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
EXPOSE 4000
CMD ["node", "src/server.js"]
