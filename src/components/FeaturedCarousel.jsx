import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowLeft, ArrowUpRight, Star } from 'lucide-react'
import { useFeaturedLocations } from '../hooks/useFeaturedLocations'
import { useTranslation } from '../context/LanguageContext'

const ease = [0.22, 1, 0.36, 1]

// Per-card accent gradient — rotates through a rich palette
const cardAccents = [
  { from: 'rgba(30,10,0,0.92)',  mid: 'rgba(20,6,0,0.4)',   label: '#C8A96A' }, // amber/gold
  { from: 'rgba(0,18,28,0.92)', mid: 'rgba(0,12,20,0.4)',  label: '#4AACBF' }, // teal
  { from: 'rgba(35,5,2,0.92)',  mid: 'rgba(24,3,1,0.4)',   label: '#E8843A' }, // terracotta
  { from: 'rgba(4,8,36,0.92)',  mid: 'rgba(2,5,24,0.4)',   label: '#6A84C8' }, // cobalt
  { from: 'rgba(6,28,4,0.92)',  mid: 'rgba(4,18,2,0.4)',   label: '#4ABF7A' }, // forest
  { from: 'rgba(28,4,24,0.92)', mid: 'rgba(18,2,16,0.4)',  label: '#BF4AB8' }, // amethyst
  { from: 'rgba(28,16,0,0.92)', mid: 'rgba(18,10,0,0.4)',  label: '#C8A040' }, // bronze
  { from: 'rgba(0,22,18,0.92)', mid: 'rgba(0,14,12,0.4)',  label: '#40BFA8' }, // jade
  { from: 'rgba(30,10,0,0.92)', mid: 'rgba(20,6,0,0.4)',   label: '#C8A96A' }, // amber
  { from: 'rgba(24,0,10,0.92)', mid: 'rgba(16,0,6,0.4)',   label: '#C84A6A' }, // rose
  { from: 'rgba(4,24,28,0.92)', mid: 'rgba(2,16,18,0.4)',  label: '#4AB8C8' }, // cyan
  { from: 'rgba(20,20,0,0.92)', mid: 'rgba(12,12,0,0.4)',  label: '#B8B840' }, // olive
]

function FeaturedCard({ location, i, featuredLabel }) {
  const accent = cardAccents[i % cardAccents.length]

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(i * 0.05, 0.3), duration: 0.7, ease }}
      className="snap-start shrink-0"
    >
      <Link
        to={`/location/${location.id}`}
        className="relative block w-[260px] sm:w-[340px] lg:w-[380px] h-[420px] sm:h-[480px] lg:h-[520px] overflow-hidden group bg-surface-low"
        style={{ backgroundColor: location.fallback || '#1c1b1b' }}
      >
        {/* Full-color image */}
        <img
          src={location.images[0]}
          alt={location.name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.07]"
        />

        {/* Colored gradient overlay — unique per card */}
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            background: `linear-gradient(to top, ${accent.from} 0%, ${accent.mid} 45%, transparent 75%)`,
          }}
        />

        {/* Top vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-bg/60 via-transparent to-transparent" />

        {/* Corner brackets — colored per card */}
        <div className="absolute top-5 left-5 w-5 h-5 border-l border-t transition-colors duration-500"
          style={{ borderColor: `${accent.label}80` }} />
        <div className="absolute top-5 right-5 w-5 h-5 border-r border-t transition-colors duration-500"
          style={{ borderColor: `${accent.label}80` }} />
        <div className="absolute bottom-5 left-5 w-5 h-5 border-l border-b transition-colors duration-500"
          style={{ borderColor: `${accent.label}80` }} />
        <div className="absolute bottom-5 right-5 w-5 h-5 border-r border-b transition-colors duration-500"
          style={{ borderColor: `${accent.label}80` }} />

        {/* Top bar */}
        <div className="absolute top-6 left-6 right-6 flex items-start justify-between">
          <span className="font-mono eyebrow-sm text-white/80 bg-black/30 backdrop-blur-sm px-2 py-1">
            № {String(location.id).padStart(3, '0')}
          </span>
          <span
            className="text-[8px] tracking-[0.25em] uppercase font-medium px-2 py-1 backdrop-blur-sm"
            style={{ color: accent.label, backgroundColor: `${accent.from.replace('0.92', '0.5')}` }}
          >
            {featuredLabel}
          </span>
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="eyebrow-sm text-white/60 mb-2">
            {location.city} · {location.type}
          </div>
          <h3 className="font-display text-2xl md:text-3xl font-light text-white leading-[1.05] tracking-display uppercase mb-4 transition-colors duration-500"
            style={{}}>
            {location.name}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Star className="w-3 h-3" fill={accent.label} style={{ color: accent.label }} />
              <span className="text-white text-xs">{location.rating}</span>
              <span className="text-white/50 text-xs">({location.reviews})</span>
            </div>
            <span className="font-mono text-sm text-white">
              {location.currency}{location.price}
              <span className="text-white/50 text-[10px]"> /day</span>
            </span>
          </div>
        </div>

        {/* Hover arrow — colored */}
        <div
          className="absolute top-1/2 right-6 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center opacity-0 translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500"
          style={{ backgroundColor: accent.label + '25', border: `1px solid ${accent.label}60` }}
        >
          <ArrowUpRight className="w-4 h-4" strokeWidth={1.5} style={{ color: accent.label }} />
        </div>
      </Link>
    </motion.div>
  )
}

