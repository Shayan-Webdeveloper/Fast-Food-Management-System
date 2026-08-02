import clsx from 'clsx'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export function Button({ children, variant = 'primary', size = 'md', className, disabled, ...props }) {
  const variants = {
    primary: 'bg-brand-500 hover:bg-brand-600 text-white shadow-sm',
    secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-600',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    dark: 'bg-surface-800 hover:bg-surface-700 text-white',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none hover:-translate-y-0.5 hover:shadow-md active:translate-y-0',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

export function ThemeToggle({ className }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={clsx(
        'inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
        isDark
          ? 'border-slate-700 bg-slate-900/70 text-slate-200 hover:border-brand-400 hover:text-brand-300'
          : 'border-[#dfcfc0] bg-white/80 text-stone-700 hover:border-brand-300 hover:text-brand-700',
        className
      )}
      aria-label="Toggle color theme"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  )
}

export function Input({ label, error, className, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-slate-700">{label}</label>}
      <input
        className={clsx(
          'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
          error && 'border-red-400 focus:border-red-400 focus:ring-red-400/20',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

export function Select({ label, children, className, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-slate-700">{label}</label>}
      <select
        className={clsx(
          'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
          className
        )}
        {...props}
      >
        {children}
      </select>
    </div>
  )
}

export function Card({ children, className, ...props }) {
  return (
    <div className={clsx('rounded-xl border border-slate-200 bg-white p-5 shadow-sm', className)} {...props}>
      {children}
    </div>
  )
}

export function Badge({ children, variant = 'default', className }) {
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    brand: 'bg-brand-100 text-brand-800',
  }

  return (
    <span className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  )
}

export function StatCard({ title, value, change, icon: Icon, trend = 'up' }) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
          {change && (
            <p className={clsx('mt-1 text-xs font-medium', trend === 'up' ? 'text-green-600' : 'text-red-600')}>
              {trend === 'up' ? '↑' : '↓'} {change}
            </p>
          )}
        </div>
        {Icon && (
          <div className="rounded-lg bg-brand-50 p-2.5">
            <Icon className="h-5 w-5 text-brand-500" />
          </div>
        )}
      </div>
    </Card>
  )
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && <Icon className="mb-3 h-10 w-10 text-slate-300" />}
      <h3 className="text-lg font-medium text-slate-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
