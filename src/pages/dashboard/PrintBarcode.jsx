import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useData } from '../../context/DataContext'
import { Barcode } from '../../components/ui/Barcode'
import { Button, Modal, Input } from '../../components/ui'
import { Printer, ArrowLeft, Download } from 'lucide-react'
import jsPDF from 'jspdf'

export default function PrintBarcode() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { menu } = useData()
  const item = menu.find((m) => m.id === id)
  const barcodeRef = useRef(null)
  const [downloading, setDownloading] = useState(false)
  const [printModalOpen, setPrintModalOpen] = useState(false)
  const [copies, setCopies] = useState(1)
  const [colorMode, setColorMode] = useState('bw')
  const [paperSize, setPaperSize] = useState('label')

  const PAPER_SIZES = {
    label: { width: 80, height: 40 },
    a4: { width: 210, height: 297 },
    letter: { width: 215.9, height: 279.4 },
  }

  const handlePrint = () => {
    const { width, height } = PAPER_SIZES[paperSize]
    const styleTag = document.createElement('style')
    styleTag.id = 'dynamic-print-style'
    styleTag.textContent = `
      @page { size: ${width}mm ${height}mm; margin: 0; }
      #barcode-print-area { filter: ${colorMode === 'bw' ? 'grayscale(1)' : 'none'}; }
    `
    document.head.appendChild(styleTag)

    setPrintModalOpen(false)
    setTimeout(() => {
      window.print()
      document.getElementById('dynamic-print-style')?.remove()
    }, 100)
  }

  const generatePdfUnused = async (copyCount) => {
    if (!barcodeRef.current) return
    setDownloading(true)
    try {
      const svg = barcodeRef.current.querySelector('svg')
      const svgData = new XMLSerializer().serializeToString(svg)
      const canvas = document.createElement('canvas')
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(svgBlob)
      const img = new Image()

      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = url
      })

      canvas.width = img.width * 3
      canvas.height = img.height * 3
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      if (colorMode === 'bw') {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data
        for (let i = 0; i < data.length; i += 4) {
          const gray = data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11
          data[i] = gray
          data[i + 1] = gray
          data[i + 2] = gray
        }
        ctx.putImageData(imageData, 0, 0)
      }

      URL.revokeObjectURL(url)

      const pngDataUrl = canvas.toDataURL('image/png')

      const { width: pageWidth, height: pageHeight } = PAPER_SIZES[paperSize]
      const orientation = paperSize === 'label' ? 'landscape' : 'portrait'
      const pdf = new jsPDF({ orientation, unit: 'mm', format: [pageWidth, pageHeight] })

      const imgWidth = paperSize === 'label' ? pageWidth - 20 : 60
      const imgHeight = (canvas.height / canvas.width) * imgWidth
      const imgX = (pageWidth - imgWidth) / 2
      const imgY = paperSize === 'label' ? 14 : 20

      for (let i = 0; i < copyCount; i++) {
        if (i > 0) pdf.addPage([pageWidth, pageHeight], orientation)
        pdf.setFontSize(paperSize === 'label' ? 10 : 12)
        pdf.text(item.name, pageWidth / 2, paperSize === 'label' ? 8 : 12, { align: 'center', maxWidth: pageWidth - 8 })
        pdf.addImage(pngDataUrl, 'PNG', imgX, imgY, imgWidth, imgHeight)
      }

      pdf.save(`barcode-${item.name.replace(/\s+/g, '-').toLowerCase()}-x${copyCount}.pdf`)
      setPrintModalOpen(false)
    } catch (err) {
      console.error('Failed to generate PDF', err)
    } finally {
      setDownloading(false)
    }
  }

  const handleDownload = () => generatePdf(1)

  useEffect(() => {
    document.title = item ? `Barcode - ${item.name}` : 'Barcode'
  }, [item])

  if (!item) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">Item not found.</p>
      </div>
    )
  }

  if (!item.barcode) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">This item has no barcode set yet. Add one from Menu Management first.</p>
        <Button className="mt-4" onClick={() => navigate('/dashboard/menu')}>Back to Menu</Button>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="print:hidden mb-6 flex items-center justify-between">
        <button onClick={() => navigate('/dashboard/menu')} className="inline-flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-brand-600 cursor-pointer">
          <ArrowLeft className="h-4 w-4" /> Back to menu
        </button>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleDownload} disabled={downloading}>
            <Download className="h-4 w-4" /> {downloading ? 'Preparing...' : 'Download PDF'}
          </Button>
          <Button onClick={() => setPrintModalOpen(true)}>
            <Printer className="h-4 w-4" /> Print
          </Button>
        </div>
      </div>

      <div id="barcode-print-area" ref={barcodeRef} className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-10 print:border-0 print:p-0">
        {Array.from({ length: copies }).map((_, i) => (
          <div key={i} className={i > 0 ? 'print-page-break mt-8 print:mt-0' : ''}>
            <p className="text-lg font-bold text-slate-900">{item.name}</p>
            <div className="mt-4">
              <Barcode value={item.barcode} width={2.5} height={70} fontSize={16} />
            </div>
          </div>
        ))}
      </div>

      <Modal open={printModalOpen} onClose={() => setPrintModalOpen(false)} title="Print Barcode">
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            Set your print options below. We'll generate a ready-to-print PDF sized exactly to your choice.
          </p>

          <Input
            label="Number of copies"
            type="number"
            min="1"
            max="50"
            value={copies}
            onChange={(e) => setCopies(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Paper size</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'label', label: 'Label (80×40mm)' },
                { value: 'a4', label: 'A4' },
                { value: 'letter', label: 'Letter' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPaperSize(opt.value)}
                  className={`cursor-pointer rounded-lg border py-2 text-xs font-semibold ${paperSize === opt.value ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

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
            <Button onClick={handlePrint}>
              Print
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}