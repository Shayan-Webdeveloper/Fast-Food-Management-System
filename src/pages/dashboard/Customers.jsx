import { useState } from 'react'
import { Search, Mail, ShoppingBag } from 'lucide-react'
import { Card, Badge, Input } from '../../components/ui'
import { useRevealAnimation } from '../../hooks/useRevealAnimation'
import { useData } from '../../context/DataContext'

export default function Customers() {
  const { allOrders } = useData()
  const pageRef = useRevealAnimation(!!allOrders)
  const [search, setSearch] = useState('')

  const customers = (() => {
    const map = {}
    allOrders.forEach((o) => {
      if (o.status === 'cancelled') return
      if (!map[o.customerId]) {
        map[o.customerId] = {
          id: o.customerId,
          name: o.customerName,
          email: o.customerEmail,
          orders: 0,
          spent: 0,
          lastOrder: o.createdAt,
        }
      }
      const c = map[o.customerId]
      c.orders += 1
      c.spent += o.total
      if (new Date(o.createdAt) > new Date(c.lastOrder)) c.lastOrder = o.createdAt
    })
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
    return Object.values(map).map((c) => ({
      ...c,
      status: new Date(c.lastOrder).getTime() >= thirtyDaysAgo ? 'active' : 'inactive',
    }))
  })()

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div ref={pageRef}>
      <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
      <p className="mt-1 text-slate-500">{customers.length} registered customers</p>

      <div data-gsap-in="zoom-flip" className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">Total Customers</p>
          <p className="text-2xl font-bold">{customers.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Active This Month</p>
          <p className="text-2xl font-bold">{customers.filter((c) => c.status === 'active').length}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Avg Lifetime Value</p>
          <p className="text-2xl font-bold">${customers.length ? (customers.reduce((s, c) => s + c.spent, 0) / customers.length).toFixed(0) : '0'}</p>
        </Card>
      </div>

      <div data-gsap-in="fade" className="mt-6 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-3 text-sm outline-none focus:border-brand-500"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card data-gsap-in="slide-up" data-gsap-delay="0.2" className="mt-6 !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-slate-500">
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Orders</th>
                <th className="px-5 py-3 font-medium">Total Spent</th>
                <th className="px-5 py-3 font-medium">Last Order</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((customer) => (
                <tr key={customer.id} className="border-t border-slate-100">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                        {customer.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <span className="font-medium">{customer.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{customer.email}</td>
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-1"><ShoppingBag className="h-3.5 w-3.5" /> {customer.orders}</span>
                  </td>
                  <td className="px-5 py-3 font-semibold">${customer.spent.toFixed(2)}</td>
                  <td className="px-5 py-3 text-slate-500">{new Date(customer.lastOrder).toLocaleDateString()}</td>
                  <td className="px-5 py-3">
                    <Badge variant={customer.status === 'active' ? 'success' : 'default'}>
                      {customer.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
