import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, MapPin, HelpCircle, Sparkles, Search, RotateCcw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ChatBot({ onClose }) {
  const navigate = useNavigate()
  const [step, setStep] = useState('greeting')
  const [cities, setCities] = useState([])
  const [allTags, setAllTags] = useState([])
  const [selectedCity, setSelectedCity] = useState(null)
  const [selectedTags, setSelectedTags] = useState([])
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(5000)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from('locations')
          .select('city, tags')
          .eq('published', true)
        if (error) throw error
        const uniqueCities = [...new Set(data.map(d => d.city).filter(Boolean))].sort()
        setCities(uniqueCities)
        const tagsSet = new Set()
        data.forEach(d => Array.isArray(d.tags) && d.tags.forEach(t => tagsSet.add(t)))
        setAllTags([...tagsSet].sort())
      } catch (err) {
        console.error('Chat data error:', err)
        setCities(['Tunis', 'Sousse', 'Hammamet', 'Djerba'])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const reset = () => {
    setStep('greeting')
    setSelectedCity(null)
    setSelectedTags([])
    setMinPrice(0)
    setMaxPrice(5000)
    setResults([])
  }

  const handleCitySelect = (city) => {
    setSelectedCity(city)
    setSelectedTags([])
    setStep('filters')
  }

  const toggleTag = (tag) =>
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])

  const handleSearch = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('published', true)
        .eq('city', selectedCity)
        .gte('price', minPrice)
        .lte('price', maxPrice)
        .order('price')
      if (error) throw error
      let filtered = data || []
      if (selectedTags.length > 0) {
        filtered = filtered.filter(loc =>
          selectedTags.some(tag => Array.isArray(loc.tags) && loc.tags.includes(tag))
        )
      }
      setResults(filtered)
      setStep('results')
    } catch (err) {
      console.error('Search error:', err)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleLocationClick = (id) => {
    onClose?.()
    navigate(`/location/${id}`)
  }

  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-b from-surface-low to-bg border border-outline-variant/30 sm:rounded-2xl overflow-hidden">
      {/* Mobile drag handle */}
      <div className="sm:hidden flex justify-center pt-2 pb-1 shrink-0">
        <span className="w-10 h-1 rounded-full bg-outline-variant/40" />
      </div>

      {/* Header */}
      <header className="flex justify-between items-center px-4 sm:px-5 py-3 sm:py-3.5 border-b border-outline-variant/20 bg-surface-low/60 backdrop-blur-md flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center shadow-md">
              <Sparkles size={15} className="text-bg" strokeWidth={2} />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-surface-low" />
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-sm sm:text-base font-medium text-on-surface leading-tight">
              Atlas
            </h2>
            <div className="text-[10px] sm:text-[11px] text-on-surface-variant leading-tight mt-0.5">
              Your guide across 216&nbsp;000&nbsp;Lieux
            </div>
          </div>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          {step !== 'greeting' && (
            <button
              onClick={reset}
              className="text-on-surface-variant hover:text-gold hover:bg-surface-container/50 transition-colors p-2 rounded-lg"
              aria-label="Reset"
              title="Start over"
            >
              <RotateCcw size={16} />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50 transition-colors p-2 rounded-lg"
            aria-label="Close chat"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-5 py-4 sm:py-5">
        <AnimatePresence mode="wait">
          {/* GREETING */}
          {step === 'greeting' && (
            <motion.div
              key="greeting"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
              className="space-y-4"
            >
              <div className="bg-gradient-to-br from-gold/15 to-gold/5 border border-gold/25 rounded-2xl p-4 sm:p-5">
                <p className="text-on-surface font-medium mb-1.5 text-sm sm:text-base">
                  👋 I'm Atlas, your guide.
                </p>
                <p className="text-on-surface-variant text-xs sm:text-sm leading-relaxed">
                  Pick a city, set your budget, and I'll surface the best of 216&nbsp;000 Lieux for you.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-on-surface-variant text-[10px] sm:text-xs font-medium uppercase tracking-[0.18em]">
                  Popular cities
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {cities.slice(0, 4).map(city => (
                    <motion.button
                      key={city}
                      onClick={() => handleCitySelect(city)}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.96 }}
                      className="px-3 py-3 bg-surface-container/60 hover:bg-gold/15 border border-outline-variant/30 hover:border-gold/45 text-on-surface rounded-xl text-sm transition-all flex items-center gap-2 justify-center shadow-sm"
                    >
                      <MapPin size={12} className="text-gold" strokeWidth={1.8} />
                      <span className="font-medium">{city}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setStep('cities')}
                className="w-full mt-2 bg-gradient-to-br from-gold to-gold-light text-bg px-4 py-3 rounded-xl transition-all font-medium text-sm shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <Search size={14} strokeWidth={2.2} />
                Browse all cities
              </button>
            </motion.div>
          )}

          {/* CITIES */}
          {step === 'cities' && (
            <motion.div
              key="cities"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.22 }}
            >
              <BackBtn onClick={() => setStep('greeting')} />
              <p className="text-on-surface text-sm mb-3 mt-3">Choose a city</p>
              {loading ? (
                <Spinner />
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {cities.map(city => (
                    <motion.button
                      key={city}
                      onClick={() => handleCitySelect(city)}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.96 }}
                      className="px-3 py-2.5 bg-gold/10 hover:bg-gold/20 border border-gold/30 hover:border-gold/55 text-on-surface rounded-xl text-sm transition-all"
                    >
                      {city}
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* FILTERS */}
          {step === 'filters' && (
            <motion.div
              key="filters"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.22 }}
            >
              <BackBtn onClick={() => setStep('greeting')} />
              <p className="text-on-surface text-sm mt-3 mb-4">
                Filters for <span className="text-gold font-medium">{selectedCity}</span>
              </p>

              <div className="space-y-5">
                {/* Budget */}
                <div className="bg-surface-container/40 border border-outline-variant/25 rounded-2xl p-4">
                  <div className="flex items-baseline justify-between mb-3">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">Budget</span>
                    <span className="text-gold font-medium text-sm tabular-nums">
                      €{minPrice} – €{maxPrice}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <Range label={`Min · €${minPrice}`} value={minPrice} onChange={setMinPrice} />
                    <Range label={`Max · €${maxPrice}`} value={maxPrice} onChange={setMaxPrice} />
                  </div>
                </div>

                {/* Tags */}
                {allTags.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-2">
                      Features
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {allTags.map(tag => (
                        <motion.button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          whileTap={{ scale: 0.94 }}
                          className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                            selectedTags.includes(tag)
                              ? 'bg-gold/30 border border-gold text-gold font-medium'
                              : 'bg-surface-container/60 border border-outline-variant/25 text-on-surface-variant hover:border-gold/40'
                          }`}
                        >
                          {tag}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="w-full bg-gradient-to-br from-gold to-gold-light text-bg px-4 py-3 rounded-xl disabled:opacity-50 transition-all font-medium text-sm shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  <Search size={14} strokeWidth={2.2} />
                  {loading ? 'Searching…' : 'Find locations'}
                </button>
              </div>
            </motion.div>
          )}

          {/* RESULTS */}
          {step === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.22 }}
            >
              <BackBtn onClick={() => setStep('filters')} label="Change filters" />

              <p className="text-on-surface-variant text-[10px] tracking-[0.2em] uppercase mt-3 mb-3">
                {results.length} {results.length === 1 ? 'match' : 'matches'} · €{minPrice}–{maxPrice}
                {selectedTags.length > 0 && ` · ${selectedTags.join(', ')}`}
              </p>

              {results.length === 0 ? (
                <div className="text-center py-10">
                  <div className="diamond mx-auto mb-3 opacity-60">
                    <Search className="w-4 h-4 text-gold" strokeWidth={1.4} />
                  </div>
                  <p className="text-on-surface-variant text-sm">No matches yet.</p>
                  <button
                    onClick={() => setStep('filters')}
                    className="text-gold text-sm mt-2 hover:text-gold-light underline-offset-4 hover:underline"
                  >
                    Adjust your filters
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {results.map(loc => (
                    <motion.button
                      key={loc.id}
                      onClick={() => handleLocationClick(loc.id)}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full text-left p-3 bg-surface-low hover:bg-surface-container border border-outline-variant/25 hover:border-gold/45 rounded-xl transition-all group shadow-sm"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <MapPin size={10} className="text-gold shrink-0" strokeWidth={2} />
                            <span className="text-[9px] tracking-[0.2em] uppercase text-on-surface-variant truncate">
                              {loc.city}
                            </span>
                          </div>
                          <h3 className="text-on-surface text-sm font-medium group-hover:text-gold transition-colors truncate leading-snug">
                            {loc.name}
                          </h3>
                          <p className="text-[11px] text-on-surface-variant mt-0.5 capitalize">
                            {loc.type || 'Property'}{loc.rating ? ` · ★ ${loc.rating}` : ''}
                          </p>
                          {Array.isArray(loc.tags) && loc.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {loc.tags.slice(0, 2).map(t => (
                                <span key={t} className="px-1.5 py-0.5 text-[9px] bg-gold/15 text-gold rounded-full">
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-gold font-medium text-sm tabular-nums leading-none">
                            €{loc.price}
                          </p>
                          <p className="text-[9px] text-on-surface-variant mt-0.5">/ day</p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <button
        onClick={() => { onClose?.(); navigate('/contact?type=support') }}
        className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 text-[11px] text-on-surface-variant/80 hover:text-gold transition-colors border-t border-outline-variant/20 bg-surface-low/40"
        style={{ paddingBottom: 'max(0.625rem, env(safe-area-inset-bottom))' }}
      >
        <HelpCircle size={12} />
        <span>Need a human? Contact support</span>
      </button>
    </div>
  )
}

function BackBtn({ onClick, label = 'Back' }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-gold text-xs hover:text-gold-light transition-colors"
    >
      <ChevronLeft size={14} />
      {label}
    </button>
  )
}

function Spinner() {
  return (
    <div className="flex justify-center py-10">
      <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
    </div>
  )
}

function Range({ label, value, onChange }) {
  return (
    <div>
      <p className="text-[10px] text-on-surface-variant mb-1.5 tabular-nums">{label}</p>
      <input
        type="range"
        min="0"
        max="5000"
        step="50"
        value={value}
        onChange={e => onChange(parseInt(e.target.value, 10))}
        className="w-full h-1.5 bg-surface-container rounded-lg appearance-none cursor-pointer accent-gold"
      />
    </div>
  )
}
