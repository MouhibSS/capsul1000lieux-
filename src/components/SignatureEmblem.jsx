import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ArrowUpRight, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { geoMercator, geoPath } from 'd3-geo'
import { feature } from 'topojson-client'
import { supabase } from '../lib/supabase'
import { useTranslation } from '../context/LanguageContext'

/**
 * Centerpiece — pixel-exact Tunisia map.
 * Outline is fetched at runtime from Natural Earth (public domain) via the
 * world-atlas CDN, projected client-side with d3-geo so it fits the viewBox.
 * A small selection of real published listings is overlaid as pins, each
 * linking to its detail page.
 */

const TOPO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-10m.json'
const VB_W = 200
const VB_H = 320

export default function SignatureEmblem() {
  const t = useTranslation('home')
  const containerRef = useRef(null)

  const mx = useMotionValue(0)
  const my = useMotionValue(0)

  const springCfg = { stiffness: 80, damping: 20, mass: 0.8 }
  const rotX = useSpring(useTransform(my, [-1, 1], [12, -12]), springCfg)
  const rotY = useSpring(useTransform(mx, [-1, 1], [-18, 18]), springCfg)

  const [gyroPermState, setGyroPermState] = useState('idle')
  const [countryPath, setCountryPath] = useState(null)
  const [projectFn, setProjectFn] = useState(null) // function: [lng,lat] -> [x,y]
  const [locations, setLocations] = useState([])
  const [activePin, setActivePin] = useState(null)
  const [showHint, setShowHint] = useState(true)
  const [isCoarsePtr, setIsCoarsePtr] = useState(false)

  // Fetch and project Tunisia outline + sample locations
  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const [topo, locResp] = await Promise.all([
          fetch(TOPO_URL).then((r) => r.json()),
          supabase
            .from('locations')
            .select('id, name, city, latitude, longitude, type, image_urls')
            .eq('published', true)
            .not('latitude', 'is', null)
            .not('longitude', 'is', null)
            .limit(8),
        ])
        if (cancelled) return

        const fc = feature(topo, topo.objects.countries)
        const tn = fc.features.find(
          (f) => f.properties?.name === 'Tunisia' || f.id === '788'
        )
        if (!tn) return

        const projection = geoMercator().fitSize([VB_W, VB_H], tn)
        const pathGen = geoPath(projection)
        setCountryPath(pathGen(tn))
        setProjectFn(() => (lngLat) => projection(lngLat))

        const rows = locResp?.data || []
        setLocations(rows)
      } catch (err) {
        // Silent: leave countryPath null; loading shimmer stays
        console.warn('Tunisia outline fetch failed:', err)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  // Tilt / gyro / idle-breathing
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const isCoarse = window.matchMedia('(pointer: coarse)').matches
    setIsCoarsePtr(isCoarse)
    let lastMouseTs = 0

    const onMove = (e) => {
      const rect = el.getBoundingClientRect()
      const px = (e.clientX - rect.left) / rect.width
      const py = (e.clientY - rect.top) / rect.height
      mx.set(px * 2 - 1)
      my.set(py * 2 - 1)
      lastMouseTs = performance.now()
    }

    const onTouch = (e) => {
      if (!e.touches || !e.touches[0]) return
      const t0 = e.touches[0]
      const rect = el.getBoundingClientRect()
      const px = (t0.clientX - rect.left) / rect.width
      const py = (t0.clientY - rect.top) / rect.height
      mx.set(Math.max(-1, Math.min(1, px * 2 - 1)))
      my.set(Math.max(-1, Math.min(1, py * 2 - 1)))
      lastMouseTs = performance.now()
      setShowHint(false)
    }

    if (!isCoarse) el.addEventListener('mousemove', onMove)
    if (isCoarse) {
      el.addEventListener('touchmove', onTouch, { passive: true })
      el.addEventListener('touchstart', onTouch, { passive: true })
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
      el.removeEventListener('touchmove', onTouch)
      el.removeEventListener('touchstart', onTouch)
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-center gap-3 mb-6 md:mb-8"
        >
          <span className="w-10 md:w-16 h-px bg-gradient-to-r from-transparent to-gold" />
          <span className="text-[10px] md:text-xs font-medium tracking-[0.4em] uppercase text-gold">
            {t.signatureEyebrow}
          </span>
          <span className="w-10 md:w-16 h-px bg-gradient-to-l from-transparent to-gold" />
        </motion.div>

        <div
          ref={containerRef}
          className="relative mx-auto flex items-center justify-center w-full"
          style={{
            perspective: '1400px',
            perspectiveOrigin: 'center',
            height: 'clamp(420px, 70vmin, 720px)',
          }}
        >
          <SideMark align="left" label={t.signatureNorth} numeral="36°N" />
          <SideMark align="right" label={t.signatureSouth} numeral="33°N" />

          <motion.div
            style={{ rotateX: rotX, rotateY: rotY, transformStyle: 'preserve-3d' }}
            className="relative w-[260px] h-[400px] xs:w-[290px] xs:h-[440px] sm:w-[340px] sm:h-[520px] md:w-[380px] md:h-[580px] lg:w-[420px] lg:h-[640px]"
          >
            <TunisiaMap
              countryPath={countryPath}
              projectFn={projectFn}
              locations={locations}
              activePin={activePin}
              setActivePin={setActivePin}
              isCoarsePtr={isCoarsePtr}
            />
          </motion.div>

          {/* Mobile interactive hint */}
          {isCoarsePtr && showHint && countryPath && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 text-[9px] tracking-[0.3em] uppercase text-gold/80 border border-gold/30 bg-bg/70 backdrop-blur-md rounded-full pointer-events-none z-20 whitespace-nowrap"
            >
              Drag · Tilt · Tap pins
            </motion.div>
          )}

          {gyroPermState === 'asking' && (
            <button
              onClick={requestGyroPermission}
              className="absolute bottom-2 left-1/2 -translate-x-1/2 px-4 py-2 text-[10px] tracking-[0.3em] uppercase bg-gold/10 border border-gold/40 text-gold rounded-full backdrop-blur-md hover:bg-gold/20 transition-colors z-20"
            >
              {t.signatureEnableTilt}
            </button>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl mx-auto text-center mt-12 md:mt-16 px-4"
        >
          <h2 className="font-display font-light text-3xl sm:text-4xl md:text-5xl text-on-surface uppercase tracking-display leading-[0.95] mb-5">
            {t.signatureHeading1} <br className="md:hidden" /><span className="stroke-text italic font-extralight">{t.signatureHeading2}</span>
          </h2>
          <p className="text-on-surface-variant text-sm md:text-base leading-relaxed max-w-lg mx-auto mb-8 md:mb-10">
            {t.signatureCopy}
          </p>
          <Link
            to="/explore"
            className="inline-flex items-center gap-3 px-6 sm:px-8 py-3 sm:py-4 border border-gold/40 hover:border-gold hover:bg-gold/10 text-on-surface hover:text-gold font-semibold text-[10px] uppercase tracking-[0.3em] transition-all group"
          >
            <span>{t.signatureCTA}</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform duration-500" strokeWidth={1.8} />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

/* ───────────── side index plates ───────────── */
function SideMark({ align = 'left', label, numeral }) {
  const isLeft = align === 'left'
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className={`hidden md:flex absolute top-1/2 -translate-y-1/2 flex-col items-center gap-5 pointer-events-none ${
        isLeft ? 'left-[4%] lg:left-[8%]' : 'right-[4%] lg:right-[8%]'
      }`}
      aria-hidden
    >
      <div className="font-mono text-[10px] tracking-[0.4em] text-gold/70">{numeral}</div>
      <div className="w-px h-20 lg:h-28 bg-gradient-to-b from-transparent via-gold/50 to-transparent" />
      <svg viewBox="0 0 20 20" className="w-3 h-3 lg:w-4 lg:h-4">
        <polygon points="10,1 19,10 10,19 1,10" fill="none" stroke="rgb(200 169 106 / 0.9)" strokeWidth="0.8" />
        <circle cx="10" cy="10" r="1.4" fill="rgb(200 169 106)" />
      </svg>
      <div className="w-px h-20 lg:h-28 bg-gradient-to-b from-transparent via-gold/50 to-transparent" />
      <div className="font-mono text-[9px] tracking-[0.45em] uppercase text-on-surface-variant/50 whitespace-nowrap" style={{ writingMode: 'vertical-rl', transform: isLeft ? 'rotate(180deg)' : 'none' }}>
        {label}
      </div>
    </motion.div>
  )
}

/* ───────────── 3D Tunisia map with location pins ───────────── */
function TunisiaMap({ countryPath, projectFn, locations, activePin, setActivePin, isCoarsePtr }) {
  return (
    <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
      {/* Ground glow halo */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: 'translateZ(-60px)',
          background: 'radial-gradient(ellipse 70% 55% at 50% 55%, rgba(200,169,106,0.22) 0%, transparent 70%)',
          filter: 'blur(30px)',
        }}
      />

      {/* Compass rose */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 240, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-[-6%] rounded-full pointer-events-none"
        style={{ transform: 'translateZ(-30px)', border: '1px dashed rgba(200,169,106,0.18)' }}
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 360, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-[2%] rounded-full pointer-events-none"
        style={{ transform: 'translateZ(-10px)', border: '1px solid rgba(200,169,106,0.10)' }}
      />

      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="tnGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F2D593" />
            <stop offset="50%" stopColor="#C8A96A" />
            <stop offset="100%" stopColor="#5a4a28" />
          </linearGradient>
          <linearGradient id="tnPlate" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1a1206" />
            <stop offset="100%" stopColor="#0a0a0a" />
          </linearGradient>
          <pattern id="tnGrid" width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M 8 0 L 0 0 0 8" fill="none" stroke="rgba(200,169,106,0.10)" strokeWidth="0.4" />
          </pattern>
          <filter id="tnGlow">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {countryPath ? (
          <>
            {/* Deep shadow plate */}
            <g style={{ transform: 'translateZ(-25px)' }}>
              <path d={countryPath} fill="#000" opacity="0.55" transform="translate(6 8)" />
            </g>

            {/* Country body */}
            <g>
              <path d={countryPath} fill="url(#tnPlate)" stroke="url(#tnGold)" strokeWidth="0.8" filter="url(#tnGlow)" />
              <path d={countryPath} fill="url(#tnGrid)" opacity="0.9" />
            </g>

            {/* Inner outline */}
            <g style={{ transform: 'translateZ(8px)' }}>
              <path d={countryPath} fill="none" stroke="rgba(200,169,106,0.35)" strokeWidth="0.4" />
            </g>
          </>
        ) : (
          <g>
            <text
              x={VB_W / 2}
              y={VB_H / 2}
              textAnchor="middle"
              fill="rgba(200,169,106,0.4)"
              fontSize="8"
              fontFamily="monospace"
              letterSpacing="3"
            >
              LOADING MAP
            </text>
          </g>
        )}

        {/* Location dots on the country */}
        {projectFn &&
          locations.map((loc) => {
            const p = projectFn([loc.longitude, loc.latitude])
            if (!p) return null
            return (
              <g key={`d-${loc.id}`}>
                <circle cx={p[0]} cy={p[1]} r="2" fill="#0a0a0a" stroke="url(#tnGold)" strokeWidth="0.6" />
                <circle cx={p[0]} cy={p[1]} r="0.7" fill="#E8C98A" />
              </g>
            )
          })}

        {/* North star */}
        <g transform={`translate(${VB_W - 30} 14)`}>
          <polygon points="0,-7 1.5,-1.5 7,0 1.5,1.5 0,7 -1.5,1.5 -7,0 -1.5,-1.5" fill="url(#tnGold)" opacity="0.85" />
        </g>
      </svg>

      {/* Location pin chips — HTML overlays */}
      {projectFn &&
        locations.map((loc, i) => {
          const p = projectFn([loc.longitude, loc.latitude])
          if (!p) return null
          return (
            <LocationPin
              key={loc.id}
              loc={loc}
              x={p[0]}
              y={p[1]}
              delay={i * 0.06}
              isActive={activePin === loc.id}
              onActivate={() => setActivePin?.(loc.id)}
              onDismiss={() => setActivePin?.(null)}
              isCoarsePtr={isCoarsePtr}
            />
          )
        })}
    </div>
  )
}

function LocationPin({ loc, x, y, delay, isActive, onActivate, onDismiss, isCoarsePtr }) {
  const left = `${(x / VB_W) * 100}%`
  const top = `${(y / VB_H) * 100}%`
  const z = 50 + ((loc.id || 0) % 5) * 10

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.85 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: 0.4 + delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="absolute"
      style={{ left, top, transform: `translate(-50%, -100%) translateZ(${z}px)`, transformStyle: 'preserve-3d' }}
    >
      <Link
        to={`/location/${loc.id}`}
        onClick={(e) => {
          if (isCoarsePtr && !isActive) {
            e.preventDefault()
            onActivate?.()
          }
        }}
        className="group relative flex flex-col items-center pointer-events-auto"
        style={{ touchAction: 'manipulation' }}
      >
        {/* Tap target halo (mobile) */}
        <span className="absolute -inset-3 sm:-inset-2" />

        {isActive ? (
          <span
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold text-bg shadow-[0_10px_40px_rgba(200,169,106,0.5)] whitespace-nowrap z-10"
          >
            <MapPin className="w-3 h-3 shrink-0" strokeWidth={2} />
            <span className="text-[9px] font-semibold tracking-[0.18em] uppercase">{loc.name}</span>
            <span className="text-[8px] font-mono opacity-70">→</span>
          </span>
        ) : (
          <motion.div
            animate={{ y: [0, -3, 0], scale: 1 }}
            whileHover={{ scale: 1.08 }}
            transition={{ y: { duration: 3 + (z % 4) * 0.3, repeat: Infinity, ease: 'easeInOut', delay: delay * 2 } }}
            className="flex items-center gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full bg-bg/85 backdrop-blur-md border border-gold/40 shadow-[0_8px_30px_rgba(0,0,0,0.6)] group-hover:border-gold group-hover:bg-gold/15 transition-colors whitespace-nowrap"
          >
            <MapPin className="w-3 h-3 text-gold shrink-0" strokeWidth={1.8} />
            <span className="text-[8px] sm:text-[9px] font-medium tracking-[0.18em] uppercase text-on-surface group-hover:text-gold transition-colors">
              {loc.name}
            </span>
          </motion.div>
        )}
        <span className="block w-px h-3 sm:h-4 bg-gradient-to-b from-gold/80 to-gold/0" />
        <motion.span
          animate={isActive ? { scale: [1, 1.6, 1] } : { scale: 1 }}
          transition={{ duration: 1.4, repeat: isActive ? Infinity : 0, ease: 'easeInOut' }}
          className="block w-1.5 h-1.5 rounded-full bg-gold shadow-[0_0_8px_rgba(200,169,106,0.9)]"
        />
        <span className={`absolute -bottom-4 left-1/2 -translate-x-1/2 text-[7px] sm:text-[8px] font-mono tracking-[0.25em] uppercase text-on-surface-variant/70 transition-opacity whitespace-nowrap ${isActive ? 'opacity-100 text-gold' : 'opacity-0 group-hover:opacity-100'}`}>
          {loc.city}
        </span>
      </Link>
    </motion.div>
  )
}
