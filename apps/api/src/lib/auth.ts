import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from './prisma'

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  trustedOrigins: [process.env.ALLOWED_ORIGIN!],
  emailAndPassword: { enabled: true, disableSignUp: true },
  rateLimit: {
    window: 60,
    max: 10,
    storage: 'database',
  },
  user: {
    additionalFields: {
      role: { type: 'string', required: true, defaultValue: 'agent', input: false },
      active: { type: 'boolean', required: true, defaultValue: true, input: false },
    },
  },
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const user = await prisma.user.findUnique({ where: { id: session.userId } })
          if (!user?.active) {
            throw new Error('Account is deactivated')
          }
          return { data: session }
        },
      },
    },
  },
})

export type Auth = typeof auth
