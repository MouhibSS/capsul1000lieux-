import { useState, useMemo, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, useScroll } from 'framer-motion'
import { Grid3X3, LayoutList, ChevronDown } from 'lucide-react'
import { useLocations } from '../hooks/useLocations'
import LocationCard from '../components/LocationCard'
import AdvancedSearchBar, { applyFilters } from '../components/AdvancedSearchBar'

const ease = [0.22, 1, 0.36, 1]

const pageVariants = {
  initial: { opacity: 0 },
  enter: { opacity: 1, transition: { duration: 0.6, ease } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
}

const sortOptions = ['Recommended', 'Price: low to high', 'Price: high to low', 'Top rated']

function parseList(p) {
  if (!p) return []
  return p.split(',').filter(Boolean)
}

export default function Explore() {
  const [params, setParams] = useSearchParams()
  const { locations, loading } = useLocations()

  const [filters, setFilters] = useState(() => ({
    governorates:   parseList(params.get('governorate')),
    cities:         parseList(params.get('city')),
    types:          parseList(params.get('type')),
    architectures:  parseList(params.get('architecture')),
    decorations:    parseList(params.get('decoration')),
    budgets:        parseList(params.get('budget')),
    typeDemande:    parseList(params.get('typedemande')),
    maxPersons:     parseList(params.get('maxpersons')),
    keyword:        params.get('q') || '',
  }))

  const [sort, setSort] = useState('Recommended')
  const [view, setView] = useState('grid')

  // Sync filters → URL
  useEffect(() => {
    const next = new URLSearchParams()
    if (filters.governorates.length)  next.set('governorate',   filters.governorates.join(','))
    if (filters.cities.length)        next.set('city',          filters.cities.join(','))
    if (filters.types.length)         next.set('type',          filters.types.join(','))
    if (filters.architectures.length) next.set('architecture',  filters.architectures.join(','))
    if (filters.decorations.length)   next.set('decoration',    filters.decorations.join(','))
    if (filters.budgets.length)       next.set('budget',        filters.budgets.join(','))
    if (filters.typeDemande.length)   next.set('typedemande',   filters.typeDemande.join(','))
    if (filters.maxPersons.length)    next.set('maxpersons',    filters.maxPersons.join(','))
    if (filters.keyword)              next.set('q',             filters.keyword)
    setParams(next, { replace: true })
  }, [filters, setParams])

  const filtered = useMemo(() => {
    let result = applyFilters(locations, filters)
    if (sort === 'Price: low to high') result = [...result].sort((a, b) => a.price - b.price)
    if (sort === 'Price: high to low') result = [...result].sort((a, b) => b.price - a.price)
    if (sort === 'Top rated')          result = [...result].sort((a, b) => b.rating - a.rating)
    return result
  }, [locations, filters, sort])

  const headerRef = useRef(null)
  useScroll({ target: headerRef, offset: ['start center', 'end center'] })

  const totalActive =
    filters.governorates.length + filters.cities.length + filters.types.length +
    filters.architectures.length + filters.decorations.length + filters.budgets.length +
    filters.typeDemande.length + filters.maxPersons.length +
    (filters.keyword ? 1 : 0)

  const clearAll = () => setFilters({
    governorates: [], cities: [], types: [], architectures: [], decorations: [], budgets: [], typeDemande: [], maxPersons: [], keyword: '',
  })

  return (
    <motion.div variants={pageVariants} initial="initial" animate="enter" exit="exit" className="min-h-screen bg-bg">
      <section ref={headerRef} className="relative pt-28 md:pt-36 pb-12 md:pb-16 border-b border-outline-variant/25 noise overflow-hidden">
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
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease }} className="flex items-center gap-3 mb-6">
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
              Filtrez par gouvernorat, ville, type de lieu, architecture, décoration ou budget. Sélection multiple — affinez librement.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Sticky search bar */}
      <section className="sticky top-16 md:top-20 z-30 bg-bg/95 backdrop-blur-xl border-b border-outline-variant/25">
        <div className="container-main py-4">
          <AdvancedSearchBar
            mode="controlled"
            value={filters}
            onChange={setFilters}
            resultsCount={filtered.length}
          />

          {/* Sort + view toggle */}
          <div className="mt-3 flex items-center gap-3 flex-wrap">
            <span className="eyebrow-sm text-on-surface-variant">{filtered.length} résultats</span>
            {totalActive > 0 && (
              <button
                onClick={clearAll}
                className="text-[10px] tracking-[0.25em] uppercase text-gold hover:text-gold-light"
              >
                Effacer ({totalActive})
              </button>
            )}
            <div className="ml-auto flex items-center gap-2">
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="appearance-none bg-transparent border border-outline-variant/40 text-on-surface text-xs px-4 py-2 pr-8 outline-none cursor-pointer hover:border-gold transition-colors font-light"
                >
                  {sortOptions.map((s) => (<option key={s} value={s} className="bg-surface-low">{s}</option>))}
                </select>
                <ChevronDown className="w-3 h-3 text-on-surface-variant absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={1.5} />
              </div>
              <div className="flex border border-outline-variant/40">
                <button onClick={() => setView('grid')} className={`p-2.5 transition-colors ${view === 'grid' ? 'text-gold' : 'text-on-surface-variant hover:text-gold'}`} aria-label="Grid view">
                  <Grid3X3 className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
                <button onClick={() => setView('list')} className={`p-2.5 transition-colors border-l border-outline-variant/40 ${view === 'list' ? 'text-gold' : 'text-on-surface-variant hover:text-gold'}`} aria-label="List view">
                  <LayoutList className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-main py-10 md:py-16">
        {loading ? (
          <div className="text-center py-32">
            <p className="font-display text-5xl font-extralight text-on-surface/30 mb-4 uppercase tracking-display">Loading...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className={`grid gap-x-5 md:gap-x-6 gap-y-10 md:gap-y-12 ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'}`}>
            {filtered.map((loc, i) => (
              <LocationCard key={loc.id} location={loc} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-32">
            <p className="font-display text-5xl font-extralight text-on-surface/30 mb-4 uppercase tracking-display">No spaces match</p>
            <p className="eyebrow-sm text-on-surface-variant">Try adjusting your filters</p>
          </div>
        )}
      </section>
    </motion.div>
  )
}
