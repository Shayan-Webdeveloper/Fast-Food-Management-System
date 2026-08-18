import { useMemo, useState } from 'react'
import { useData } from '../../context/DataContext'
import { Card } from '../../components/ui'
import { DollarSign, Receipt, TrendingDown, XCircle } from 'lucide-react'
import { DatePicker } from '../../components/ui/DatePicker'

export default function DailySales() {
  const { orders } = useData()
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10))

  const dayOrders = useMemo(() => {
    return orders.filter((o) => {
      const orderDate = new Date(o.createdAt).toISOString().slice(0, 10)
      return orderDate === selectedDate && o.orderType === 'counter'
    })
  }, [orders, selectedDate])

  const activeOrders = dayOrders.filter((o) => o.status !== 'cancelled')
  const cancelledOrders = dayOrders.filter((o) => o.status === 'cancelled')

  const cashTotal = activeOrders.filter((o) => o.paymentMethod === 'cash').reduce((s, o) => s + o.total, 0)
  const cardTotal = activeOrders.filter((o) => o.paymentMethod === 'card').reduce((s, o) => s + o.total, 0)
  const grandTotal = cashTotal + cardTotal
  const totalDiscounts = activeOrders.reduce((s, o) => s + (o.subtotal ? o.subtotal - o.total : 0), 0)

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Daily Sales</h1>
          <p className="mt-1 text-slate-500">Counter sales summary for a shift or day.</p>
        </div>
        <DatePicker value={selectedDate} onChange={setSelectedDate} className="w-56" />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Sales</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">${grandTotal.toFixed(2)}</p>
            </div>
            <div className="rounded-lg bg-brand-50 p-2.5"><DollarSign className="h-5 w-5 text-brand-500" /></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">Orders</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{activeOrders.length}</p>
            </div>
            <div className="rounded-lg bg-brand-50 p-2.5"><Receipt className="h-5 w-5 text-brand-500" /></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">Discounts Given</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">${totalDiscounts.toFixed(2)}</p>
            </div>
            <div className="rounded-lg bg-brand-50 p-2.5"><TrendingDown className="h-5 w-5 text-brand-500" /></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">Voided</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{cancelledOrders.length}</p>
            </div>
            <div className="rounded-lg bg-red-50 p-2.5"><XCircle className="h-5 w-5 text-red-500" /></div>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="text-sm font-semibold text-slate-500">Cash</p>
          <p className="mt-1 text-xl font-bold text-slate-900">${cashTotal.toFixed(2)}</p>
          <p className="text-xs text-slate-400">{activeOrders.filter((o) => o.paymentMethod === 'cash').length} orders</p>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-slate-500">Card</p>
          <p className="mt-1 text-xl font-bold text-slate-900">${cardTotal.toFixed(2)}</p>
          <p className="text-xs text-slate-400">{activeOrders.filter((o) => o.paymentMethod === 'card').length} orders</p>
        </Card>
      </div>

      <Card className="mt-6 !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-slate-500">
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-5 py-3 font-medium">Time</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Payment</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {dayOrders.map((o) => (
                <tr key={o.id} className="border-t border-slate-100">
                  <td className="px-5 py-3 font-medium whitespace-nowrap">{o.id}</td>
                  <td className="px-5 py-3 text-slate-500 whitespace-nowrap">{new Date(o.createdAt).toLocaleTimeString()}</td>
                  <td className="px-5 py-3 font-semibold">${o.total.toFixed(2)}</td>
                  <td className="px-5 py-3 capitalize">{o.paymentMethod}</td>
                  <td className="px-5 py-3">
                    {o.status === 'cancelled' ? (
                      <span className="text-xs font-semibold text-red-500">Voided</span>
                    ) : (
                      <span className="text-xs font-semibold text-green-600">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
              {dayOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-500">No counter sales on this date.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}