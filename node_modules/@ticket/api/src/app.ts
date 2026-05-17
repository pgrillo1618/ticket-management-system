import express from 'express'
import cors from 'cors'
import { toNodeHandler } from 'better-auth/node'
import { auth } from './lib/auth'
import { router } from './routes'

const app = express()

app.use(cors({ origin: 'http://localhost:5173', credentials: true }))

// Must be before express.json()
app.all('/api/auth/*splat', toNodeHandler(auth))

app.use(express.json())
app.use('/api', router)

export { app }
