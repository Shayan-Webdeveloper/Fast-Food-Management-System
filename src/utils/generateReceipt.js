import jsPDF from 'jspdf'

export function generateReceiptPdf(order, restaurantName = 'Receipt') {
  const width = 80
  const lineHeight = 5
  let y = 8

  const items = order.items || []
  const estimatedHeight = 40 + items.length * lineHeight + 30
  const pdf = new jsPDF({ unit: 'mm', format: [width, estimatedHeight] })

  const centerText = (text, size = 10, bold = false) => {
    pdf.setFontSize(size)
    pdf.setFont(undefined, bold ? 'bold' : 'normal')
    pdf.text(text, width / 2, y, { align: 'center', maxWidth: width - 8 })
    y += lineHeight
  }

  const leftRightText = (left, right, size = 9) => {
    pdf.setFontSize(size)
    pdf.setFont(undefined, 'normal')
    pdf.text(left, 4, y, { maxWidth: width * 0.65 })
    pdf.text(right, width - 4, y, { align: 'right' })
    y += lineHeight
  }

  const col = { name: 4, price: 36, qty: 52, total: width - 6 }

  const tableHeader = () => {
    pdf.setFontSize(7.5)
    pdf.setFont(undefined, 'bold')
    pdf.text('Item', col.name, y)
    pdf.text('Price', col.price, y)
    pdf.text('Qty', col.qty, y)
    pdf.text('Total', col.total, y, { align: 'right' })
    y += lineHeight * 0.8
  }

  const tableRow = (name, price, qty, lineTotal) => {
    pdf.setFontSize(8)
    pdf.setFont(undefined, 'normal')
    pdf.text(name, col.name, y, { maxWidth: col.price - col.name - 2 })
    pdf.text(`$${price.toFixed(2)}`, col.price, y)
    pdf.text(`${qty}`, col.qty, y)
    pdf.text(`$${lineTotal.toFixed(2)}`, col.total, y, { align: 'right' })
    y += lineHeight
  }

  const divider = () => {
    pdf.setLineWidth(0.2)
    pdf.line(4, y, width - 4, y)
    y += lineHeight * 0.9
  }

  centerText(restaurantName, 13, true)
  y += 1
  centerText(`Order ${order.order_number || order.id}`, 9)
  centerText(new Date(order.created_at || order.createdAt || Date.now()).toLocaleString(), 8)
  y += 1
  divider()
  tableHeader()
  y += 0.5

  items.forEach((item) => {
    const name = item.name || item.menu_items?.name || 'Item'
    const qty = item.qty || item.quantity || 1
    const price = Number(item.price || item.unit_price || 0)
    tableRow(name, price, qty, price * qty)
  })

  y += 1
  divider()
  y += 1.5
  leftRightText('Total', `$${Number(order.total).toFixed(2)}`, 12)
  y += 2
  centerText(`Payment: ${(order.payment_method || order.paymentMethod || '').toUpperCase()}`, 9)
  y += 3
  centerText('Thank you!', 10, true)

  return pdf
}

export function downloadReceipt(order, restaurantName) {
  const pdf = generateReceiptPdf(order, restaurantName)
  pdf.save(`receipt-${order.order_number || order.id}.pdf`)
}

export function printReceipt(order, restaurantName) {
  const pdf = generateReceiptPdf(order, restaurantName)
  const blobUrl = pdf.output('bloburl')
  window.open(blobUrl, '_blank')
}