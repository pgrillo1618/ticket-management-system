import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'
import path from 'path'

// Populate process.env from .env.test so webServer env blocks below can reference them
dotenv.config({ path: path.resolve(__dirname, '.env.test') })

if (!process.env.E2E_DATABASE_URL) {
  throw new Error('E2E_DATABASE_URL is not set — make sure apps/e2e/.env.test exists')
}

// Test servers run on different ports so they never conflict with running dev servers
const API_PORT = 3001
const WEB_PORT = 5174
const API_URL = `http://localhost:${API_PORT}`
const WEB_URL = `http://localhost:${WEB_PORT}`

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],

  globalSetup: './global-setup',

  use: {
    baseURL: WEB_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: [
    {
      name: 'API',
      command: 'npm run dev:api --prefix ../..',
      url: `${API_URL}/api/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
      env: {
        PORT: String(API_PORT),
        DATABASE_URL: process.env.E2E_DATABASE_URL,
        BETTER_AUTH_SECRET: process.env.E2E_BETTER_AUTH_SECRET!,
        BETTER_AUTH_URL: API_URL,
        ALLOWED_ORIGIN: WEB_URL,
      },
    },
    {
      name: 'Web',
      command: 'npm run dev:e2e --prefix ../../apps/web',
      url: WEB_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
      env: {
        // Tells vite.config.ts which API host to proxy /api/* to
        API_URL,
        // Override the .env value so the auth client targets the e2e web server
        VITE_AUTH_BASE_URL: WEB_URL,
      },
    },
  ],
})
