import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

/**
 * Signature Emblem — refined edition.
 * Centerpiece is the only 3D element (always moving, interactive).
 * Side pieces are fine, minimal 2D linework — no tilt, no 3D, no clutter.
 */
export default function SignatureEmblem() {
  const containerRef = useRef(null)

  const mx = useMotionValue(0)
  const my = useMotionValue(0)

  const springCfg = { stiffness: 80, damping: 20, mass: 0.8 }
  const rotX = useSpring(useTransform(my, [-1, 1], [14, -14]), springCfg)
  const rotY = useSpring(useTransform(mx, [-1, 1], [-20, 20]), springCfg)

  const [gyroPermState, setGyroPermState] = useState('idle')

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const isCoarse = window.matchMedia('(pointer: coarse)').matches
    let lastMouseTs = 0

    const onMove = (e) => {
      const rect = el.getBoundingClientRect()
      const px = (e.clientX - rect.left) / rect.width
      const py = (e.clientY - rect.top) / rect.height
      mx.set(px * 2 - 1)
      my.set(py * 2 - 1)
      lastMouseTs = performance.now()
    }

    if (!isCoarse) {
      el.addEventListener('mousemove', onMove)
    }

    let gyroHandler = null
    const attachGyro = () => {
      gyroHandler = (e) => {
        const beta = e.beta || 0
        const gamma = e.gamma || 0
        mx.set(Math.max(-1, Math.min(1, gamma / 35)))
        my.set(Math.max(-1, Math.min(1, (beta - 30) / 40)))
        lastMouseTs = performance.now()
      }
      window.addEventListener('deviceorientation', gyroHandler)
    }

    if (isCoarse && typeof window.DeviceOrientationEvent !== 'undefined') {
      if (typeof window.DeviceOrientationEvent.requestPermission === 'function') {
        setGyroPermState('asking')
      } else {
        attachGyro()
        setGyroPermState('granted')
      }
    }

    // Always-on idle breathing — runs on every device, fades in whenever
    // the user hasn't interacted for a moment. Keeps the centerpiece alive.
    let rafId = 0
    let t = 0
    const loop = () => {
      t += 0.006
      const idleSince = performance.now() - lastMouseTs
      if (idleSince > 700) {
        const blend = Math.min(1, (idleSince - 700) / 600)
        const targetX = Math.sin(t) * 0.28
        const targetY = Math.cos(t * 0.72) * 0.2
        mx.set(mx.get() + (targetX - mx.get()) * 0.02 * blend)
        my.set(my.get() + (targetY - my.get()) * 0.02 * blend)
      }
      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)

    return () => {
      el.removeEventListener('mousemove', onMove)
      if (gyroHandler) window.removeEventListener('deviceorientation', gyroHandler)
      cancelAnimationFrame(rafId)
    }
  }, [mx, my, gyroPermState])

  const requestGyroPermission = async () => {
    try {
      const perm = await window.DeviceOrientationEvent.requestPermission()
      if (perm === 'granted') {
        setGyroPermState('granted')
        window.addEventListener('deviceorientation', (e) => {
          const beta = e.beta || 0
          const gamma = e.gamma || 0
          mx.set(Math.max(-1, Math.min(1, gamma / 35)))
          my.set(Math.max(-1, Math.min(1, (beta - 30) / 40)))
        })
      } else setGyroPermState('denied')
    } catch { setGyroPermState('denied') }
  }

  return (
    <section className="relative py-20 md:py-32 border-b border-outline-variant/25 overflow-hidden bg-gradient-to-b from-[#050505] via-bg to-[#070707]">
      {/* Starfield */}
      <div className="absolute inset-0 pointer-events-none opacity-50">
        {[...Array(36)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-px h-px bg-gold rounded-full"
            style={{ left: `${(i * 137) % 100}%`, top: `${(i * 79) % 100}%` }}
            animate={{ opacity: [0.08, 0.4, 0.08] }}
            transition={{ duration: 4 + (i % 5), repeat: Infinity, delay: i * 0.12, ease: 'easeInOut' }}
          />
        ))}
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(200,169,106,0.06)_0%,transparent_60%)] pointer-events-none" />

      <div className="container-main relative z-10">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-center gap-3 mb-6 md:mb-8"
        >
          <span className="w-10 md:w-16 h-px bg-gradient-to-r from-transparent to-gold" />
          <span className="text-[10px] md:text-xs font-medium tracking-[0.4em] uppercase text-gold">
            The signature
          </span>
          <span className="w-10 md:w-16 h-px bg-gradient-to-l from-transparent to-gold" />
        </motion.div>

        {/* Stage */}
        <div
          ref={containerRef}
          className="relative mx-auto flex items-center justify-center w-full"
          style={{
            perspective: '1400px',
            perspectiveOrigin: 'center',
            height: 'clamp(340px, 58vmin, 600px)',
          }}
        >
          {/* LEFT side — minimal index mark */}
          <SideMark align="left" />

          {/* RIGHT side — minimal index mark */}
          <SideMark align="right" />

          {/* CENTER — the only 3D piece */}
          <motion.div
            style={{
              rotateX: rotX,
              rotateY: rotY,
              transformStyle: 'preserve-3d',
            }}
            className="relative w-[260px] h-[260px] xs:w-[300px] xs:h-[300px] sm:w-[360px] sm:h-[360px] md:w-[400px] md:h-[400px] lg:w-[460px] lg:h-[460px] xl:w-[520px] xl:h-[520px]"
          >
            <CentralEmblem />
          </motion.div>

          {/* iOS gyro prompt */}
          {gyroPermState === 'asking' && (
            <button
              onClick={requestGyroPermission}
              className="absolute bottom-2 left-1/2 -translate-x-1/2 px-4 py-2 text-[10px] tracking-[0.3em] uppercase bg-gold/10 border border-gold/40 text-gold rounded-full backdrop-blur-md hover:bg-gold/20 transition-colors z-20"
            >
              Enable tilt
            </button>
          )}
        </div>

        {/* Copy */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl mx-auto text-center mt-12 md:mt-16 px-4"
        >
          <h2 className="font-display font-light text-3xl sm:text-4xl md:text-5xl text-on-surface uppercase tracking-display leading-[0.95] mb-5">
            A mosaic of <br className="md:hidden" /><span className="stroke-text italic font-extralight">possibilities</span>
          </h2>
          <p className="text-on-surface-variant text-sm md:text-base leading-relaxed max-w-lg mx-auto mb-8 md:mb-10">
            Every location is a tile in a larger picture — a country of stories, light, and texture.
          </p>
          <Link
            to="/explore"
            className="inline-flex items-center gap-3 px-6 sm:px-8 py-3 sm:py-4 border border-gold/40 hover:border-gold hover:bg-gold/10 text-on-surface hover:text-gold font-semibold text-[10px] uppercase tracking-[0.3em] transition-all group"
          >
            <span>Enter the atlas</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform duration-500" strokeWidth={1.8} />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

/* ═════════════════════════════════════════════════════════════
   Minimal side mark — a gallery-style index plate.
   Fixed, no 3D, no tilt. Pure line art, high ink economy.
   ═════════════════════════════════════════════════════════════ */
function SideMark({ align = 'left' }) {
  const isLeft = align === 'left'
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className={`hidden md:flex absolute top-1/2 -translate-y-1/2 flex-col items-center gap-5 pointer-events-none ${
        isLeft ? 'left-[6%] lg:left-[10%]' : 'right-[6%] lg:right-[10%]'
      }`}
      aria-hidden
    >
      {/* Top roman numeral / index */}
      <div className="font-mono text-[10px] tracking-[0.4em] text-gold/70">
        {isLeft ? 'I' : 'II'}
      </div>

      {/* Thin vertical line */}
      <div className="w-px h-20 lg:h-28 bg-gradient-to-b from-transparent via-gold/50 to-transparent" />

      {/* Minimal diamond accent */}
      <svg viewBox="0 0 20 20" className="w-3 h-3 lg:w-4 lg:h-4">
        <polygon
          points="10,1 19,10 10,19 1,10"
          fill="none"
          stroke="rgb(200 169 106 / 0.9)"
          strokeWidth="0.8"
        />
        <circle cx="10" cy="10" r="1.4" fill="rgb(200 169 106)" />
      </svg>

      {/* Thin vertical line */}
      <div className="w-px h-20 lg:h-28 bg-gradient-to-b from-transparent via-gold/50 to-transparent" />

      {/* Bottom label */}
      <div className="font-mono text-[9px] tracking-[0.45em] uppercase text-on-surface-variant/50 whitespace-nowrap" style={{ writingMode: isLeft ? 'vertical-rl' : 'vertical-rl', transform: isLeft ? 'rotate(180deg)' : 'none' }}>
        {isLeft ? 'Collection' : 'Curated'}
      </div>
    </motion.div>
  )
}

