---
name: Users Page UI Selectors
description: Locator patterns, element structure, and API shapes for the /users page tests
type: reference
---

## Page structure (`apps/web/src/pages/UsersPage.tsx`)

- Page heading: `getByRole('heading', { name: 'Users' })`
- Loading indicator text: `"Loading users…"` (in a `<p>` inside a `<td colSpan=6>`)
- Per-row error: `<p className="text-xs text-red-500 mt-1">` inside the Actions cell

## Row locator pattern

Use `page.locator('tr').filter({ hasText: email })` to get a user's row by email.
Each row contains: Name cell (with optional `(you)` span), Email cell, Role `<select>`, Status `<Badge>`, Joined date, Actions `<Button>`.

## Key locators inside a row

- Role select: `row.locator('select')` — `<select value={user.role} disabled={isSelf || isUpdating}>`
- Status badge text: `'Active'` or `'Inactive'` (via `row.getByText(...)`)
- Toggle button: `row.getByRole('button', { name: 'Deactivate' })` or `row.getByRole('button', { name: 'Activate' })`
- Self indicator: `row.getByText('(you)')` — only visible on the logged-in admin's own row
- Inline error: `row.locator('p.text-red-500')`

## Self-row guards (isSelf === true)

- Role `<select>` is `disabled`
- Deactivate/Activate `<Button>` is `disabled`

## API shapes

- `GET /api/users` → `{ data: User[] }` ordered by `createdAt asc`; 403 if not admin
- `PATCH /api/users/:id` → `{ data: User }` on success
  - 400 `"Cannot deactivate your own account"` — self-deactivation
  - 400 `"Cannot change your own role"` — self-role-change
  - 400 `"Cannot remove the last admin"` — demoting sole admin (only reachable when a second admin performs the action)
  - 400 `"No valid fields to update"` — empty body
  - 404 `"User not found"` — unknown id

## Optimistic update pattern

The component applies the change to local state before the PATCH response returns,
then rolls back if the response is not `ok`. Use `page.waitForResponse(...)` to
synchronize assertions with the server round-trip.

## Intercepting updates to test error rollback

```ts
await page.route('**/api/users/**', route => {
  if (route.request().method() === 'PATCH') {
    route.fulfill({ status: 400, contentType: 'application/json',
      body: JSON.stringify({ error: 'BadRequest', message: '...' }) })
  } else { route.continue() }
})
```
