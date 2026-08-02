import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, ShoppingBag, UtensilsCrossed, BarChart3, Users,
  Settings, UserCircle, LogOut, Menu as MenuIcon, X, Bell, ShoppingCart, Home, Moon, Sun,
  PanelLeftClose, PanelLeftOpen
} from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { useTheme } from '../../context/ThemeContext'

const staffNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { to: '/dashboard/orders', icon: ShoppingBag, label: 'Orders' },
  { to: '/dashboard/menu', icon: UtensilsCrossed, label: 'Menu' },
  { to: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/dashboard/customers', icon: Users, label: 'Customers', adminOnly: true },
  { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
]

const customerNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { to: '/dashboard/order', icon: UtensilsCrossed, label: 'Order Food' },
  { to: '/dashboard/my-orders', icon: ShoppingBag, label: 'My Orders' },
  { to: '/dashboard/profile', icon: UserCircle, label: 'Profile' },
]

export default function DashboardLayout({ children }) {
  const { user, logout, isAdmin, isStaff } = useAuth()
  const { notifications, cart } = useData()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const isDark = theme === 'dark'

  const navItems = isStaff ? staffNav.filter((n) => !n.adminOnly || isAdmin) : customerNav
  const unreadCount = notifications.filter((n) => !n.read).length

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className={`flex min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={clsx(
        'fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
        collapsed ? 'w-20' : 'w-64',
        isDark ? 'bg-slate-900' : 'bg-surface-900',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className={clsx('flex h-16 items-center border-b border-surface-700', collapsed ? 'justify-center px-2' : 'gap-2 px-5')}>
          {!collapsed && (
            <>
              <span className="text-2xl">🍔</span>
              <div>
                <p className="text-sm font-bold text-white">FoodHub Pro</p>
                <p className="text-xs text-slate-400 capitalize">{user?.role} Portal</p>
              </div>
              <button className="ml-auto text-slate-400 lg:hidden cursor-pointer" onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </>
          )}
          <button
            className={clsx('hidden text-slate-400 hover:text-white lg:block cursor-pointer', !collapsed && 'ml-auto')}
            onClick={() => setCollapsed((c) => !c)}
            aria-label="Toggle sidebar"
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard'}
              onClick={() => setSidebarOpen(false)}
              title={collapsed ? label : undefined}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                collapsed && 'justify-center',
                isActive ? 'bg-brand-500 text-white' : 'text-slate-300 hover:bg-surface-800 hover:text-white'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && label}
            </NavLink>
          ))}
        </nav>

        <div className="shrink-0 border-t border-surface-700 p-3">
          {!collapsed && (
            <div className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
                {user?.avatar}
              </div>
              <div className="flex-1 truncate">
                <p className="truncate text-sm font-medium text-white">{user?.name}</p>
                <p className="truncate text-xs text-slate-400">{user?.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            title={collapsed ? 'Sign Out' : undefined}
            className={clsx(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-surface-800 hover:text-white cursor-pointer',
              collapsed && 'justify-center'
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && 'Sign Out'}
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className={`sticky top-0 z-30 flex h-16 items-center gap-4 border-b px-4 backdrop-blur-xl lg:px-6 ${isDark ? 'border-slate-700 bg-slate-900/70' : 'border-slate-200 bg-white/80'}`}>
          <button className={`lg:hidden cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-600'}`} onClick={() => setSidebarOpen(true)}>
            <MenuIcon className="h-5 w-5" />
          </button>

          <div className="flex-1" />

          <button
            type="button"
            onClick={toggleTheme}
            className={`rounded-full border p-2 transition hover:border-brand-300 hover:text-brand-600 cursor-pointer ${isDark ? 'border-slate-700 text-slate-300 hover:border-brand-400 hover:text-brand-400' : 'border-slate-200 text-slate-600'}`}
            aria-label="Toggle color theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <NavLink to="/" className={`hidden items-center gap-1 text-sm hover:text-brand-500 sm:flex ${isDark ? 'text-slate-400 hover:text-brand-400' : 'text-slate-500'}`}>
            <Home className="h-4 w-4" />
            Website
          </NavLink>

          {!isStaff && cart.length > 0 && (
            <NavLink to="/dashboard/order" className={`relative hover:text-brand-500 ${isDark ? 'text-slate-300 hover:text-brand-400' : 'text-slate-600'}`}>
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white">
                {cart.reduce((s, i) => s + i.qty, 0)}
              </span>
            </NavLink>
          )}

          {isStaff && (
            <button className={`relative hover:text-brand-500 cursor-pointer ${isDark ? 'text-slate-300 hover:text-brand-400' : 'text-slate-600'}`}>
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>
          )}
        </header>

        <main className="flex-1 overflow-x-hidden p-3 sm:p-4 lg:p-6 dashboard-main">{children}</main>
      </div>
    </div>
  )
}
