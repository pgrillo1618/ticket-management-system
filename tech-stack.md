# Tech Stack

## Frontend
- **React** — UI library, TypeScript
- **React Router v7** — client-side routing

## Backend
- **Node.js + Express** — REST API server, TypeScript

## Database
- **PostgreSQL** — primary data store
- **Prisma ORM** — schema management and query layer
- **pgvector** — vector similarity search for knowledge base retrieval

## AI
- **Anthropic Claude API** — classification, auto-responses, summaries, and suggested replies

## Authentication
- **JWT** — token-based auth for the REST API

## Background Jobs
- **BullMQ + Redis** — job queues for Gmail polling, AI processing, and email sending

## Email Integration
- **Gmail API** (`googleapis`) — polling inbox to create tickets and sending replies

## UI
- **Tailwind CSS** — styling
- **shadcn/ui** — component library

## File Storage
- **Cloudflare R2** (or AWS S3) — knowledge base document uploads

## Deployment
- **Railway** — hosting for app, PostgreSQL, and Redis
