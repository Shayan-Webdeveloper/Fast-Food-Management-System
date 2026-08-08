import { useRevealAnimation } from '../../hooks/useRevealAnimation'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, Star } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { StatCard, Card, Badge } from '../../components/ui'

export default function Analytics() {
  const { allOrders, menu } = useData()
  const pageRef = useRevealAnimation(!!allOrders)

  const totalRevenue = allOrders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0)
  const avgOrderValue = allOrders.length ? totalRevenue / allOrders.filter((o) => o.status !== 'cancelled').length : 0
  const completionRate = allOrders.length
    ? ((allOrders.filter((o) => o.status === 'delivered').length / allOrders.length) * 100).toFixed(1)
    : 0
const ratedOrders = allOrders.filter((o) => o.rating)
const avgRating = ratedOrders.length
    ? (ratedOrders.reduce((s, o) => s + o.rating, 0) / ratedOrders.length).toFixed(1)
    : 0
    const now = Date.now()
  const oneWeek = 7 * 24 * 60 * 60 * 1000
  const thisWeekOrders = allOrders.filter((o) => o.status !== 'cancelled' && now - new Date(o.createdAt).getTime() <= oneWeek)
  const lastWeekOrders = allOrders.filter((o) => o.status !== 'cancelled' && now - new Date(o.createdAt).getTime() > oneWeek && now - new Date(o.createdAt).getTime() <= oneWeek * 2)

  const thisWeekRevenue = thisWeekOrders.reduce((s, o) => s + o.total, 0)
  const lastWeekRevenue = lastWeekOrders.reduce((s, o) => s + o.total, 0)
  const revenueChange = lastWeekRevenue ? (((thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100).toFixed(1) : null

  const thisWeekAvgOrder = thisWeekOrders.length ? thisWeekRevenue / thisWeekOrders.length : 0
  const lastWeekAvgOrder = lastWeekOrders.length ? lastWeekRevenue / lastWeekOrders.length : 0
  const avgOrderChange = lastWeekAvgOrder ? (((thisWeekAvgOrder - lastWeekAvgOrder) / lastWeekAvgOrder) * 100).toFixed(1) : null

  const thisWeekCompletion = thisWeekOrders.length ? (thisWeekOrders.filter((o) => o.status === 'delivered').length / thisWeekOrders.length) * 100 : 0
  const lastWeekCompletion = lastWeekOrders.length ? (lastWeekOrders.filter((o) => o.status === 'delivered').length / lastWeekOrders.length) * 100 : 0
  const completionChange = lastWeekOrders.length ? (thisWeekCompletion - lastWeekCompletion).toFixed(1) : null

  const uniqueCustomers = new Set(allOrders.filter((o) => o.status !== 'cancelled').map((o) => o.customerId)).size
  const thisWeekCustomers = new Set(thisWeekOrders.map((o) => o.customerId)).size
  const lastWeekCustomers = new Set(lastWeekOrders.map((o) => o.customerId)).size
  const customersChange = lastWeekCustomers ? (((thisWeekCustomers - lastWeekCustomers) / lastWeekCustomers) * 100).toFixed(1) : null
    const prepTimes = allOrders
    .filter((o) => o.preparingAt && o.readyAt)
    .map((o) => (new Date(o.readyAt) - new Date(o.preparingAt)) / 60000)
const avgPrepTime = prepTimes.length
    ? (prepTimes.reduce((s, t) => s + t, 0) / prepTimes.length).toFixed(1)
    : 0
    const returnRate = allOrders.length
    ? ((allOrders.filter((o) => o.returned).length / allOrders.length) * 100).toFixed(1)
    : 0
  const topItems = {}
  allOrders.forEach((o) => {
    o.items.forEach((i) => {
      topItems[i.name] = (topItems[i.name] || 0) + i.qty
    })
  })
  const topItemsList = Object.entries(topItems)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, qty]) => ({ name, qty }))
const revenueData = (() => {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push({ date: d.toDateString(), day: d.toLocaleDateString('en-US', { weekday: 'short' }), revenue: 0, orders: 0 })
  }
  allOrders.forEach((o) => {
    if (o.status === 'cancelled') return
    const orderDate = new Date(o.createdAt).toDateString()
    const match = days.find((d) => d.date === orderDate)
    if (match) { match.revenue += o.total; match.orders += 1 }
  })
  return days.map(({ day, revenue, orders }) => ({ day, revenue: Number(revenue.toFixed(2)), orders }))
})()

