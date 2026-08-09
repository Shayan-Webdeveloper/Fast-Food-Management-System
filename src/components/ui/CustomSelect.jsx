import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Check } from 'lucide-react'
import clsx from 'clsx'

if (typeof document !== 'undefined' && !document.getElementById('custom-select-keyframes')) {
  const style = document.createElement('style')
  style.id = 'custom-select-keyframes'
  style.textContent = `@keyframes dropdown { from { opacity: 0; transform: scaleY(0.8) translateY(-4px); } to { opacity: 1; transform: scaleY(1) translateY(0); } }`
  document.head.appendChild(style)
}

export function CustomSelect({ value, onChange, options, className }) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 })
  const ref = useRef(null)
  const buttonRef = useRef(null)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        ref.current && !ref.current.contains(e.target) &&
        menuRef.current && !menuRef.current.contains(e.target)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setCoords({ top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX, width: rect.width })
    }
  }, [open])

  const selected = options.find((o) => o.value === value)

  return (
    <div ref={ref} className={clsx('relative', className)}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-500"
      >
        {selected?.label}
        <ChevronDown className={clsx('h-4 w-4 text-slate-400 transition-transform', open && 'rotate-180')} />
      </button>
      {open && createPortal(
        <div
          ref={menuRef}
          style={{ position: 'absolute', top: coords.top, left: coords.left, width: coords.width }}
          className="z-[200] origin-top animate-[dropdown_0.15s_ease-out] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg"
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className="group flex w-full cursor-pointer items-center justify-between px-3 py-2 text-left text-sm text-slate-900 transition-colors hover:bg-brand-500 hover:text-white"
            >
              {opt.label}
              {opt.value === value && <Check className="h-4 w-4 text-brand-500 group-hover:text-white" />}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  )
}