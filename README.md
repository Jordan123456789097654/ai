# Kyro AI Platform

A production-ready AI platform: OpenAI-compatible streaming API, Live Code Sandbox (`/sandbox`), Multi-Key Groq LPU pool with automatic failover, developer portal, admin control panel, and a responsive streaming web chat UI.

---

## 1. Architecture & Feature Overview

```
                                   ┌─────────────────────┐
                                   │   Admin Control      │
                                   │   Panel (Next.js)    │
                                   │  /admin routes       │
                                   └──────────┬───────────┘
                                              │ writes config
                                              ▼
┌───────────────┐   session (JWT)   ┌──────────────────────┐        ┌──────────────┐
│  Kyro Web Chat │ ───────────────► │                        │        │  PostgreSQL  │
│  (Next.js)     │ ◄─────────────── │   API Gateway          │◄──────►│  (Prisma)    │
└───────────────┘   SSE stream      │   Node.js / Fastify    │        │  users,keys, │
                                    │                        │        │  usage,config│
┌───────────────┐   Bearer          │  - Supabase JWT verify │        └──────────────┘
│ 3rd-party Dev  │   kyro_sk_live_  │  - API key auth        │
│ (OpenAI SDK)   │ ───────────────► │  - RBAC & Admin Bypass │        ┌──────────────┐
└───────────────┘   /v1/chat/      │  - Token-bucket limits │◄──────►│    Redis     │
                     completions   │  - Groq Multi-Key Pool │        │  rate limits,│
                                    └──────────┬─────────────┘        │  active      │
                                              │ round-robin           │  system      │
                                              │ failover retry        │  prompt cache│
                                              ▼                        └──────────────┘
                                   ┌──────────────────────┐
                                   │ Upstream Groq Cloud  │
                                   │  LPU Inference Array │
                                   │ Llama 3.3 70B /      │
                                   │ Llama 3.1 8B / Qwen  │
                                   └──────────────────────┘
```

### Key Platform Capabilities
- **💻 Live Code Sandbox (`/sandbox`)**: In-browser interactive runner for JavaScript (Node VM), Python 3, and SQL engine with stdout/stderr execution metrics and AI Code Assist.
- **⚡ Multi-Key Groq API Pool (`GROQ_API_KEYS`)**: Round-robin key rotation with automatic failover on 429 rate-limit and 401 auth errors.
- **🔓 Admin Restriction Bypass**: Admin API keys and Admin role sessions automatically bypass rate limits (`X-RateLimit-Limit: unlimited`) and secret redaction filters.
- **📈 Dynamic Status Monitor (`/status`)**: Real-time operational health checks, median p50 and tail p99 latency benchmarks across all nodes.
- **🛡️ 24-Hour Secret Exposure Scanner (`/code-audit`)**: Automated audit tool scanning public commits, client bundles, and `.env` files for unmasked secrets.

---

## 2. Repo Layout

```
kyro/
├── docker-compose.yml
├── prisma/schema.prisma
├── apps/
│   ├── api/     # Fastify API gateway (routes: /v1/chat/completions, /v1/sandbox/*, /admin/*, /health)
│   └── web/     # Next.js frontend (chat, sandbox, status, support, admin, dev portal, docs)
```

---

## 3. Environment Variables Reference

### API (`apps/api/.env`)
```env
PORT=4000
NODE_ENV=development
DATABASE_URL=postgresql://...
REDIS_URL=redis://localhost:6379

# Upstream Groq Cloud LPU Engine
INFERENCE_BASE_URL=https://api.groq.com/openai/v1
INFERENCE_MODEL=llama-3.3-70b-versatile
GROQ_API_KEYS=gsk_key1,gsk_key2,gsk_key3
INFERENCE_API_KEY=gsk_key1

# Rate Limits (requests per minute)
RATE_LIMIT_FREE=20
RATE_LIMIT_PRO=120
RATE_LIMIT_ENTERPRISE=1000
RATE_LIMIT_GUEST=8
```

### Web (`apps/web/.env.local`)
```env
NEXT_PUBLIC_API_BASE_URL=https://kyro-api-auou.onrender.com
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

---

## 4. Local Development

```bash
# 1. Install dependencies
cd apps/api && npm install
cd ../web && npm install

# 2. Run local API & Web servers
cd apps/api && npm run dev
cd apps/web && npm run dev
```

- **API Gateway**: `http://localhost:4000` (docs at `/docs`)
- **Web App**: `http://localhost:3000`
