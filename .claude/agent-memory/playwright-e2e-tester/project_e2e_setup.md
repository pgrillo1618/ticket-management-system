---
name: Project E2E Test Setup
description: Playwright config, ports, seeded users, DB reset strategy for the ticket management system e2e suite
type: project
---

The e2e suite lives in `apps/e2e/`. Key facts:

- baseURL: `http://localhost:5174` (web dev:e2e server)
- API runs on port 3001 during e2e (not the default 3000)
- Three browser projects: chromium, firefox, webkit; `fullyParallel: true`
- `globalSetup` (`apps/e2e/global-setup.ts`) runs `prisma migrate reset --force` then `tsx prisma/seed.ts` before every run — no per-test DB reset
- Seeded users: `admin@example.com / e2e-admin-pass` (role: admin) and `agent@example.com / e2e-agent-pass` (role: agent)
- Credentials come from `apps/e2e/.env.test` env vars: `E2E_ADMIN_PASSWORD`, `E2E_AGENT_PASSWORD`, `E2E_BETTER_AUTH_SECRET`, `E2E_DATABASE_URL`
- Web server env: `VITE_AUTH_BASE_URL=http://localhost:5174` so the auth client points at the e2e Vite server; Vite proxies `/api/*` to port 3001
- Trace on first retry, screenshot on failure
- `apps/e2e/tsconfig.json`: `module: CommonJS`, `esModuleInterop: true` — use `import` syntax

**Why:** Knowing these ports and the single-global-setup pattern is critical to writing tests that don't assume wrong URLs or try to reset state mid-run.
**How to apply:** Always target `http://localhost:5174` (via relative paths + baseURL). Never assume per-test DB resets; tests must not leave dirty state that breaks later tests.
