---
name: High Risk Files for Future Reviews
description: Files that are security-sensitive and must be read carefully in every future audit of this codebase
type: project
---

These files require careful scrutiny in every security review pass:

1. `apps/api/src/lib/auth.ts` — Better Auth configuration: secret, trusted origins, session settings, plugins, rate limiting, databaseHooks for active-user enforcement
2. `apps/api/src/app.ts` — CORS config, middleware order, global error handler presence
3. `apps/api/src/routes/index.ts` (and any new route files added) — Presence of auth middleware on each router, input validation, RBAC checks
4. `apps/api/.env` — Contains DATABASE_URL and BETTER_AUTH_SECRET; must never be committed to git
5. `apps/api/prisma/seed.ts` — Contains plaintext credentials; must not use production passwords
6. `apps/web/src/layouts/RequireAdmin.tsx` and any future RequireSupervisor/RequireAgent layouts — Client-side route guards (must always have server-side enforcement as well)
7. `apps/web/src/lib/auth-client.ts` — baseURL must be env-var driven; import from API source is type-only (safe for now)
8. `packages/types/src/index.ts` — Shared types reveal API response shapes; check for PII exposure patterns

**Why:** These files contain or directly configure authentication, authorization, secrets, and trust boundaries.
**How to apply:** Always read these files first before expanding the audit scope to other files.
