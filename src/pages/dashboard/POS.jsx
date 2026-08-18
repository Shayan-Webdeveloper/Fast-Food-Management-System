import { useState } from 'react'
import { Plus, Minus, Trash2, ShoppingBag, Search } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useToast } from '../../context/ToastContext'
import { Card, Button, Modal } from '../../components/ui'
import { foodImage } from '../../utils/foodImages'
import { downloadReceipt, printReceipt } from '../../utils/generateReceipt'
import { RESTAURANT } from '../../config/resturant'
import { openCashDrawer, isWebSerialSupported } from '../../utils/cashDrawer'
import { Wallet } from 'lucide-react'

export default function POS() {
  const { menu, placeOrder } = useData()
  const { showToast } = useToast()
  const [posCart, setPosCart] = useState([])
  const [search, setSearch] = useState('')
  const [scanFeedback, setScanFeedback] = useState('')
  const [payment, setPayment] = useState('cash')
  const [placing, setPlacing] = useState(false)
  const [completedOrder, setCompletedOrder] = useState(null)
  const [discountType, setDiscountType] = useState(null)
  const [discountValue, setDiscountValue] = useState('')
  const [openingDrawer, setOpeningDrawer] = useState(false)

  const handleOpenDrawer = async () => {
    setOpeningDrawer(true)
    try {
      await openCashDrawer()
      showToast('Cash drawer opened')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setOpeningDrawer(false)
    }
  }

  const available = menu.filter((m) => m.available)
  const filtered = search
    ? available.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()))
    : available
