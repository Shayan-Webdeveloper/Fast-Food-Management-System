import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { gsap } from 'gsap'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Button, Input, ThemeToggle } from '../components/ui'
import { friendlyError } from '../utils/errorMessages'

export default function Login() {
  const { login } = useAuth()
  const { theme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const authShellRef = useRef(null)

  const from = location.state?.from?.pathname || '/dashboard'
  const isDark = theme === 'dark'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(email, password)
    if (result.success) {
      navigate(from, { replace: true })
    } else {
      setError(friendlyError(result.error))
    }
    setLoading(false)
  }

  useEffect(() => {
    const items = authShellRef.current?.querySelectorAll('[data-auth-animate]')
    if (!items?.length) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        items,
        { opacity: 0, y: 24, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.9, stagger: 0.08, ease: 'power3.out' }
      )
    }, authShellRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={authShellRef} className={`flex min-h-screen flex-col transition-colors duration-300 lg:flex-row ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-[#fffaf3] text-slate-900'}`}>
      <div data-auth-animate className="hidden w-full bg-gradient-to-br from-brand-500 to-red-600 lg:flex lg:w-1/2 lg:flex-col lg:justify-center lg:p-12">
        <span className="text-5xl">🍔</span>
        <h1 className="mt-6 text-4xl font-bold text-white">FoodHub Pro</h1>
        <p className="mt-4 max-w-md text-lg text-brand-100">
          Sign in to access your restaurant dashboard, manage orders, view analytics, and more.
        </p>
      </div>

      <div data-auth-animate className="relative flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-8">
        <ThemeToggle className="absolute right-4 top-4" />
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <span className="text-3xl">🍔</span>
            <h1 className="mt-2 text-2xl font-bold">FoodHub Pro</h1>
          </div>

          <div data-auth-animate>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Welcome back</h2>
            <p className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Sign in to your account to continue</p>
          </div>

          <form data-auth-animate onSubmit={handleSubmit} className="mt-8 space-y-4">
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p data-auth-animate className={`mt-6 text-center text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-brand-500 hover:text-brand-600">Create one</Link>
          </p>
          <p data-auth-animate className="mt-2 text-center">
            <Link to="/" className={`text-sm ${isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}>← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
