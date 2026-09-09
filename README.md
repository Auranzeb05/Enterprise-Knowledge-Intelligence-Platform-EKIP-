# EKIP — Enterprise Knowledge Intelligence Platform

EKIP is a full-stack, AI-powered Enterprise Knowledge Intelligence Platform that combines secure document management, role-based access control, semantic search, analytics, auditability, and Retrieval-Augmented Generation (RAG) to deliver grounded, source-cited answers from authorized organizational knowledge.

The application is designed around three organizational roles — **Employee**, **Manager**, and **Admin** — with access rules enforced across the frontend and backend.

## Core Capabilities

- Secure authentication with Supabase Auth
- Role-based access control for Employee, Manager, and Admin workflows
- Department-aware document access
- Private document storage with Supabase Storage
- Document ingestion and text extraction
- Vector embeddings and semantic retrieval
- Retrieval-augmented chat with grounded source citations
- Persistent chat conversations and history
- Knowledge Base search
- Admin user and department management
- Audit logging
- Role-aware analytics
- Production health and readiness checks
- Responsive layouts for desktop, laptop, 1024px, and 768px views

## Roles

### Employee

Employees can access authorized organizational knowledge, search the Knowledge Base, use the grounded chat experience, and manage their own profile and settings.

### Manager

Managers receive Employee capabilities plus department-scoped management access. Manager document operations and analytics are limited to their authorized department scope.

### Admin

Admins have organization-wide administrative access, including user management, department management, document administration, analytics, and audit logs.

## Architecture

```text
React + Vite Frontend
        |
        v
Node.js + Express API
   |        |        |
   |        |        +--> Ollama
   |        |             - qwen3:4b
   |        |             - nomic-embed-text
   |        |
   |        +--> Supabase
   |              - Authentication
   |              - Private document storage
   |
   +--> Neon PostgreSQL
          - Prisma ORM
          - Application data
          - Chat persistence
          - Audit records
          - Vector-backed knowledge data
```

## Technology Stack

### Frontend

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Radix UI primitives
- Material UI
- Recharts
- Lucide icons
- Supabase JavaScript client

### Backend

- Node.js
- Express 5
- TypeScript
- Prisma ORM
- PostgreSQL / Neon
- Supabase
- Helmet
- CORS
- Express rate limiting
- Vitest

### Knowledge and AI Runtime

- Ollama
- `qwen3:4b` for chat generation
- `nomic-embed-text` for embeddings
- 768-dimensional embeddings
- Retrieval-augmented generation
- Semantic search

## Repository Structure

```text
EKIP CURRENT/
├── src/                       # React frontend
│   ├── app/
│   │   ├── components/
│   │   ├── context/
│   │   └── pages/
│   ├── lib/
│   └── styles/
├── backend/
│   ├── prisma/                # Prisma schema and migrations
│   ├── scripts/               # Backend verification utilities
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   └── modules/
│   └── tests/
├── scripts/                   # Project-level verification scripts
├── DEPLOYMENT.md
├── package.json
└── vite.config.ts
```

## Local Development

### Prerequisites

Install:

- Node.js and npm
- PostgreSQL-compatible Neon database
- Supabase project
- Ollama

Pull the required Ollama models:

```bash
ollama pull nomic-embed-text
ollama pull qwen3:4b
```

### 1. Clone the repository

```bash
git clone https://github.com/Auranzeb05/Enterprise-Knowledge-Intelligence-Platform-EKIP-.git
cd Enterprise-Knowledge-Intelligence-Platform-EKIP-
```

### 2. Configure the frontend

```bash
cp .env.example .env
npm install
```

Set the required frontend values in `.env`:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_URL=http://localhost:4000
```

### 3. Configure the backend

```bash
cd backend
cp .env.example .env
npm install
```

Set the required backend values in `backend/.env`.

The important configuration groups are:

- Neon / PostgreSQL
- Supabase
- CORS
- Ollama
- runtime settings

Never commit real environment files.

### 4. Prepare Prisma

From `backend/`:

```bash
npx prisma generate
npx prisma migrate deploy
```

### 5. Start Ollama

Make sure Ollama is running and the required models are available:

```bash
ollama list
```

### 6. Start the backend

```bash
cd backend
npm run dev
```

Backend default:

```text
http://localhost:4000
```

### 7. Start the frontend

In another terminal:

```bash
npm run dev
```

Frontend default:

```text
http://localhost:5173
```

## Production Build

Frontend:

```bash
npm run build
```

Backend:

```bash
cd backend
npm run build
npm start
```

The frontend production output is generated in `dist/`.

The backend production entry point is `backend/dist/server.js`.

## Health and Readiness

Backend liveness:

```text
GET /api/health
```

Backend readiness:

```text
GET /api/ready
```

Readiness verifies both the PostgreSQL connection and Ollama availability.

## Verification

Backend verification:

```bash
cd backend
npm run verify:phase7
```

Runtime verification with running services:

```bash
npm run verify:runtime
```

Project-level deployment verification is available at:

```bash
./scripts/verify-deployment.sh
```

## Security

EKIP includes:

- authenticated API access
- server-side role enforcement
- department-aware authorization
- private document storage
- explicit production CORS allowlisting
- security headers
- API rate limiting
- request IDs and structured error handling
- service-role credentials restricted to the backend
- environment validation
- audit logging

## Deployment

See [`DEPLOYMENT.md`](DEPLOYMENT.md) for the production architecture, environment configuration, Ollama hosting considerations, CORS configuration, health checks, migrations, and deployment smoke-test procedure.

## Current Status

The application includes the complete frontend and backend workflow for:

- authentication
- role-based dashboards
- document management
- knowledge retrieval
- grounded chat
- conversation persistence
- analytics
- audit logs
- account profile and settings
- production readiness

The project is suitable for local demonstration and can be deployed publicly when the backend has secure network access to a persistent Ollama runtime.
