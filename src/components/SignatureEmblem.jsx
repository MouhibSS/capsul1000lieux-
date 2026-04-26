import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ArrowUpRight, MapPin } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { geoMercator, geoPath } from 'd3-geo'
import { feature } from 'topojson-client'
import { useTranslation } from '../context/LanguageContext'

function useIsMobile() {
  const [v, setV] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)')
    const h = (e) => setV(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])
  return v
}

const TOPO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-10m.json'
const VB_W = 200
const VB_H = 320

// Hardcoded Tunisian cities with coords
const CITIES = [
  { name: 'Tunis',        lng: 10.1815, lat: 36.8065 },
  { name: 'Sidi Bou Said',lng: 10.3400, lat: 36.8700 },
  { name: 'La Marsa',     lng: 10.3230, lat: 36.8780 },
  { name: 'Hammamet',     lng: 10.6200, lat: 36.4000 },
  { name: 'Sousse',       lng: 10.6369, lat: 35.8256 },
  { name: 'Kairouan',     lng: 10.0978, lat: 35.6784 },
  { name: 'Sfax',         lng: 10.7600, lat: 34.7400 },
  { name: 'Tozeur',       lng:  8.1300, lat: 33.9200 },
  { name: 'Djerba',       lng: 10.8500, lat: 33.8700 },
  { name: 'Tataouine',    lng: 10.4500, lat: 32.9300 },
]

