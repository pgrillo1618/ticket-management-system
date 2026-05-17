import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authClient } from '../lib/auth-client'

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-[1.618rem] px-4">

      {serverError && (
        <div className="relative w-full max-w-sm animate-cloud-in">
          <div className="animate-cloud-breathe [animation-delay:0.382s] [animation-fill-mode:backwards]">
            <div className="relative bg-red-50 border border-red-300 rounded-2xl px-4 py-3 animate-cloud-glow [animation-delay:0.382s] [animation-fill-mode:backwards]">
              <p className="text-sm text-red-700 font-medium text-center">{serverError}</p>
              {/* Speech bubble tail pointing down toward the form */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-red-50 border-r border-b border-red-300 rotate-45" />
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-sm">
        <div className={`bg-white rounded-2xl shadow-sm border p-8 w-full transition-colors duration-[382ms] ${serverError ? 'border-red-400 animate-border-glow [animation-delay:0.382s] [animation-fill-mode:backwards]' : 'border-gray-200'}`}>
          <h1 className="text-xl font-semibold text-gray-800 mb-6">Sign in</h1>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email')}
                className={`border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-[border-color,box-shadow] duration-[382ms] ${errors.email
                  ? 'border-red-500 focus:ring-red-500 animate-field-invalid'
                  : 'border-gray-300 focus:ring-blue-500'
                  }`}
              />
              {errors.email && (
                <p className="text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register('password')}
                className={`border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-[border-color,box-shadow] duration-[382ms] ${errors.password
                  ? 'border-red-500 focus:ring-red-500 animate-field-invalid'
                  : 'border-gray-300 focus:ring-blue-500'
                  }`}
              />
              {errors.password && (
                <p className="text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors"
            >
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>

    </div>
  )
}
