import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Search, Printer } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { Card, Button, Badge, Modal, Input, Select } from '../../components/ui'
import { foodImage } from '../../utils/foodImages'
import { CustomSelect } from '../../components/ui/CustomSelect'
import { useRevealAnimation } from '../../hooks/useRevealAnimation'
import { useToast } from '../../context/ToastContext'

const CATEGORIES = ['Burgers', 'Wraps', 'Pizza', 'Sides', 'Drinks', 'Appetizers']

const emptyItem = { name: '', category: 'Burgers', price: '', description: '', image: '🍔', available: true, track_inventory: false, stock_quantity: '', low_stock_threshold: 5, barcode: '' }

export default function MenuManagement() {
  const { menu, addMenuItem, updateMenuItem, deleteMenuItem, loading } = useData()
  const { isAdmin } = useAuth()
  const { showToast } = useToast()
  const pageRef = useRevealAnimation(!!menu)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyItem)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageError, setImageError] = useState('')

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500" />
        <p className="mt-4 text-sm text-slate-500">Loading menu...</p>
      </div>
    )
  }

  const filtered = menu.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = categoryFilter === 'all' || m.category === categoryFilter
    return matchSearch && matchCat
  })

  const openAdd = () => {
    setEditing(null)
    setForm(emptyItem)
    setModalOpen(true)
  }

  const openEdit = (item) => {
    setEditing(item)
    setForm({ ...item })
    setModalOpen(true)
  }
