import 'dotenv/config'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from '../src/lib/prisma'

const seedAuth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  emailAndPassword: { enabled: true },
})

const users: { email: string; name: string; password: string; role: 'admin' | 'agent' }[] = [
  { email: 'admin@example.com', name: 'Admin User', password: 'changeme123', role: 'admin' },
  { email: 'agent@example.com', name: 'Agent User', password: 'changeme123', role: 'agent' },
]

async function main() {
  console.log('Seeding users...')

  for (const { email, name, password, role } of users) {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      console.log(`  skipped: ${email} (already exists)`)
      continue
    }

    await seedAuth.api.signUpEmail({ body: { email, name, password } })

    if (role !== 'agent') {
      await prisma.user.update({ where: { email }, data: { role } })
    }

    console.log(`  created: ${email} (${role})`)
  }

  console.log('Done.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
