import { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { useTranslation } from '../context/LanguageContext'

function Pane({ chapter, i, total, progress, accent, enterSpaceText }) {
  const seg = 1 / total
  const start = i * seg
  const end = (i + 1) * seg
  const enter = seg * 0.55
  const hold = seg * 0.2

  const x = useTransform(
    progress,
    [start - enter, start + hold, end - hold, end + hold],
    i === 0 ? ['0%', '0%', '0%', '-18%'] : ['105%', '0%', '0%', '-18%']
  )
  const opacity = useTransform(
    progress,
    [start - enter, start - enter * 0.2, end - hold * 0.5, end + hold * 0.6],
    i === 0 ? [1, 1, 1, 0] : [0, 1, 1, 0]
  )
  const rotateY = useTransform(
    progress,
    [start - enter, start + hold, end - hold, end + hold],
    i === 0 ? [0, 0, 0, -4] : [7, 0, 0, -4]
  )
  const scale = useTransform(
    progress,
    [start - enter, start + hold, end - hold, end + hold],
    [0.97, 1, 1, 0.96]
  )

  const reversed = i % 2 === 1

  return (
    <motion.div
      className="absolute inset-0 flex items-center"
      style={{ x, opacity, rotateY, scale, transformPerspective: 1400, transformStyle: 'preserve-3d' }}
    >
      <div className="container-main w-full">
        <div
          className={`grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 lg:gap-16 items-center ${
            reversed ? 'lg:[&>*:first-child]:order-2' : ''
          }`}
        >
          {/* Image */}
          <div className="lg:col-span-7 relative">
            <Link
              to={`/explore?city=${chapter.city}`}
              className="group block relative overflow-hidden aspect-[16/10] md:aspect-[5/4] lg:aspect-[16/11] bg-surface-low"
              style={{ backgroundColor: chapter.fallback }}
            >
              <img
                src={chapter.image}
                alt={chapter.name}
                loading="lazy"
                className="w-full h-full object-cover img-mono transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute top-4 left-4 w-5 h-5 border-l border-t" style={{ borderColor: accent + 'A0' }} />
              <div className="absolute top-4 right-4 w-5 h-5 border-r border-t" style={{ borderColor: accent + 'A0' }} />
              <div className="absolute bottom-4 left-4 w-5 h-5 border-l border-b" style={{ borderColor: accent + 'A0' }} />
              <div className="absolute bottom-4 right-4 w-5 h-5 border-r border-b" style={{ borderColor: accent + 'A0' }} />
              <div className="absolute top-5 left-1/2 -translate-x-1/2 eyebrow-sm text-on-surface-variant font-mono pointer-events-none">
                {chapter.coords}
              </div>
              <div className="absolute bottom-5 right-5 w-12 h-12 rounded-full glass-gold flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                <ArrowUpRight className="w-4 h-4 text-gold" strokeWidth={1.5} />
              </div>
            </Link>
          </div>

          {/* Text */}
          <div className="lg:col-span-5 relative">
            <div className="flex items-center gap-4 mb-4 md:mb-5">
              <span
                className="font-display text-4xl md:text-6xl font-extralight tabular-nums leading-none"
                style={{ color: accent + '60' }}
              >
                {chapter.index}
              </span>
              <div className="flex flex-col">
                <span className="eyebrow" style={{ color: accent }}>{chapter.region}</span>
                <span className="text-on-surface-variant text-xs mt-1 font-mono tracking-wider">
                  {chapter.coords}
                </span>
              </div>
            </div>

            <h3 className="font-display font-light text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[0.94] tracking-display text-on-surface uppercase mb-3">
              {chapter.name}
            </h3>
            <p className="font-display italic font-extralight text-lg md:text-2xl mb-5 md:mb-6"
              style={{ color: accent }}>
              {chapter.subtitle}
            </p>

            <div className="w-14 h-px mb-5 md:mb-6" style={{ background: `linear-gradient(90deg, ${accent}70, transparent)` }} />

            <p className="text-on-surface-variant text-sm md:text-base leading-relaxed mb-5 md:mb-6 max-w-md font-light">
              {chapter.copy}
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              {chapter.tags.map((t) => (
                <span key={t} className="chip">
                  {t}
                </span>
              ))}
            </div>

            <Link
              to={`/explore?city=${chapter.city}`}
              className="inline-flex items-center gap-3 text-on-surface hover:text-gold text-[10px] tracking-[0.35em] uppercase font-medium transition-colors duration-300 group"
            >
              <span>{enterSpaceText}</span>
              <span className="w-10 h-px bg-on-surface group-hover:bg-gold group-hover:w-14 transition-all duration-500" />
              <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function ProgressRail({ progress, total }) {
  const smooth = useSpring(progress, { stiffness: 120, damping: 24, mass: 0.4 })
  const scaleY = useTransform(smooth, [0, 1], [0, 1])
  return (
    <div className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-3 pointer-events-none">
      <span className="eyebrow-sm text-on-surface-variant font-mono">01</span>
      <div className="relative h-40 md:h-56 w-px bg-outline-variant/30 overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gold origin-top"
          style={{ scaleY }}
        />
      </div>
      <span className="eyebrow-sm text-on-surface-variant font-mono">
        {String(total).padStart(2, '0')}
      </span>
    </div>
  )
}

function ActiveIndex({ progress, total }) {
  const current = useTransform(progress, (v) =>
    String(Math.min(total, Math.floor(v * total) + 1)).padStart(2, '0')
  )
  return (
    <motion.span className="font-mono eyebrow-sm text-gold">
      {current}
    </motion.span>
  )
}

export default function CinematicJourney() {
  const t = useTranslation('cinematic')
  const sectionRef = useRef(null)
  const isAnimating = useRef(false)

  const chapters = [
    {
      id: 1,
      index: '01',
      city: 'Sidi Bou Said',
      region: t.chapter1Region || 'Northern Coast',
      name: t.chapter1Name || 'Sidi Bou Said',
      subtitle: t.chapter1Subtitle || 'The cobalt postcard',
      coords: '36.87°N · 10.34°E',
      copy: t.chapter1Copy || "Whitewashed walls, cobalt shutters, bougainvillea spilling over salt-washed terraces. A village suspended above the Gulf of Tunis — cinema's favorite North African postcard.",
      image: 'https://images.unsplash.com/photo-1548263594-a71ea65a8598?w=1800&q=85&auto=format&fit=crop',
      fallback: '#102035',
      tags: ['Villa', 'Sea view', 'Natural light'],
      accent: '#4A9FC8',
    },
    {
      id: 5,
      index: '02',
      city: 'Tozeur',
      region: t.chapter2Region || 'South — Sahara',
      name: t.chapter2Name || 'Tozeur',
      subtitle: t.chapter2Subtitle || 'Edge of the salt flats',
      coords: '33.92°N · 8.13°E',
      copy: t.chapter2Copy || 'A sand-coloured studio pressed against the lip of Chott el Djerid. Infinity cove, pro rigging, and a palmeraie courtyard where the light bends and the desert walks into frame.',
      image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1800&q=85&auto=format&fit=crop',
      fallback: '#3a2614',
      tags: ['Studio', 'Desert', 'Cove'],
      accent: '#C89040',
    },
    {
      id: 8,
      index: '03',
      city: 'Tataouine',
      region: t.chapter3Region || 'Deep south',
      name: t.chapter3Name || 'Tataouine',
      subtitle: t.chapter3Subtitle || 'Bauhaus on red dunes',
      coords: '32.93°N · 10.45°E',
      copy: t.chapter3Copy || 'A minimalist concrete cube rising from ochre dunes — ksar craft folded into Bauhaus precision. Private plunge pool and a landscape that has written itself into cinema history.',
      image: 'https://images.unsplash.com/photo-1509233725247-49e657c54213?w=1800&q=85&auto=format&fit=crop',
      fallback: '#2a1810',
      tags: ['Villa', 'Desert', 'Cinematic'],
      accent: '#E8683A',
    },
    {
      id: 2,
      index: '04',
      city: 'La Marsa',
      region: t.chapter4Region || 'Mediterranean',
      name: t.chapter4Name || 'La Marsa',
      subtitle: t.chapter4Subtitle || 'Travertine & tide',
      coords: '36.87°N · 10.32°E',
      copy: t.chapter4Copy || 'Polished travertine, infinity pool, uninterrupted horizon. A canvas rinsed daily by the North African sea — built for fashion, editorial, and the luxury of restraint.',
      image: 'https://images.unsplash.com/photo-1519452575417-564c1401ecc0?w=1800&q=85&auto=format&fit=crop',
      fallback: '#0e1a25',
      tags: ['Villa', 'Seafront', 'Pool'],
      accent: '#2AAFB8',
    },
  ]

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.5 })

  // One wheel tick = one chapter advance
  useEffect(() => {
    const handleWheel = (e) => {
      const section = sectionRef.current
      if (!section) return

      const rect = section.getBoundingClientRect()
      const vh = window.innerHeight

      // Only intercept while section is pinned (fills the viewport)
      if (rect.top > 0 || rect.bottom < vh) return

      const sectionTop = section.offsetTop
      const current = Math.round((window.scrollY - sectionTop) / vh)
      const clamped = Math.max(0, Math.min(chapters.length - 1, current))
      const dir = e.deltaY > 0 ? 1 : -1

      // Let default scroll handle exit at section boundaries
      if (dir < 0 && clamped === 0) return
      if (dir > 0 && clamped === chapters.length - 1) return

      e.preventDefault()
      if (isAnimating.current) return

      isAnimating.current = true
      window.scrollTo({ top: sectionTop + (clamped + dir) * vh, behavior: 'smooth' })
      setTimeout(() => { isAnimating.current = false }, 900)
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative bg-bg noise"
      style={{ height: `${chapters.length * 100}vh` }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Persistent header */}
        <div className="absolute top-0 left-0 right-0 pt-24 md:pt-28 pb-4 z-10 pointer-events-none">
          <div className="container-main flex items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <span className="w-6 h-px bg-gold" />
              <span className="eyebrow">{t.fieldNotesTitle}</span>
            </div>
            <div className="hidden md:flex items-center gap-4 eyebrow-sm text-on-surface-variant font-mono">
              <ActiveIndex progress={progress} total={chapters.length} />
              <span className="w-8 h-px bg-outline-variant/40" />
              <span>{t.fourChapters}</span>
            </div>
          </div>
        </div>

        {/* Panes */}
        <div className="relative w-full h-full pt-24 md:pt-28">
          {chapters.map((c, i) => (
            <Pane
              key={c.id}
              chapter={c}
              i={i}
              total={chapters.length}
              progress={progress}
              accent={c.accent}
              enterSpaceText={t.enterSpace}
            />
          ))}
        </div>

        {/* Progress rail */}
        <ProgressRail progress={progress} total={chapters.length} />

        {/* Bottom meta bar */}
        <div className="absolute bottom-0 left-0 right-0 pb-6 md:pb-8 pointer-events-none">
          <div className="container-main flex items-center justify-between">
            <span className="eyebrow-sm text-on-surface-variant hidden sm:inline">
              {t.scrollAdvance}
            </span>
            <Link
              to="/explore"
              className="pointer-events-auto inline-flex items-center gap-3 text-on-surface hover:text-gold text-[10px] tracking-[0.35em] uppercase font-medium transition-colors"
            >
              {t.browseLibrary}
              <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
