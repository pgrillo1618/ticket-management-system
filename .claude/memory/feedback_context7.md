---
name: feedback-context7-docs
description: Always use Context7 MCP to fetch up-to-date library documentation before writing code
type: feedback
---
Always resolve and query Context7 documentation before writing code that uses any library, framework, SDK, or CLI tool. This keeps generated code aligned with the current API and avoids stale patterns from training data.

**Why:** User explicitly requires Context7 usage to stay up to date. The project stack (React Router v7, Express v5, Tailwind v4, Prisma, BullMQ, Anthropic SDK, etc.) evolves quickly and training data may lag.

**How to apply:**
1. Call `mcp__context7__resolve-library-id` to get the library ID
2. Call `mcp__context7__query-docs` with a specific query before writing implementation code
3. Apply this to every library touched in a given task — not just unfamiliar ones
