import { useState, useMemo, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { X, Grid3X3, LayoutList, ChevronDown } from 'lucide-react'
import { locationTypes, cities } from '../data/locations'
import { useLocations } from '../hooks/useLocations'
import LocationCard from '../components/LocationCard'

const ease = [0.22, 1, 0.36, 1]

const pageVariants = {
  initial: { opacity: 0 },
  enter: { opacity: 1, transition: { duration: 0.6, ease } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
}

const sortOptions = ['Recommended', 'Price: low to high', 'Price: high to low', 'Top rated']

export default function Explore() {
  const [params, setParams] = useSearchParams()
  const { locations, loading } = useLocations()
  const [type, setType] = useState(params.get('type')
    ? locationTypes.find((t) => t.toLowerCase() === params.get('type')) || 'All'
    : 'All')
  const [city, setCity] = useState(params.get('city') || 'All Cities')
  const [sort, setSort] = useState('Recommended')
  const [view, setView] = useState('grid')

  useEffect(() => {
    const next = new URLSearchParams()
    if (type !== 'All') next.set('type', type.toLowerCase())
    if (city !== 'All Cities') next.set('city', city)
    setParams(next, { replace: true })
  }, [type, city, setParams])

  const filtered = useMemo(() => {
    let result = [...locations]
    if (type !== 'All') result = result.filter((l) => l.type === type.toLowerCase())
    if (city !== 'All Cities') result = result.filter((l) => l.city === city)
    if (sort === 'Price: low to high') result.sort((a, b) => a.price - b.price)
    if (sort === 'Price: high to low') result.sort((a, b) => b.price - a.price)
    if (sort === 'Top rated') result.sort((a, b) => b.rating - a.rating)
    return result
  }, [locations, type, city, sort])

  const headerRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: headerRef, offset: ['start center', 'end center'] })

  return (
    <motion.div variants={pageVariants} initial="initial" animate="enter" exit="exit" className="min-h-screen bg-bg">
      {/* Editorial header */}
      <section ref={headerRef} className="relative pt-28 md:pt-36 pb-12 md:pb-16 border-b border-outline-variant/25 noise overflow-hidden">
        {/* Animated shimmer gradient */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            background: [
              'radial-gradient(ellipse 70% 60% at 20% 35%, rgba(200,169,106,0.06) 0%, transparent 60%)',
              'radial-gradient(ellipse 70% 60% at 30% 45%, rgba(220,140,100,0.1) 0%, transparent 60%)',
              'radial-gradient(ellipse 70% 60% at 20% 35%, rgba(200,169,106,0.06) 0%, transparent 60%)',
            ],
            x: [0, 40, -40, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="container-main relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 items-end">
            <div className="lg:col-span-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease }}
                className="flex items-center gap-3 mb-6"
              >
                <span className="w-6 h-px bg-gold" />
                <span className="eyebrow">The Index — {filtered.length} spaces</span>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.9, ease }}
                className="font-display font-light text-5xl sm:text-6xl md:text-8xl lg:text-[8.5rem] leading-[0.88] tracking-display uppercase text-on-surface"
              >
                Explore
                <br />
                <span className="stroke-text italic font-extralight">Tunisia.</span>
              </motion.h1>
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.8 }}
              className="lg:col-span-4 text-on-surface-variant font-light leading-relaxed"
            >
              The complete index of scouted spaces across the country — filter
              by typology, governorate, or sort by rate. Every entry is
              bookable and vetted in person.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Filters bar */}
      <section className="sticky top-16 md:top-20 z-30 bg-bg/90 backdrop-blur-xl border-b border-outline-variant/25">
        <div className="container-main py-4 md:py-5 flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
          {/* Type pills */}
          <div className="flex items-center gap-2 flex-nowrap md:flex-wrap overflow-x-auto -mx-1 px-1 pb-1 md:pb-0" style={{ scrollbarWidth: 'none' }}>
            {locationTypes.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-4 py-2 text-[10px] font-medium tracking-[0.25em] uppercase transition-all duration-300 whitespace-nowrap ${
                  type === t
                    ? 'bg-gold text-bg'
                    : 'border border-outline-variant/40 text-on-surface-variant hover:text-gold hover:border-gold'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="md:ml-auto flex items-center gap-2 flex-wrap">
            <div className="relative">
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="appearance-none bg-transparent border border-outline-variant/40 text-on-surface text-xs px-4 py-2 pr-8 outline-none cursor-pointer hover:border-gold transition-colors font-light"
              >
                {cities.map((c) => (
                  <option key={c} value={c} className="bg-surface-low">
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-on-surface-variant absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={1.5} />
            </div>

            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none bg-transparent border border-outline-variant/40 text-on-surface text-xs px-4 py-2 pr-8 outline-none cursor-pointer hover:border-gold transition-colors font-light"
              >
                {sortOptions.map((s) => (
                  <option key={s} value={s} className="bg-surface-low">
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-on-surface-variant absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={1.5} />
            </div>

            <div className="flex border border-outline-variant/40">
              <button
                onClick={() => setView('grid')}
                className={`p-2.5 transition-colors ${view === 'grid' ? 'text-gold' : 'text-on-surface-variant hover:text-gold'}`}
                aria-label="Grid view"
              >
                <Grid3X3 className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
              <button
                onClick={() => setView('list')}
                className={`p-2.5 transition-colors border-l border-outline-variant/40 ${view === 'list' ? 'text-gold' : 'text-on-surface-variant hover:text-gold'}`}
                aria-label="List view"
              >
                <LayoutList className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>

        {/* Active chips */}
        {(type !== 'All' || city !== 'All Cities') && (
          <div className="container-main pb-4 flex items-center gap-2 flex-wrap">
            <span className="eyebrow-sm text-on-surface-variant">Active</span>
            {type !== 'All' && (
              <button
                onClick={() => setType('All')}
                className="flex items-center gap-2 chip-gold hover:bg-gold hover:text-bg transition-colors"
              >
                {type} <X className="w-2.5 h-2.5" strokeWidth={1.5} />
              </button>
            )}
            {city !== 'All Cities' && (
              <button
                onClick={() => setCity('All Cities')}
                className="flex items-center gap-2 chip-gold hover:bg-gold hover:text-bg transition-colors"
              >
                {city} <X className="w-2.5 h-2.5" strokeWidth={1.5} />
              </button>
            )}
          </div>
        )}
      </section>

      {/* Grid */}
      <section className="container-main py-10 md:py-16">
        {loading ? (
          <div className="text-center py-32">
            <p className="font-display text-5xl font-extralight text-on-surface/30 mb-4 uppercase tracking-display">
              Loading...
            </p>
          </div>
        ) : filtered.length > 0 ? (
          <div
            className={`grid gap-x-5 md:gap-x-6 gap-y-10 md:gap-y-12 ${
              view === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1 sm:grid-cols-2'
            }`}
          >
            {filtered.map((loc, i) => (
              <LocationCard key={loc.id} location={loc} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-32">
            <p className="font-display text-5xl font-extralight text-on-surface/30 mb-4 uppercase tracking-display">
              No spaces match
            </p>
            <p className="eyebrow-sm text-on-surface-variant">Try adjusting your filters</p>
          </div>
        )}
      </section>
    </motion.div>
  )
}
