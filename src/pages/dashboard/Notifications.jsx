import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { Card } from '../../components/ui'

export default function Notifications() {
  const { notifications, markNotificationRead, markAllNotificationsRead, loading } = useData()
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => {
    if (!selectedId && notifications.length) {
      setSelectedId(notifications[0].id)
    }
  }, [notifications, selectedId])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500" />
        <p className="mt-4 text-sm text-slate-500">Loading notifications...</p>
      </div>
    )
  }

  const selected = notifications.find((n) => n.id === selectedId)
  const unreadCount = notifications.filter((n) => !n.read).length

  const handleSelect = (n) => {
    setSelectedId(n.id)
    if (!n.read) markNotificationRead(n.id)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="mt-1 text-slate-500">{notifications.length} total · {unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllNotificationsRead}
            className="cursor-pointer rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* List */}
        <Card className="!p-0 overflow-hidden">
          <div className="max-h-[70vh] overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-slate-500">No notifications yet</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleSelect(n)}
                  className={`block w-full cursor-pointer border-b border-slate-100 px-4 py-3 text-left transition ${
                    selectedId === n.id ? 'bg-brand-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className={`truncate text-sm ${n.read ? 'font-medium text-slate-700' : 'font-bold text-slate-900'}`}>
                      {n.title}
                    </p>
                    {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-brand-500" />}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-slate-500">{n.message}</p>
                  <p className="mt-1 text-xs text-slate-400">{new Date(n.created_at).toLocaleString()}</p>
                </button>
              ))
            )}
          </div>
        </Card>

        {/* Detail */}
        <Card>
          {selected ? (
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <Bell className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-xl font-bold text-slate-900">{selected.title}</h2>
              <p className="mt-1 text-xs text-slate-400">{new Date(selected.created_at).toLocaleString()}</p>
              <p className="mt-4 leading-6 text-slate-600">{selected.message}</p>

              {selected.relatedOrder && (
                <div className="mt-6 space-y-5 border-t border-slate-100 pt-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Customer</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{selected.relatedOrder.customerName}</p>
                      <p className="text-sm text-slate-500">{selected.relatedOrder.customerEmail}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Payment</p>
                      <p className="mt-1 text-sm font-semibold capitalize text-slate-900">{selected.relatedOrder.paymentMethod}</p>
                      <p className="text-sm text-slate-500">Total: ${selected.relatedOrder.total.toFixed(2)}</p>
                    </div>
                  </div>

                  {selected.relatedOrder.orderType === 'counter' ? (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Order type</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">Counter sale (paid in-store)</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Delivery</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">Name: {selected.relatedOrder.deliveryName}</p>
                      <p className="text-sm text-slate-500">Contact: {selected.relatedOrder.deliveryPhone}</p>
                      <p className="text-sm text-slate-500">Address: {selected.relatedOrder.deliveryAddress}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Items</p>
                    <div className="mt-2 space-y-2">
                      {selected.relatedOrder.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                          <span className="font-medium text-slate-700">{item.qty}x {item.name}</span>
                          <span className="text-slate-500">${(item.price * item.qty).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center py-16 text-center">
              <Bell className="h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm text-slate-500">Select a notification to view details</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}