---
name: Initial Audit Findings Summary
description: Summary of all security findings from the 2026-05-24 comprehensive audit — severity counts, key issues, and fixed/unfixed status
type: project
---

Audit completed: 2026-05-24. Codebase is early MVP (mostly scaffolding, one route, no ticket API routes yet).

**Finding counts:** 0 Critical | 3 High | 5 Medium | 4 Low | 3 Info

## High Severity (unfixed as of audit)
1. No authentication/authorization middleware on API routes — all future business routes will be unprotected by default. File: `apps/api/src/routes/index.ts`, `apps/api/src/app.ts`
2. Deactivated user accounts (`active: false`) can still log in — the `active` field is stored but no Better Auth `databaseHooks` enforces it at sign-in. File: `apps/api/src/lib/auth.ts`
3. No rate limiting on auth endpoints — `/api/auth/sign-in/email` is open to brute force. No Better Auth `rateLimit` config, no express-rate-limit middleware.

## Medium Severity (unfixed as of audit)
1. CORS and trustedOrigins hardcoded to `http://localhost:5173` — will need env-var parameterization before production. Files: `apps/api/src/app.ts:9`, `apps/api/src/lib/auth.ts:7`
2. No security headers (Helmet) — missing CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
3. Body parser has no size limit — `express.json()` with no `limit` option, DoS vector via large payloads
4. `auth-client.ts` imports `type { auth }` from `apps/api/src/lib/auth` via relative path — couples web build to API source; if server-only imports ever become non-type, secrets could leak to client bundle
5. Login form password validation is `min(1)` only — no minimum length enforced client-side (server enforces 8 chars via Better Auth default)

## Low Severity (unfixed as of audit)
1. Seed script contains weak default passwords `changeme123` in plaintext — file: `apps/api/prisma/seed.ts:12-13`
2. No global error handler in Express — unhandled exceptions may leak stack traces in development and cause unformatted 500s in production
3. `GET /api/health` unauthenticated and polled every 5 seconds from Navbar — minor info disclosure + load
4. `apps/api/.env` excluded from git (correct) but `.gitignore` pattern `.env` (no leading `/`) — matches any `.env` file at any depth, which is actually correct behavior

## Info (best practice gaps, no direct exploit)
1. No `BETTER_AUTH_SECRET` explicit validation at startup — app will silently fail or use a weak default if env var is missing
2. Supervisor role defined in types/schema but not yet used in any authorization check
3. No Content Security Policy meta tag in `apps/web/index.html`

**Why:** This is the first comprehensive audit. No fixes have been applied yet.
**How to apply:** In future reviews, check each finding above against current code to see if it has been addressed. Do not re-report fixed items.
