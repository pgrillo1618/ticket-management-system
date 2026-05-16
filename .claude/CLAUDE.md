# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development commands

```bash
# Install all workspace dependencies
npm install

# Start API (Express, port 3000) — uses tsx watch for hot reload
npm run dev:api

# Start web (Vite, port 5173) — proxies /api/* to localhost:3000
npm run dev:web

# Type-check all workspaces
npm run typecheck
```

Run each dev server in a separate terminal. There is no single combined dev command.

## Architecture

Bun monorepo (running on npm until Bun is installed) with three workspaces:

```
apps/web      React 19 + React Router v7 (library/SPA mode) + Vite + Tailwind v4
apps/api      Express v5 + TypeScript, runs via tsx watch
packages/types  Shared TypeScript types consumed by both apps
```

### API (`apps/api`)

- Entry: `src/index.ts` → starts the server
- App setup: `src/app.ts` → mounts CORS, JSON body parser, and all routes under `/api`
- Routes: `src/routes/index.ts` — add new `Router` files here and mount them in `app.ts`
- All routes are prefixed `/api` — e.g. `GET /api/health`

### Web (`apps/web`)

- Entry: `src/main.tsx` → renders `<RouterProvider>`
- Routes: `src/router.tsx` — add new routes here using `createBrowserRouter`
- Vite proxies `/api/*` to `http://localhost:3000` in dev, so fetch calls use `/api/...` (no full URL needed)
- Tailwind v4: configured via the `@tailwindcss/vite` plugin — no `tailwind.config.js`, import with `@import "tailwindcss"` in CSS

### Shared types (`packages/types`)

- `src/index.ts` exports all shared interfaces and union types used across web and api
- Referenced as `@ticket/types` in both workspaces
- Add new shared types here; avoid duplicating type definitions across apps

## Key conventions

- API responses follow `ApiResponse<T>` / `ApiError` shapes from `@ticket/types`
- Ticket statuses: `open | resolved | closed`; categories: `question | technical question | refund request`
- Before writing code that uses any library, resolve and query its docs via the **Context7 MCP** (`mcp__context7__resolve-library-id` → `mcp__context7__query-docs`)
