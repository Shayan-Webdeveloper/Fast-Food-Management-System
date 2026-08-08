import { useState } from 'react'
import { useRevealAnimation } from '../../hooks/useRevealAnimation'
import { Search, Filter } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useToast } from '../../context/ToastContext'
import { Card, Badge, Select } from '../../components/ui'
import { CustomSelect } from '../../components/ui/CustomSelect'
import { ORDER_STATUS_CONFIG } from '../../data/mockData'

export default function Orders() {
  const { orders, updateOrderStatus, markReturned, loading } = useData()
  const { showToast } = useToast()
  const pageRef = useRevealAnimation(!!orders)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500" />
        <p className="mt-4 text-sm text-slate-500">Loading orders...</p>
      </div>
    )
  }

  const filtered = orders.filter((o) => {
    const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || o.status === statusFilter
    return matchSearch && matchStatus
  })

  const statuses = ['pending', 'preparing', 'ready', 'delivered', 'cancelled']

  return (
    <div ref={pageRef}>
      <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
      <p className="mt-1 text-slate-500">Manage and track all restaurant orders</p>

      <div data-gsap-in="slide-up" className="mt-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative z-20 flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <CustomSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[{ value: 'all', label: 'All Status' }, ...statuses.map((s) => ({ value: s, label: ORDER_STATUS_CONFIG[s].label }))]}
          />
        </div>
      </div>

      <div data-gsap-in="zoom-flip" className="mt-4 grid gap-3 sm:grid-cols-5">
        {statuses.map((s) => {
          const count = orders.filter((o) => o.status === s).length
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s === statusFilter ? 'all' : s)}
              className={`rounded-lg border p-3 text-left transition cursor-pointer ${statusFilter === s ? 'border-brand-500 bg-brand-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
            >
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-xs text-slate-500">{ORDER_STATUS_CONFIG[s].label}</p>
            </button>
          )
        })}
      </div>

      <Card data-gsap-in="blur" data-gsap-delay="0.4" className="mt-6 !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-slate-500">
                <th className="px-5 py-3 font-medium">Order ID</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Items</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Payment</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id} className="border-t border-slate-100">
                  <td className="px-5 py-3 font-medium">{order.id}</td>
                  <td className="px-5 py-3">{order.customerName}</td>
                  <td className="px-5 py-3">
                    <div className="max-w-[200px]">
                      {order.items.map((i) => (
                        <span key={i.id} className="block text-xs text-slate-500">{i.qty}x {i.name}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3 font-semibold">${order.total.toFixed(2)}</td>
                  <td className="px-5 py-3 capitalize">{order.paymentMethod}</td>
                  <td className="px-5 py-3 text-slate-500">{new Date(order.createdAt).toLocaleString()}</td>
                  <td className="px-5 py-3">
                    <Badge variant={
                      order.status === 'delivered' ? 'success' :
                      order.status === 'cancelled' ? 'danger' :
                      order.status === 'ready' ? 'info' : 'warning'
                    }>
                      {ORDER_STATUS_CONFIG[order.status]?.label}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <Select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="!py-1 text-xs"
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>{ORDER_STATUS_CONFIG[s].label}</option>
                        ))}
                      </Select>
                    )}
                    {order.status === 'delivered' && (
                      order.returned ? (
                        <span className="text-xs font-medium text-red-500">Returned</span>
                      ) : (
                        <button
                          onClick={async () => {
                            try {
                              await markReturned(order.id)
                              showToast(`Order ${order.id} marked as returned`)
                            } catch (error) {
                              showToast('Could not mark order as returned', 'error')
                            }
                          }}
                          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:border-red-300 hover:text-red-500 cursor-pointer"
                        >
                          Mark as Returned
                        </button>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-500">No orders found</p>
          )}
        </div>
      </Card>
    </div>
  )
}
