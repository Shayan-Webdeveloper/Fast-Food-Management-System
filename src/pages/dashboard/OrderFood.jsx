import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Minus, ShoppingCart, CheckCircle, Search } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { Card, Button, Badge, Modal, Input } from '../../components/ui'
import { CustomSelect } from '../../components/ui/CustomSelect'
import { foodImage } from '../../utils/foodImages'

export default function OrderFood() {
  const navigate = useNavigate()
  const { menu, cart, cartTotal, addToCart, updateCartQty, removeFromCart, placeOrder, loading } = useData()
  const [categories_selected, setCategoriesSelected] = useState([])
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('featured')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [popularOnly, setPopularOnly] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [showDeliveryForm, setShowDeliveryForm] = useState(false)
  const [deliveryName, setDeliveryName] = useState('')
  const [deliveryPhone, setDeliveryPhone] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')

  const available = menu.filter((m) => m.available)
  const categories = [...new Set(available.map((m) => m.category))]

  let filtered =
    categories_selected.length === 0
      ? available
      : available.filter((m) => categories_selected.includes(m.category))
  filtered = filtered.filter((m) =>
    `${m.name} ${m.description}`.toLowerCase().includes(search.toLowerCase())
  )
  if (minPrice !== '') filtered = filtered.filter((m) => Number(m.price) >= Number(minPrice))
  if (maxPrice !== '') filtered = filtered.filter((m) => Number(m.price) <= Number(maxPrice))
  if (popularOnly) filtered = filtered.filter((m) => m.popular)
  if (sort === 'price-low') filtered = [...filtered].sort((a, b) => a.price - b.price)
  if (sort === 'price-high') filtered = [...filtered].sort((a, b) => b.price - a.price)

  useEffect(() => {
    if (filtered.length && !revealed) {
      const timer = requestAnimationFrame(() => setRevealed(true))
      return () => cancelAnimationFrame(timer)
    }
  }, [filtered.length, revealed])

  const handleCheckout = async () => {
    if (cart.length === 0) return
    try {
      const order = await placeOrder(cart, 'card', { name: deliveryName, phone: deliveryPhone, address: deliveryAddress })
      setOrderPlaced({ id: order.order_number, total: Number(order.total) })
      setShowDeliveryForm(false)
      setDeliveryName('')
      setDeliveryPhone('')
      setDeliveryAddress('')
    } catch (error) {
      console.error('Unable to place order', error)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500" />
        <p className="mt-4 text-sm text-slate-500">Loading menu...</p>
      </div>
    )
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
    <div className="order-food-root">
      <h1 className="text-2xl font-bold text-slate-900">Order Food</h1>
      <p className="mt-1 text-slate-500">Browse our menu and add items to your cart</p>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="p-5 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search menu..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition-all duration-200 focus:border-brand-500 focus:shadow-md focus:shadow-brand-500/10"
              />
            </div>

            <CustomSelect
              value={sort}
              onChange={setSort}
              options={[
                { value: 'featured', label: 'Featured' },
                { value: 'price-low', label: 'Price: low to high' },
                { value: 'price-high', label: 'Price: high to low' },
              ]}
              className="mt-3 w-full"
            />

            {(minPrice !== '' || maxPrice !== '' || popularOnly || categories_selected.length > 0 || search !== '') && (
              <div className="mt-6 border-t border-slate-100 pt-5">
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Active filters</p>
                <div className="flex flex-wrap gap-2">
                  {search !== '' && (
                    <span className="flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
                      "{search}"
                      <button onClick={() => setSearch('')} className="cursor-pointer hover:text-brand-900">✕</button>
                    </span>
                  )}
                  {categories_selected.map((cat) => (
                    <span key={cat} className="flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
                      {cat}
                      <button onClick={() => setCategoriesSelected((c) => c.filter((x) => x !== cat))} className="cursor-pointer hover:text-brand-900">✕</button>
                    </span>
                  ))}
                  {minPrice !== '' && (
                    <span className="flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
                      Min ${minPrice}
                      <button onClick={() => setMinPrice('')} className="cursor-pointer hover:text-brand-900">✕</button>
                    </span>
                  )}
                  {maxPrice !== '' && (
                    <span className="flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
                      Max ${maxPrice}
                      <button onClick={() => setMaxPrice('')} className="cursor-pointer hover:text-brand-900">✕</button>
                    </span>
                  )}
                  {popularOnly && (
                    <span className="flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
                      Popular only
                      <button onClick={() => setPopularOnly(false)} className="cursor-pointer hover:text-brand-900">✕</button>
                    </span>
                  )}
                </div>
                <button
                  onClick={() => { setMinPrice(''); setMaxPrice(''); setPopularOnly(false); setCategoriesSelected([]); setSearch('') }}
                  className="mt-3 w-full cursor-pointer rounded-xl border border-slate-200 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 transition-colors hover:!bg-brand-500 hover:!text-white"
                >
                  Clear all filters
                </button>
              </div>
            )}

            <div className="mt-6 border-t border-slate-100 pt-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Price range</p>
              <div className="flex items-center gap-2">
                <input type="number" min="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="Min"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500" />
                <span className="text-slate-400">–</span>
                <input type="number" min="0" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Max"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500" />
              </div>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-5">
              <label className="flex cursor-pointer items-center justify-between">
                <span className="text-sm font-bold text-slate-700">Popular only</span>
                <input type="checkbox" checked={popularOnly} onChange={(e) => setPopularOnly(e.target.checked)}
                  className="h-4 w-4 cursor-pointer rounded border-slate-300 text-brand-500 focus:ring-brand-500" />
              </label>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Categories</p>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => setCategoriesSelected([])}
                  className={`flex w-full items-center justify-between whitespace-nowrap rounded-xl px-3 py-2 text-left text-sm font-bold transition cursor-pointer ${
                    categories_selected.length === 0 ? '!bg-brand-500 !text-white' : 'border border-transparent text-slate-700 dark:text-slate-300 hover:!bg-brand-500 hover:!text-white'
                  }`}
                >
                  All
                  {categories_selected.length === 0 && <span>✓</span>}
                </button>
                {categories.map((cat) => {
                  const isSelected = categories_selected.includes(cat)
                  return (
                    <button
                      key={cat}
                      onClick={() => setCategoriesSelected((c) => isSelected ? c.filter((x) => x !== cat) : [...c, cat])}
                      className={`flex w-full items-center justify-between whitespace-nowrap rounded-xl px-3 py-2 text-left text-sm font-bold capitalize transition cursor-pointer ${
                        isSelected ? '!bg-brand-500 !text-white' : 'border border-transparent text-slate-700 dark:text-slate-300 hover:!bg-brand-500 hover:!text-white'
                      }`}
                    >
                      {cat}
                      {isSelected && <span>✓</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </aside>

        <div className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3 3xl:!grid-cols-4 pb-24">
          {filtered.map((item, i) => (
            <Card
              key={item.id}
              className={`!p-0 overflow-hidden flex flex-col h-full transition-all duration-700 ${
                revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{ transitionDelay: revealed ? `${Math.min(i * 40, 400)}ms` : '0ms' }}
            >
              <Link to={`/menu/${item.id}`} className="cursor-pointer">
                <div className="aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-brand-50 to-orange-50">
                  <img src={foodImage(item)} alt={item.name} className="h-full w-full object-cover" />
                </div>
              </Link>
              <div className="p-4 flex flex-1 flex-col">
                <div className="flex items-start justify-between">
                  <Link to={`/menu/${item.id}`} className="cursor-pointer">
                    <h3 className="font-semibold text-slate-900 hover:text-brand-600">{item.name}</h3>
                    <p className="text-xs text-slate-500">{item.category}</p>
                  </Link>
                  <p className="text-lg font-bold text-brand-600">${item.price.toFixed(2)}</p>
                </div>
                <p className="mt-2 line-clamp-2 text-xs text-slate-500">{item.description}</p>
                <div className="mt-auto pt-3 flex items-center justify-between">
                  {item.popular && <Badge variant="brand">Popular</Badge>}
                  <Button size="sm" className="ml-auto" onClick={() => addToCart(item)}>
                    <Plus className="h-3.5 w-3.5" /> Add
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          {!filtered.length && (
            <div className="col-span-full py-16 text-center">
              <p className="text-4xl">🍽️</p>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">Nothing matched your filters</h3>
              <p className="mt-1 text-sm text-slate-500">Try a different search or category.</p>
            </div>
          )}
        </div>
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-30 mx-auto flex max-w-lg items-center justify-between rounded-2xl bg-surface-900 p-3 pl-5 text-white shadow-xl lg:left-auto lg:right-8">
          <div>
            <p className="text-xs text-orange-100/70">
              {cart.reduce((s, i) => s + i.qty, 0)} items in your cart
            </p>
            <p className="font-black">${cartTotal.toFixed(2)}</p>
          </div>
          <Button className="rounded-xl" onClick={() => navigate('/dashboard/checkout')}>
            <ShoppingCart className="h-4 w-4" />
            Place Order
          </Button>
        </div>
      )}
    </div>
  )
}