import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { ThemeToggle } from '../ui'

export function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  const { theme } = useTheme()
  const location = useLocation()
  const isDark = theme === 'dark'

  if (loading) {
    return (
      <div className={`relative flex min-h-screen items-center justify-center px-4 transition-colors duration-300 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-[#fffaf3] text-slate-900'}`}>
        <ThemeToggle className="absolute right-4 top-4" />
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
      )
    }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export function PublicRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return null
  if (user) return <Navigate to="/dashboard" replace />

  return children
}
