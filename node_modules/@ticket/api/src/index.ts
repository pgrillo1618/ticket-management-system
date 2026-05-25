import 'dotenv/config'
import { app } from './app'

if (!process.env.BETTER_AUTH_SECRET) throw new Error('BETTER_AUTH_SECRET environment variable is required')
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL environment variable is required')
if (!process.env.ALLOWED_ORIGIN) throw new Error('ALLOWED_ORIGIN environment variable is required')

const PORT = process.env.PORT ?? 3000

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`)
})
