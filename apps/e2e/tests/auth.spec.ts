import { test, expect, type Page } from '@playwright/test'

// ---------------------------------------------------------------------------
// Seeded credentials (created fresh by globalSetup before every run)
// ---------------------------------------------------------------------------
const ADMIN = { email: 'admin@example.com', password: 'e2e-admin-pass' }
const AGENT = { email: 'agent@example.com', password: 'e2e-agent-pass' }

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Fill and submit the login form, then wait for the navigation that follows.
 * Does NOT assert on the destination — callers do that themselves.
 */
async function submitLoginForm(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.locator('#email').fill(email)
  await page.locator('#password').fill(password)
  await page.getByRole('button', { name: 'Login' }).click()
}

/**
 * Perform a full programmatic login and wait until the app has navigated
 * away from /login (i.e. the authenticated home page is rendered).
 */
async function loginAs(
  page: Page,
  credentials: { email: string; password: string },
): Promise<void> {
  await page.goto('/login')
  await submitLoginForm(page, credentials.email, credentials.password)
  await page.waitForURL('/')
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

test.describe('Authentication', () => {
  // =========================================================================
  // Happy path — successful login
  // =========================================================================
  test.describe('Happy path — successful login', () => {
    test.beforeEach(async ({ page }) => {
      // Always start from the login page with a fresh, unauthenticated state
      await page.goto('/login')
    })

    test('admin can log in and lands on /', async ({ page }) => {
      // Arrange — already on /login via beforeEach

      // Act
      await submitLoginForm(page, ADMIN.email, ADMIN.password)

      // Assert
      await page.waitForURL('/')
      expect(page.url()).toContain('/')
    })

    test('agent can log in and lands on /', async ({ page }) => {
      // Arrange — already on /login via beforeEach

      // Act
      await submitLoginForm(page, AGENT.email, AGENT.password)

      // Assert
      await page.waitForURL('/')
      expect(page.url()).toContain('/')
    })

    test('after login the navbar Sign out button is visible', async ({ page }) => {
      // Arrange — already on /login via beforeEach

      // Act
      await submitLoginForm(page, ADMIN.email, ADMIN.password)
      await page.waitForURL('/')

      // Assert
      await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible()
    })

    test('admin sees Management dropdown in the navbar', async ({ page }) => {
      // Arrange — already on /login via beforeEach

      // Act
      await submitLoginForm(page, ADMIN.email, ADMIN.password)
      await page.waitForURL('/')

      // Assert — the Management trigger button is rendered only for admins
      await expect(page.getByRole('button', { name: /management/i })).toBeVisible()
    })

    test('agent does NOT see the Management dropdown in the navbar', async ({ page }) => {
      // Arrange — already on /login via beforeEach

      // Act
      await submitLoginForm(page, AGENT.email, AGENT.password)
      await page.waitForURL('/')

      // Assert
      await expect(page.getByRole('button', { name: /management/i })).not.toBeVisible()
    })
  })

  // =========================================================================
  // Sign-out
  // =========================================================================
  test.describe('Sign-out', () => {
    test('admin can sign out and is redirected to /login', async ({ page }) => {
      // Arrange — log in first
      await loginAs(page, ADMIN)

      // Act
      await page.getByRole('button', { name: 'Sign out' }).click()

      // Assert
      await page.waitForURL('/login')
      await expect(page.getByRole('button', { name: 'Login' })).toBeVisible()
    })

    test('after sign-out, navigating to / redirects back to /login', async ({ page }) => {
      // Arrange — log in, then sign out
      await loginAs(page, ADMIN)
      await page.getByRole('button', { name: 'Sign out' }).click()
      await page.waitForURL('/login')

      // Act — attempt to visit the protected home route
      await page.goto('/')

      // Assert — AppLayout redirects unauthenticated visitors to /login
      await page.waitForURL('/login')
      await expect(page.getByRole('button', { name: 'Login' })).toBeVisible()
    })
  })

  // =========================================================================
  // Route protection
  // =========================================================================
  test.describe('Route protection', () => {
    test('unauthenticated visit to / redirects to /login', async ({ page }) => {
      // Arrange — fresh page with no session cookie

      // Act
      await page.goto('/')

      // Assert
      await page.waitForURL('/login')
      await expect(page.getByRole('button', { name: 'Login' })).toBeVisible()
    })

    test('unauthenticated visit to /users redirects to /login', async ({ page }) => {
      // Arrange — fresh page with no session cookie

      // Act
      await page.goto('/users')

      // Assert — AppLayout catches the unauthenticated request first
      await page.waitForURL('/login')
      await expect(page.getByRole('button', { name: 'Login' })).toBeVisible()
    })

    test('agent visiting /users is redirected to / (not admin)', async ({ page }) => {
      // Arrange — log in as a non-admin agent
      await loginAs(page, AGENT)

      // Act
      await page.goto('/users')

      // Assert — RequireAdmin redirects non-admins to /
      await page.waitForURL('/')
      await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible()
    })

    test('admin visiting /users can access the page', async ({ page }) => {
      // Arrange — log in as admin
      await loginAs(page, ADMIN)

      // Act
      await page.goto('/users')

      // Assert — stays on /users and the page heading is rendered
      await page.waitForURL('/users')
      await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible()
    })
  })

  // =========================================================================
  // Client-side login validation (Zod / react-hook-form — no network call)
  // =========================================================================
  test.describe('Login form — client-side validation', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login')
    })

    test('submitting empty form shows validation errors for both fields', async ({ page }) => {
      // Arrange — form is empty (beforeEach puts us on /login)

      // Act — submit without filling anything
      await page.getByRole('button', { name: 'Login' }).click()

      // Assert — Zod requires a valid email format and ≥8-char password
      // Both field error paragraphs should appear under their respective inputs
      await expect(page.locator('#email ~ p.text-red-400')).toBeVisible()
      await expect(page.locator('#password ~ p.text-red-400')).toBeVisible()
    })

    test('invalid email format shows an email validation error', async ({ page }) => {
      // Arrange
      await page.locator('#email').fill('not-an-email')
      await page.locator('#password').fill('validpassword')

      // Act
      await page.getByRole('button', { name: 'Login' }).click()

      // Assert
      const emailError = page.locator('#email ~ p.text-red-400')
      await expect(emailError).toBeVisible()
      await expect(emailError).toContainText('Invalid email address')
    })

    test('password shorter than 8 characters shows a password validation error', async ({ page }) => {
      // Arrange
      await page.locator('#email').fill('user@example.com')
      await page.locator('#password').fill('short')

      // Act
      await page.getByRole('button', { name: 'Login' }).click()

      // Assert
      const passwordError = page.locator('#password ~ p.text-red-400')
      await expect(passwordError).toBeVisible()
      await expect(passwordError).toContainText('Password must be at least 8 characters')
    })
  })

  // =========================================================================
  // Server-side login failures
  // =========================================================================
  test.describe('Login form — server-side errors', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login')
    })

    test('wrong password for a valid email shows a server error message', async ({ page }) => {
      // Arrange
      await page.locator('#email').fill(ADMIN.email)
      await page.locator('#password').fill('wrong-password-123')

      // Act
      await page.getByRole('button', { name: 'Login' }).click()

      // Assert — the red error box above the form should appear with a message
      // The box is rendered as a div containing a <p className="text-sm text-red-400 ...">
      const serverErrorBox = page.locator('div.bg-red-950\\/60 p.text-red-400')
      await expect(serverErrorBox).toBeVisible()
      // Still on /login — no navigation occurred
      expect(page.url()).toContain('/login')
    })

    test('non-existent email shows a server error message', async ({ page }) => {
      // Arrange
      await page.locator('#email').fill('nobody@example.com')
      await page.locator('#password').fill('somepassword')

      // Act
      await page.getByRole('button', { name: 'Login' }).click()

      // Assert
      const serverErrorBox = page.locator('div.bg-red-950\\/60 p.text-red-400')
      await expect(serverErrorBox).toBeVisible()
      expect(page.url()).toContain('/login')
    })
  })

  // =========================================================================
  // Already-authenticated redirect
  // =========================================================================
  test.describe('Already-authenticated redirect', () => {
    test('authenticated user navigating to /login is redirected to /', async ({ page }) => {
      // Arrange — establish an authenticated session
      await loginAs(page, ADMIN)

      // Act — navigate to /login while already authenticated.
      // LoginPage fires navigate('/') before the page load settles, so Playwright
      // throws "navigation interrupted". Catch it and wait for the final destination.
      await page.goto('/login').catch(() => {})

      // Assert — LoginPage detected the live session and redirected us to /
      await page.waitForURL('/')
      await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible()
    })
  })
})
