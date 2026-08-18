import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import jsPDF from 'jspdf'
import JsBarcode from 'jsbarcode'
import { useData } from '../../context/DataContext'
import { useTheme } from '../../context/ThemeContext'
import { Button, Card, Modal } from '../../components/ui'
import { ArrowLeft, Download, CheckSquare, Square, Printer } from 'lucide-react'

const LABELS_PER_ROW = 3
const LABELS_PER_COL = 8
const LABEL_WIDTH = 63.5
const LABEL_HEIGHT = 33.9
const MARGIN_X = 7
const MARGIN_Y = 12

export default function BatchBarcodes() {
  const navigate = useNavigate()
  const { menu } = useData()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [printModalOpen, setPrintModalOpen] = useState(false)
  const [colorMode, setColorMode] = useState('bw')
  const barcodedItems = menu.filter((m) => m.barcode)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [generating, setGenerating] = useState(false)

  const toggleItem = (id) => {
    setSelectedIds((current) => {
      const next = new Set(current)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    setSelectedIds((current) =>
      current.size === barcodedItems.length ? new Set() : new Set(barcodedItems.map((i) => i.id))
    )
  }

  const generateBarcodeImage = (value) => {
    const canvas = document.createElement('canvas')
    JsBarcode(canvas, value, { format: 'CODE128', width: 2, height: 40, fontSize: 12, margin: 4 })
    return canvas.toDataURL('image/png')
  }

  const handleGenerate = async () => {
    const items = barcodedItems.filter((i) => selectedIds.has(i.id))
    if (items.length === 0) return
    setGenerating(true)

    try {
      const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
      let col = 0
      let row = 0

      items.forEach((item, index) => {
        if (index > 0 && index % (LABELS_PER_ROW * LABELS_PER_COL) === 0) {
          pdf.addPage()
          col = 0
          row = 0
        }

        const x = MARGIN_X + col * LABEL_WIDTH
        const y = MARGIN_Y + row * LABEL_HEIGHT

        const imgData = generateBarcodeImage(item.barcode)
        pdf.setFontSize(8)
        pdf.text(item.name, x + LABEL_WIDTH / 2, y + 5, { align: 'center', maxWidth: LABEL_WIDTH - 6 })
        const imgWidth = LABEL_WIDTH - 14
        const imgHeight = 14
        pdf.addImage(imgData, 'PNG', x + (LABEL_WIDTH - imgWidth) / 2, y + 7, imgWidth, imgHeight)

        col++
        if (col >= LABELS_PER_ROW) {
          col = 0
          row++
        }
      })

      pdf.save(`barcode-labels-${Date.now()}.pdf`)
    } catch (err) {
      console.error('Failed to generate batch PDF', err)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div>
      <button onClick={() => navigate('/dashboard/menu')} className="inline-flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-brand-600 cursor-pointer">
        <ArrowLeft className="h-4 w-4" /> Back to menu
      </button>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Batch Barcode Labels</h1>
          <p className="mt-1 text-slate-500">Select products, then download a printable sheet of labels.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setPrintModalOpen(true)} disabled={selectedIds.size === 0}>
            <Printer className="h-4 w-4" /> Print ({selectedIds.size})
          </Button>
          <Button onClick={handleGenerate} disabled={selectedIds.size === 0 || generating}>
            <Download className="h-4 w-4" /> {generating ? 'Generating...' : `Download PDF (${selectedIds.size})`}
          </Button>
        </div>
      </div>

      {barcodedItems.length === 0 ? (
        <Card className="mt-6 text-center text-sm text-slate-500">
          No items have a barcode yet. Add one from Menu Management first.
        </Card>
      ) : (
        <Card className="mt-6 !p-0 overflow-hidden">
          <button
            onClick={toggleAll}
            className={`flex w-full cursor-pointer items-center gap-2 border-b px-4 py-3 text-sm font-semibold !transform-none !shadow-none transition-colors ${
              isDark ? 'border-slate-700 text-slate-300 hover:bg-brand-500/50' : 'border-slate-100 text-slate-600 hover:bg-brand-200'
            }`}
          >
            {selectedIds.size === barcodedItems.length ? <CheckSquare className="h-4 w-4 text-brand-500" /> : <Square className="h-4 w-4" />}
            Select all ({barcodedItems.length})
          </button>
          <div className="max-h-[60vh] overflow-y-auto">
            {barcodedItems.map((item) => (
              <button
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`flex w-full cursor-pointer items-center gap-3 border-b px-4 py-3 text-left !transform-none !shadow-none transition-colors ${
                  isDark ? 'border-slate-800 hover:bg-brand-500/50' : 'border-slate-50 hover:bg-brand-200'
                }`}
              >
                {selectedIds.has(item.id) ? <CheckSquare className="h-4 w-4 shrink-0 text-brand-500" /> : <Square className={`h-4 w-4 shrink-0 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />}
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm font-medium ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{item.name}</p>
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{item.barcode}</p>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      <Modal open={printModalOpen} onClose={() => setPrintModalOpen(false)} title="Print Labels">
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            Printing {selectedIds.size} label{selectedIds.size !== 1 ? 's' : ''}. Choose color mode below.
          </p>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Color</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'bw', label: 'Black & White' },
                { value: 'color', label: 'Color' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setColorMode(opt.value)}
                  className={`cursor-pointer rounded-lg border py-2 text-xs font-semibold ${colorMode === opt.value ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setPrintModalOpen(false)}>Cancel</Button>
            <Button onClick={() => setPrintModalOpen(false)}>Print</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}