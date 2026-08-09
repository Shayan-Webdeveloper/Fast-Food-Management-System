import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useTheme } from '../context/ThemeContext'
import { Button, Input, ThemeToggle } from '../components/ui'
import { friendlyError } from '../utils/errorMessages'

export default function ResetPassword() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
      else setError('This password reset link is invalid or has expired. Please request a new one.')
    })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(friendlyError(error.message))
    } else {
      setDone(true)
      setTimeout(() => navigate('/dashboard'), 1500)
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

        {done ? (
          <div className="text-center">
            <h2 className={`text-2xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Password updated!</h2>
            <p className={`mt-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Redirecting you to your dashboard...</p>
          </div>
        ) : (
          <>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Set a new password</h2>
            <p className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Choose a new password for your account.</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <Input label="New password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" required disabled={!ready} />
              <Input label="Confirm password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" required disabled={!ready} />
              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading || !ready}>
                {loading ? 'Updating...' : 'Update password'}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}