import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, MapPin } from 'lucide-react'
import { useTranslation } from '../context/LanguageContext'

const ease = [0.22, 1, 0.36, 1]

const stats = [
  ['1K+', 'Curated spaces'],
  ['24', 'Governorates'],
  ['12K+', 'Productions'],
  ['4.9', 'Avg. rating'],
]

const marqueeItems = [
  'Sidi Bou Said', 'La Marsa', 'Tozeur', 'Tataouine',
  'Hammamet', 'Djerba', 'Sousse', 'Kairouan', 'Bizerte', 'Mahdia',
]

function Marquee() {
  const doubled = [...marqueeItems, ...marqueeItems]
  return (
    <>
      <style>{`
        @keyframes marquee-slide {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }
        .hero-marquee-inner {
          display: inline-flex;
          animation: marquee-slide 40s linear infinite;
          will-change: transform;
          white-space: nowrap;
        }
        .hero-marquee-inner:hover { animation-play-state: paused; }
      `}</style>
      <div className="overflow-hidden border-t border-b border-outline-variant/20 py-3 my-7 md:my-9 pointer-events-none">
        <div className="hero-marquee-inner flex whitespace-nowrap">
          {doubled.map((name, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-3 px-5 text-[9px] tracking-[0.3em] uppercase text-on-surface-variant font-mono"
            >
              {name}
              <span className="text-gold/40 text-[8px] leading-none">✦</span>
            </span>
          ))}
        </div>
      </div>
    </>
  )
}

export default function Hero() {
  const t = useTranslation('hero')
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.02, 1.1])
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '-8%'])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0])

  return (
    <section
      ref={ref}
      className="relative min-h-[680px] md:min-h-[820px] lg:h-screen w-full overflow-hidden bg-bg noise"
    >
      {/* Full-bleed image */}
      <motion.div
        className="absolute inset-0"
        style={{ y: imageY, scale: imageScale }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1548263594-a71ea65a8598?w=2400&q=90&auto=format&fit=crop)',
            backgroundColor: '#102035',
            filter: 'grayscale(100%) brightness(0.48) contrast(1.08)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(10,10,10,0.6) 0%, rgba(10,10,10,0.25) 40%, rgba(10,10,10,0.88) 100%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 55% 45% at 18% 28%, rgba(200,169,106,0.07) 0%, transparent 70%)',
          }}
        />
      </motion.div>

      {/* Technical grid overlay */}
      <div className="absolute inset-0 opacity-[0.10] tech-grid pointer-events-none" />

      {/* Horizontal framing rules */}
      <div className="absolute top-24 left-0 right-0 h-px bg-outline-variant/25 pointer-events-none" />
      <div className="absolute bottom-24 left-0 right-0 h-px bg-outline-variant/25 pointer-events-none" />

      {/* Content */}
      <motion.div
        className="relative z-10 min-h-[680px] md:min-h-[820px] lg:h-full flex flex-col justify-end pb-12 md:pb-20 pt-32 md:pt-40 container-main"
        style={{ y: contentY, opacity: contentOpacity }}
      >
        {/* Top row — eyebrow + coordinates */}
        <div className="absolute top-20 md:top-28 left-6 right-6 md:left-12 md:right-12 xl:left-16 xl:right-16 flex items-center justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease }}
            className="flex items-center gap-3"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse-slow" />
            <span className="eyebrow">{t.tagline}</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.1 }}
            className="hidden md:flex items-center gap-3 eyebrow-sm text-on-surface-variant"
          >
            <MapPin className="w-3 h-3 text-gold" strokeWidth={1.5} />
            36.87°N · 10.34°E
          </motion.div>
        </div>

        {/* Headline */}
        <div className="relative">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, ease }}
            className="font-display font-light leading-[0.9] tracking-display text-on-surface uppercase"
            style={{ fontSize: 'clamp(2rem, 4.8vw, 5.8rem)' }}
          >
            <motion.span
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1.1, ease, delay: 0.1 }}
              className="block overflow-hidden"
            >
              <span className="block">{t.headline1}</span>
            </motion.span>
            <motion.span
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1.1, ease, delay: 0.25 }}
              className="block overflow-hidden"
            >
              <span className="block stroke-text italic font-extralight">{t.headline2}</span>
            </motion.span>
            <motion.span
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1.1, ease, delay: 0.4 }}
              className="block overflow-hidden"
            >
              <span className="block text-gold-gradient">{t.headline3}</span>
            </motion.span>
          </motion.h1>

          {/* Marquee strip — below headline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
          >
            <Marquee />
          </motion.div>
        </div>

        {/* Lower row — paragraph + CTAs */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 items-end">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.7 }}
            className="md:col-span-5 text-on-surface-variant text-sm md:text-base leading-relaxed max-w-sm font-light"
          >
            {t.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.85 }}
            className="md:col-span-4 md:col-start-9 flex flex-col sm:flex-row gap-3 md:justify-end"
          >
            <Link to="/explore" className="btn-primary group">
              {t.exploreButton}
              <ArrowUpRight
                className="w-3.5 h-3.5 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                strokeWidth={1.8}
              />
            </Link>
            <Link to="/list-space" className="btn-ghost">
              List your space
            </Link>
          </motion.div>
        </div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, ease, delay: 1 }}
          className="mt-8 md:mt-10 pt-5 md:pt-6 border-t border-outline-variant/30 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
        >
          {stats.map(([val, label], i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease, delay: 1.1 + i * 0.08 }}
              className="flex flex-col gap-1"
            >
              <span className="font-display text-2xl md:text-3xl text-on-surface font-light tabular-nums">
                {val}
              </span>
              <span className="eyebrow-sm text-on-surface-variant">{label}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        className="absolute bottom-6 right-6 md:right-12 xl:right-16 z-20 flex items-center gap-3"
      >
        <span className="eyebrow-sm text-on-surface-variant">Scroll</span>
        <div className="w-12 h-px overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-gold/60 to-transparent animate-pulse" />
        </div>
      </motion.div>
    </section>
  )
}
