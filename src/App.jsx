import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import ScrollToHash from './components/ScrollToHash'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { animateOnScroll, animatePageIn } from './lib/gsap'
import { AuthProvider } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import { ProtectedRoute, PublicRoute } from './components/auth/ProtectedRoute'
import DashboardLayout from './components/layout/DashboardLayout'

import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Overview from './pages/dashboard/Overview'
import Orders from './pages/dashboard/Orders'
import MenuManagement from './pages/dashboard/Menu'
import Analytics from './pages/dashboard/Analytics'
import Customers from './pages/dashboard/Customers'
import Settings from './pages/dashboard/Settings'
import OrderFood from './pages/dashboard/OrderFood'
import MyOrders from './pages/dashboard/MyOrders'
import Profile from './pages/dashboard/Profile'
import RestaurantLayout from './components/layout/RestaurantLayout'
import MenuPage from './pages/Menu'
import ProductPage from './pages/Product'
import Checkout from './pages/Checkout'

function DashboardWrapper({ children, roles }) {
  return (
    <ProtectedRoute roles={roles}>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  )
}

function AppShell() {
  const location = useLocation()

  useEffect(() => {
    const revealElements = Array.from(document.querySelectorAll('main section, main article:not(.menu-card), main > div:not(.menu-page-root):not(.order-food-root), main > .reveal-on-scroll')).filter((el) => !el.closest('.dashboard-main'))

    if (!revealElements.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target
            target.classList.add('is-visible')
            observer.unobserve(target)
          }
        })
      },
      { threshold: 0.12 }
    )

    revealElements.forEach((element, index) => {
      if (!element.classList.contains('reveal-on-scroll')) {
        element.classList.add('reveal-on-scroll')
      }
      element.classList.add(index % 2 === 0 ? 'from-left' : 'from-right')
      observer.observe(element)
    })

    const main = document.querySelector('main')
    const frame = window.requestAnimationFrame(() => {
      if (main) {
        animatePageIn(main)
        animateOnScroll(main)
      }
    })

    return () => {
      window.cancelAnimationFrame(frame)
      observer.disconnect()
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [location.pathname])

  return <AppRoutes />
}

function AppRoutes() {
  return (
    <>
      <ScrollToHash />
      <Routes>
      <Route path="/" element={<RestaurantLayout><Landing /></RestaurantLayout>} />
      <Route path="/menu" element={<RestaurantLayout><MenuPage /></RestaurantLayout>} />
      <Route path="/menu/:id" element={<RestaurantLayout><ProductPage /></RestaurantLayout>} />
      <Route path="/checkout" element={<RestaurantLayout><Checkout /></RestaurantLayout>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      <Route path="/dashboard" element={<DashboardWrapper><Overview /></DashboardWrapper>} />
      <Route path="/dashboard/orders" element={<DashboardWrapper><Orders /></DashboardWrapper>} />
      <Route path="/dashboard/menu" element={<DashboardWrapper><MenuManagement /></DashboardWrapper>} />
      <Route path="/dashboard/analytics" element={<DashboardWrapper><Analytics /></DashboardWrapper>} />
      <Route path="/dashboard/customers" element={<DashboardWrapper roles={['admin']}><Customers /></DashboardWrapper>} />
      <Route path="/dashboard/settings" element={<DashboardWrapper><Settings /></DashboardWrapper>} />
      <Route path="/dashboard/order" element={<DashboardWrapper><OrderFood /></DashboardWrapper>} />
      <Route path="/dashboard/my-orders" element={<DashboardWrapper><MyOrders /></DashboardWrapper>} />
      <Route path="/dashboard/profile" element={<DashboardWrapper><Profile /></DashboardWrapper>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
      <ToastProvider>
      <AuthProvider>
        <DataProvider>
        <AppShell />
        </DataProvider>
      </AuthProvider>
      </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
