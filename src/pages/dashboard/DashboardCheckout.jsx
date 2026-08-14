import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Minus, Plus, ShieldCheck, Trash2, ChevronLeft } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { Button, Input, Card } from '../../components/ui'
import { friendlyError } from '../../utils/errorMessages'

export default function DashboardCheckout() {
  const navigate = useNavigate()
  const { cart, cartTotal, updateCartQty, removeFromCart, placeOrder } = useData()
  const [deliveryName, setDeliveryName] = useState('')
  const [deliveryPhone, setDeliveryPhone] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [payment, setPayment] = useState('cash')
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(null)

  const delivery = cart.length ? 2.5 : 0
  const total = cartTotal + delivery

  const submit = async (e) => {
    e.preventDefault()
    setPlacing(true)
    setError('')
    try {
      const order = await placeOrder(cart, payment, { name: deliveryName, phone: deliveryPhone, address: deliveryAddress })
      setDone(order)
    } catch (issue) {
      setError(friendlyError(issue.message) || 'We could not place your order. Please try again.')
    } finally {
      setPlacing(false)
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <CheckCircle2 className="h-16 w-16 text-green-500" />
        <h2 className="mt-4 text-2xl font-bold text-slate-900">Order Placed!</h2>
        <p className="mt-2 text-slate-500">Order {done.order_number} · ${Number(done.total).toFixed(2)}</p>
        <p className="text-sm text-slate-400">We'll start preparing your food shortly.</p>
        <Button className="mt-6" onClick={() => navigate('/dashboard/order')}>Order More</Button>
      </div>
    )
  }

  if (!cart.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-5xl">🛍️</p>
        <h2 className="mt-4 text-xl font-bold text-slate-900">Your cart is empty</h2>
        <p className="mt-2 text-slate-500">Add items from the menu first.</p>
        <Button className="mt-6" onClick={() => navigate('/dashboard/order')}>Browse Menu</Button>
      </div>
    )
  }

  return (
    <div>
      <button onClick={() => navigate('/dashboard/order')} className="inline-flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-brand-600 cursor-pointer">
        <ChevronLeft className="h-4 w-4" /> Back to menu
      </button>
      <h1 className="mt-3 text-2xl font-bold text-slate-900">Checkout</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <form onSubmit={submit} className="space-y-6">
          <Card>
            <h2 className="font-semibold text-slate-900">Delivery details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Input label="Full name" value={deliveryName} onChange={(e) => setDeliveryName(e.target.value)} required />
              <Input label="Phone number" placeholder="03XX XXX XXXX" value={deliveryPhone} onChange={(e) => setDeliveryPhone(e.target.value)} required />
            </div>
            <div className="mt-4">
              <Input label="Delivery address" placeholder="House / street / area" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} required />
            </div>
          </Card>

          <Card>
            <h2 className="font-semibold text-slate-900">Payment</h2>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPayment('cash')}
                className={`cursor-pointer rounded-xl border p-3 text-left text-sm font-bold ${payment === 'cash' ? 'border-brand-500 bg-brand-50 text-brand-800' : 'border-slate-200'}`}
              >
                Cash on delivery
              </button>
              <button
                type="button"
                onClick={() => setPayment('card')}
                className={`cursor-pointer rounded-xl border p-3 text-left text-sm font-bold ${payment === 'card' ? 'border-brand-500 bg-brand-50 text-brand-800' : 'border-slate-200'}`}
              >
                Card on delivery
              </button>
            </div>
          </Card>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" disabled={placing} className="w-full py-3">
            {placing ? 'Placing order...' : `Place order · $${total.toFixed(2)}`}
          </Button>
          <p className="flex items-center justify-center gap-1 text-xs text-slate-500">
            <ShieldCheck className="h-4 w-4" /> Your information is safe with us.
          </p>
        </form>

        <div>
          <Card className="sticky top-20">
            <h2 className="font-semibold text-slate-900">Your order</h2>
            <div className="mt-4 space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-slate-500">${Number(item.price).toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={item.qty <= 1}
                      onClick={() => updateCartQty(item.id, item.qty - 1)}
                      className="rounded p-0.5 hover:bg-slate-100 cursor-pointer disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-4 text-center text-sm">{item.qty}</span>
                    <button type="button" onClick={() => updateCartQty(item.id, item.qty + 1)} className="rounded p-0.5 hover:bg-slate-100 cursor-pointer">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" onClick={() => removeFromCart(item.id)} className="rounded p-0.5 text-slate-400 hover:bg-red-50 hover:text-red-500 cursor-pointer">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-500">
              <p className="flex justify-between"><span>Subtotal</span><span>${cartTotal.toFixed(2)}</span></p>
              <p className="flex justify-between"><span>Delivery</span><span>${delivery.toFixed(2)}</span></p>
              <p className="flex justify-between pt-2 text-lg font-bold text-slate-900"><span>Total</span><span>${total.toFixed(2)}</span></p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}