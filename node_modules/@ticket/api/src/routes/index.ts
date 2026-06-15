import { Router } from 'express'
import { UserRole } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { requireAdmin } from '../middleware/requireAdmin'

export const router = Router()

const USER_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  active: true,
  createdAt: true,
} as const

const VALID_ROLES: UserRole[] = ['admin', 'supervisor', 'agent']

router.get('/users', requireAdmin, async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: USER_SELECT,
      orderBy: { createdAt: 'asc' },
    })
    res.json({ data: users })
  } catch (err) {
    next(err)
  }
})

router.patch('/users/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = req.params['id'] as string
    const { role, active } = req.body as { role?: string; active?: boolean }
    const currentUserId = res.locals.session.user.id

    if (id === currentUserId && active === false) {
      res.status(400).json({ error: 'BadRequest', message: 'Cannot deactivate your own account' })
      return
    }

    if (id === currentUserId && role !== undefined && role !== 'admin') {
      res.status(400).json({ error: 'BadRequest', message: 'Cannot change your own role' })
      return
    }

    const updateData: { role?: UserRole; active?: boolean } = {}
    if (role !== undefined) {
      if (!VALID_ROLES.includes(role as UserRole)) {
        res.status(400).json({ error: 'BadRequest', message: 'Invalid role' })
        return
      }
      updateData.role = role as UserRole
    }
    if (active !== undefined) {
      if (typeof active !== 'boolean') {
        res.status(400).json({ error: 'BadRequest', message: 'Invalid active value' })
        return
      }
      updateData.active = active
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: USER_SELECT,
    })

    res.json({ data: user })
  } catch (err) {
    next(err)
  }
})
