---
name: Architecture Security Overview
description: Auth stack, session model, database layer, and security-relevant architectural decisions in the ticket management system
type: project
---

Authentication layer uses Better Auth 1.6.11 with email/password; sessions are stored in the PostgreSQL database (Session model with expiresAt, token, userId). Cookies are issued by Better Auth (httpOnly by default). Sign-up is disabled in production config (`disableSignUp: true`) but the seed script creates its own `betterAuth` instance with sign-up enabled.

API layer (Express v5) has no authentication middleware on any business routes as of 2026-05-24. The only route is `GET /api/health`. All auth is handled via Better Auth's own handler at `/api/auth/*splat`.

CORS is hardcoded to `http://localhost:5173` in both `apps/api/src/app.ts` and `apps/api/src/lib/auth.ts` (trustedOrigins). These must be environment-variable-driven before production deployment.

Database: Prisma with PostgreSQL. `DATABASE_URL` read from env; no connection pool size limits configured. `process.env.DATABASE_URL!` uses non-null assertion — will throw at startup if missing, which is acceptable.

Role model: `admin | supervisor | agent` defined in both Prisma schema and `packages/types`. The `active` boolean field is defined but not enforced by Better Auth's built-in session validation (no `databaseHooks` configured).

**Why:** These are architectural decisions made during initial MVP scaffolding.
**How to apply:** When new routes are added, immediately flag if auth middleware is absent. When production deployment begins, flag the localhost CORS/origin hardcoding as a blocker.
