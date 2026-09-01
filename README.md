# Kyro

A production-ready AI platform: OpenAI-compatible API, developer portal, admin control panel, and a streaming web chat UI — all sitting in front of a self-hosted open-source model.

## 1. Architecture Overview

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
│ (OpenAI SDK)   │ ───────────────► │  - RBAC                │        ┌──────────────┐
└───────────────┘   /v1/chat/      │  - Token-bucket limits │◄──────►│    Redis     │
                     completions   │  - Usage logging       │        │  rate limits,│
                                    └──────────┬─────────────┘        │  active      │
                                              │ proxies + injects     │  system      │
                                              │ active system prompt  │  prompt cache│
                                              ▼                        └──────────────┘
                                   ┌──────────────────────┐
                                   │  vLLM Inference Server │
                                   │  (OpenAI-compatible)   │
                                   │  Llama 3 / Mistral /   │
                                   │  DeepSeek              │
                                   └──────────────────────┘
```

**Request flow, `/v1/chat/completions`:**
1. Caller sends a standard OpenAI-format request with `Authorization: Bearer kyro_sk_live_...`.
2. The gateway hashes the key (SHA-256), looks it up in Postgres, confirms it's active, and resolves the owning user's tier.
3. A Redis token-bucket check enforces the per-key/per-tier rate limit; on failure the gateway returns `429`.
4. The gateway reads the **active system prompt + model + default hyperparameters** from a Redis cache (`system_config:active`), keyed by the Admin Panel — never a redeploy.
5. The active system prompt is prepended as the first `system` message, then the request is forwarded to vLLM's OpenAI-compatible endpoint.
6. Tokens stream back over Server-Sent Events, straight through to the caller.
7. Usage (prompt/completion tokens, endpoint, latency) is logged asynchronously to `api_usage_logs`.

**Admin Panel writes**, they don't touch the inference server directly — they update `system_configs` in Postgres and publish the new value into the Redis cache (`system_config:active`), which every gateway instance reads on the next request. This is what makes persona/model swaps live without a redeploy.

**Web chat** authenticates end users via Supabase Auth (JWT), and calls the *same* `/v1/chat/completions` route as external developers, just via a first-party session instead of an API key — one code path, two auth mechanisms.

## 2. Repo layout

```
kyro/
├── docker-compose.yml
├── prisma/schema.prisma
├── apps/
│   ├── api/     # Fastify API gateway
│   └── web/     # Next.js frontend (chat, admin, dev portal, docs)
```

## 3. Local development

Prerequisites: Docker + Docker Compose, Node 20+, a GPU host for vLLM (or point `INFERENCE_BASE_URL` at any OpenAI-compatible server, including Ollama, for CPU-only local dev).

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
# fill in SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY

docker compose up -d postgres redis vllm   # infra + model server
cd apps/api && npm install && npx prisma migrate deploy && npm run dev
cd apps/web && npm install && npm run dev
```

- API gateway: http://localhost:4000 (docs at `/docs`, OpenAPI JSON at `/openapi.json`)
- Web app: http://localhost:3000

### Swapping in Ollama for CPU-only dev

`docker-compose.yml` ships a `vllm` service. For a laptop without a GPU, replace it with Ollama and set:

```
INFERENCE_BASE_URL=http://ollama:11434/v1
INFERENCE_MODEL=llama3
```

The gateway only assumes an OpenAI-compatible `/v1/chat/completions` route — vLLM, TGI (with its OpenAI adapter), and Ollama all satisfy that.

## 4. Deployment (cloud)

- **Postgres**: managed instance (RDS/Cloud SQL/Supabase Postgres). Run `npx prisma migrate deploy` on release.
- **Redis**: managed (ElastiCache/Upstash). Used for rate-limit token buckets and the live system-config cache only — treat it as disposable; on a cold cache the gateway falls back to the DB row.
- **vLLM**: deploy on a GPU node (`vllm serve <model> --port 8000`) behind an internal load balancer; the gateway is the only service that talks to it.
- **API gateway**: stateless — horizontally scale behind a load balancer. Set env vars from `.env.example`.
- **Web app**: deploy to Vercel or as a Node server; point `NEXT_PUBLIC_API_BASE_URL` at the gateway.
- Put a CDN/WAF in front of the gateway's public `/v1/*` routes; everything else (`/admin/*`, `/keys/*`) should require the Supabase session and is not meant for anonymous public traffic.

See `docker-compose.yml` for a full local stack (Postgres, Redis, vLLM, API, web).
