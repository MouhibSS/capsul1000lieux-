import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { Sparkles } from 'lucide-react'
import { useTranslation } from '../context/LanguageContext'
import TunisianTime from './TunisianTime'

const ease = [0.22, 1, 0.36, 1]

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
  const colorShift = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <section
      ref={ref}
      className="relative min-h-[540px] md:min-h-[640px] w-full overflow-hidden bg-bg noise"
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
            filter: 'grayscale(55%) brightness(0.55) contrast(1.05)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(10,10,10,0.5) 0%, rgba(10,10,10,0.2) 40%, rgba(10,10,10,0.85) 100%)',
          }}
        />
        {/* Subtle animated gradient light rays with side-to-side movement */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'linear-gradient(110deg, rgba(200,150,120,0) 0%, rgba(180,130,100,0.04) 35%, rgba(160,110,90,0.02) 100%)',
              'linear-gradient(110deg, rgba(200,150,120,0.02) 0%, rgba(180,130,100,0.05) 40%, rgba(160,110,90,0.03) 100%)',
              'linear-gradient(110deg, rgba(200,150,120,0) 0%, rgba(180,130,100,0.04) 35%, rgba(160,110,90,0.02) 100%)',
            ],
            x: [0, 30, -30, 0],
          }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Subtle warm accent glow with gentle drifting */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            background: [
              'radial-gradient(ellipse 60% 50% at 18% 28%, rgba(200,169,106,0.03) 0%, transparent 60%)',
              'radial-gradient(ellipse 60% 50% at 26% 36%, rgba(200,140,100,0.05) 0%, transparent 60%)',
              'radial-gradient(ellipse 60% 50% at 18% 28%, rgba(200,169,106,0.03) 0%, transparent 60%)',
            ],
            y: [-20, 20, -20],
          }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Very subtle warm edge fade */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(220,130,90,0.02) 0%, transparent 45%, transparent 55%, rgba(200,90,80,0.01) 100%)',
          }}
        />
      </motion.div>

      {/* Technical grid overlay */}
      <div className="absolute inset-0 opacity-[0.10] tech-grid pointer-events-none" />

      {/* Subtle floating accent orbs - visible on all devices */}
      <motion.div
        className="absolute top-1/4 right-1/3 w-72 h-72 rounded-full pointer-events-none"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.03, 0.05, 0.03],
          y: [0, -20, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          background: 'radial-gradient(circle, rgba(200,130,100,0.08) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Secondary subtle floating accent */}
      <motion.div
        className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.02, 0.04, 0.02],
          y: [0, 30, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        style={{
          background: 'radial-gradient(circle, rgba(180,130,100,0.06) 0%, transparent 70%)',
          filter: 'blur(70px)',
        }}
      />

      {/* Horizontal framing rules */}
      <div className="absolute top-24 left-0 right-0 h-px bg-outline-variant/25 pointer-events-none" />
      <div className="absolute bottom-24 left-0 right-0 h-px bg-outline-variant/25 pointer-events-none" />

      {/* Content */}
      <motion.div
        className="relative z-10 min-h-[540px] md:min-h-[640px] flex flex-col justify-center pb-0 pt-24 md:pt-32 container-main"
        style={{ y: contentY, opacity: contentOpacity }}
      >
        {/* Top row — eyebrow + status badge */}
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

          {/* Mobile: compact pill */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.1 }}
            className="md:hidden flex items-center gap-2 px-2.5 py-1 border border-gold/30 bg-gold/5 backdrop-blur-sm rounded-full"
          >
            <span className="w-1 h-1 rounded-full bg-gold animate-pulse" />
            <span className="text-[8px] tracking-[0.15em] uppercase text-gold font-medium">1K+ spaces</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.1 }}
            className="hidden md:flex flex-col items-end gap-2"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 border border-gold/30 bg-gold/5 backdrop-blur-sm rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                <span className="eyebrow-sm text-gold">1,000+ spaces curated</span>
              </div>
              <div className="hidden lg:flex items-center gap-2 eyebrow-sm text-on-surface-variant">
                <Sparkles className="w-3 h-3 text-gold" strokeWidth={1.5} />
                Vetted by scouts
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease, delay: 0.3 }}
              className="px-3 py-1.5 border border-outline-variant/30 bg-bg/40 backdrop-blur-sm rounded-full"
            >
              <TunisianTime />
            </motion.div>
          </motion.div>
        </div>

        {/* Headline */}
        <div className="relative">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, ease }}
            className="font-display font-light leading-[0.9] tracking-display text-on-surface uppercase"
            style={{ fontSize: 'clamp(3.5rem, 9vw, 5.8rem)' }}
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
