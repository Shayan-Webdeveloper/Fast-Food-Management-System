import { useEffect, useRef } from 'react'
import JsBarcode from 'jsbarcode'

export function Barcode({ value, width = 2, height = 60, fontSize = 14 }) {
  const svgRef = useRef(null)

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format: 'CODE128',
          width,
          height,
          fontSize,
          margin: 8,
          background: '#ffffff',
          lineColor: '#000000',
        })
      } catch (err) {
        console.error('Barcode render failed', err)
      }
    }
  }, [value, width, height, fontSize])

  if (!value) return null

  return <svg ref={svgRef} />
}