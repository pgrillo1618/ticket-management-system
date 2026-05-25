import { createAuthClient } from 'better-auth/react'
import { inferAdditionalFields } from 'better-auth/client/plugins'
import type { auth } from '../../../../apps/api/src/lib/auth'

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_AUTH_BASE_URL,
  plugins: [inferAdditionalFields<typeof auth>()],
})
