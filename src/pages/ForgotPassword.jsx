import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useTheme } from '../context/ThemeContext'
import { Button, Input, ThemeToggle } from '../components/ui'
import { friendlyError } from '../utils/errorMessages'

export default function ForgotPassword() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) {
      setError(friendlyError(error.message))
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className={`flex min-h-screen flex-col items-center justify-center p-4 transition-colors duration-300 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-[#fffaf3] text-slate-900'}`}>
      <ThemeToggle className="absolute right-4 top-4" />
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="text-3xl">🍔</span>
          <h1 className="mt-2 text-2xl font-bold">FoodHub Pro</h1>
        </div>

        {sent ? (
          <div className="text-center">
            <h2 className={`text-2xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Check your email</h2>
            <p className={`mt-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              If an account exists for {email}, we've sent a link to reset your password.
            </p>
            <Link to="/login" className="mt-6 inline-block">
              <Button variant="secondary">Back to sign in</Button>
            </Link>
          </div>
        ) : (
          <>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Reset your password</h2>
            <p className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Enter your email and we'll send you a link to reset it.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send reset link'}
              </Button>
            </form>

            <p className={`mt-6 text-center text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Remembered your password?{' '}
              <Link to="/login" className="font-medium text-brand-500 hover:text-brand-600">Sign in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}