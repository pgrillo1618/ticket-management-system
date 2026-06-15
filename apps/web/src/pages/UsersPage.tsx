import { useState, useEffect, useCallback } from 'react'
import type { User, UserRole, ApiResponse } from '@ticket/types'
import { authClient } from '../lib/auth-client'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const ROLES: UserRole[] = ['admin', 'supervisor', 'agent']

const roleBadgeClass: Record<UserRole, string> = {
  admin: 'bg-purple-100 text-purple-700 border-purple-200',
  supervisor: 'bg-blue-100 text-blue-700 border-blue-200',
  agent: 'bg-gray-100 text-gray-600 border-gray-200',
}

const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
const formatDate = (iso: string) => DATE_FORMATTER.format(new Date(iso))

export default function UsersPage() {
  const { data: session } = authClient.useSession()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set())
  const [updateErrors, setUpdateErrors] = useState<Record<string, string>>({})

  const fetchUsers = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/users', { credentials: 'include', signal })
      if (!res.ok) throw new Error('Failed to fetch users')
      const json: ApiResponse<User[]> = await res.json()
      setUsers(json.data)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      setError('Failed to load users. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetchUsers(controller.signal)
    return () => controller.abort()
  }, [fetchUsers])

  async function updateUser(id: string, data: Partial<Pick<User, 'role' | 'active'>>) {
    const original = users.find(u => u.id === id)
    if (!original) return

    setUpdatingIds(prev => new Set(prev).add(id))
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u))

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const errBody = await res.json()
        throw new Error(errBody.message ?? 'Failed to update user')
      }
      const json: ApiResponse<User> = await res.json()
      setUsers(prev => prev.map(u => u.id === id ? json.data : u))
      setUpdateErrors(prev => { const next = { ...prev }; delete next[id]; return next })
    } catch (err) {
      setUsers(prev => prev.map(u => u.id === id ? original : u))
      setUpdateErrors(prev => ({ ...prev, [id]: err instanceof Error ? err.message : 'Failed to update user' }))
    } finally {
      setUpdatingIds(prev => { const next = new Set(prev); next.delete(id); return next })
    }
  }

  const currentUserId = session?.user?.id

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Users</h1>
        <p className="text-sm text-gray-500 mt-1">Manage team members and their roles</p>
      </div>

      <Card className="rounded-xl overflow-hidden border-gray-200 py-0 shadow-none">
        <CardHeader className="px-5 py-4 border-b border-gray-100 flex-row items-center justify-between space-y-0">
          <h2 className="text-sm font-semibold text-gray-800">
            All Users
            {!loading && !error && (
              <span className="ml-2 text-xs font-normal text-gray-400">{users.length}</span>
            )}
          </h2>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-100">
                <TableHead className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Name</TableHead>
                <TableHead className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Email</TableHead>
                <TableHead className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Role</TableHead>
                <TableHead className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</TableHead>
                <TableHead className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Joined</TableHead>
                <TableHead className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow className="border-0">
                  <TableCell colSpan={6} className="px-5 py-16 text-center">
                    <p className="text-sm text-gray-400">Loading users…</p>
                  </TableCell>
                </TableRow>
              )}

              {!loading && error && (
                <TableRow className="border-0">
                  <TableCell colSpan={6} className="px-5 py-16 text-center">
                    <p className="text-sm text-red-500">{error}</p>
                    <Button
                      variant="link"
                      onClick={() => fetchUsers()}
                      className="text-xs text-blue-600 hover:text-blue-700 h-auto p-0 mt-2"
                    >
                      Try again
                    </Button>
                  </TableCell>
                </TableRow>
              )}

              {!loading && !error && users.length === 0 && (
                <TableRow className="border-0">
                  <TableCell colSpan={6} className="px-5 py-16 text-center">
                    <p className="text-sm text-gray-400">No users found</p>
                  </TableCell>
                </TableRow>
              )}

              {!loading && !error && users.map(user => {
                const isSelf = user.id === currentUserId
                const isUpdating = updatingIds.has(user.id)

                return (
                  <TableRow key={user.id} className="border-gray-100 hover:bg-gray-50/50">
                    <TableCell className="px-5 py-3 text-sm font-medium text-gray-800">
                      {user.name}
                      {isSelf && <span className="ml-1.5 text-xs text-gray-400">(you)</span>}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-sm text-gray-600">{user.email}</TableCell>
                    <TableCell className="px-5 py-3">
                      <select
                        value={user.role}
                        disabled={isSelf || isUpdating}
                        onChange={e => updateUser(user.id, { role: e.target.value as UserRole })}
                        className={`text-xs font-medium rounded-full border px-2 py-0.5 outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${roleBadgeClass[user.role]}`}
                      >
                        {ROLES.map(r => (
                          <option key={r} value={r}>
                            {r.charAt(0).toUpperCase() + r.slice(1)}
                          </option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell className="px-5 py-3">
                      <Badge
                        className={
                          user.active
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : 'bg-red-100 text-red-600 border-red-200'
                        }
                        variant="outline"
                      >
                        {user.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-3 text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell className="px-5 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isSelf || isUpdating}
                        onClick={() => updateUser(user.id, { active: !user.active })}
                        className={`h-7 px-2.5 text-xs font-medium ${
                          user.active
                            ? 'text-red-600 hover:text-red-700 hover:bg-red-50'
                            : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                        } disabled:opacity-40`}
                      >
                        {isUpdating ? '…' : user.active ? 'Deactivate' : 'Activate'}
                      </Button>
                      {updateErrors[user.id] && (
                        <p className="text-xs text-red-500 mt-1">{updateErrors[user.id]}</p>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
