import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { Prisma } from '@prisma/client'
import { toNodeHandler } from 'better-auth/node'
import { auth } from './lib/auth'
import { router } from './routes'
import { requireAuth } from './middleware/requireAuth'

const app = express()

app.use(helmet())
app.use(cors({ origin: process.env.ALLOWED_ORIGIN, credentials: true }))

// Must be before express.json()
app.all('/api/auth/*splat', toNodeHandler(auth))

app.use(express.json({ limit: '100kb' }))
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))
app.use('/api', requireAuth, router)

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
    res.status(404).json({ error: 'NotFound', message: 'Resource not found' })
    return
  }
  console.error(err)
  const isDev = process.env.NODE_ENV !== 'production'
  res.status(500).json({ error: 'InternalServerError', message: isDev ? err.message : 'An unexpected error occurred' })
})

export { app }
