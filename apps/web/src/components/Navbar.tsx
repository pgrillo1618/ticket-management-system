import { useEffect, useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router'
import { DropdownMenu } from 'radix-ui'
import { ChevronDown } from 'lucide-react'
import { authClient } from '../lib/auth-client'
import { Button } from '@/components/ui/button'

type ApiStatus = 'online' | 'offline' | 'unknown'

function HealthIndicator({ status }: { status: ApiStatus }) {
  if (status === 'online') {
    return <div className="w-3.5 h-3.5 rounded-full bg-green-500 shadow-[0_0_10px_4px_rgba(34,197,94,0.75)]" />
  }
  if (status === 'offline') {
    return <div className="w-3.5 h-3.5 rounded-full bg-red-500 animate-pulse" />
  }
  return <div className="w-3.5 h-3.5 rounded-full bg-gray-300" />
}

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { data: session } = authClient.useSession()
  const [status, setStatus] = useState<ApiStatus>('unknown')
  const isManagementActive = location.pathname.startsWith('/users')

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('/api/health')
        setStatus(res.ok ? 'online' : 'offline')
      } catch {
        setStatus('offline')
      }
    }

    check()
    const interval = setInterval(check, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleSignOut = async () => {
    await authClient.signOut()
    navigate('/login', { replace: true })
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 grid grid-cols-3 items-center">
      <div className="flex items-center gap-3">
        <HealthIndicator status={status} />
      </div>
      <div className="flex justify-center">
        <NavLink to="/" className="text-sm font-semibold text-gray-800 hover:text-gray-600 transition-colors">Ticket Management System</NavLink>
      </div>
      <div className="flex items-center justify-end gap-4">
        {session?.user?.role === 'admin' && (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded-md font-medium transition-colors outline-none ${
                  isManagementActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                Management
                <ChevronDown className="size-3.5" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={6}
                className="z-50 min-w-[160px] rounded-lg border border-gray-200 bg-white py-1 shadow-md"
              >
                <DropdownMenu.Item asChild>
                  <NavLink
                    to="/users"
                    className={({ isActive }) =>
                      `block px-3 py-2 text-sm outline-none cursor-pointer ${
                        isActive
                          ? 'font-medium text-gray-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`
                    }
                  >
                    Users
                  </NavLink>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        )}
<Button
          variant="ghost"
          onClick={handleSignOut}
          className="h-auto p-0 text-sm text-red-600 hover:text-red-700 hover:bg-transparent font-medium"
        >
          Sign out
        </Button>
      </div>
    </nav>
  )
}
