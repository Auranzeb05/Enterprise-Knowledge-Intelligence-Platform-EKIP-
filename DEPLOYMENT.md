# EKIP Deployment Guide

This document describes the supported production architecture for the
Enterprise Knowledge Intelligence Platform (EKIP).

## 1. Production architecture

EKIP consists of five runtime pieces:

1. **Frontend** — React + Vite static application.
2. **Backend** — Node.js + Express + TypeScript API.
3. **Database** — Neon PostgreSQL with Prisma and pgvector-backed knowledge data.
4. **Authentication and private document storage** — Supabase.
5. **Local/self-hosted AI runtime** — Ollama using:
   - `nomic-embed-text`
   - `qwen3:4b`

The AI runtime is intentionally local/self-hosted. EKIP does not require a
paid hosted LLM API.

## 2. Important Ollama deployment constraint

A normal static frontend host can serve the Vite application.

The backend, however, must have network access to an Ollama instance.
A serverless function environment is not sufficient by itself if Ollama is
only running on a developer laptop.

Supported patterns:

### Local / portfolio demo

- Frontend: `localhost:5173`
- Backend: `localhost:4000`
- Ollama: `127.0.0.1:11434`
- Database: Neon
- Auth/storage: Supabase

This is the simplest full-feature EKIP demo configuration.

### Hosted full-stack deployment

Run the backend on a persistent VM/container/server and give it access to an
Ollama instance on the same machine or a private network.

Do not expose a default unauthenticated Ollama endpoint directly to the
public internet.

## 3. Environment files

Never commit real secrets.

Frontend:

```bash
cp .env.example .env
```

Required frontend variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_URL`

Backend:

```bash
cd backend
cp .env.example .env
```

Required backend variables include:

- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Production additionally requires:

- `NODE_ENV=production`
- `CORS_ORIGINS=https://your-frontend-host.example`

Ollama variables have safe local defaults in the application, but a hosted
backend must set `OLLAMA_BASE_URL` to an Ollama endpoint reachable from the
backend.

## 4. Database migrations

From `backend/`:

```bash
npx prisma generate
npx prisma migrate deploy
```

Use `migrate deploy` for an existing production database. Do not use
`prisma migrate reset` on production data.

## 5. Ollama preparation

Install Ollama on the machine that provides AI inference, then ensure both
models are present:

```bash
ollama pull nomic-embed-text
ollama pull qwen3:4b
ollama list
```

EKIP expects 768-dimensional embeddings.

Verify Ollama:

```bash
curl http://127.0.0.1:11434/api/tags
```

For a remote/private Ollama installation, replace the URL with the configured
`OLLAMA_BASE_URL`.

## 6. Frontend production build

From the project root:

```bash
npm ci
npm run build
```

The static production output is:

```text
dist/
```

The static host must support SPA history fallback so React routes resolve to
`index.html`.

The build-time `VITE_API_URL` must point to the deployed backend API.

## 7. Backend production build and start

From `backend/`:

```bash
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
npm start
```

Expected entry point:

```text
backend/dist/server.js
```

## 8. CORS

In development, EKIP permits the local Vite origins configured by the
application.

When `NODE_ENV=production`, `CORS_ORIGINS` must be configured.

Example:

```env
NODE_ENV=production
CORS_ORIGINS=https://ekip.example.com
```

For multiple allowed frontend origins, use a comma-separated list with exact
origins:

```env
CORS_ORIGINS=https://ekip.example.com,https://www.ekip.example.com
```

Do not use `*` for the production EKIP API.

## 9. Reverse proxy

When the Node backend is deployed behind a trusted reverse proxy and rate
limiting must use the forwarded client IP, set:

```env
TRUST_PROXY=true
```

Leave it `false` when the backend is directly exposed or the proxy is not
trusted.

## 10. Health and readiness

Liveness:

```text
GET /api/health
```

Expected:

```text
HTTP 200
status: alive
```

Readiness:

```text
GET /api/ready
```

Readiness returns HTTP 200 only when both PostgreSQL and Ollama are reachable.

A deployment platform should use:

- liveness check: `/api/health`
- readiness check: `/api/ready` when supported

Do not treat `/api/ready` failing because Ollama is intentionally offline as a
healthy full EKIP AI deployment.

## 11. Runtime verification

With the backend running:

```bash
cd backend
npm run verify:runtime
```

To verify deployed services:

```bash
EKIP_API_URL=https://api.example.com \
EKIP_FRONTEND_URL=https://ekip.example.com \
npm run verify:runtime
```

The verification checks:

- API liveness
- database readiness
- Ollama readiness
- optional frontend availability

## 12. Supabase production checklist

Before deployment:

- keep the documents bucket private
- never expose the service-role key to the frontend
- configure Supabase Auth redirect/site URLs for the deployed frontend when
  required by the selected auth flow
- use the same Supabase project in frontend and backend configuration
- confirm the backend service-role key has access required by EKIP's document
  management operations

## 13. Neon / PostgreSQL production checklist

- use the production Neon connection string only in backend secrets
- apply all Prisma migrations with `prisma migrate deploy`
- confirm pgvector/schema migrations are present
- use TLS according to the Neon connection string
- back up important production data before schema changes

## 14. Production smoke test

After deployment:

```bash
curl https://api.example.com/api/health
curl https://api.example.com/api/ready
```

Then verify in the UI:

1. Sign in with one Admin, Manager, and Employee account.
2. Confirm role-specific navigation and permissions.
3. Upload and index a test document with the permitted role.
4. Search the knowledge base.
5. Ask a grounded AI question and open a source citation.
6. Confirm chat history persistence.
7. Confirm Analytics and Audit Logs for authorized roles.
8. Confirm Profile and Settings.
9. Test primary layouts at normal desktop width, 1024px, and 768px.

## 15. Deployment decision for this portfolio build

EKIP is production-prepared, but the simplest fully functional demonstration
remains a local/self-hosted AI deployment because Ollama is intentionally used
instead of a paid hosted AI provider.

For a public hosted demo, deploy the backend and Ollama together on suitable
persistent compute, or connect the backend to a protected private Ollama
service.

The frontend may be deployed independently as a static Vite application.
