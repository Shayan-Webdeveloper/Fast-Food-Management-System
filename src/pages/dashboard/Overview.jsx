import { useRevealAnimation } from '../../hooks/useRevealAnimation'
import { DollarSign, ShoppingBag, Users, TrendingUp, Clock, Bell } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { StatCard, Card, Badge } from '../../components/ui'
import { ORDER_STATUS_CONFIG } from '../../data/mockData'

export default function Overview() {
  const { user, isStaff } = useAuth()
  const { orders, notifications, cart, cartTotal } = useData()
// const pageRef = useRef(null)
// const animatedRef = useRef(false)

// useEffect(() => {
//   if (orders && !animatedRef.current && pageRef.current) {
//     animatedRef.current = true
//     const cards = pageRef.current.querySelectorAll('[data-gsap-in] > *')
//     requestAnimationFrame(() => {
//       gsap.fromTo(
//         cards,
//         { opacity: 0, y: 40, scale: 0.94 },
//         { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.12, ease: 'power3.out' }
//       )
//     })
//   }
// }, [orders])
const pageRef = useRevealAnimation(!!orders)
  if (!isStaff) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome, {user.name.split(' ')[0]}!</h1>
        <p className="mt-1 text-slate-500">Ready to order some delicious food?</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <StatCard title="Total Orders" value={orders.length} icon={ShoppingBag} />
          <StatCard title="Cart Items" value={cart.length} icon={ShoppingBag} />
          <StatCard title="Cart Total" value={`$${cartTotal.toFixed(2)}`} icon={DollarSign} />
        </div>

        <Card className="mt-6">
          <h3 className="font-semibold text-slate-900">Recent Orders</h3>
          {orders.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No orders yet. Start by browsing our menu!</p>
          ) : (
            <div className="mt-4 space-y-3">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                  <div>
                    <p className="text-sm font-medium">{order.id}</p>
                    <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">${order.total.toFixed(2)}</span>
                    <Badge variant={order.status === 'delivered' ? 'success' : order.status === 'cancelled' ? 'danger' : 'warning'}>
                      {ORDER_STATUS_CONFIG[order.status]?.label}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    )
  }

  const todayOrders = orders.filter((o) => new Date(o.createdAt).toDateString() === new Date().toDateString())
  const totalRevenue = orders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0)
  const pendingOrders = orders.filter((o) => o.status === 'pending' || o.status === 'preparing')
  const unreadNotifs = notifications.filter((n) => !n.read)
  const now = Date.now()
  const oneWeek = 7 * 24 * 60 * 60 * 1000
  const thisWeekOrders = orders.filter((o) => o.status !== 'cancelled' && now - new Date(o.createdAt).getTime() <= oneWeek)
  const lastWeekOrders = orders.filter((o) => o.status !== 'cancelled' && now - new Date(o.createdAt).getTime() > oneWeek && now - new Date(o.createdAt).getTime() <= oneWeek * 2)

  const thisWeekRevenue = thisWeekOrders.reduce((s, o) => s + o.total, 0)
  const lastWeekRevenue = lastWeekOrders.reduce((s, o) => s + o.total, 0)
  const revenueChange = lastWeekRevenue ? (((thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100).toFixed(1) : null

  const ordersChange = lastWeekOrders.length ? (((thisWeekOrders.length - lastWeekOrders.length) / lastWeekOrders.length) * 100).toFixed(1) : null
  const activeCustomers = new Set(orders.filter((o) => o.status !== 'cancelled').map((o) => o.customerId)).size

  const allCustomerFirstOrder = {}
  orders.filter((o) => o.status !== 'cancelled').forEach((o) => {
    const t = new Date(o.createdAt).getTime()
    if (!allCustomerFirstOrder[o.customerId] || t < allCustomerFirstOrder[o.customerId]) {
      allCustomerFirstOrder[o.customerId] = t
    }
  })
  const newCustomersThisWeek = Object.values(allCustomerFirstOrder).filter((t) => now - t <= oneWeek).length

  const yesterdayOrders = orders.filter((o) => {
    const d = new Date(o.createdAt)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return o.status !== 'cancelled' && d.toDateString() === yesterday.toDateString()
  })
  const todayChange = yesterdayOrders.length
    ? (((todayOrders.length - yesterdayOrders.length) / yesterdayOrders.length) * 100).toFixed(1)
    : null
const revenueData = (() => {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push({ date: d.toDateString(), day: d.toLocaleDateString('en-US', { weekday: 'short' }), revenue: 0 })
  }
  orders.forEach((o) => {
    if (o.status === 'cancelled') return
    const orderDate = new Date(o.createdAt).toDateString()
    const match = days.find((d) => d.date === orderDate)
    if (match) match.revenue += o.total
  })
  return days.map(({ day, revenue }) => ({ day, revenue: Number(revenue.toFixed(2)) }))
})()
  return (
    <div ref={pageRef}>
      <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
      <p className="mt-1 text-slate-500">Welcome back, {user.name}. Here's what's happening today.</p>

      <div data-gsap-in="zoom-flip" className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={`$${totalRevenue.toFixed(0)}`}
          change={revenueChange === null ? 'No data last week' : `${Math.abs(revenueChange)}% vs last week`}
          trend={revenueChange === null || revenueChange >= 0 ? 'up' : 'down'}
          icon={DollarSign}
        />
        <StatCard
          title="Total Orders"
          value={orders.length}
          change={ordersChange === null ? 'No data last week' : `${Math.abs(ordersChange)}% vs last week`}
          trend={ordersChange === null || ordersChange >= 0 ? 'up' : 'down'}
          icon={ShoppingBag}
        />
        <StatCard
          title="Today's Orders"
          value={todayOrders.length}
          change={todayChange === null ? 'No data yesterday' : `${Math.abs(todayChange)}% vs yesterday`}
          trend={todayChange === null || todayChange >= 0 ? 'up' : 'down'}
          icon={Clock}
        />
        <StatCard
          title="Active Customers"
          value={activeCustomers}
          change={`${newCustomersThisWeek} new this week`}
          trend="up"
          icon={Users}
        />
      </div>

      <div data-gsap-in="slide-left" className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Revenue Overview</h3>
            <Badge variant="brand"><TrendingUp className="mr-1 inline h-3 w-3" /> This Week</Badge>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#f97316" fill="url(#colorRev)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Notifications</h3>
            <Bell className="h-4 w-4 text-slate-400" />
          </div>
          <div className="space-y-3">
            {unreadNotifs.length === 0 && notifications.length === 0 ? (
              <p className="text-sm text-slate-500">No notifications</p>
            ) : (
              notifications.slice(0, 4).map((n) => (
                <div key={n.id} className={`rounded-lg p-3 ${n.read ? 'bg-slate-50' : 'bg-brand-50 border border-brand-100'}`}>
                  <p className="text-sm font-medium text-slate-900">{n.title}</p>
                  <p className="text-xs text-slate-500">{n.message}</p>
                  <p className="mt-1 text-xs text-slate-400">{n.time}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card data-gsap-in="blur" className="mt-6">
        <h3 className="mb-4 font-semibold text-slate-900">Pending Orders ({pendingOrders.length})</h3>
        {pendingOrders.length === 0 ? (
          <p className="text-sm text-slate-500">All caught up! No pending orders.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-slate-500">
                  <th className="pb-3 pr-4 font-medium">Order</th>
                  <th className="pb-3 pr-4 font-medium">Customer</th>
                  <th className="pb-3 pr-4 font-medium">Items</th>
                  <th className="pb-3 pr-4 font-medium">Total</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {pendingOrders.map((order) => (
                  <tr key={order.id} className="border-b border-slate-50">
                    <td className="py-3 pr-4 font-medium">{order.id}</td>
                    <td className="py-3 pr-4">{order.customerName}</td>
                    <td className="py-3 pr-4">{order.items.length} items</td>
                    <td className="py-3 pr-4 font-semibold">${order.total.toFixed(2)}</td>
                    <td className="py-3">
                      <Badge variant="warning">{ORDER_STATUS_CONFIG[order.status]?.label}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
