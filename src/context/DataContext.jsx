  import { createContext, useCallback, useContext, useEffect, useState } from 'react'
  import { supabase } from '../lib/supabase'
  import { useAuth } from './AuthContext'

  const DataContext = createContext(null)
  const mapMenu = (item) => ({ ...item })
const mapOrder = (order) => ({
  id: order.order_number, dbId: order.id, customerId: order.customer_id,
  customerName: order.profiles?.full_name ?? 'Customer',
  customerEmail: order.profiles?.email ?? '',
  items: (order.order_items ?? []).map(({ menu_items, quantity, unit_price }) => ({ id: menu_items.id, name: menu_items.name, price: Number(unit_price), qty: quantity })),
  total: Number(order.total), status: order.status, createdAt: order.created_at, paymentMethod: order.payment_method, rating: order.rating,
  preparingAt: order.preparing_at, readyAt: order.ready_at, returned: order.returned,
})

  export function DataProvider({ children }) {
    const { user } = useAuth()
    const [menu, setMenu] = useState([])
    const [orders, setOrders] = useState([])
    const [notifications, setNotifications] = useState([])
    const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('foodhub_cart')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

    const refreshMenu = useCallback(async () => {
      let query = supabase.from('menu_items').select('*').order('created_at', { ascending: false })
      if (user?.role === 'customer' || !user) query = query.eq('available', true)
      const { data, error } = await query
      if (error) { console.error('Unable to load menu', error); return }
      setMenu(data.map(mapMenu))
    }, [user])

    const refreshData = useCallback(async () => {
      if (!user) return
      const [orderResult, notificationResult] = await Promise.all([
        supabase.from('orders').select('*, profiles!orders_customer_id_fkey(full_name, email), order_items(quantity, unit_price, menu_items(id, name))').order('created_at', { ascending: false }),
        supabase.from('notifications').select('*').order('created_at', { ascending: false }),
      ])
      const error = orderResult.error || notificationResult.error
      if (error) { console.error('Unable to load data', error); return }
      setOrders(orderResult.data.map(mapOrder))
      setNotifications(notificationResult.data)
    }, [user])

    useEffect(() => {
      refreshMenu()
      if (!user) { setOrders([]); setNotifications([]); return }
      refreshData()
    }, [user, refreshData, refreshMenu])
useEffect(() => {
    try {
      localStorage.setItem('foodhub_cart', JSON.stringify(cart))
    } catch {
      // ignore storage errors (e.g. private browsing quota)
    }
  }, [cart])
    const addMenuItem = useCallback(async (item) => {
      const { data, error } = await supabase.from('menu_items').insert({ ...item, available: true, popular: false }).select().single()
      if (error) throw error
      setMenu((current) => [mapMenu(data), ...current])
    }, [])
    const updateMenuItem = useCallback(async (id, updates) => {
      const { data, error } = await supabase.from('menu_items').update(updates).eq('id', id).select().single()
      if (error) throw error
      setMenu((current) => current.map((item) => item.id === id ? mapMenu(data) : item))
    }, [])
    const deleteMenuItem = useCallback(async (id) => {
      const { error } = await supabase.from('menu_items').delete().eq('id', id)
      if (error) throw error
      setMenu((current) => current.filter((item) => item.id !== id))
    }, [])
    const updateOrderStatus = useCallback(async (orderNumber, status) => {
      const order = orders.find((item) => item.id === orderNumber)
      if (!order) return
      const updates = { status }
      if (status === 'preparing') updates.preparing_at = new Date().toISOString()
      if (status === 'ready') updates.ready_at = new Date().toISOString()
      const { error } = await supabase.from('orders').update(updates).eq('id', order.dbId)
      if (error) throw error
      setOrders((current) => current.map((item) => item.id === orderNumber ? { ...item, ...updates, status } : item))
    }, [orders])
    const markReturned = useCallback(async (orderNumber) => {
      const order = orders.find((item) => item.id === orderNumber)
      if (!order) return
      const { error } = await supabase.from('orders').update({ returned: true }).eq('id', order.dbId)
      if (error) throw error
      setOrders((current) => current.map((item) => item.id === orderNumber ? { ...item, returned: true } : item))
    }, [orders])
    const submitRating = useCallback(async (orderNumber, rating) => {
      const order = orders.find((item) => item.id === orderNumber)
      if (!order) return
      const { error } = await supabase.from('orders').update({ rating }).eq('id', order.dbId)
      if (error) throw error
      setOrders((current) => current.map((item) => item.id === orderNumber ? { ...item, rating } : item))
    }, [orders])
    const placeOrder = useCallback(async (items, paymentMethod = 'card') => {
      const { data, error } = await supabase.rpc('place_order', { p_items: items.map(({ id, qty }) => ({ menu_item_id: id, quantity: qty })), p_payment_method: paymentMethod })
      if (error) throw error
      await refreshData(); setCart([])
      return data
    }, [refreshData])
    const addToCart = useCallback((item) => setCart((current) => {
      const existing = current.find((cartItem) => cartItem.id === item.id)
      return existing ? current.map((cartItem) => cartItem.id === item.id ? { ...cartItem, qty: cartItem.qty + 1 } : cartItem) : [...current, { ...item, qty: 1 }]
    }), [])
    const removeFromCart = useCallback((id) => setCart((current) => current.filter((item) => item.id !== id)), [])
    const updateCartQty = useCallback((id, qty) => setCart((current) => qty <= 0 ? current.filter((item) => item.id !== id) : current.map((item) => item.id === id ? { ...item, qty } : item)), [])
    const markNotificationRead = useCallback(async (id) => {
      const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id)
      if (!error) setNotifications((current) => current.map((item) => item.id === id ? { ...item, read: true } : item))
    }, [])
    const markAllNotificationsRead = useCallback(async () => {
      const { error } = await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false)
      if (!error) setNotifications((current) => current.map((item) => ({ ...item, read: true })))
    }, [user])
    const cartTotal = cart.reduce((total, item) => total + Number(item.price) * item.qty, 0)

    return <DataContext.Provider value={{ menu, orders, allOrders: orders, notifications, cart, cartTotal, addMenuItem, updateMenuItem, deleteMenuItem, updateOrderStatus, submitRating, markReturned, placeOrder, addToCart, removeFromCart, updateCartQty, clearCart: () => setCart([]), markNotificationRead, markAllNotificationsRead }}>{children}</DataContext.Provider>
  }

  export function useData() { const ctx = useContext(DataContext); if (!ctx) throw new Error('useData must be used within DataProvider'); return ctx }
