import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { ArrowUpRight, MapPin, Film, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from '../context/LanguageContext'

/**
 * Atlas Reel — replaces the old "Field Notes" pinned-scroll section.
 * A horizontally snap-scrolling filmstrip of postcards. Works on
 * touch (swipe), trackpad (horizontal scroll), and pointer (drag + arrows).
 * Each postcard has parallax depth on hover and an accent stripe.
 */
function PostcardCard({ chapter, isActive, onActivate, enterSpaceText }) {
  const ref = useRef(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rotX = useSpring(useTransform(my, [-1, 1], [6, -6]), { stiffness: 120, damping: 20 })
  const rotY = useSpring(useTransform(mx, [-1, 1], [-8, 8]), { stiffness: 120, damping: 20 })
  const tx = useSpring(useTransform(mx, [-1, 1], [-8, 8]), { stiffness: 120, damping: 20 })
  const ty = useSpring(useTransform(my, [-1, 1], [-6, 6]), { stiffness: 120, damping: 20 })

  const handleMove = (e) => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    mx.set(((e.clientX - r.left) / r.width) * 2 - 1)
    my.set(((e.clientY - r.top) / r.height) * 2 - 1)
  }
  const reset = () => { mx.set(0); my.set(0) }

  return (
    <motion.article
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      onClick={onActivate}
      style={{ rotateX: rotX, rotateY: rotY, transformPerspective: 1100, transformStyle: 'preserve-3d' }}
      className={`snap-center shrink-0 relative w-[78vw] sm:w-[58vw] md:w-[44vw] lg:w-[32vw] aspect-[3/4] cursor-pointer group select-none ${
        isActive ? 'z-10' : ''
      }`}
    >
      {/* Film perforations */}
      <div className="absolute -top-3 left-0 right-0 h-3 flex items-center justify-around pointer-events-none">
        {Array.from({ length: 14 }).map((_, i) => (
          <span key={i} className="w-1.5 h-1.5 rounded-sm bg-on-surface-variant/20" />
        ))}
      </div>
      <div className="absolute -bottom-3 left-0 right-0 h-3 flex items-center justify-around pointer-events-none">
        {Array.from({ length: 14 }).map((_, i) => (
          <span key={i} className="w-1.5 h-1.5 rounded-sm bg-on-surface-variant/20" />
        ))}
      </div>

      {/* Card */}
      <div
        className="relative w-full h-full overflow-hidden bg-surface-low border border-outline-variant/30 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]"
        style={{ backgroundColor: chapter.fallback }}
      >
        {/* Image with parallax */}
        <motion.img
          src={chapter.image}
          alt={chapter.name}
          loading="lazy"
          style={{ x: tx, y: ty }}
          className="absolute inset-[-6%] w-[112%] h-[112%] object-cover img-mono transition-[filter] duration-700 group-hover:[filter:none] group-hover:scale-[1.04]"
          draggable={false}
        />

        {/* Gradient veil */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />
        <div
          className="absolute inset-0 opacity-50 mix-blend-overlay pointer-events-none"
          style={{ background: `radial-gradient(ellipse at top, ${chapter.accent}55 0%, transparent 65%)` }}
        />

        {/* Accent left stripe */}
        <span
          className="absolute top-0 bottom-0 left-0 w-1"
          style={{ background: `linear-gradient(to bottom, ${chapter.accent}, transparent)` }}
        />

        {/* Top meta — coords & live dot */}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-bg/65 backdrop-blur border border-outline-variant/30">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: chapter.accent, boxShadow: `0 0 8px ${chapter.accent}` }}
            />
            <span className="font-mono text-[9px] tracking-[0.25em] text-on-surface-variant">
              {chapter.coords}
            </span>
          </div>
          <span
            className="font-display text-3xl md:text-4xl font-extralight tabular-nums leading-none drop-shadow"
            style={{ color: chapter.accent }}
          >
            {chapter.index}
          </span>
        </div>

        {/* Bottom content */}
        <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-[9px] tracking-[0.35em] uppercase font-medium"
              style={{ color: chapter.accent }}
            >
              {chapter.region}
            </span>
            <span className="w-6 h-px" style={{ background: `${chapter.accent}80` }} />
            <span className="font-mono text-[9px] tracking-[0.2em] text-on-surface-variant uppercase">
              Reel
            </span>
          </div>
          <h3 className="font-display font-light text-2xl md:text-3xl lg:text-4xl text-on-surface uppercase tracking-display leading-[0.95] mb-2">
            {chapter.name}
          </h3>
          <p
            className="font-display italic font-extralight text-sm md:text-base mb-3"
            style={{ color: chapter.accent }}
          >
            {chapter.subtitle}
          </p>

          {/* Hidden until hover/active — copy reveal */}
          <div
            className={`overflow-hidden transition-all duration-500 ease-out ${
              isActive ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0 group-hover:max-h-40 group-hover:opacity-100'
            }`}
          >
            <p className="text-on-surface-variant text-xs md:text-sm leading-relaxed mb-3 line-clamp-3">
              {chapter.copy}
            </p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {chapter.tags.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 text-[9px] tracking-[0.18em] uppercase border rounded-full"
                  style={{ borderColor: `${chapter.accent}55`, color: chapter.accent }}
                >
                  {t}
                </span>
              ))}
            </div>
            <Link
              to={`/explore?city=${chapter.city}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase font-medium text-on-surface hover:text-gold transition-colors"
            >
              {enterSpaceText}
              <ArrowUpRight className="w-3 h-3" strokeWidth={1.6} />
            </Link>
          </div>
        </div>

        {/* Corner brackets */}
        {[
          'top-3 left-3 border-l border-t',
          'top-3 right-3 border-r border-t',
          'bottom-3 left-3 border-l border-b',
          'bottom-3 right-3 border-r border-b',
        ].map((c, i) => (
          <span
            key={i}
            className={`absolute w-3 h-3 ${c}`}
            style={{ borderColor: `${chapter.accent}aa` }}
          />
        ))}
      </div>
    </motion.article>
  )
}

export default function CinematicJourney() {
  const t = useTranslation('cinematic')
  const scrollerRef = useRef(null)
  const [activeIdx, setActiveIdx] = useState(0)

  const chapters = [
    {
      id: 1, index: '01', city: 'Sidi Bou Said',
      region: t.chapter1Region || 'Northern Coast',
      name: t.chapter1Name || 'Sidi Bou Said',
      subtitle: t.chapter1Subtitle || 'The cobalt postcard',
      coords: '36.87°N · 10.34°E',
      copy: t.chapter1Copy || "Whitewashed walls, cobalt shutters, bougainvillea spilling over salt-washed terraces. A village suspended above the Gulf of Tunis.",
      image: 'https://images.unsplash.com/photo-1548263594-a71ea65a8598?w=1400&q=85&auto=format&fit=crop',
      fallback: '#102035',
      tags: ['Villa', 'Sea view', 'Light'],
      accent: '#4A9FC8',
    },
    {
      id: 5, index: '02', city: 'Tozeur',
      region: t.chapter2Region || 'South — Sahara',
      name: t.chapter2Name || 'Tozeur',
      subtitle: t.chapter2Subtitle || 'Edge of the salt flats',
      coords: '33.92°N · 8.13°E',
      copy: t.chapter2Copy || 'A sand-coloured studio pressed against the lip of Chott el Djerid. Infinity cove, pro rigging, palmeraie courtyard.',
      image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1400&q=85&auto=format&fit=crop',
      fallback: '#3a2614',
      tags: ['Studio', 'Desert', 'Cove'],
      accent: '#C89040',
    },
    {
      id: 8, index: '03', city: 'Tataouine',
      region: t.chapter3Region || 'Deep south',
      name: t.chapter3Name || 'Tataouine',
      subtitle: t.chapter3Subtitle || 'Bauhaus on red dunes',
      coords: '32.93°N · 10.45°E',
      copy: t.chapter3Copy || 'A minimalist concrete cube rising from ochre dunes — ksar craft folded into Bauhaus precision.',
      image: 'https://images.unsplash.com/photo-1509233725247-49e657c54213?w=1400&q=85&auto=format&fit=crop',
      fallback: '#2a1810',
      tags: ['Villa', 'Desert', 'Cinematic'],
      accent: '#E8683A',
    },
    {
      id: 2, index: '04', city: 'La Marsa',
      region: t.chapter4Region || 'Mediterranean',
      name: t.chapter4Name || 'La Marsa',
      subtitle: t.chapter4Subtitle || 'Travertine & tide',
      coords: '36.87°N · 10.32°E',
      copy: t.chapter4Copy || 'Polished travertine, infinity pool, uninterrupted horizon. A canvas rinsed daily by the North African sea.',
      image: 'https://images.unsplash.com/photo-1519452575417-564c1401ecc0?w=1400&q=85&auto=format&fit=crop',
      fallback: '#0e1a25',
      tags: ['Villa', 'Seafront', 'Pool'],
      accent: '#2AAFB8',
    },
  ]

  // Track which card is centered for the dots indicator
  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const center = el.scrollLeft + el.clientWidth / 2
        const cards = el.querySelectorAll('article')
        let best = 0
        let dist = Infinity
        cards.forEach((c, i) => {
          const cx = c.offsetLeft + c.clientWidth / 2
          const d = Math.abs(cx - center)
          if (d < dist) { dist = d; best = i }
        })
        setActiveIdx(best)
      })
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('scroll', onScroll)
    }
  }, [])

  const scrollTo = (i) => {
    const el = scrollerRef.current
    if (!el) return
    const card = el.querySelectorAll('article')[i]
    if (!card) return
    el.scrollTo({ left: card.offsetLeft - (el.clientWidth - card.clientWidth) / 2, behavior: 'smooth' })
  }

  const nudge = (dir) => scrollTo(Math.max(0, Math.min(chapters.length - 1, activeIdx + dir)))

  return (
    <section className="relative py-16 md:py-24 lg:py-28 bg-bg overflow-hidden border-y border-outline-variant/20">
      {/* Ambient backdrop */}
      <div
        className="absolute inset-0 pointer-events-none opacity-60 transition-colors duration-1000"
        style={{
          background: `radial-gradient(ellipse 60% 40% at 50% 30%, ${chapters[activeIdx].accent}22 0%, transparent 70%)`,
        }}
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      {/* Header */}
      <div className="container-main relative">
        <div className="flex items-end justify-between gap-6 mb-8 md:mb-12 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Film className="w-3.5 h-3.5 text-gold" strokeWidth={1.6} />
              <span className="eyebrow text-gold">{t.fieldNotesTitle || 'Atlas Reel — Vol. 01'}</span>
            </div>
            <h2 className="font-display font-light text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[0.92] tracking-display uppercase text-on-surface max-w-3xl">
              Postcards <span className="stroke-text italic">from the</span> reel
            </h2>
            <p className="text-on-surface-variant text-sm md:text-base mt-4 md:mt-5 max-w-md font-light leading-relaxed">
              Four chapters. One country. Tap a card to peek behind the lens — or swipe through the strip.
            </p>
          </div>

          {/* Desktop nav arrows */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => nudge(-1)}
              disabled={activeIdx === 0}
              className="w-11 h-11 rounded-full border border-outline-variant/40 text-on-surface-variant hover:text-gold hover:border-gold transition-colors flex items-center justify-center disabled:opacity-30 disabled:hover:text-on-surface-variant disabled:hover:border-outline-variant/40"
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={1.6} />
            </button>
            <button
              onClick={() => nudge(1)}
              disabled={activeIdx === chapters.length - 1}
              className="w-11 h-11 rounded-full border border-outline-variant/40 text-on-surface-variant hover:text-gold hover:border-gold transition-colors flex items-center justify-center disabled:opacity-30 disabled:hover:text-on-surface-variant disabled:hover:border-outline-variant/40"
              aria-label="Next"
            >
              <ChevronRight className="w-4 h-4" strokeWidth={1.6} />
            </button>
          </div>
        </div>
      </div>

      {/* Filmstrip — snap scroller */}
      <div
        ref={scrollerRef}
        className="relative flex gap-4 md:gap-6 px-[11vw] sm:px-[21vw] md:px-[14vw] lg:px-[18vw] overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory no-scrollbar"
        style={{ scrollbarWidth: 'none' }}
      >
        {chapters.map((c, i) => (
          <PostcardCard
            key={c.id}
            chapter={c}
            isActive={activeIdx === i}
            onActivate={() => scrollTo(i)}
            enterSpaceText={t.enterSpace || 'Enter the space'}
          />
        ))}
      </div>

      {/* Indicator + active title */}
      <div className="container-main mt-8 md:mt-10 relative">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            {chapters.map((c, i) => (
              <button
                key={c.id}
                onClick={() => scrollTo(i)}
                aria-label={`Go to ${c.name}`}
                className={`group relative h-1.5 transition-all duration-500 rounded-full ${
                  activeIdx === i ? 'w-12' : 'w-2 hover:w-6'
                }`}
                style={{
                  backgroundColor: activeIdx === i ? c.accent : 'rgba(200,169,106,0.25)',
                  boxShadow: activeIdx === i ? `0 0 12px ${c.accent}80` : 'none',
                }}
              />
            ))}
          </div>
          <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.3em] uppercase text-on-surface-variant">
            <span style={{ color: chapters[activeIdx].accent }}>
              {String(activeIdx + 1).padStart(2, '0')}
            </span>
            <span className="w-8 h-px bg-outline-variant/50" />
            <span>{String(chapters.length).padStart(2, '0')}</span>
            <span className="w-8 h-px bg-outline-variant/50 hidden sm:inline-block" />
            <span className="hidden sm:inline-flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-gold" strokeWidth={1.6} />
              {chapters[activeIdx].city}
            </span>
          </div>
        </div>
      </div>

      {/* Marquee strip — looping city names */}
      <div className="mt-12 md:mt-16 relative overflow-hidden border-y border-outline-variant/25 py-3 md:py-4">
        <div className="flex animate-marquee whitespace-nowrap will-change-transform">
          {[...chapters, ...chapters, ...chapters].map((c, i) => (
            <span key={i} className="inline-flex items-center gap-3 px-6 font-display font-extralight text-2xl md:text-4xl uppercase tracking-display text-on-surface-variant/40">
              {c.city}
              <span className="w-2 h-2 rounded-full" style={{ background: c.accent }} />
            </span>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="container-main mt-10 md:mt-14 relative flex items-center justify-between gap-4 flex-wrap">
        <span className="eyebrow-sm text-on-surface-variant hidden sm:inline">
          {t.scrollAdvance || 'Swipe — advance the reel'}
        </span>
        <Link
          to="/explore"
          className="inline-flex items-center gap-3 px-6 py-3 border border-gold/40 hover:border-gold hover:bg-gold/10 text-on-surface hover:text-gold text-[10px] tracking-[0.35em] uppercase font-semibold transition-all group"
        >
          {t.browseLibrary || 'Browse the library'}
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform duration-500" strokeWidth={1.6} />
        </Link>
      </div>
    </section>
  )
}
