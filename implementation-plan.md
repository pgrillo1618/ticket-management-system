# Implementation Plan

## Phase 0 — Project Setup

### 0.2 Frontend bootstrap
- Create React + Vite app with TypeScript in `apps/web`
- Install and configure React Router v7
- Install and configure Tailwind CSS

### 0.3 Backend bootstrap
- Create Express app with TypeScript in `apps/api`
- Configure `tsconfig.json`, `ts-node`, and `nodemon` for dev
- Set up folder structure: `routes/`, `controllers/`, `services/`, `middleware/`, `jobs/`

### 0.4 Database setup
- Provision PostgreSQL instance on Railway
- Initialize Prisma with PostgreSQL provider
- Enable `pgvector` extension in the database
- Write initial `schema.prisma` with placeholder models

### 0.5 Environment & tooling
- Configure `.env` files for web and api
- Set up ESLint + Prettier for both workspaces
- Add shared TypeScript types package (`packages/types`)

---

## Phase 1 — Auth & User Management

### 1.1 Database models
- `User` model: id, email, password hash, role (`admin` | `supervisor` | `agent`), active flag, timestamps
- Seed script for the initial admin account

### 1.2 Backend — Auth endpoints
- `POST /auth/login` — validate credentials, return JWT access token + refresh token
- `POST /auth/refresh` — issue new access token from refresh token
- `POST /auth/logout` — invalidate refresh token

### 1.3 Backend — Auth middleware
- JWT verification middleware applied to all protected routes
- Role-based guard middleware (`requireRole`)

### 1.4 Backend — User management endpoints (admin only)
- `GET /users` — list all users
- `POST /users` — create agent or supervisor account
- `PATCH /users/:id` — update name, role
- `PATCH /users/:id/deactivate` — deactivate account

### 1.5 Frontend — Auth flow
- Login page with email/password form
- Store access token in memory, refresh token in `httpOnly` cookie
- Axios instance with token injection and auto-refresh on 401
- Redirect unauthenticated users to login

### 1.6 Frontend — Protected routing
- `<ProtectedRoute>` component wrapping app routes
- Role-aware route guards (e.g. admin-only pages)

### 1.7 Frontend — User management page (admin only)
- User list table with role and status columns
- Create user dialog (name, email, role)
- Deactivate user action

---

## Phase 2 — Core Ticket Management

### 2.1 Database models
- `Ticket` model: id, subject, sender email, sender name, status (`open` | `resolved` | `closed`), category, priority, assignee, created/updated timestamps
- `Message` model: id, ticket id, body (HTML + plain text), direction (`inbound` | `outbound`), sender, timestamp
- `TicketActivity` model: id, ticket id, actor, action, metadata, timestamp (audit log)

### 2.2 Backend — Ticket endpoints
- `GET /tickets` — list with filtering (status, priority, category, assignee) and sorting, paginated
- `GET /tickets/:id` — ticket detail with full message thread
- `PATCH /tickets/:id` — update status, assignee, priority, category
- `POST /tickets/:id/messages` — add an outbound message (manual agent reply)

### 2.3 Frontend — Ticket list page
- Table with columns: subject, sender, status badge, category, priority, assignee, created date
- Filter bar: status, category, priority, assignee dropdowns
- Column sorting
- Pagination

### 2.4 Frontend — Ticket detail page
- Ticket metadata header (status, category, priority, assignee)
- Full message thread timeline (inbound/outbound styled differently)
- Status change actions (resolve, close, reopen)
- Reassign ticket dropdown

### 2.5 Frontend — Dashboard page
- Summary cards: open tickets, resolved today, unassigned
- Recent tickets list
- (Placeholder for agent workload — populated in Phase 7)

---

## Phase 3 — Gmail Integration

### 3.1 Gmail OAuth setup
- Configure Google Cloud project and OAuth 2.0 credentials
- Implement OAuth consent + token exchange flow in the backend
- Store and refresh Gmail access/refresh tokens securely

### 3.2 Polling job
- BullMQ + Redis setup in `apps/api`
- `gmail-poll` repeatable job — runs every N minutes
- Fetch unread messages from Gmail API
- Mark fetched messages as read / label them

### 3.3 Ticket creation from email
- Parse raw Gmail message: subject, sender name/email, plain text + HTML body, thread ID
- De-duplicate: if `threadId` matches an existing ticket, append as a new `Message`; otherwise create a new `Ticket`
- Attach raw Gmail `messageId` and `threadId` to records for reply threading

