import { execSync } from 'child_process'
import path from 'path'
import dotenv from 'dotenv'
import { Client } from 'pg'

export default async function globalSetup() {
  dotenv.config({ path: path.resolve(__dirname, '.env.test') })

  const dbUrl = process.env.E2E_DATABASE_URL
  if (!dbUrl) throw new Error('E2E_DATABASE_URL is not set in apps/e2e/.env.test')

  // Create the test database if it does not exist yet
  const parsed = new URL(dbUrl)
  const dbName = parsed.pathname.slice(1)
  parsed.pathname = '/postgres'

  const admin = new Client({ connectionString: parsed.toString() })
  await admin.connect()
  const { rows } = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName])
  if (rows.length === 0) {
    await admin.query(`CREATE DATABASE "${dbName}"`)
    console.log(`[e2e] Created test database: ${dbName}`)
  }
  await admin.end()

  const apiDir = path.resolve(__dirname, '../../apps/api')
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    DATABASE_URL: dbUrl,
    BETTER_AUTH_SECRET: process.env.E2E_BETTER_AUTH_SECRET!,
    SEED_ADMIN_PASSWORD: process.env.E2E_ADMIN_PASSWORD!,
    SEED_AGENT_PASSWORD: process.env.E2E_AGENT_PASSWORD!,
  }

  // Apply any pending migrations (non-destructive — safe for CI and local)
  console.log('[e2e] Applying migrations to test database...')
  execSync('npx prisma migrate deploy', { cwd: apiDir, env, stdio: 'inherit' })

  // Wipe all application tables so every test run starts from a clean slate
  console.log('[e2e] Truncating test data...')
  const db = new Client({ connectionString: dbUrl })
  await db.connect()
  await db.query(
    `TRUNCATE TABLE "Message", "Ticket", "Session", "Account", "Verification", "User" RESTART IDENTITY CASCADE`
  )
  await db.end()

  // Populate with known test users (admin + agent)
  console.log('[e2e] Seeding test database...')
  execSync('npx tsx prisma/seed.ts', { cwd: apiDir, env, stdio: 'inherit' })

  console.log('[e2e] Test database ready.')
}
