import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Button, Input, ThemeToggle } from '../components/ui'
import { friendlyError } from '../utils/errorMessages'

export default function Register() {
  const { register } = useAuth()
  const { theme } = useTheme()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const authShellRef = useRef(null)
  const isDark = theme === 'dark'

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    const result = await register(form)
    if (result.success) {
      navigate('/dashboard')
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
        <h1 className="mt-6 text-4xl font-bold text-white">Join FoodHub Pro</h1>
        <p className="mt-4 max-w-md text-lg text-brand-100">
          Create your account and start managing your fast food business with professional SaaS tools.
        </p>
      </div>

      <div data-auth-animate className="relative flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-8">
        <ThemeToggle className="absolute right-4 top-4" />
        <div className="w-full max-w-md">
          <div data-auth-animate>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Create your account</h2>
            <p className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Start your 14-day free trial today</p>
          </div>

          <form data-auth-animate onSubmit={handleSubmit} className="mt-8 space-y-4">
            <Input label="Full Name" name="name" value={form.name} onChange={handleChange} placeholder="Ali Ahmed" required />
            <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@gmail.com" required />
            <Input label="Password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min 6 characters" required />
            {/* <div className={`rounded-xl border px-3 py-3 text-sm ${isDark ? 'border-slate-700 bg-slate-900/60 text-slate-300' : 'border-[#eadfd2] bg-white/80 text-slate-600'}`}> */}
              {/* <p className="font-semibold">Customer account</p> */}
              {/* <p className="mt-1 text-xs leading-5">Only customer accounts can be created from this sign-up flow, so you can order food and manage your profile.</p> */}
            {/* </div> */}
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <p data-auth-animate className={`mt-6 text-center text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-brand-500 hover:text-brand-600">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
