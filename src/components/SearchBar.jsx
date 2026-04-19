import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin, Layers, DollarSign, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const typeOptions = ['Any type', 'Loft', 'Villa', 'Studio', 'Rooftop', 'Mansion', 'Penthouse']
const cityOptions = ['Any city', 'Tunis', 'Sidi Bou Said', 'La Marsa', 'Hammamet', 'Sousse', 'Djerba', 'Tozeur', 'Kairouan', 'Tataouine']
const budgetOptions = ['Any budget', '< €300/day', '€300–600/day', '€600–1000/day', '€1000+/day']

function Dropdown({ icon: Icon, label, options, value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  return (
    <div ref={ref} className="relative flex-1 sm:min-w-[140px]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-5 py-4 sm:py-5 text-left group"
      >
        <Icon className="w-3.5 h-3.5 text-gold shrink-0" strokeWidth={1.5} />
        <div className="flex flex-col min-w-0">
          <span className="eyebrow-sm text-on-surface-variant mb-0.5">{label}</span>
          <span className="text-on-surface text-sm font-light truncate">{value}</span>
        </div>
        <ChevronDown
          className={`w-3 h-3 text-on-surface-variant ml-auto shrink-0 transition-transform duration-300 ${
            open ? 'rotate-180' : ''
          }`}
          strokeWidth={1.5}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-surface-low border border-outline-variant/40 z-20 max-h-72 overflow-y-auto"
          >
            {options.map((opt) => (
              <button
                key={opt}
                className={`w-full text-left px-5 py-3 text-sm transition-colors font-light ${
                  value === opt
                    ? 'text-gold bg-surface-container'
                    : 'text-on-surface hover:text-gold hover:bg-surface-container'
                }`}
                onClick={() => {
                  onChange(opt)
                  setOpen(false)
                }}
              >
                {opt}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function SearchBar({ compact = false }) {
  const [type, setType] = useState('Any type')
  const [city, setCity] = useState('Any city')
  const [budget, setBudget] = useState('Any budget')
  const navigate = useNavigate()

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (type !== 'Any type') params.set('type', type.toLowerCase())
    if (city !== 'Any city') params.set('city', city)
    if (budget !== 'Any budget') params.set('budget', budget)
    navigate(`/explore?${params.toString()}`)
  }

  return (
    <div
      className={`bg-surface-low border border-outline-variant/40 flex flex-col sm:flex-row items-stretch divide-y sm:divide-y-0 divide-outline-variant/40 ${
        compact ? 'max-w-2xl' : 'max-w-4xl'
      } w-full`}
    >
      <Dropdown icon={Layers} label="Type" options={typeOptions} value={type} onChange={setType} />
      <div className="hidden sm:block w-px bg-outline-variant/40 self-stretch" />
      <Dropdown icon={MapPin} label="City" options={cityOptions} value={city} onChange={setCity} />
      <div className="hidden sm:block w-px bg-outline-variant/40 self-stretch" />
      <Dropdown icon={DollarSign} label="Budget" options={budgetOptions} value={budget} onChange={setBudget} />

      <button
        onClick={handleSearch}
        className="flex items-center justify-center gap-3 bg-gold hover:bg-gold-light text-bg px-8 py-4 sm:py-5 font-semibold text-[10px] uppercase tracking-[0.3em] transition-colors"
      >
        <Search className="w-3.5 h-3.5" strokeWidth={1.8} />
        Search
      </button>
    </div>
  )
}
