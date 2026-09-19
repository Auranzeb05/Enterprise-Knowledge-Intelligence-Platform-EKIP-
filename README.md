# EKIP — Enterprise Knowledge Intelligence Platform

> A full-stack, AI-powered enterprise knowledge platform for secure document management, role-based access control, semantic search, grounded Retrieval-Augmented Generation (RAG), analytics, and auditability.

<p align="center">
  <strong>Enterprise Knowledge. Securely Retrieved. Contextually Answered.</strong>
</p>

---

## Live Demo

**Live Application:** [Open EKIP](https://ekip-sooty.vercel.app/)

**AI / RAG Demo Video:** [Watch Demo](YOUR_DEMO_VIDEO_URL_HERE)

> The public showcase can be configured with one-click demo access for Admin, Manager, and Employee roles. Full AI document ingestion and grounded RAG require an Ollama runtime reachable by the backend.

---

## Overview

EKIP (Enterprise Knowledge Intelligence Platform) is a full-stack knowledge management and AI retrieval system built to help organizations securely store, organize, search, and query internal knowledge.

The platform combines secure authentication, role-based access control, department-aware authorization, private document storage, document ingestion, vector embeddings, semantic search, retrieval-augmented generation, persistent AI conversations, source citations, analytics, audit logging, user and department administration, and optional public portfolio demo access.

EKIP is designed around three organizational roles:

- **Employee**
- **Manager**
- **Admin**

Each role receives a different workspace, navigation experience, and level of access. Authorization is enforced on the backend, not only in the interface.

---

## Why EKIP?

Organizations often store critical knowledge across policy documents, financial reports, internal manuals, operational procedures, technical documentation, and strategy files. Traditional keyword search can fail when users do not know the exact wording contained in a document.

EKIP solves this by combining secure enterprise access controls with semantic retrieval and RAG.

Instead of searching only for exact words, users can ask questions such as:

- "How many PTO days can an employee carry forward?"
- "What happens if the solvency ratio falls below the warning threshold?"
- "What should an employee do after receiving an unexpected MFA request?"
- "Which policies apply before a manager starts a formal PIP?"
- "What was the company's FY2025 combined ratio?"
- "What is the disaster recovery objective for a critical system?"

EKIP retrieves relevant authorized document chunks, supplies them as grounded context to the AI runtime, and returns an answer with source references.

---

## Key Features

### Authentication

- Supabase Authentication
- Email/password sign-in
- Session restoration
- Secure logout
- Role-aware routing
- Protected routes

### Role-Based Access Control

| Capability | Employee | Manager | Admin |
|---|:---:|:---:|:---:|
| Personal dashboard | ✅ | ✅ | ✅ |
| Knowledge Base | ✅ | ✅ | ✅ |
| Semantic search | ✅ | ✅ | ✅ |
| Grounded AI Chat | ✅ | ✅ | ✅ |
| View authorized documents | ✅ | ✅ | ✅ |
| Upload documents | — | Department scope | Organization-wide |
| Department analytics | — | ✅ | ✅ |
| Organization analytics | — | — | ✅ |
| User management | — | — | ✅ |
| Department management | — | — | ✅ |
| Audit logs | — | — | ✅ |
| Organization-wide document administration | — | — | ✅ |

### Department-Aware Authorization

- Employees access authorized general knowledge and documents relevant to their department.
- Managers receive Employee capabilities plus department-scoped document and analytics access.
- Admins have organization-wide administrative access.
- Manager-to-employee relationships are department-consistent.
- Admin accounts are treated as organization-wide rather than assigned to a normal department.

### Document Management

- Private Supabase Storage bucket
- PDF support
- DOCX text extraction
- Text file processing
- File metadata tracking
- Department assignment
- Document lifecycle states
- Signed download URLs
- Upload authorization
- Deletion controls

Document lifecycle:

```text
Uploaded
   ↓
Processing
   ↓
Text Extraction
   ↓
Chunking
   ↓
Embedding Generation
   ↓
Ready
```

If ingestion fails:

```text
Processing
   ↓
Failed
```

### Semantic Search

EKIP stores 768-dimensional document embeddings in PostgreSQL and uses vector similarity to retrieve semantically related knowledge. This allows users to search by meaning instead of exact wording.

Example:

```text
User query:
"What should I do if an authentication prompt appears that I did not request?"

Semantic retrieval can match content discussing:
"unexpected MFA approval requests"
```

### Retrieval-Augmented Generation (RAG)

The AI pipeline is grounded in retrieved enterprise knowledge.

```text
User Question
      ↓
Authorization Scope
      ↓
Semantic Retrieval
      ↓
Relevant Document Chunks
      ↓
Grounded Context
      ↓
Ollama Chat Model
      ↓
Answer + Sources
```

The chat system is designed to:

- answer from retrieved enterprise context
- avoid inventing unsupported enterprise facts
- cite source documents
- preserve conversational context
- respect the user's authorization scope
- keep unauthorized knowledge outside the model context

### AI Chat

- Persistent conversations
- Stored chat history
- Conversation titles
- Source references
- Contextual follow-up questions
- Role-aware retrieval
- Citation display
- History drawer
- Source drawer
- Responsive desktop/tablet layout

### Knowledge Base

- Searchable enterprise documents
- Semantic retrieval
- Authorized result filtering
- Document metadata
- Source discovery
- Role/department-based document access

### Analytics

**Manager analytics**
- Department-scoped metrics
- Department document activity
- Relevant operational insights

**Admin analytics**
- Organization-wide metrics
- User distribution
- Document activity
- Knowledge usage
- Administrative overview

### Audit Logging

EKIP records security and administrative activity such as:

- User creation
- User updates
- Department creation
- Department updates
- Document upload activity
- Document download activity
- Administrative actions
- Action outcome
- Actor
- Role
- Request ID
- IP address
- User agent
- Resource metadata

Audit outcomes include:

```text
success
failure
blocked
```

### User Management

Admin functionality includes:

- Create users
- Update users
- Assign roles
- Assign departments
- Assign employee managers
- Enforce department-consistent reporting relationships
- Organization-wide Admin handling
- Account status management

### Department Management

Admins can:

- Create departments
- Update departments
- Organize users
- Scope manager and employee access
- Support department-aware authorization throughout the system

### Profile and Settings

Users can manage account-facing information through profile/settings workflows while authentication remains managed by Supabase.

### Responsive Interface

The UI is designed for desktop, laptop, 1024px, and 768px layouts and includes a collapsible desktop sidebar, compact navigation on narrower screens, responsive dashboards, adaptive AI Chat drawers, and consistent role-based navigation.

---

## One-Click Portfolio Demo Access

EKIP includes an optional showcase mode for recruiters, interviewers, and portfolio visitors.

The login screen can expose:

```text
Explore Demo

[ Admin Demo ]
[ Manager Demo ]
[ Employee Demo ]
```

The public browser never needs to contain demo passwords. Demo credentials remain backend-only.

Frontend:

```env
VITE_DEMO_MODE=true
```

Backend:

```env
DEMO_MODE_ENABLED=true
```

Demo mode can later be disabled without replacing the normal authentication system.

```env
VITE_DEMO_MODE=false
DEMO_MODE_ENABLED=false
```

---

## Architecture

```text
┌─────────────────────────────────────┐
│         React + Vite Frontend       │
│                                     │
│  Dashboards • Search • AI Chat      │
│  Documents • Analytics • Admin UI   │
└─────────────────┬───────────────────┘
                  │ HTTPS / REST
                  ▼
┌─────────────────────────────────────┐
│      Node.js + Express Backend      │
│                                     │
│ Auth • RBAC • Documents • Search    │
│ RAG • Analytics • Audit • Demo API  │
└───────┬──────────────┬──────────────┘
        │              │
        │              │
        ▼              ▼
┌───────────────┐  ┌──────────────────┐
│   Supabase    │  │ Neon PostgreSQL  │
│               │  │                  │
│ Authentication│  │ Prisma ORM       │
│ Private Files │  │ Users            │
└───────────────┘  │ Departments      │
                   │ Documents         │
                   │ Chunks            │
                   │ Embeddings        │
                   │ Conversations     │
                   │ Audit Logs        │
                   └─────────┬────────┘
                             │
                             ▼
                   ┌──────────────────┐
                   │      Ollama      │
                   │                  │
                   │ qwen3:4b         │
                   │ nomic-embed-text │
                   └──────────────────┘
```

---

## RAG Processing Pipeline

### Document ingestion

```text
Upload
  ↓
Supabase Private Storage
  ↓
Document Metadata
  ↓
Text Extraction
  ↓
Chunk Generation
  ↓
nomic-embed-text
  ↓
768-D Vector Embeddings
  ↓
PostgreSQL / pgvector
  ↓
Document Status = Ready
```

### Question answering

```text
Authenticated User
       ↓
Role + Department Authorization
       ↓
Question
       ↓
Query Embedding
       ↓
Vector Similarity Search
       ↓
Authorized Chunks
       ↓
Grounding Prompt
       ↓
qwen3:4b
       ↓
Grounded Answer
       ↓
Source Citations
       ↓
Conversation Persistence
```

---

## Technology Stack

### Frontend

| Technology | Purpose |
|---|---|
| React 18 | UI application |
| TypeScript | Typed frontend development |
| Vite | Development server and production bundling |
| Tailwind CSS | Styling |
| React Router | Client-side navigation |
| Radix UI | Accessible UI primitives |
| Material UI | UI components |
| Lucide React | Icons |
| Recharts | Analytics visualizations |
| Supabase JS | Authentication/session integration |

### Backend

| Technology | Purpose |
|---|---|
| Node.js | Backend runtime |
| Express 5 | REST API |
| TypeScript | Backend implementation |
| Prisma ORM | Database access and migrations |
| PostgreSQL | Primary database |
| Neon | Managed PostgreSQL |
| pgvector | Vector-backed semantic knowledge |
| Supabase | Authentication and document storage |
| Multer | Multipart uploads |
| pdf-parse | PDF extraction |
| Mammoth | DOCX extraction |
| Helmet | Security headers |
| CORS | Cross-origin control |
| express-rate-limit | API rate limiting |
| Vitest | Backend testing |

### AI / Knowledge Runtime

| Technology | Purpose |
|---|---|
| Ollama | Local/self-hosted AI runtime |
| qwen3:4b | Chat generation |
| nomic-embed-text | Embedding generation |
| RAG | Grounded enterprise Q&A |
| Semantic Search | Meaning-based retrieval |
| 768-D vectors | Stored document embeddings |

---

## Database Model

Main application entities:

```text
Department
   │
   ├── Users
   └── Documents

User
   │
   ├── Department
   ├── Manager / Employees
   ├── Documents
   ├── Conversations
   └── Audit Logs

Document
   │
   └── Document Chunks
           │
           └── Vector Embedding

Chat Conversation
   │
   └── Chat Messages
           │
           └── Source Metadata

Audit Log
   └── Actor / Action / Resource / Status / Metadata
```

Core enums:

```text
Role
- employee
- manager
- admin

UserStatus
- active
- pending
- suspended

DocumentStatus
- uploaded
- processing
- ready
- failed

ChatMessageRole
- user
- assistant
```

---

## Security Design

### Authentication Security

- Supabase Auth
- Protected routes
- Backend token validation
- Session-aware frontend state

### Authorization Security

- Backend-enforced RBAC
- Department-scoped access
- Manager scope validation
- Admin organization-wide access
- Authorized document filtering before RAG retrieval

### API Security

- Helmet security headers
- Production CORS allowlisting
- API rate limiting
- Request IDs
- Structured error handling
- Reverse-proxy awareness

### Secret Management

Sensitive values remain server-side:

```text
DATABASE_URL
SUPABASE_SERVICE_ROLE_KEY
DEMO_ADMIN_PASSWORD
DEMO_MANAGER_PASSWORD
DEMO_EMPLOYEE_PASSWORD
```

Frontend-safe configuration uses Vite variables such as:

```text
VITE_API_URL
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_DEMO_MODE
```

### Storage Security

- Private Supabase document bucket
- Backend-controlled uploads
- Signed download URLs
- No public document bucket requirement

---

## Sample Enterprise Knowledge Corpus

For portfolio demonstrations, EKIP can be populated with a synthetic fictional company knowledge base.

1. **Employee & Manager Workplace Policy Manual**
   - Leave rules
   - Hybrid work
   - Manager procedures
   - Employee FAQs
   - Department structure

2. **Financial & Actuarial Performance Report**
   - Underwriting KPIs
   - Actuarial reserves
   - IFRS 17
   - Solvency
   - Stress testing

3. **Multi-Year Strategy & ORSA Report**
   - Strategic targets
   - Financial projections
   - Capital planning
   - Risk scenarios
   - Executive management actions

4. **Technology, Cybersecurity & Data Governance Manual**
   - MFA
   - RBAC
   - Privileged access
   - Ransomware response
   - Disaster recovery
   - Data classification
   - Vendor risk
   - Responsible AI
   - Retention and legal hold

These documents are synthetic portfolio data and are intended only to demonstrate enterprise retrieval, semantic search, and grounded RAG behavior.

---

## Example Semantic Search / RAG Questions

```text
"What is the annual PTO carryover rule?"

"What happens before an employee is placed on a formal PIP?"

"What was the FY2025 combined ratio?"

"What management action is triggered when solvency falls below the warning threshold?"

"What should an employee do after receiving an MFA prompt they did not initiate?"

"How quickly must a critical cybersecurity incident be contained?"

"What is the recovery objective for a critical enterprise system?"

"Can restricted company information be entered into a public AI service?"
```

---

## Repository Structure

```text
Enterprise-Knowledge-Intelligence-Platform-EKIP-/
│
├── src/
│   ├── app/
│   │   ├── components/
│   │   ├── context/
│   │   └── pages/
│   ├── lib/
│   └── styles/
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── scripts/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   └── modules/
│   │       ├── admin/
│   │       ├── audit/
│   │       ├── chat/
│   │       ├── demo/
│   │       ├── departments/
│   │       ├── documents/
│   │       ├── employee/
│   │       ├── manager/
│   │       ├── search/
│   │       └── users/
│   └── tests/
│
├── scripts/
├── .env.example
├── DEPLOYMENT.md
├── package.json
├── vite.config.ts
└── README.md
```

---

## Local Development

### Prerequisites

Install:

- Node.js
- npm
- PostgreSQL-compatible Neon database
- Supabase project
- Ollama

Pull the required Ollama models:

```bash
ollama pull nomic-embed-text
ollama pull qwen3:4b
```

Verify:

```bash
ollama list
```

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/Auranzeb05/Enterprise-Knowledge-Intelligence-Platform-EKIP-.git
cd Enterprise-Knowledge-Intelligence-Platform-EKIP-
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Configure frontend environment

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
VITE_API_URL=http://localhost:4000
VITE_DEMO_MODE=false
```

### 4. Install backend dependencies

```bash
cd backend
npm install
```

### 5. Configure backend environment

```bash
cp .env.example .env
```

```env
NODE_ENV=development
PORT=4000
TRUST_PROXY=false

CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require

SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
SUPABASE_DOCUMENTS_BUCKET=documents

OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
OLLAMA_CHAT_MODEL=qwen3:4b
OLLAMA_EMBEDDING_DIMENSION=768
OLLAMA_EMBEDDING_TIMEOUT_MS=60000
OLLAMA_CHAT_TIMEOUT_MS=120000

DEMO_MODE_ENABLED=false
```

Never commit real `.env` files.

---

## Database Setup

From `backend/`:

```bash
npm run prisma:generate
npx prisma migrate deploy
```

The production build also generates Prisma Client before TypeScript compilation.

---

## Running Locally

### Terminal 1 — Ollama

If Ollama is not already running:

```bash
ollama serve
```

### Terminal 2 — Backend

```bash
cd backend
npm run dev
```

Backend:

```text
http://localhost:4000
```

### Terminal 3 — Frontend

From the repository root:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## Production Build

### Frontend

```bash
npm run build
```

Output:

```text
dist/
```

### Backend

```bash
cd backend
npm run build
npm start
```

Backend build process:

```text
Prisma Client Generation
        ↓
Clean dist
        ↓
TypeScript Compilation
```

Production entry point:

```text
backend/dist/server.js
```

---

## Health and Readiness

### Liveness

```http
GET /api/health
```

Confirms that the API process is alive.

### Readiness

```http
GET /api/ready
```

Readiness verifies PostgreSQL and Ollama availability. A backend may therefore be alive while the full AI runtime is not ready.

---

## Verification and Testing

Backend tests:

```bash
cd backend
npm test
```

Phase verification:

```bash
npm run verify:phase7
```

Runtime verification:

```bash
npm run verify:runtime
```

Project-level deployment verification:

```bash
./scripts/verify-deployment.sh
```

---

## Deployment

EKIP separates frontend, backend, database, storage/authentication, and AI runtime.

### Example Portfolio Deployment

```text
Frontend
Vercel
   │
   ▼
Backend
Render
   │
   ├── Neon PostgreSQL
   └── Supabase
```

Full live AI functionality additionally requires:

```text
Render Backend
      ↓
Reachable Ollama Runtime
      ↓
qwen3:4b + nomic-embed-text
```

### Frontend

Required build-time variables:

```env
VITE_API_URL=https://YOUR_BACKEND.example.com
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
VITE_DEMO_MODE=true
```

### Backend

Example production settings:

```env
NODE_ENV=production
TRUST_PROXY=true
CORS_ORIGINS=https://YOUR_FRONTEND.example.com
```

For TypeScript builds where development dependencies are not installed automatically:

```bash
npm ci --include=dev && npm run build
```

Start:

```bash
npm start
```

### AI Runtime Constraint

Ollama is intentionally self-hosted. If the backend is hosted remotely while Ollama exists only on a developer machine, document embedding and live RAG cannot complete because the remote backend cannot reach the local Ollama process.

For a fully hosted AI deployment, the backend must have network access to a persistent Ollama instance. Do not expose a default unauthenticated Ollama service directly to the public internet.

---

## Demo Mode Setup

Backend demo variables:

```env
DEMO_MODE_ENABLED=true

DEMO_ADMIN_EMAIL=demo.admin@ekip.app
DEMO_ADMIN_PASSWORD=YOUR_RANDOM_PASSWORD

DEMO_MANAGER_EMAIL=demo.manager@ekip.app
DEMO_MANAGER_PASSWORD=YOUR_RANDOM_PASSWORD

DEMO_EMPLOYEE_EMAIL=demo.employee@ekip.app
DEMO_EMPLOYEE_PASSWORD=YOUR_RANDOM_PASSWORD
```

Create demo users:

```bash
cd backend
npm run demo:setup
```

Remove demo users:

```bash
npm run demo:cleanup
```

Never expose demo passwords through `VITE_*` variables.

---

## Production Checklist

- [ ] Real `.env` files are excluded from Git
- [ ] Supabase service-role key exists only on backend
- [ ] Database credentials exist only on backend
- [ ] Private document bucket remains private
- [ ] Production CORS uses exact frontend origins
- [ ] Prisma migrations are applied
- [ ] Health endpoint returns successfully
- [ ] Role-specific access is tested
- [ ] Demo accounts contain only synthetic data
- [ ] No confidential documents exist in public demo
- [ ] Public Admin demo cannot expose real data
- [ ] Hosted backend can reach Ollama if live AI is enabled
- [ ] Frontend and backend production builds pass

---

## Screenshots

Add screenshots here before publishing the final showcase README.

### Login / Demo Access

```text
docs/screenshots/login.png
```

### Admin Dashboard

```text
docs/screenshots/admin-dashboard.png
```

### Manager Dashboard

```text
docs/screenshots/manager-dashboard.png
```

### Employee Dashboard

```text
docs/screenshots/employee-dashboard.png
```

### Document Management

```text
docs/screenshots/document-management.png
```

### Semantic Search

```text
docs/screenshots/semantic-search.png
```

### AI Chat with Sources

```text
docs/screenshots/ai-chat.png
```

### Analytics

```text
docs/screenshots/analytics.png
```

### Audit Logs

```text
docs/screenshots/audit-logs.png
```

---

## Demo Walkthrough

1. Open the public EKIP login page.
2. Enter **Admin Demo**.
3. Show the Admin dashboard.
4. Open User Management.
5. Open Department Management.
6. Show Document Management.
7. Show Analytics.
8. Show Audit Logs.
9. Logout.
10. Enter **Manager Demo**.
11. Demonstrate department-scoped access.
12. Logout.
13. Enter **Employee Demo**.
14. Demonstrate restricted employee access.
15. Show the recorded local AI/RAG demonstration.
16. Demonstrate a document question with a source citation.
17. Explain the semantic search and authorization flow.

---

## Engineering Highlights

- Backend authorization instead of UI-only access control
- Department-aware document retrieval
- Vector-backed semantic search
- Grounded RAG context construction
- Persistent conversational history
- Source-aware AI responses
- Private storage with signed URLs
- Real audit records
- Role-aware analytics
- Production CORS controls
- Health/readiness separation
- Configurable trusted-proxy behavior
- Optional removable portfolio demo mode
- Reproducible Prisma generation during backend builds
- Responsive role-specific interfaces

---

## Current Deployment Notes

The frontend and backend can be deployed independently. The public portfolio interface can remain available even when the AI runtime is intentionally local.

Full live behavior for document embedding, semantic indexing, AI Chat, and RAG answering requires the deployed backend to reach Ollama.

For portfolio use, a recorded local AI demonstration can be linked above until a persistent hosted Ollama runtime is provided.

---

## Future Enhancements

- Hosted private Ollama inference
- Streaming AI responses
- Additional document formats
- Document versioning
- Advanced hybrid retrieval
- Reranking
- Multi-organization tenancy
- Automated knowledge synchronization
- SSO / enterprise identity providers
- Richer audit-event coverage
- Background ingestion queues
- Document approval workflows
- Fine-grained permissions
- Usage monitoring and cost telemetry
- Automated knowledge freshness checks

---

## Project Status

EKIP currently includes complete application workflows for:

- Authentication
- Employee / Manager / Admin role separation
- Role-specific dashboards
- User management
- Department management
- Document management
- Text extraction
- Document chunking
- Vector embeddings
- Semantic retrieval
- Grounded AI Chat
- Source citations
- Persistent conversations
- Analytics
- Audit logging
- Profile/settings
- Responsive layouts
- Demo access
- Deployment configuration
- Health/readiness monitoring

---

## Documentation

Additional deployment guidance:

```text
DEPLOYMENT.md
```

Environment templates:

```text
.env.example
backend/.env.example
```

---

## Author

**MD Auranzeb Khan**

Software Engineering • Full-Stack Development • AI/ML

GitHub: [Auranzeb05](https://github.com/Auranzeb05)

LinkedIn: [Add LinkedIn URL](YOUR_LINKEDIN_URL_HERE)

Portfolio: [Add Portfolio URL](YOUR_PORTFOLIO_URL_HERE)

---

## Repository

**Enterprise Knowledge Intelligence Platform (EKIP)**

```text
https://github.com/Auranzeb05/Enterprise-Knowledge-Intelligence-Platform-EKIP-
```

---

## License

This project is provided as a portfolio and educational software project.

If you plan to make the repository public for reuse or distribution, add an explicit license file that matches the permissions you want to grant.

---

<p align="center">
  <strong>EKIP — Secure Enterprise Knowledge, Retrieval and AI in One Platform</strong>
</p>
