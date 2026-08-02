import { useState } from 'react'
import { Plus, Minus, ShoppingCart, CheckCircle } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { Card, Button, Badge } from '../../components/ui'

export default function OrderFood() {
  const { menu, cart, cartTotal, addToCart, updateCartQty, removeFromCart, placeOrder } = useData()
  const [category, setCategory] = useState('all')
  const [orderPlaced, setOrderPlaced] = useState(null)

  const available = menu.filter((m) => m.available)
  const categories = ['all', ...new Set(available.map((m) => m.category))]
  const filtered = category === 'all' ? available : available.filter((m) => m.category === category)

  const handleCheckout = async () => {
    if (cart.length === 0) return
    try {
      const order = await placeOrder(cart, 'card')
      setOrderPlaced({ id: order.order_number, total: Number(order.total) })
    } catch (error) {
      console.error('Unable to place order', error)
    }
  }

  if (orderPlaced) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <CheckCircle className="h-16 w-16 text-green-500" />
        <h2 className="mt-4 text-2xl font-bold text-slate-900">Order Placed!</h2>
        <p className="mt-2 text-slate-500">Order {orderPlaced.id} · ${orderPlaced.total.toFixed(2)}</p>
        <p className="text-sm text-slate-400">We'll start preparing your food shortly.</p>
        <Button className="mt-6" onClick={() => setOrderPlaced(null)}>Order More</Button>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Order Food</h1>
      <p className="mt-1 text-slate-500">Browse our menu and add items to your cart</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition cursor-pointer capitalize ${category === cat ? 'bg-brand-500 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-brand-300'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 grid gap-4 sm:grid-cols-2">
          {filtered.map((item) => (
            <Card key={item.id} className="flex gap-4 !p-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-3xl">
                {item.image}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">{item.name}</h3>
                    <p className="text-xs text-slate-500">{item.description}</p>
                  </div>
                  <p className="font-bold text-brand-600">${item.price.toFixed(2)}</p>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  {item.popular && <Badge variant="brand">Popular</Badge>}
                  <Button size="sm" onClick={() => addToCart(item)}>
                    <Plus className="h-3.5 w-3.5" /> Add
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div>
          <Card className="sticky top-20">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart className="h-5 w-5 text-brand-500" />
              <h3 className="font-semibold">Your Cart ({cart.length})</h3>
            </div>
            {cart.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center">Cart is empty</p>
            ) : (
              <>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-slate-500">${item.price.toFixed(2)} each</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateCartQty(item.id, item.qty - 1)} className="rounded p-0.5 hover:bg-slate-100 cursor-pointer">
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="text-sm font-medium w-4 text-center">{item.qty}</span>
                        <button onClick={() => updateCartQty(item.id, item.qty + 1)} className="rounded p-0.5 hover:bg-slate-100 cursor-pointer">
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-brand-600">${cartTotal.toFixed(2)}</span>
                  </div>
                  <Button className="w-full mt-3" onClick={handleCheckout}>Place Order</Button>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
