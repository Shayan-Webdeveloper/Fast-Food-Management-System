import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import clsx from 'clsx'

export function DatePicker({ value, onChange, className }) {
  const [open, setOpen] = useState(false)
  const [viewDate, setViewDate] = useState(() => value ? new Date(value + 'T00:00:00') : new Date())
  const [coords, setCoords] = useState({ top: 0, left: 0 })
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
      const calendarWidth = 288 // w-72
      const viewportWidth = window.innerWidth
      let left = rect.left + window.scrollX
      if (left + calendarWidth > viewportWidth - 8) {
        left = viewportWidth - calendarWidth - 8
      }
      if (left < 8) left = 8
      setCoords({ top: rect.bottom + window.scrollY + 4, left })
      setViewDate(value ? new Date(value + 'T00:00:00') : new Date())
    }
  }, [open, value])

  const selectedDate = value ? new Date(value + 'T00:00:00') : null
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthLabel = viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })

  const days = []
  for (let i = 0; i < firstDayOfMonth; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)

  const formatDate = (d) => {
    const dt = new Date(year, month, d)
    const yyyy = dt.getFullYear()
    const mm = String(dt.getMonth() + 1).padStart(2, '0')
    const dd = String(dt.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  const isSameDay = (d, other) => {
    if (!other) return false
    return d === other.getDate() && month === other.getMonth() && year === other.getFullYear()
  }

  const displayLabel = selectedDate
    ? selectedDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    : 'Select date'

  return (
    <div ref={ref} className={clsx('relative', className)}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition hover:border-brand-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
      >
        <Calendar className="h-4 w-4 text-slate-400" />
        {displayLabel}
      </button>

      {open && createPortal(
        <div
          ref={menuRef}
          style={{ position: 'absolute', top: coords.top, left: coords.left }}
          className="z-[200] w-72 origin-top-left rounded-xl border border-slate-200 bg-white p-3 shadow-lg animate-[dropdown_0.15s_ease-out]"
        >
          <div className="flex items-center justify-between px-1 pb-2">
            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month - 1, 1))}
              className="cursor-pointer rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="text-sm font-semibold text-slate-900">{monthLabel}</p>
            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month + 1, 1))}
              disabled={year === today.getFullYear() && month === today.getMonth()}
              className="cursor-pointer rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 px-1 text-center text-xs font-semibold text-slate-400">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={i} className="py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 px-1">
            {days.map((d, i) => {
              if (d === null) return <div key={i} />
              const isSelected = isSameDay(d, selectedDate)
              const isToday = isSameDay(d, today)
              const thisDate = new Date(year, month, d)
              const isFuture = thisDate > today
              return (
                <button
                  key={i}
                  type="button"
                  disabled={isFuture}
                  onClick={() => { onChange(formatDate(d)); setOpen(false) }}
                  className={clsx(
                    'aspect-square rounded-lg text-sm font-medium transition',
                    isFuture ? 'cursor-not-allowed text-slate-300' : 'cursor-pointer',
                    !isFuture && isSelected ? '!bg-brand-500 !text-white' :
                    !isFuture && isToday ? 'bg-brand-50 text-brand-700' :
                    !isFuture && 'text-slate-700 hover:bg-slate-100'
                  )}
                >
                  {d}
                </button>
              )
            })}
          </div>

          <button
            type="button"
            onClick={() => { onChange(formatDate(today.getDate())); setViewDate(new Date()); }}
            className="mt-2 w-full cursor-pointer rounded-lg border border-slate-200 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Today
          </button>
        </div>,
        document.body
      )}
    </div>
  )
}