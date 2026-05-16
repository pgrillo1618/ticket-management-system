import { useEffect, useState } from 'react'

type ApiStatus = 'online' | 'offline' | 'unknown'

function HealthIndicator({ status }: { status: ApiStatus }) {
  if (status === 'online') {
    return (
      <div className="w-3.5 h-3.5 rounded-full bg-green-500 shadow-[0_0_10px_4px_rgba(34,197,94,0.75)]" />
    )
  }
  if (status === 'offline') {
    return (
      <div className="w-3.5 h-3.5 rounded-full bg-red-500 animate-pulse" />
    )
  }
  return <div className="w-3.5 h-3.5 rounded-full bg-gray-300" />
}

export default function App() {
  const [status, setStatus] = useState<ApiStatus>('unknown')

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/health')
        setStatus(res.ok ? 'online' : 'offline')
      } catch {
        setStatus('offline')
      }
    }

    check()
    const interval = setInterval(check, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="fixed top-4 right-4">
        <HealthIndicator status={status} />
      </div>
      <h1 className="text-2xl font-semibold text-gray-800">Ticket Management System</h1>
    </div>
  )
}
