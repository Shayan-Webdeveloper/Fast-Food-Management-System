import { useState } from 'react'
import { useData } from '../../context/DataContext'
import { Star } from 'lucide-react'
import { Card, Badge, EmptyState } from '../../components/ui'
import { ORDER_STATUS_CONFIG } from '../../data/mockData'
import { ShoppingBag } from 'lucide-react'

export default function MyOrders() {
  const { orders, submitRating } = useData()
const [hovered, setHovered] = useState({})
const [pending, setPending] = useState({})

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">My Orders</h1>
      <p className="mt-1 text-slate-500">Track your order history and status</p>

      {orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No orders yet"
          description="Browse our menu and place your first order!"
        />
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-slate-900">{order.id}</h3>
                    <Badge variant={
                      order.status === 'delivered' ? 'success' :
                      order.status === 'cancelled' ? 'danger' : 'warning'
                    }>
                      {ORDER_STATUS_CONFIG[order.status]?.label}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {new Date(order.createdAt).toLocaleString()} · {order.paymentMethod}
                  </p>
                </div>
                <p className="text-xl font-bold text-brand-600">${order.total.toFixed(2)}</p>
              </div>
              <div className="mt-4 rounded-lg bg-slate-50 p-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm py-1">
                    <span>{item.qty}x {item.name}</span>
                    <span className="text-slate-500">${(item.price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              {order.status === 'delivered' && (
                <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4">
                  <span className="text-sm text-slate-500">
                    {order.rating ? 'Your rating:' : 'Rate this order:'}
                  </span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        disabled={!!order.rating}
                        onClick={() => !order.rating && setPending((p) => ({ ...p, [order.id]: star }))}
                        onMouseEnter={() => !order.rating && setHovered((h) => ({ ...h, [order.id]: star }))}
                        onMouseLeave={() => !order.rating && setHovered((h) => ({ ...h, [order.id]: 0 }))}
                        className={order.rating ? 'cursor-default' : 'cursor-pointer'}
                      >
                        <Star
                          className={`h-5 w-5 ${
                            star <= (hovered[order.id] || pending[order.id] || order.rating || 0)
                              ? 'fill-brand-500 text-brand-500'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {!order.rating && pending[order.id] > 0 && (
                    <button
                      onClick={() => submitRating(order.id, pending[order.id])}
                      className="ml-2 rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold text-white cursor-pointer hover:bg-brand-600"
                    >
                      Done
                    </button>
                  )}
                  {order.rating && (
                    <span className="text-xs font-medium text-green-600">Done</span>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