const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImageError('')

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setImageError('Please upload a JPG, PNG, or WEBP image.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setImageError('Image must be under 2MB.')
      return
    }

    setUploadingImage(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${crypto.randomUUID()}.${fileExt}`

    const { error: uploadError } = await supabase.storage.from('menu-images').upload(fileName, file)
    if (uploadError) {
      setImageError('Upload failed. Please try again.')
      setUploadingImage(false)
      return
    }

    const { data } = supabase.storage.from('menu-images').getPublicUrl(fileName)
    setForm((f) => ({ ...f, image_url: data.publicUrl }))
    setUploadingImage(false)
  }
  const handleSave = (e) => {
    e.preventDefault()
    const parsedPrice = parseFloat(form.price)
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      showToast('Price must be greater than $0', 'error')
      return
    }
    if (form.track_inventory && (form.stock_quantity === '' || isNaN(parseInt(form.stock_quantity)))) {
      showToast('Enter a stock quantity for tracked items', 'error')
      return
    }
    const data = {
      ...form,
      price: parsedPrice,
      stock_quantity: form.track_inventory ? parseInt(form.stock_quantity) : null,
      low_stock_threshold: form.track_inventory ? (parseInt(form.low_stock_threshold) || 5) : 5,
      barcode: form.barcode?.trim() || null,
    }
    if (editing) {
      updateMenuItem(editing.id, data)
      showToast(`${form.name} updated`)
    } else {
      addMenuItem(data)
      showToast(`${form.name} added to menu`)
    }
    setModalOpen(false)
  }

  const toggleAvailability = (item) => {
    updateMenuItem(item.id, { available: !item.available })
  }

  return (
    <div ref={pageRef}>
      <div data-gsap-in="slide-up" className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Menu Management</h1>
          <p className="mt-1 text-slate-500">{menu.length} items · {menu.filter((m) => m.available).length} available</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Link to="/dashboard/menu/barcodes">
              <Button variant="secondary"><Printer className="h-4 w-4" /> Print Labels</Button>
            </Link>
            <Button onClick={openAdd}><Plus className="h-4 w-4" /> Add Item</Button>
          </div>
        )}
      </div>

      <div data-gsap-in="fade" className="relative z-20 mt-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-3 text-sm outline-none focus:border-brand-500"
            placeholder="Search menu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <CustomSelect
          value={categoryFilter}
          onChange={setCategoryFilter}
          options={[{ value: 'all', label: 'All Categories' }, ...CATEGORIES.map((c) => ({ value: c, label: c }))]}
        />
      </div>

      <div data-gsap-in="zoom-flip" data-gsap-delay="0.3" className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => (
          <Card key={item.id} className="!p-0 overflow-hidden flex flex-col h-full">
            <Link to={`/menu/${item.id}`} className="cursor-pointer">
              <div className="h-64 w-full overflow-hidden bg-gradient-to-br from-brand-50 to-orange-50">
                <img src={item.image_url || foodImage(item)} alt={item.name} className="h-full w-full object-cover" />
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
                <div className="flex flex-wrap gap-1">
                  {item.popular && <Badge variant="brand">Popular</Badge>}
                  <Badge variant={item.available ? 'success' : 'danger'}>
                    {item.available ? 'Available' : 'Unavailable'}
                  </Badge>
                  {item.track_inventory && (
                    <Badge variant={item.stock_quantity <= item.low_stock_threshold ? 'warning' : 'default'}>
                      Stock: {item.stock_quantity}
                    </Badge>
                  )}
                </div>
                {isAdmin && (
                  <div className="flex gap-1">
                    <button onClick={() => toggleAvailability(item)} className="rounded p-1 text-xs text-slate-400 hover:bg-slate-100 cursor-pointer">
                      {item.available ? 'Disable' : 'Enable'}
                    </button>
                    <button onClick={() => openEdit(item)} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-brand-500 cursor-pointer">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    {item.barcode && (
                      <Link to={`/dashboard/menu/${item.id}/barcode`} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-brand-500 cursor-pointer" title="Print barcode">
                        <Printer className="h-3.5 w-3.5" />
                      </Link>
                    )}
                    <button
                      onClick={async () => {
                        try {
                          await deleteMenuItem(item.id)
                          showToast(`${item.name} deleted`)
                        } catch (error) {
                          showToast('Could not delete item', 'error')
                        }
                      }}
                      className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Menu Item' : 'Add Menu Item'}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Input label="Price ($)" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

          <div className="rounded-lg border border-slate-200 p-3">
            <label className="flex cursor-pointer items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Track inventory for this item</span>
              <input
                type="checkbox"
                checked={form.track_inventory}
                onChange={(e) => setForm({ ...form, track_inventory: e.target.checked })}
                className="h-4 w-4 cursor-pointer rounded border-slate-300 text-brand-500 focus:ring-brand-500"
              />
            </label>

            {form.track_inventory && (
              <div className="mt-3 space-y-3 border-t border-slate-100 pt-3">
                <Input
                  label="Stock quantity"
                  type="number"
                  min="0"
                  value={form.stock_quantity}
                  onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
                  placeholder="e.g. 50"
                />
                <Input
                  label="Low stock alert threshold"
                  type="number"
                  min="0"
                  value={form.low_stock_threshold}
                  onChange={(e) => setForm({ ...form, low_stock_threshold: e.target.value })}
                  placeholder="e.g. 5"
                />
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">Barcode</label>
                  <div className="flex gap-2">
                    <input
                      value={form.barcode}
                      onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                      placeholder="Scan, type, or auto-generate"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, barcode: `${Date.now()}`.slice(-12) }))}
                      className="shrink-0 cursor-pointer whitespace-nowrap rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Generate
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Photo</label>
            {form.image_url ? (
              <div className="relative">
                <img src={form.image_url} alt="Item preview" className="h-40 w-full rounded-lg object-cover" />
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, image_url: null }))}
                  className="absolute right-2 top-2 cursor-pointer rounded-full bg-white/90 p-1.5 text-slate-600 hover:bg-white hover:text-red-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <label className="flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-200 text-slate-400 hover:border-brand-300 hover:text-brand-500">
                {uploadingImage ? (
                  <span className="text-sm">Uploading...</span>
                ) : (
                  <>
                    <span className="text-sm font-medium">Click to upload a photo</span>
                    <span className="text-xs">JPG, PNG or WEBP, max 2MB</span>
                  </>
                )}
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} disabled={uploadingImage} className="hidden" />
              </label>
            )}
            {imageError && <p className="text-xs text-red-500">{imageError}</p>}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editing ? 'Update' : 'Add Item'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