export default function FeaturedCarousel() {
  const t = useTranslation('home')
  const scrollRef = useRef(null)
  const { locations: featured, loading } = useFeaturedLocations()

  const scroll = (dir) => {
    if (!scrollRef.current) return
    const card = scrollRef.current.querySelector('a')
    const cardW = card ? card.offsetWidth + 16 : 396
    scrollRef.current.scrollBy({ left: dir * cardW, behavior: 'smooth' })
  }

  if (loading || featured.length === 0) return null

  return (
    <section className="relative py-16 md:py-24 lg:py-28 border-t border-outline-variant/25 overflow-hidden">
      {/* Subtle teal color bloom behind heading */}
      <div
        className="absolute top-0 right-0 w-2/3 h-64 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 100% at 100% 0%, rgba(0,130,150,0.07) 0%, transparent 70%)' }}
      />

      <div className="container-main mb-8 md:mb-12">
        <div className="flex items-end justify-between flex-wrap gap-6">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease }}
              className="flex items-center gap-3 mb-6"
            >
              <span className="w-6 h-px bg-gold" />
              <span className="eyebrow">{t.featuredEyebrow}</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.9, ease }}
              className="font-display font-light text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[0.9] tracking-display uppercase text-on-surface"
            >
              {t.featuredHeading.split(' ')[0]}
              <br />
              <span className="text-gold-gradient italic font-extralight">{t.featuredHeading.split(' ').slice(1).join(' ')}</span>
            </motion.h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll(-1)}
              className="w-12 h-12 border border-outline-variant/40 flex items-center justify-center text-on-surface-variant hover:text-gold hover:border-gold transition-colors"
              aria-label="Previous"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            </button>
            <button
              onClick={() => scroll(1)}
              className="w-12 h-12 border border-outline-variant/40 flex items-center justify-center text-on-surface-variant hover:text-gold hover:border-gold transition-colors"
              aria-label="Next"
            >
              <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory px-[max(1.5rem,calc((100vw-1440px)/2+1.5rem))] md:px-[max(3rem,calc((100vw-1440px)/2+3rem))] xl:px-[max(4rem,calc((100vw-1440px)/2+4rem))]"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {featured.map((loc, i) => (
          <FeaturedCard key={loc.id} location={loc} i={i} featuredLabel={t.featuredEyebrow.split(' ')[0]} />
        ))}
      </div>

      {/* Scroll hint dots */}
      <div className="container-main mt-6 flex items-center gap-2">
        {featured.slice(0, 8).map((_, i) => (
          <div key={i} className="w-1 h-1 rounded-full bg-outline-variant/50" />
        ))}
        {featured.length > 8 && <span className="eyebrow-sm text-on-surface-variant ml-1">+{featured.length - 8}</span>}
      </div>
    </section>
  )
}