/* ═════════════════════════════════════════════════════════════
   Central emblem — the 3D interactive hero.
   Always rotating, always alive, expensive detail.
   ═════════════════════════════════════════════════════════════ */
function CentralEmblem() {
  return (
    <>
      {/* Outer dashed ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 rounded-full"
        style={{ transform: 'translateZ(60px)', border: '1px dashed rgba(200,169,106,0.35)' }}
      />

      {/* Middle ring with 24 tick marks */}
      <div className="absolute inset-[8%]" style={{ transformStyle: 'preserve-3d' }}>
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full"
          style={{ transform: 'translateZ(40px)' }}
        >
          {[...Array(24)].map((_, i) => (
            <div
              key={i}
              className="absolute top-0 left-1/2 w-px h-2 bg-gold/40 origin-bottom"
              style={{
                transform: `translateX(-50%) rotate(${(i * 360) / 24}deg) translateY(-50%)`,
                transformOrigin: '50% calc(100% + 48%)',
              }}
            />
          ))}
        </motion.div>
      </div>

      {/* Subtle third ring — slow opposite rotation, fine hair-line */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 200, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-[4%] rounded-full pointer-events-none"
        style={{
          transform: 'translateZ(20px)',
          border: '1px solid rgba(200,169,106,0.12)',
        }}
      />

      {/* 8-point star SVG */}
      <div className="absolute inset-[18%] flex items-center justify-center">
        <svg viewBox="0 0 200 200" className="w-full h-full" style={{ filter: 'drop-shadow(0 0 40px rgba(200,169,106,0.3))' }}>
          <defs>
            <linearGradient id="goldGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E8C98A" />
              <stop offset="45%" stopColor="#C8A96A" />
              <stop offset="100%" stopColor="#7a6840" />
            </linearGradient>
            <radialGradient id="goldRad1" cx="50%" cy="45%" r="60%">
              <stop offset="0%" stopColor="#F2D593" />
              <stop offset="50%" stopColor="#C8A96A" />
              <stop offset="100%" stopColor="#5a4a28" />
            </radialGradient>
            <filter id="glow1">
              <feGaussianBlur stdDeviation="2.5" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          <g transform="translate(100 100)">
            <polygon
              points="0,-90 20,-20 90,0 20,20 0,90 -20,20 -90,0 -20,-20"
              fill="url(#goldRad1)"
              stroke="url(#goldGrad1)"
              strokeWidth="1.5"
              filter="url(#glow1)"
            />
            <polygon
              points="0,-70 14,-14 70,0 14,14 0,70 -14,14 -70,0 -14,-14"
              fill="#0a0a0a"
              fillOpacity="0.35"
              stroke="rgba(200,169,106,0.55)"
              strokeWidth="1"
              transform="rotate(22.5)"
            />
            <g stroke="rgba(200,169,106,0.8)" strokeWidth="0.8" fill="none">
              <polygon points="0,-40 28,0 0,40 -28,0" />
              <polygon points="0,-28 18,0 0,28 -18,0" transform="rotate(45)" />
              <circle r="10" fill="url(#goldGrad1)" />
              <circle r="3" fill="#0a0a0a" />
            </g>
          </g>
        </svg>
      </div>

      {/* Cardinal dots */}
      {[0, 90, 180, 270].map((deg, i) => (
        <motion.div
          key={deg}
          animate={{ opacity: [0.3, 0.9, 0.3] }}
          transition={{ duration: 2 + i * 0.4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-1.5 h-1.5 rounded-full bg-gold top-1/2 left-1/2"
          style={{
            transform: `translate(-50%, -50%) rotate(${deg}deg) translateY(-48%) rotate(${-deg}deg)`,
            boxShadow: '0 0 12px rgba(200,169,106,0.9)',
          }}
        />
      ))}

      {/* Inner glow */}
      <div
        className="absolute inset-[38%] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(200,169,106,0.35) 0%, transparent 70%)',
          transform: 'translateZ(-20px)',
          filter: 'blur(20px)',
        }}
      />
    </>
  )
}