const categoryColors = ['#f97316', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ec4899', '#14b8a6', '#f43f5e']
const categorySales = (() => {
  const categoryQty = {}
  allOrders.forEach((o) => {
    if (o.status === 'cancelled') return
    o.items.forEach((i) => {
      const menuItem = menu.find((m) => m.id === i.id)
      const cat = menuItem?.category || 'Other'
      categoryQty[cat] = (categoryQty[cat] || 0) + i.qty
    })
  })
  const total = Object.values(categoryQty).reduce((s, v) => s + v, 0)
  return Object.entries(categoryQty).map(([name, qty], i) => ({
    name,
    value: total ? Math.round((qty / total) * 100) : 0,
    color: categoryColors[i % categoryColors.length],
  }))
})()
  return (
    <div ref={pageRef}>
      <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
      <p className="mt-1 text-slate-500">Detailed insights into your restaurant performance</p>

      <div data-gsap-in="zoom-flip" className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={`$${totalRevenue.toFixed(0)}`}
          change={revenueChange === null ? 'No data last week' : `${Math.abs(revenueChange)}%`}
          trend={revenueChange === null || revenueChange >= 0 ? 'up' : 'down'}
          icon={DollarSign}
        />
        <StatCard
          title="Avg Order Value"
          value={`$${avgOrderValue.toFixed(2)}`}
          change={avgOrderChange === null ? 'No data last week' : `${Math.abs(avgOrderChange)}%`}
          trend={avgOrderChange === null || avgOrderChange >= 0 ? 'up' : 'down'}
          icon={ShoppingBag}
        />
        <StatCard
          title="Completion Rate"
          value={`${completionRate}%`}
          change={completionChange === null ? 'No data last week' : `${Math.abs(completionChange)} pts`}
          trend={completionChange === null || completionChange >= 0 ? 'up' : 'down'}
          icon={Star}
        />
        <StatCard
          title="Unique Customers"
          value={uniqueCustomers}
          change={customersChange === null ? 'No data last week' : `${Math.abs(customersChange)}%`}
          trend={customersChange === null || customersChange >= 0 ? 'up' : 'down'}
          icon={Users}
        />
      </div>

      <div data-gsap-in="flip-3d" className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 font-semibold text-slate-900">Weekly Revenue & Orders</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar yAxisId="left" dataKey="revenue" fill="#f97316" radius={[4, 4, 0, 0]} name="Revenue ($)" />
              <Bar yAxisId="right" dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="mb-4 font-semibold text-slate-900">Sales by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={categorySales} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, value }) => `${name} ${value}%`}>
  {categorySales.map((entry) => (
    <Cell key={entry.name} fill={entry.color} />
  ))}
</Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div data-gsap-in="elastic" data-gsap-delay="0.6" className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 font-semibold text-slate-900">Top Selling Items</h3>
          {topItemsList.length === 0 ? (
            <p className="text-sm text-slate-500">No data yet</p>
          ) : (
            <div className="space-y-3">
              {topItemsList.map((item, i) => (
                <div key={item.name} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-600">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    <div className="mt-1 h-2 rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-brand-500"
                        style={{ width: `${(item.qty / topItemsList[0].qty) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-slate-600">{item.qty} sold</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h3 className="mb-4 font-semibold text-slate-900">Performance Metrics</h3>
          <div className="space-y-4">
            {[
             { label: 'Order Fulfillment', value: Number(completionRate), trend: 'up' },
              { label: 'Customer Satisfaction', value: Number(avgRating), trend: 'up', isRating: true },
              { label: 'Avg Prep Time', value: `${avgPrepTime} min`, trend: 'down', isText: true },
              { label: 'Return Rate', value: Number(returnRate), trend: 'up', suffix: '%' },
            ].map((metric) => (
              <div key={metric.label} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">{metric.label}</p>
                  <p className="text-lg font-bold text-brand-600">
                    {metric.isRating ? `${metric.value}/5` : metric.isText ? metric.value : `${metric.value}${metric.suffix || '%'}`}
                  </p>
                </div>
                {metric.trend === 'up'
                  ? <TrendingUp className="h-5 w-5 text-green-500" />
                  : <TrendingDown className="h-5 w-5 text-red-500" />
                }
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