export default function SignatureEmblem() {
  const t = useTranslation('home')
  const containerRef = useRef(null)
  const isMobile = useIsMobile()

  const mx = useMotionValue(0)
  const my = useMotionValue(0)

  const springCfg = { stiffness: 40, damping: 22, mass: 1.2 }
  const rotX = useSpring(useTransform(my, [-1, 1], [6, -6]),    springCfg)
  const rotY = useSpring(useTransform(mx, [-1, 1], [-10, 10]),  springCfg)
  const rotZ = useSpring(useTransform(mx, [-1, 1], [-0.8, 0.8]),springCfg)
  const lift = useSpring(useTransform(my, [-1, 1], [3, -3]),    springCfg)

  const [countryPath, setCountryPath] = useState(null)
  const [projectFn,   setProjectFn]   = useState(null)
  const [activeCity,  setActiveCity]  = useState(null)

  // Fetch Tunisia outline only
  useEffect(() => {
    let cancelled = false
    fetch(TOPO_URL)
      .then(r => r.json())
      .then(topo => {
        if (cancelled) return
        const fc = feature(topo, topo.objects.countries)
        const tn = fc.features.find(f => f.properties?.name === 'Tunisia' || f.id === '788')
        if (!tn) return
        const projection = geoMercator().fitSize([VB_W, VB_H], tn)
        setCountryPath(geoPath(projection)(tn))
        setProjectFn(() => lngLat => projection(lngLat))
      })
      .catch(err => console.warn('Tunisia outline fetch failed:', err))
    return () => { cancelled = true }
  }, [])

  // Desktop: mouse tilt + gentle idle drift. Mobile: nothing.
  useEffect(() => {
    const el = containerRef.current
    if (!el || isMobile) return

    let lastTs = 0
    const onMove = (e) => {
      const r = el.getBoundingClientRect()
      mx.set((e.clientX - r.left) / r.width  * 2 - 1)
      my.set((e.clientY - r.top)  / r.height * 2 - 1)
      lastTs = performance.now()
    }
    el.addEventListener('mousemove', onMove)

    let raf = 0, tick = 0
    const loop = () => {
      tick += 0.007
      const idle = performance.now() - lastTs
      if (idle > 800) {
        const b = Math.min(1, (idle - 800) / 600)
        mx.set(mx.get() + (Math.sin(tick) * 0.18 - mx.get()) * 0.025 * b)
        my.set(my.get() + (Math.cos(tick * 0.7) * 0.12 - my.get()) * 0.025 * b)
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => { el.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf) }
  }, [mx, my, isMobile])

  // Project cities once projectFn is ready
  const projectedCities = projectFn
    ? CITIES.map(c => ({ ...c, p: projectFn([c.lng, c.lat]) })).filter(c => c.p)
    : []

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

        {/* Map stage — fixed height container */}
        <div
          ref={containerRef}
          className="relative mx-auto flex items-center justify-center w-full"
          style={{ height: 'clamp(420px, 70vmin, 720px)' }}
        >
          <SideMark align="left"  label={t.signatureNorth} numeral="36°N" />
          <SideMark align="right" label={t.signatureSouth} numeral="33°N" />

          {/* Map card — sized wrapper */}
          <div
            className="relative"
            style={{
              width:  isMobile ? 'clamp(260px, 70vw, 340px)' : 'clamp(300px, 28vw, 420px)',
              height: isMobile ? 'clamp(400px, 107vw, 520px)' : 'clamp(460px, 43vw, 640px)',
            }}
          >
            {/* ── Layer 1: 3D-tilting SVG map + orbs ── */}
            <motion.div
              className="absolute inset-0"
              style={isMobile
                ? { position: 'absolute', inset: 0 }
                : { rotateX: rotX, rotateY: rotY, rotateZ: rotZ, y: lift,
                    transformStyle: 'preserve-3d', position: 'absolute', inset: 0 }
              }
            >
              <MapSVGLayer countryPath={countryPath} projectedCities={projectedCities} />
            </motion.div>

            {/* ── Layer 2: flat pin overlay — always 2D, always clickable ── */}
            <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
              {projectedCities.map((city, i) => (
                <CityPin
                  key={city.name}
                  city={city}
                  index={i}
                  isActive={activeCity === city.name}
                  onActivate={() => setActiveCity(city.name)}
                  onClose={() => setActiveCity(null)}
                />
              ))}
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl mx-auto text-center mt-12 md:mt-16 px-4"
        >
          <h2 className="font-display font-light text-3xl sm:text-4xl md:text-5xl text-on-surface uppercase tracking-display leading-[0.95] mb-5">
            {t.signatureHeading1}{' '}
            <br className="md:hidden" />
            <span className="stroke-text italic font-extralight">{t.signatureHeading2}</span>
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

/* ── Side index plates ── */
function SideMark({ align, label, numeral }) {
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
      <div
        className="font-mono text-[9px] tracking-[0.45em] uppercase text-on-surface-variant/50 whitespace-nowrap"
        style={{ writingMode: 'vertical-rl', transform: isLeft ? 'rotate(180deg)' : 'none' }}
      >
        {label}
      </div>
    </motion.div>
  )
}

/* ── SVG map + animated orbs (tilts in 3D on desktop) ── */
function MapSVGLayer({ countryPath, projectedCities }) {
  return (
    <div className="absolute inset-0">
      {/* Ground glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 55% at 50% 55%, rgba(200,169,106,0.22) 0%, transparent 70%)',
          filter: 'blur(30px)',
        }}
      />

      {/* Rotating orbs */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-[-6%] rounded-full pointer-events-none"
        style={{ border: '1px dashed rgba(200,169,106,0.28)' }}
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-[2%] rounded-full pointer-events-none"
        style={{ border: '1px solid rgba(200,169,106,0.18)' }}
      />
      {/* Radar sweep */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-[-6%] rounded-full pointer-events-none"
        style={{
          background: 'conic-gradient(from 0deg, transparent 0deg, rgba(200,169,106,0.25) 30deg, transparent 60deg)',
          mixBlendMode: 'screen',
        }}
      />

      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="tnGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#F2D593" />
            <stop offset="50%"  stopColor="#C8A96A" />
            <stop offset="100%" stopColor="#5a4a28" />
          </linearGradient>
          <linearGradient id="tnPlate" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#1a1206" />
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
            <path d={countryPath} fill="#000" opacity="0.55" transform="translate(6 8)" />
            <path d={countryPath} fill="url(#tnPlate)" stroke="url(#tnGold)" strokeWidth="0.8" filter="url(#tnGlow)">
              <animate attributeName="stroke-width" values="0.6;1.4;0.6" dur="3.2s" repeatCount="indefinite" />
            </path>
            <path d={countryPath} fill="url(#tnGrid)" opacity="0.9" />
            <path d={countryPath} fill="none" stroke="rgba(232,201,138,0.6)" strokeWidth="0.3" strokeDasharray="2 6">
              <animate attributeName="stroke-dashoffset" values="0;-32" dur="5s" repeatCount="indefinite" />
            </path>
            <path d={countryPath} fill="none" stroke="rgba(200,169,106,0.35)" strokeWidth="0.4" />
          </>
        ) : (
          <text x={VB_W / 2} y={VB_H / 2} textAnchor="middle"
            fill="rgba(200,169,106,0.4)" fontSize="8" fontFamily="monospace" letterSpacing="3">
            LOADING MAP
          </text>
        )}

        {/* Radar pings at city positions (SVG only — decorative) */}
        {projectedCities.map((city, i) => (
          <g key={`ping-${city.name}`}>
            <circle cx={city.p[0]} cy={city.p[1]} r="2" fill="none" stroke="rgba(200,169,106,0.5)" strokeWidth="0.4">
              <animate attributeName="r" values="2;6;2" dur="2.4s" begin={`${i * 0.35}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.9;0;0.9" dur="2.4s" begin={`${i * 0.35}s`} repeatCount="indefinite" />
            </circle>
            <circle cx={city.p[0]} cy={city.p[1]} r="1.8" fill="#0a0a0a" stroke="url(#tnGold)" strokeWidth="0.6" />
            <circle cx={city.p[0]} cy={city.p[1]} r="0.8" fill="#E8C98A">
              <animate attributeName="opacity" values="0.5;1;0.5" dur="1.6s" begin={`${i * 0.2}s`} repeatCount="indefinite" />
            </circle>
          </g>
        ))}

        {/* North star */}
        <g transform={`translate(${VB_W - 30} 14)`}>
          <polygon points="0,-7 1.5,-1.5 7,0 1.5,1.5 0,7 -1.5,1.5 -7,0 -1.5,-1.5" fill="url(#tnGold)" opacity="0.85" />
        </g>
      </svg>
    </div>
  )
}

/* ── City pin — flat 2D layer, always clickable ── */
function CityPin({ city, index, isActive, onActivate, onClose }) {
  const navigate = useNavigate()
  const left = `${(city.p[0] / VB_W) * 100}%`
  const top  = `${(city.p[1] / VB_H) * 100}%`

  const handleClick = (e) => {
    e.stopPropagation()
    if (isActive) {
      navigate(`/explore?city=${encodeURIComponent(city.name)}`)
    } else {
      onActivate()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.85 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: 0.4 + index * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="absolute"
      style={{
        left,
        top,
        transform: 'translate(-50%, -100%)',
        pointerEvents: 'auto',
        zIndex: isActive ? 20 : 10,
      }}
    >
      <button
        onClick={handleClick}
        className="group flex flex-col items-center focus:outline-none"
        style={{ touchAction: 'manipulation' }}
        aria-label={`Explore ${city.name}`}
      >
        {isActive ? (
          <motion.span
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold text-bg shadow-[0_10px_40px_rgba(200,169,106,0.5)] whitespace-nowrap"
          >
            <MapPin className="w-3 h-3 shrink-0" strokeWidth={2} />
            <span className="text-[9px] font-semibold tracking-[0.18em] uppercase">{city.name}</span>
            <ArrowUpRight className="w-2.5 h-2.5" strokeWidth={2.5} />
          </motion.span>
        ) : (
          <motion.div
            animate={{ y: [0, -2.5, 0] }}
            transition={{ duration: 3 + (index % 4) * 0.4, repeat: Infinity, ease: 'easeInOut', delay: index * 0.3 }}
            whileHover={{ scale: 1.1 }}
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-bg/85 backdrop-blur-md border border-gold/40 shadow-[0_6px_24px_rgba(0,0,0,0.6)] hover:border-gold hover:bg-gold/15 transition-colors whitespace-nowrap"
          >
            <MapPin className="w-2.5 h-2.5 text-gold shrink-0" strokeWidth={1.8} />
            <span className="text-[8px] font-medium tracking-[0.15em] uppercase text-on-surface group-hover:text-gold transition-colors">
              {city.name}
            </span>
          </motion.div>
        )}
        <span className="block w-px h-3 bg-gradient-to-b from-gold/80 to-gold/0" />
        <motion.span
          animate={isActive ? { scale: [1, 1.6, 1] } : { scale: 1 }}
          transition={{ duration: 1.4, repeat: isActive ? Infinity : 0, ease: 'easeInOut' }}
          className="block w-1.5 h-1.5 rounded-full bg-gold shadow-[0_0_8px_rgba(200,169,106,0.9)]"
        />
      </button>
    </motion.div>
  )
}
