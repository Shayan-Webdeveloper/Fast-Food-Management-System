import { useState } from 'react'
import { useData } from '../../context/DataContext'
import { useToast } from '../../context/ToastContext'
import { supabase } from '../../lib/supabase'
import { Card, Badge, Modal, Input, Button } from '../../components/ui'
import { Package, Plus, History } from 'lucide-react'

export default function Inventory() {
  const { menu, refreshMenu } = useData()
  const { showToast } = useToast()
  const trackedItems = menu.filter((m) => m.track_inventory)
  const [restockTarget, setRestockTarget] = useState(null)
  const [restockAmount, setRestockAmount] = useState('')
  const [restocking, setRestocking] = useState(false)
  const [historyItem, setHistoryItem] = useState(null)
  const [historyLogs, setHistoryLogs] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  const lowStockCount = trackedItems.filter((i) => i.stock_quantity <= i.low_stock_threshold).length

  const handleRestock = async () => {
    const amount = parseInt(restockAmount)
    if (!restockTarget || isNaN(amount) || amount <= 0) {
      showToast('Enter a valid quantity to add', 'error')
      return
    }
    setRestocking(true)
    try {
      const newStock = restockTarget.stock_quantity + amount
      const { error: updateError } = await supabase
        .from('menu_items')
        .update({ stock_quantity: newStock })
        .eq('id', restockTarget.id)
      if (updateError) throw updateError

      const { error: logError } = await supabase.from('inventory_logs').insert({
        menu_item_id: restockTarget.id,
        change_amount: amount,
        reason: 'restock',
        created_by: (await supabase.auth.getUser()).data.user?.id,
      })
      if (logError) throw logError

      await refreshMenu()
      showToast(`${restockTarget.name} restocked: +${amount}`)
      setRestockTarget(null)
      setRestockAmount('')
    } catch (err) {
      showToast(err.message || 'Could not restock item', 'error')
    } finally {
      setRestocking(false)
    }
  }

  const openHistory = async (item) => {
    setHistoryItem(item)
    setLoadingHistory(true)
    const { data, error } = await supabase
      .from('inventory_logs')
      .select('*, profiles(full_name)')
      .eq('menu_item_id', item.id)
      .order('created_at', { ascending: false })
      .limit(50)
    if (!error) setHistoryLogs(data)
    setLoadingHistory(false)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
          <p className="mt-1 text-slate-500">{trackedItems.length} tracked items{lowStockCount > 0 && ` · ${lowStockCount} low on stock`}</p>
        </div>
      </div>

      {trackedItems.length === 0 ? (
        <Card className="mt-6 text-center text-sm text-slate-500">
          No items have inventory tracking enabled yet. Turn it on for an item from Menu Management.
        </Card>
      ) : (
        <Card className="mt-6 !p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-slate-500">
                  <th className="px-5 py-3 font-medium">Item</th>
                  <th className="px-5 py-3 font-medium">Stock</th>
                  <th className="px-5 py-3 font-medium">Threshold</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {trackedItems.map((item) => {
                  const isLow = item.stock_quantity <= item.low_stock_threshold
                  return (
                    <tr key={item.id} className="border-t border-slate-100">
                      <td className="px-5 py-3 font-medium whitespace-nowrap">{item.name}</td>
                      <td className="px-5 py-3 font-semibold">{item.stock_quantity}</td>
                      <td className="px-5 py-3 text-slate-500">{item.low_stock_threshold}</td>
                      <td className="px-5 py-3">
                        <Badge variant={isLow ? 'warning' : 'success'}>{isLow ? 'Low Stock' : 'In Stock'}</Badge>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setRestockTarget(item)}
                            className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" /> Restock
                          </button>
                          <button
                            onClick={() => openHistory(item)}
                            className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                          >
                            <History className="h-3.5 w-3.5" /> History
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal open={!!restockTarget} onClose={() => setRestockTarget(null)} title="Restock Item">
        {restockTarget && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-900">{restockTarget.name}</span> — currently {restockTarget.stock_quantity} in stock.
            </p>
            <Input
              label="Quantity to add"
              type="number"
              min="1"
              value={restockAmount}
              onChange={(e) => setRestockAmount(e.target.value)}
              placeholder="e.g. 20"
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setRestockTarget(null)}>Cancel</Button>
              <Button onClick={handleRestock} disabled={restocking}>
                {restocking ? 'Saving...' : 'Add Stock'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!historyItem} onClose={() => setHistoryItem(null)} title={historyItem ? `${historyItem.name} — History` : 'History'}>
        <div className="max-h-96 overflow-y-auto">
          {loadingHistory ? (
            <p className="py-6 text-center text-sm text-slate-500">Loading...</p>
          ) : historyLogs.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">No history yet.</p>
          ) : (
            <div className="space-y-2">
              {historyLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                  <div>
                    <p className="font-medium text-slate-900 capitalize">{log.reason}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(log.created_at).toLocaleString()} {log.profiles?.full_name && `· ${log.profiles.full_name}`}
                    </p>
                    {log.note && <p className="mt-0.5 text-xs text-slate-400">{log.note}</p>}
                  </div>
                  <span className={`font-semibold ${log.change_amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {log.change_amount > 0 ? '+' : ''}{log.change_amount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}