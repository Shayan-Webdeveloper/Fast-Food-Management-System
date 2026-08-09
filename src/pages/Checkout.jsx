import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  ChevronLeft,
  Minus,
  Plus,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { Button, Input } from "../components/ui";
import { friendlyError } from "../utils/errorMessages";

export default function Checkout() {
  const { user } = useAuth();
  const { cart, cartTotal, updateCartQty, removeFromCart, placeOrder } =
    useData();
  const navigate = useNavigate();
const [payment, setPayment] = useState('cash'); const [placing, setPlacing] = useState(false); const [error, setError] = useState(''); const [done, setDone] = useState(null)
  const [deliveryName, setDeliveryName] = useState(user?.name || ''); const [deliveryPhone, setDeliveryPhone] = useState(''); const [deliveryAddress, setDeliveryAddress] = useState('')
  const delivery = cart.length ? 2.5 : 0;
  const total = cartTotal + delivery;
  const submit = async (event) => { event.preventDefault(); if (!user) { navigate('/login', { state: { from: { pathname: '/checkout' } } }); return } setPlacing(true); setError(''); try { const order = await placeOrder(cart, payment, { name: deliveryName, phone: deliveryPhone, address: deliveryAddress }); setDone(order) } catch (issue) { setError(friendlyError(issue.message) || 'We could not place your order. Please try again.') } finally { setPlacing(false) } }
  if (done)
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <CheckCircle2 className="mx-auto h-20 w-20 text-green-600" />
        <p className="mt-6 text-sm font-bold uppercase tracking-[.2em] text-brand-600">
          Order confirmed
        </p>
        <h1 className="mt-2 text-4xl font-black">We’re on it!</h1>
        <p className="mt-4 text-stone-600">
          Your order <strong>{done.order_number}</strong> has been received.
          We’ll start cooking it right away.
        </p>
        <Link to="/menu" className="mt-8 inline-block">
          <Button className="rounded-full">Order something else</Button>
        </Link>
      </div>
    );
  if (!cart.length)
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="text-6xl">🛍️</p>
        <h1 className="mt-5 text-3xl font-black">Your order is empty</h1>
        <p className="mt-3 text-stone-600">Let’s find something delicious.</p>
        <Link to="/menu" className="mt-7 inline-block">
          <Button className="rounded-full">Browse the menu</Button>
        </Link>
      </div>
    );
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <Link
        to="/menu"
        className="inline-flex items-center gap-1 text-sm font-bold text-stone-600 hover:text-brand-600"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to menu
      </Link>
      <h1 className="mt-5 text-4xl font-black">Checkout</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_.8fr]">
        <form
          onSubmit={submit}
          className="space-y-6 rounded-3xl border border-[#eadfd2] bg-white p-6"
        >
          <div>
            <h2 className="text-lg font-black">Delivery details</h2>
            {!user && (
              <p className="mt-2 rounded-xl bg-brand-50 p-3 text-sm text-brand-800">
                Please sign in or create an account before placing your order.
              </p>
            )}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
             <Input label="Full name" value={deliveryName} onChange={(e) => setDeliveryName(e.target.value)} required /><Input label="Phone number" placeholder="03XX XXX XXXX" value={deliveryPhone} onChange={(e) => setDeliveryPhone(e.target.value)} required />
            </div>
            <div className="mt-4">
              <Input label="Delivery address" placeholder="House / street / area" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} required />
            </div>
          </div>
          <div className="border-t border-[#eee3d8] pt-6">
            <h2 className="text-lg font-black">Payment</h2>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPayment("cash")}
                className={`rounded-xl border p-3 cursor-pointer text-left text-sm font-bold ${payment === "cash" ? "border-brand-500 bg-brand-50 text-brand-800" : "border-[#e5d6c6]"}`}
              >
                Cash on delivery
              </button>
              <button
                type="button"
                onClick={() => setPayment("card")}
                className={`rounded-xl border p-3 cursor-pointer text-left text-sm font-bold ${payment === "card" ? "border-brand-500 bg-brand-50 text-brand-800" : "border-[#e5d6c6]"}`}
              >
                Card on delivery
              </button>
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button
            type="submit"
            disabled={placing}
            className="w-full rounded-full py-3"
          >
            {placing
              ? "Placing order..."
              : `Place order · $${total.toFixed(2)}`}
          </Button>
          <p className="flex items-center justify-center gap-1 text-xs text-stone-500">
            <ShieldCheck className="h-4 w-4" />
            Your information is safe with us.
          </p>
        </form>
        <aside className="h-fit rounded-3xl bg-surface-900 p-6 text-white">
          <h2 className="text-lg font-black">Your order</h2>
          <div className="mt-5 space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3"
              >
                <div>
                  <p className="font-bold">{item.name}</p>
                  <p className="text-sm text-orange-100/65">
                    ${Number(item.price).toFixed(2)} each
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 rounded-full bg-white/10 px-2 py-1">
                    <button
                      type="button"
                      disabled={item.qty <= 1}
                      onClick={() => updateCartQty(item.id, item.qty - 1)}
                      className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-4 text-center text-sm">{item.qty}</span>
                    <button
                      type="button"
                      onClick={() => updateCartQty(item.id, item.qty + 1)}
                      className="cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    className="cursor-pointer text-orange-100/60 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-2 border-t border-white/10 pt-5 text-sm text-orange-100/75">
            <p className="flex justify-between">
              <span>Subtotal</span>
              <span>${cartTotal.toFixed(2)}</span>
            </p>
            <p className="flex justify-between">
              <span>Delivery</span>
              <span>${delivery.toFixed(2)}</span>
            </p>
            <p className="flex justify-between pt-2 text-lg font-black text-white">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
