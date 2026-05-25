---
name: Auth UI Selectors
description: LoginPage field IDs, error element selectors, Navbar button names, route guard behavior discovered from source code
type: reference
---

## LoginPage (`apps/web/src/pages/LoginPage.tsx`)

- Email input: `id="email"` — `page.locator('#email')`; Label text "Email" — `page.getByLabel('Email')`
- Password input: `id="password"` — `page.locator('#password')`; Label text "Password" — `page.getByLabel('Password')`
- Submit button: `<Button type="submit">Login</Button>` (text changes to "Signing in…" while submitting) — `page.getByRole('button', { name: 'Login' })`
- Field errors: `<p className="text-xs text-red-400">` rendered as sibling of input — select via `#email ~ p.text-red-400` and `#password ~ p.text-red-400`
- Server error box: `<div className="... bg-red-950/60 border border-red-800/50 ..."><p className="text-sm text-red-400 ...">` — select via `div.bg-red-950\/60 p.text-red-400`
- Auth uses `authClient.signIn.email(...)` from `better-auth`; on success calls `navigate('/', { replace: true })`
- If session already exists on mount → `navigate('/', { replace: true })` (LoginPage guards itself)

## Navbar (`apps/web/src/components/Navbar.tsx`)

- Sign out button: `<Button variant="ghost">Sign out</Button>` — `page.getByRole('button', { name: 'Sign out' })`
- Management dropdown trigger: only rendered when `session?.user?.role === 'admin'` — `page.getByRole('button', { name: /management/i })`
- "Users" link inside Management dropdown: `<NavLink to="/users">Users</NavLink>`
- Health indicator: coloured circle (no testid); not relevant to auth tests

## Route guards

- `AppLayout`: `authClient.useSession()` — if `!session` → `<Navigate to="/login" replace />`
- `RequireAdmin`: if `session?.user?.role !== 'admin'` → `<Navigate to="/" replace />`
- Both show a spinner/null while `isPending` — tests must use `waitForURL` not immediate assertions

## App routes

- `/` → `App` (Dashboard page — heading "Dashboard", sub-text "Overview of your support tickets")
- `/users` → `UsersPage` (heading `<h1>Users</h1>`)
- `/login` → `LoginPage`
