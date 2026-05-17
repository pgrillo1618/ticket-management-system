import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { authClient } from '../lib/auth-client'

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
  const { data: session } = authClient.useSession()
  const [status, setStatus] = useState<ApiStatus>('unknown')

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
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <HealthIndicator status={status} />
        <span className="text-sm font-semibold text-gray-800">Ticket Management System</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">{session?.user?.name}</span>
        <button
          onClick={handleSignOut}
          className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
        >
          Sign out
        </button>
      </div>
    </nav>
  )
}
