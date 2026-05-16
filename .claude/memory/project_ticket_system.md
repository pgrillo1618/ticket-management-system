---
name: project-ticket-system
description: Overview of the AI-powered ticket management system project being built
type: project
---
AI-powered ticket management system to handle hundreds of daily support emails. Replaces manual agent triage with AI classification, auto-responses, and routing.

**Why:** Agents manually read/classify/respond to every ticket — slow, impersonal, sometimes incorrect.

**How to apply:** Keep suggestions aligned with these constraints when proposing features or architecture.

## Audience & Roles
- Mixed audience: students, general customers, staff
- Roles: Admin, Supervisor/Manager, Agent/Support staff
- End users (ticket submitters) are not system users — they interact via email

## Email Integration
- Source: Gmail / Google Workspace
- Method: Gmail API polling (not Pub/Sub)

## Knowledge Base
- Format: Static docs / FAQs (markdown/PDF uploads)
- Used by AI to generate auto-responses

## AI Features
- Ticket classification (category/priority)
- Auto-generated human-friendly responses using knowledge base
- AI summaries of ticket threads
- AI-suggested replies for agents

## Ticket Status
- `open`, `resolved`, `closed`

## Ticket Categories (one per ticket, AI-classified)
- `question`, `technical question`, `refund request`

## Deployment
- Ships with a pre-seeded admin account
- Admin creates all other users (agents/supervisors) from within the app
- No self-registration

## Core Features
- Receive support emails → create tickets
- Ticket list with filtering and sorting
- Ticket detail view
- Dashboard to view and manage all tickets
- User management (admin only)

## Scope
- Full featured MVP — all listed features before launch

## Tech Stack (decided)
- Frontend: React + React Router v7 (TypeScript)
- Backend: Node.js + Express v5 (REST API, TypeScript)
- Database: PostgreSQL + Prisma ORM
- Vector search: pgvector
- AI: Anthropic Claude API
- Auth: JWT
- Jobs/Queue: BullMQ + Redis
- Email: Gmail API (googleapis)
- UI: Tailwind CSS v4 + shadcn/ui
- File storage: Cloudflare R2 (or S3)
- Deployment: Railway