### 3.4 Sending replies via Gmail API
- `gmail-send` service: compose reply in the same Gmail thread
- Called when an agent submits a manual reply
- Store outbound message in `Message` table

---

## Phase 4 — Knowledge Base

### 4.1 Database models
- `KnowledgeBaseDoc` model: id, filename, file URL, upload date, uploader, processing status
- `KnowledgeBaseChunk` model: id, doc id, chunk text, embedding vector (`pgvector`)

### 4.2 File upload
- `POST /kb/documents` — accept PDF or markdown file, upload to Cloudflare R2, create `KnowledgeBaseDoc` record
- `DELETE /kb/documents/:id` — remove document and its chunks

### 4.3 Document processing job
- `kb-process` BullMQ job triggered on upload
- Extract text from PDF (via `pdf-parse`) or read markdown directly
- Split text into overlapping chunks
- Generate embeddings via Claude (or OpenAI embeddings API)
- Store chunks with vectors in `KnowledgeBaseChunk`

### 4.4 Vector search service
- `searchKnowledgeBase(query)` — embed query, run `pgvector` cosine similarity search, return top-K chunks

### 4.5 Frontend — Knowledge base page (admin only)
- Upload document form (drag and drop)
- Document list with status (processing / ready) and delete action

---

## Phase 5 — AI Features

### 5.1 Claude API client
- Shared service wrapping `@anthropic-ai/sdk` with prompt caching enabled
- Helper for structured JSON output (classification, suggestions)

### 5.2 Auto-classification
- On ticket creation, enqueue `ai-classify` job
- Prompt Claude with ticket subject + body → return `category` and `priority`
- Update ticket record with results

### 5.3 Auto-response
- On ticket creation (after classification), enqueue `ai-respond` job
- Retrieve top-K knowledge base chunks relevant to the ticket
- Prompt Claude with ticket content + KB context → generate reply
- Store as a draft outbound `Message` with `status: draft`
- Auto-send immediately or hold for agent review (configurable per category)

### 5.4 AI thread summary
- `GET /tickets/:id/summary` endpoint
- Prompt Claude with full message thread → return a short summary paragraph
- Frontend: "Summarize thread" button on ticket detail page, summary displayed inline

### 5.5 AI-suggested replies
- `GET /tickets/:id/suggestions` endpoint
- Retrieve relevant KB chunks + thread context → prompt Claude for 1–3 reply drafts
- Frontend: "Suggested replies" panel on ticket detail page; agent can select, edit, and send

---

## Phase 6 — Supervisor Features & Reporting

### 6.1 Backend — Reporting endpoints
- `GET /reports/overview` — total tickets by status, average resolution time
- `GET /reports/agents` — per-agent: assigned count, resolved count, avg response time

### 6.2 Frontend — Reports page (supervisor + admin)
- Stat cards: total open, avg resolution time
- Agent workload table
- Simple bar chart for tickets over time (using Recharts or shadcn charts)

### 6.3 Ticket reassignment (supervisor)
- Supervisors can reassign any ticket to any agent from the ticket detail page

---

## Phase 7 — Deployment

### 7.1 Railway setup
- Create Railway project with services: `api`, `web`, `PostgreSQL`, `Redis`
- Configure environment variables per service
- Set up `pgvector` extension on the provisioned PostgreSQL instance

### 7.2 Build pipeline
- `apps/web` — Vite production build served as static files (or via Railway's static hosting)
- `apps/api` — compile TypeScript, run with `node dist/index.js`

### 7.3 Database migrations
- Run `prisma migrate deploy` on first deploy and on schema changes
- Run seed script to create initial admin account on first deploy

### 7.4 Gmail OAuth for production
- Complete Google OAuth verification for production domain
- Store production Gmail tokens securely in environment / database

### 7.5 Final QA checklist
- End-to-end: send email → ticket created → AI classified → AI response drafted → agent reviews and sends → ticket resolved
- Auth: login, role guards, token refresh, logout
- Knowledge base: upload → process → used in AI response
- Supervisor: reassign, reports

---

## Phase Order Summary

| Phase | What ships                                                     |
| ----- | -------------------------------------------------------------- |
| 0     | Monorepo, tooling, DB connection                               |
| 1     | Login, roles, user management                                  |
| 2     | Ticket CRUD, list, detail, dashboard shell                     |
| 3     | Gmail polling, ticket creation from email, send replies        |
| 4     | Knowledge base upload and vector indexing                      |
| 5     | AI classification, auto-response, summaries, suggested replies |
| 6     | Supervisor reports and agent workload                          |
| 7     | Production deployment on Railway                               |
