import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authClient } from '../lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const navigate = useNavigate()
  const { data: session, isPending } = authClient.useSession()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  if (!isPending && session) {
    navigate('/', { replace: true })
    return null
  }

  const onSubmit = async (values: FormData) => {
    setServerError(null)

    const { data, error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
      callbackURL: '/',
    })

    if (error) {
      setServerError(error.message ?? 'Sign in failed')
      return
    }

    if (data) {
      navigate('/', { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-[#1f1f1f] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm flex flex-col gap-6">

        {/* Brand */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="rounded-md border border-emerald-500/30 bg-emerald-950/20 overflow-hidden animate-golden-rect-glow"
            style={{ width: '81px', height: '50px' }}
          >
            <svg viewBox="-2 -2 165.8 104" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* golden ratio subdivision lines */}
              <line x1="100" y1="0" x2="100" y2="100" stroke="#2be9a1" strokeWidth="0.8" strokeOpacity="0.2" />
              <line x1="100" y1="61.8" x2="161.8" y2="61.8" stroke="#2be9a1" strokeWidth="0.8" strokeOpacity="0.2" />
              <line x1="123.6" y1="61.8" x2="123.6" y2="100" stroke="#2be9a1" strokeWidth="0.8" strokeOpacity="0.2" />
              <line x1="100" y1="76.4" x2="123.6" y2="76.4" stroke="#2be9a1" strokeWidth="0.8" strokeOpacity="0.2" />
              <line x1="114.6" y1="61.8" x2="114.6" y2="76.4" stroke="#2be9a1" strokeWidth="0.8" strokeOpacity="0.2" />
              <line x1="114.6" y1="70.8" x2="123.6" y2="70.8" stroke="#2be9a1" strokeWidth="0.8" strokeOpacity="0.2" />
              {/* golden spiral — 7 quarter-circle arcs, all CCW (sweep=0), drawn with dashoffset animation */}
              <path
                d="M 100 100 A 100 100 0 0 0 0 0 A 61.8 61.8 0 0 0 161.8 61.8 A 38.2 38.2 0 0 0 123.6 100 A 23.6 23.6 0 0 0 100 76.4 A 14.6 14.6 0 0 0 114.6 61.8 A 9 9 0 0 0 123.6 70.8 A 5.6 5.6 0 0 0 118 76.4"
                stroke="#2be9a1"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="400"
                strokeDashoffset="400"
                className="animate-golden-spiral"
              />
            </svg>
          </div>
          <div className="text-center">
            <h1 className="text-white text-[2.023rem] font-semibold tracking-tight">Log into your account</h1>
            <p className="text-zinc-500 text-sm mt-0.5">Ticket Management System</p>
          </div>
        </div>

        {/* Error */}
        {serverError && (
          <div className="animate-cloud-in bg-red-950/60 border border-red-800/50 rounded-md px-4 py-3">
            <p className="text-sm text-red-400 text-center font-medium">{serverError}</p>
          </div>
        )}

        {/* Card */}
        <div className={`bg-zinc-900 border rounded-md p-6 flex flex-col gap-4 transition-colors duration-[382ms] ${
          serverError
            ? 'border-red-800/60 animate-border-glow'
            : 'border-zinc-800'
        }`}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-zinc-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="Enter work email"
                {...register('email')}
                className={`bg-zinc-800/60 border rounded-sm px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-offset-0 transition-[border-color,box-shadow] duration-[382ms] ${
                  errors.email
                    ? 'border-red-700/70 focus-visible:ring-red-700/50 animate-field-invalid'
                    : 'border-zinc-700 focus-visible:border-zinc-500 focus-visible:ring-zinc-500/50'
                }`}
              />
              {errors.email && (
                <p className="text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-zinc-300">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter password"
                {...register('password')}
                className={`bg-zinc-800/60 border rounded-sm px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-offset-0 transition-[border-color,box-shadow] duration-[382ms] ${
                  errors.password
                    ? 'border-red-700/70 focus-visible:ring-red-700/50 animate-field-invalid'
                    : 'border-zinc-700 focus-visible:border-zinc-500 focus-visible:ring-zinc-500/50'
                }`}
              />
              {errors.password && (
                <p className="text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="mt-1 w-full bg-[#2be9a1] hover:bg-[#22d492] disabled:opacity-40 text-zinc-900 text-sm font-medium rounded-sm px-4 py-2.5 cursor-pointer"
            >
              {isSubmitting ? 'Signing in…' : 'Login'}
            </Button>

          </form>
        </div>

      </div>
    </div>
  )
}
