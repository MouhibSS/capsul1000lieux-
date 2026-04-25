import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DOW = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

const sameDay = (a, b) => a && b && a.toDateString() === b.toDateString()
const stripTime = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x }
const fmtISO = (d) => {
  if (!d) return ''
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}
const parseISO = (s) => {
  if (!s) return null
  const [y, m, d] = s.split('-').map(Number)
  if (!y) return null
  return new Date(y, m - 1, d)
}

function buildMonth(year, month) {
  const first = new Date(year, month, 1)
  const startWeekday = (first.getDay() + 6) % 7 // Mon=0
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
  while (cells.length % 7) cells.push(null)
  return cells
}

/**
 * ThemedCalendar
 * - mode: "single" | "range"
 * - value: ISO date string (single) or { start, end } ISO strings (range)
 * - onChange: returns the same shape
 * - minDate: optional Date or ISO string
 * - placeholder, label
 */
export default function ThemedCalendar({
  mode = 'single',
  value,
  onChange,
  minDate,
  label,
  placeholder = 'Select date',
  rangeLabels = ['Check-in', 'Check-out'],
  className = '',
}) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)
  const today = stripTime(new Date())
  const min = minDate ? stripTime(typeof minDate === 'string' ? parseISO(minDate) : minDate) : today

  const initialDate =
    mode === 'range'
      ? parseISO(value?.start) || today
      : parseISO(value) || today
  const [view, setView] = useState({ y: initialDate.getFullYear(), m: initialDate.getMonth() })
  const [hover, setHover] = useState(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const onDoc = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('touchstart', onDoc)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('touchstart', onDoc)
    }
  }, [open])

  const current = mode === 'range'
    ? { start: parseISO(value?.start), end: parseISO(value?.end) }
    : parseISO(value)

  const cells = buildMonth(view.y, view.m)

  const prev = () => setView(({ y, m }) => m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 })
  const next = () => setView(({ y, m }) => m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 })

  const handlePick = (d) => {
    if (!d || d < min) return
    if (mode === 'single') {
      onChange(fmtISO(d))
      setOpen(false)
      return
    }
    // range
    const { start, end } = current
    if (!start || (start && end)) {
      onChange({ start: fmtISO(d), end: '' })
    } else if (d <= start) {
      onChange({ start: fmtISO(d), end: '' })
    } else {
      onChange({ start: fmtISO(start), end: fmtISO(d) })
      setTimeout(() => setOpen(false), 150)
    }
  }

  const inRange = (d) => {
    if (mode !== 'range' || !d) return false
    const { start, end } = current
    if (!start) return false
    const target = end || hover
    if (!target) return false
    return d > start && d < target
  }

  const isStart = (d) => mode === 'range' ? sameDay(d, current.start) : false
  const isEnd = (d) => mode === 'range' ? sameDay(d, current.end) : false
  const isSelected = (d) => mode === 'single' ? sameDay(d, current) : (isStart(d) || isEnd(d))

  // Display string
  const displayText = () => {
    if (mode === 'single') {
      return current ? current.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : placeholder
    }
    const { start, end } = current
    if (!start) return placeholder
    const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    if (start && !end) return `${fmt(start)} → …`
    return `${fmt(start)} → ${fmt(end)}`
  }

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      {label && (
        <label className="text-[10px] tracking-[0.25em] text-on-surface-variant uppercase block mb-2">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center gap-3 px-3 sm:px-4 py-3 bg-bg border text-left text-sm transition-colors ${
          open ? 'border-gold' : 'border-outline-variant/40 hover:border-gold/60'
        }`}
      >
        <CalendarIcon className="w-3.5 h-3.5 text-gold flex-shrink-0" strokeWidth={1.6} />
        <span className={`flex-1 truncate ${current && (mode === 'single' ? current : current.start) ? 'text-on-surface' : 'text-on-surface-variant/70'}`}>
          {displayText()}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute z-50 mt-2 left-0 right-0 sm:right-auto sm:min-w-[320px] origin-top"
          >
            <div className="bg-[#0c0c0c] border border-gold/30 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl rounded-sm overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/25 bg-gradient-to-r from-gold/5 to-transparent">
                <button
                  type="button"
                  onClick={prev}
                  className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-gold hover:bg-gold/10 rounded transition-colors"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="w-4 h-4" strokeWidth={1.6} />
                </button>
                <div className="text-center">
                  <div className="font-display text-sm font-light tracking-[0.3em] uppercase text-on-surface">
                    {MONTHS[view.m]}
                  </div>
                  <div className="font-mono text-[10px] tracking-[0.3em] text-gold mt-0.5">{view.y}</div>
                </div>
                <button
                  type="button"
                  onClick={next}
                  className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-gold hover:bg-gold/10 rounded transition-colors"
                  aria-label="Next month"
                >
                  <ChevronRight className="w-4 h-4" strokeWidth={1.6} />
                </button>
              </div>

              {/* Day-of-week header */}
              <div className="grid grid-cols-7 px-3 pt-3">
                {DOW.map((d, i) => (
                  <div key={i} className="text-center text-[9px] font-mono tracking-[0.2em] text-on-surface-variant/60 uppercase pb-2">
                    {d}
                  </div>
                ))}
              </div>

              {/* Cells */}
              <div className="grid grid-cols-7 px-3 pb-3 gap-y-1">
                {cells.map((d, i) => {
                  if (!d) return <div key={i} />
                  const disabled = d < min
                  const sel = isSelected(d)
                  const range = inRange(d)
                  const isToday = sameDay(d, today)
                  const start = isStart(d)
                  const end = isEnd(d)
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handlePick(d)}
                      onMouseEnter={() => mode === 'range' && setHover(d)}
                      disabled={disabled}
                      className={`
                        relative h-9 sm:h-10 flex items-center justify-center text-xs font-mono transition-all
                        ${disabled ? 'text-on-surface-variant/20 cursor-not-allowed' : 'text-on-surface hover:text-gold'}
                        ${sel ? 'bg-gold text-bg font-semibold hover:text-bg' : ''}
                        ${range ? 'bg-gold/15 text-gold' : ''}
                        ${start && mode === 'range' ? 'rounded-l-sm' : ''}
                        ${end && mode === 'range' ? 'rounded-r-sm' : ''}
                      `}
                    >
                      {isToday && !sel && (
                        <span className="absolute inset-0 border border-gold/50 rounded-sm pointer-events-none" />
                      )}
                      {d.getDate()}
                    </button>
                  )
                })}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-outline-variant/25 bg-surface-low/40">
                {mode === 'range' ? (
                  <div className="flex items-center gap-3 text-[10px] tracking-[0.2em] uppercase">
                    <span className={`${current.start ? 'text-gold' : 'text-on-surface-variant/60'}`}>
                      {rangeLabels[0]}
                    </span>
                    <span className="text-on-surface-variant/30">→</span>
                    <span className={`${current.end ? 'text-gold' : 'text-on-surface-variant/60'}`}>
                      {rangeLabels[1]}
                    </span>
                  </div>
                ) : <span />}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-[10px] tracking-[0.25em] uppercase text-on-surface-variant hover:text-gold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