const handleSearchKeyDown = (e) => {
    if (e.key !== 'Enter') return
    const trimmed = search.trim()
    if (!trimmed) return

    const matched = available.find((m) => m.barcode && m.barcode === trimmed)
    if (matched) {
      addItem(matched)
      setScanFeedback(`Added: ${matched.name}`)
      setSearch('')
      setTimeout(() => setScanFeedback(''), 2000)
    } else {
      setScanFeedback('No product found for that barcode')
      setTimeout(() => setScanFeedback(''), 2000)
    }
  }

  const addItem = (item) => {
    setPosCart((current) => {
      const existing = current.find((c) => c.id === item.id)
      return existing
        ? current.map((c) => c.id === item.id ? { ...c, qty: c.qty + 1 } : c)
        : [...current, { ...item, qty: 1 }]
    })
  }

  const updateQty = (id, qty) => {
    setPosCart((current) =>
      qty <= 0
        ? current.filter((c) => c.id !== id)
        : current.map((c) => c.id === id ? { ...c, qty } : c)
    )
  }

  const subtotal = posCart.reduce((sum, item) => sum + Number(item.price) * item.qty, 0)
  const parsedDiscount = parseFloat(discountValue) || 0
  const discountAmount = discountType === 'percent'
    ? subtotal * (parsedDiscount / 100)
    : discountType === 'fixed'
      ? Math.min(parsedDiscount, subtotal)
      : 0
  const total = Math.max(0, subtotal - discountAmount)

  const handleCheckout = async () => {
    if (posCart.length === 0) return
    setPlacing(true)
    try {
      const discount = discountType ? { type: discountType, value: parsedDiscount } : {}
      const order = await placeOrder(posCart, payment, {}, 'counter', discount)
      showToast(`Order ${order.order_number} placed · $${Number(order.total).toFixed(2)}`)
      setCompletedOrder({ ...order, items: posCart, payment_method: payment })
      setPosCart([])
      setDiscountType(null)
      setDiscountValue('')
    } catch (error) {
      showToast(error.message || 'Could not place order', 'error')
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col lg:flex-row lg:gap-6">
      {/* Product grid */}
      <div className="flex-1 overflow-hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search or scan barcode..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-brand-500"
          />
        </div>
        {scanFeedback && (
          <p className={`mt-2 text-sm font-semibold ${scanFeedback.startsWith('Added') ? 'text-green-600' : 'text-red-500'}`}>
            {scanFeedback}
          </p>
        )}

        <div className="mt-4 grid max-h-[calc(100vh-14rem)] grid-cols-2 gap-3 overflow-y-auto pb-4 sm:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item) => {
            const outOfStock = item.track_inventory && item.stock_quantity <= 0
            return (
              <button
                key={item.id}
                onClick={() => !outOfStock && addItem(item)}
                disabled={outOfStock}
                className="cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-white text-left transition hover:border-brand-400 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
              >
                <div className="aspect-square w-full overflow-hidden bg-slate-50">
                  <img src={item.image_url || foodImage(item)} alt={item.name} className="h-full w-full object-cover" />
                </div>
                <div className="p-2">
                  <p className="truncate text-sm font-semibold text-slate-900">{item.name}</p>
                  <p className="text-sm font-bold text-brand-600">${Number(item.price).toFixed(2)}</p>
                  {outOfStock && <p className="text-xs font-semibold text-red-500">Out of stock</p>}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Cart / checkout panel */}
      <Card className="mt-4 flex w-full flex-col lg:mt-0 lg:w-96 lg:shrink-0">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="font-bold text-slate-900">Current Order</h2>
          {posCart.length > 0 && (
            <button onClick={() => setPosCart([])} className="cursor-pointer text-xs font-semibold text-slate-400 hover:text-red-500">
              Clear
            </button>
          )}
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto py-3">
          {posCart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-10 text-center text-slate-400">
              <ShoppingBag className="h-10 w-10" />
              <p className="mt-2 text-sm">Tap items to add them</p>
            </div>
          ) : (
            posCart.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{item.name}</p>
                  <p className="text-xs text-slate-500">${Number(item.price).toFixed(2)} each</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => updateQty(item.id, item.qty - 1)} className="cursor-pointer rounded p-1 hover:bg-slate-200">
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-5 text-center text-sm font-semibold">{item.qty}</span>
                  <button onClick={() => updateQty(item.id, item.qty + 1)} className="cursor-pointer rounded p-1 hover:bg-slate-200">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => updateQty(item.id, 0)} className="cursor-pointer rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-slate-100 pt-3">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">Discount</label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => { setDiscountType(null); setDiscountValue('') }}
                className={`cursor-pointer rounded-lg border py-1.5 text-xs font-semibold ${!discountType ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600'}`}
              >
                None
              </button>
              <button
                onClick={() => setDiscountType('percent')}
                className={`cursor-pointer rounded-lg border py-1.5 text-xs font-semibold ${discountType === 'percent' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600'}`}
              >
                % Off
              </button>
              <button
                onClick={() => setDiscountType('fixed')}
                className={`cursor-pointer rounded-lg border py-1.5 text-xs font-semibold ${discountType === 'fixed' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600'}`}
              >
                $ Off
              </button>
            </div>
            {discountType && (
              <input
                type="number"
                min="0"
                max={discountType === 'percent' ? 100 : subtotal}
                value={discountValue}
                onChange={(e) => {
                  let val = e.target.value
                  if (val === '') {
                    setDiscountValue('')
                    return
                  }
                  let num = parseFloat(val)
                  if (isNaN(num) || num < 0) num = 0
                  if (discountType === 'percent' && num > 100) num = 100
                  if (discountType === 'fixed' && num > subtotal) num = subtotal
                  setDiscountValue(String(num))
                }}
                placeholder={discountType === 'percent' ? 'e.g. 10' : 'e.g. 5.00'}
                className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-brand-500"
              />
            )}
          </div>

          <div className="mt-3 space-y-1 border-t border-slate-100 pt-3 text-sm text-slate-500">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-brand-600">
                <span>Discount</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="mt-2 flex justify-between text-lg font-bold text-slate-900">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => setPayment('cash')}
              className={`cursor-pointer rounded-lg border py-2 text-sm font-semibold ${payment === 'cash' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600'}`}
            >
              Cash
            </button>
            <button
              onClick={() => setPayment('card')}
              className={`cursor-pointer rounded-lg border py-2 text-sm font-semibold ${payment === 'card' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600'}`}
            >
              Card
            </button>
          </div>

          {isWebSerialSupported() && (
            <button
              onClick={handleOpenDrawer}
              disabled={openingDrawer}
              className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              <Wallet className="h-4 w-4" /> {openingDrawer ? 'Opening...' : 'Open Cash Drawer'}
            </button>
          )}

          <Button
            onClick={handleCheckout}
            disabled={posCart.length === 0 || placing}
            className="mt-3 w-full py-3 text-base"
          >
            {placing ? 'Processing...' : `Charge $${total.toFixed(2)}`}
          </Button>
        </div>
      </Card>

      <Modal open={!!completedOrder} onClose={() => setCompletedOrder(null)} title="Order Complete">
        {completedOrder && (
          <div className="space-y-4 text-center">
            <p className="text-lg font-bold text-slate-900">Order {completedOrder.order_number}</p>
            <p className="text-2xl font-black text-brand-600">${Number(completedOrder.total).toFixed(2)}</p>
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              <Button variant="secondary" onClick={() => setCompletedOrder(null)}>Close</Button>
              <Button variant="secondary" onClick={() => printReceipt(completedOrder, RESTAURANT.name)}>
                Print Receipt
              </Button>
              <Button onClick={() => downloadReceipt(completedOrder, RESTAURANT.name)}>
                Download Receipt
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}