import { useRef, useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ArrowUpRight, X, Volume2, VolumeX } from 'lucide-react'

const ease = [0.22, 1, 0.36, 1]

const pageVariants = {
  initial: { opacity: 0 },
  enter:   { opacity: 1, transition: { duration: 0.7, ease } },
  exit:    { opacity: 0, transition: { duration: 0.35 } },
}

/* Single accent — house gold, applied to every project */
const ACCENT = '#C9A45A'

/* Video sources — Capsul CDN (same-org, no CORS/ORB issues) */
const projects = [
  {
    id: '01',
    code: '216-001',
    title: 'Remember',
    type: 'Music video',
    year: '2026',
    director: 'L. Hammami',
    partner: 'Asake',
    runtime: '03:42',
    location: 'Sidi Bou Said',
    description: "An afrobeats summer above the Gulf of Tunis. Shot in one golden afternoon with Asake's team.",
    video: 'https://capsul-tv.b-cdn.net/Shortened%20Videos/short%20videos/asake_-_remember%20(1080p)%20-%20Trim.mp4',
  },
  {
    id: '02',
    code: '216-002',
    title: 'SDM',
    type: 'Music video',
    year: '2026',
    director: 'A. Ben Saïd',
    partner: 'Cello',
    runtime: '03:18',
    location: 'Tataouine',
    description: 'A Bauhaus cube rising from ochre dunes. Cello drops a sustained chord across the desert horizon.',
    video: 'https://capsul-tv.b-cdn.net/Shortened%20Videos/short%20videos/cello_-_sdm%20(1080p)%20-%20Trim.mp4',
  },
  {
    id: '03',
    code: '216-003',
    title: 'Big Time',
    type: 'Music video',
    year: '2025',
    director: 'M. Trabelsi',
    partner: 'Frenna × Hamza',
    runtime: '03:54',
    location: 'La Marsa',
    description: 'Polished stone meeting the slow choreography of water — a two-day shoot for the Frenna × Hamza collab.',
    video: 'https://capsul-tv.b-cdn.net/Shortened%20Videos/short%20videos/frenna_x_hamza_-_big_time%20(1080p)%20-%20Trim.mp4',
  },
  {
    id: '04',
    code: '216-004',
    title: 'EOT',
    type: 'Music video',
    year: '2025',
    director: 'F. Karoui',
    partner: 'Madd',
    runtime: '02:48',
    location: 'Tozeur',
    description: "Silver thread on terracotta — the salt horizon at noon. Madd's editorial cut, shot in a single weekend.",
    video: 'https://capsul-tv.b-cdn.net/Shortened%20Videos/short%20videos/madd_-_eot%20(1080p)%20-%20Trim.mp4',
  },
  {
    id: '05',
    code: '216-005',
    title: 'Ma Play',
    type: 'Music video',
    year: '2026',
    director: 'S. Mejri',
    partner: 'Naza × Keblack',
    runtime: '03:12',
    location: 'Carthage',
    description: "Two thousand years of marble lit only by torchlight. Naza & Keblack's nocturnal walk through the ruins.",
    video: 'https://capsul-tv.b-cdn.net/Shortened%20Videos/short%20videos/naza_ft_keblack%2C_naps_-_ma_play%20(1080p)%20-%20Trim.mp4',
  },
  {
    id: '06',
    code: '216-006',
    title: 'Ra Ta Ta',
    type: 'Music video',
    year: '2026',
    director: 'I. Riahi',
    partner: 'Mahmood',
    runtime: '03:24',
    location: 'Hammamet',
    description: "A family kitchen, three generations, six rosé evenings. Mahmood's long-lens family portrait.",
    video: 'https://capsul-tv.b-cdn.net/Shortened%20Videos/short%20videos/mahmood_-_ra_ta_ta%20(1080p)%20-%20Trim.mp4',
  },
]

/* ──────────────────────────────────────────────────────────────────
   COLLAB MARK — large pill badge "216 000 × Partner"
   ────────────────────────────────────────────────────────────────── */
function CollabMark({ partner, size = 'md' }) {
  const sizes = {
    sm: 'px-2.5 py-1.5 text-[10px] tracking-[0.3em] gap-2',
    md: 'px-3.5 py-2 text-[11px] md:text-[12px] tracking-[0.32em] gap-2.5',
    lg: 'px-5 py-2.5 text-[12px] md:text-[14px] tracking-[0.35em] gap-3',
  }
  return (
    <span
      className={`inline-flex items-center font-mono uppercase backdrop-blur-md ${sizes[size]}`}
      style={{
        backgroundColor: 'rgba(8,8,8,0.55)',
        border: `1px solid ${ACCENT}38`,
      }}
    >
      <span className="text-on-surface/55 font-medium">216 000</span>
      <span className="text-on-surface/25 text-[0.85em]">×</span>
      <span className="font-semibold" style={{ color: ACCENT }}>
        {partner}
      </span>
    </span>
  )
}

/* ──────────────────────────────────────────────────────────────────
   INTRO OVERLAY — tagline reveal, auto-dismisses into the page
   ────────────────────────────────────────────────────────────────── */
function IntroOverlay({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease }}
      className="fixed inset-0 z-[60] bg-bg flex items-center justify-center px-6 overflow-hidden"
    >
      <div className="absolute inset-0 noise opacity-40 pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-25"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 4px)',
        }}
      />

      <div className="relative w-full max-w-3xl text-center md:text-left">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.15 }}
          className="flex items-center gap-3 mb-6 md:mb-8 justify-center md:justify-start font-mono text-[10px] md:text-[11px] tracking-[0.4em] uppercase"
          style={{ color: ACCENT }}
        >
          <span className="w-6 h-px" style={{ backgroundColor: ACCENT, opacity: 0.7 }} />
          216 000 — manifest
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease, delay: 0.3 }}
          className="font-display font-extralight uppercase tracking-display text-on-surface leading-[0.9]"
          style={{ fontSize: 'clamp(2.2rem, 7vw, 6rem)' }}
        >
          We make your work
          <br />
          <span className="stroke-text italic">digital.</span>{' '}
          <span className="italic" style={{ color: ACCENT, opacity: 0.9 }}>And eternal.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, ease, delay: 1.0 }}
          className="mt-6 md:mt-8 font-mono text-[10px] md:text-[11px] tracking-[0.4em] uppercase text-on-surface/45"
        >
          entering the matrix —
        </motion.p>
      </div>
    </motion.div>
  )
}

/* ──────────────────────────────────────────────────────────────────
   GRID TILE — hover/scroll to play, tap to mute, arrow to open
   ────────────────────────────────────────────────────────────────── */
function GridTile({ project, onOpen, onHover, hovered, anyHovered, index, isTouch }) {
  const videoRef = useRef(null)
  const tileRef = useRef(null)
  const isActive = hovered === project.id
  const [userMuted, setUserMuted] = useState(false)

  // Mouse-tracked tilt + spotlight (desktop only)
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const rx = useSpring(useTransform(my, [0, 1], [6, -6]), { stiffness: 220, damping: 22 })
  const ry = useSpring(useTransform(mx, [0, 1], [-8, 8]), { stiffness: 220, damping: 22 })
  const sx = useTransform(mx, (v) => `${v * 100}%`)
  const sy = useTransform(my, (v) => `${v * 100}%`)
  const spotlight = useTransform(
    [sx, sy],
    ([x, y]) => `radial-gradient(circle 300px at ${x} ${y}, ${ACCENT}18, transparent 72%)`
  )

  const handleMove = (e) => {
    if (isTouch) return
    const r = tileRef.current?.getBoundingClientRect()
    if (!r) return
    mx.set((e.clientX - r.left) / r.width)
    my.set((e.clientY - r.top) / r.height)
  }
  const handleLeave = () => {
    if (isTouch) return
    mx.set(0.5); my.set(0.5)
    onHover(null)
  }

  // Touch: IntersectionObserver picks the most visible tile to play
  useEffect(() => {
    if (!isTouch) return
    const el = tileRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0]
        if (e.isIntersecting && e.intersectionRatio >= 0.6) {
          onHover(project.id)
        }
      },
      { threshold: [0, 0.6, 1] }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [isTouch, project.id, onHover])

  // Drive playback
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (isActive) {
      v.muted = userMuted
      v.volume = 0.6
      const tryPlay = async () => {
        try {
          await v.play()
        } catch {
          v.muted = true
          setUserMuted(true)
          try { await v.play() } catch {}
        }
      }
      tryPlay()
    } else {
      v.pause()
      v.muted = true
      v.currentTime = 0
    }
  }, [isActive, userMuted])

  // Click on tile → toggle mute. Click on open arrow → open cinematic.
  const handleTileClick = () => {
    if (!isActive) {
      onHover(project.id)
      return
    }
    setUserMuted((m) => !m)
  }
  const handleOpenClick = (e) => {
    e.stopPropagation()
    onOpen(project)
  }

  const audible = isActive && !userMuted

  return (
    <motion.div
      ref={tileRef}
      onMouseEnter={() => !isTouch && onHover(project.id)}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={handleTileClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(project) } }}
      initial={{ opacity: 0, y: 24 }}
      animate={{
        opacity: anyHovered && !isActive ? 0.4 : 1,
        y: 0,
      }}
      transition={{ duration: 0.6, ease, delay: 0.05 * index }}
      style={{
        rotateX: !isTouch && isActive ? rx : 0,
        rotateY: !isTouch && isActive ? ry : 0,
        transformPerspective: 1200,
        transformStyle: 'preserve-3d',
      }}
      className="group relative overflow-hidden bg-black border border-on-surface/10 hover:border-gold/60 transition-colors duration-500 text-left will-change-transform cursor-pointer select-none"
    >
      <div className="aspect-[16/10] relative overflow-hidden">
        <video
          ref={videoRef}
          src={project.video}
          loop
          muted
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover transition-[filter] duration-700"
          style={{ filter: isActive ? 'brightness(0.92) contrast(0.98) saturate(0.85)' : 'grayscale(90%) contrast(0.95) brightness(0.65)' }}
        />

        {/* Cursor-tracked spotlight (desktop only) */}
        {!isTouch && (
          <motion.div
            className="absolute inset-0 pointer-events-none transition-opacity duration-500"
            style={{ opacity: isActive ? 1 : 0, background: spotlight }}
          />
        )}

        {/* Scanlines */}
        <div
          className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-25"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 4px)',
          }}
        />

        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.05) 55%, rgba(0,0,0,0.78) 100%)',
          }}
        />

        {/* Top — collab pill + runtime */}
        <div className="absolute top-3 left-3 right-3 md:top-3.5 md:left-3.5 md:right-3.5 flex items-start justify-between z-10 gap-2 md:gap-3">
          <CollabMark partner={project.partner} size="md" />
          <span className="shrink-0 font-mono text-[9px] md:text-[10px] tracking-[0.32em] md:tracking-[0.35em] uppercase text-on-surface/55 mt-1.5">
            {project.runtime}
          </span>
        </div>

        {/* Bottom — title + open arrow */}
        <div className="absolute bottom-3 left-3 right-3 md:bottom-4 md:left-4 md:right-4 z-10 flex items-end justify-between gap-2 md:gap-3">
          <div className="min-w-0">
            <div className="font-mono text-[9px] tracking-[0.32em] md:tracking-[0.35em] uppercase mb-1.5 md:mb-2 text-on-surface/60">
              {project.id} — {project.type}
            </div>
            <div
              className="font-display font-light uppercase tracking-display text-on-surface leading-[0.95] truncate"
              style={{ fontSize: 'clamp(1rem, 2.1vw, 1.85rem)' }}
            >
              {project.title}
            </div>
            <div className="mt-1.5 md:mt-2 font-mono text-[9px] tracking-[0.28em] md:tracking-[0.3em] uppercase text-on-surface/45 truncate">
              dir · {project.director}
            </div>
          </div>
          <motion.button
            type="button"
            onClick={handleOpenClick}
            aria-label={`Open ${project.title} fullscreen`}
            animate={{
              x: isActive || isTouch ? 0 : -8,
              opacity: isActive || isTouch ? 1 : 0,
              scale: isActive || isTouch ? 1 : 0.9,
            }}
            transition={{ duration: 0.4, ease }}
            className="shrink-0 w-9 h-9 md:w-10 md:h-10 border flex items-center justify-center bg-bg/40 backdrop-blur-sm hover:bg-bg/70 transition-colors"
            style={{ borderColor: ACCENT, color: ACCENT }}
          >
            <ArrowUpRight className="w-3.5 h-3.5 md:w-4 md:h-4" strokeWidth={1.8} />
          </motion.button>
        </div>

        {/* Center — audio status indicator */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.3 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 px-3 py-1.5 bg-bg/70 backdrop-blur-md border border-on-surface/20 font-mono text-[9px] tracking-[0.35em] uppercase text-on-surface/85 pointer-events-none"
            >
              {audible ? (
                <>
                  <Volume2 className="w-3 h-3" strokeWidth={1.8} style={{ color: ACCENT }} />
                  live audio · tap to mute
                </>
              ) : (
                <>
                  <VolumeX className="w-3 h-3" strokeWidth={1.8} />
                  muted · tap to unmute
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

/* ──────────────────────────────────────────────────────────────────
   CINEMATIC OVERLAY — full-bleed playback with sound
   ────────────────────────────────────────────────────────────────── */
function CinematicOverlay({ project, onClose, onPrev, onNext }) {
  const videoRef = useRef(null)
  const [muted, setMuted] = useState(false)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = false
    v.volume = 0.9
    const tryPlay = async () => {
      try {
        await v.play()
        setMuted(false)
      } catch {
        v.muted = true
        setMuted(true)
        try { await v.play() } catch {}
      }
    }
    tryPlay()
  }, [project.id])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') onNext()
      else if (e.key === 'ArrowLeft') onPrev()
      else if (e.key === 'm' || e.key === 'M') {
        const v = videoRef.current
        if (v) { v.muted = !v.muted; setMuted(v.muted) }
      }
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose, onNext, onPrev])

  const toggleMute = () => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease }}
      className="fixed inset-0 z-50 bg-black"
    >
      <motion.video
        key={project.id}
        ref={videoRef}
        src={project.video}
        loop
        playsInline
        initial={{ scale: 1.06, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.0, ease }}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'brightness(0.88) contrast(0.96) saturate(0.85)' }}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.35) 70%, rgba(0,0,0,0.92) 100%)',
        }}
      />

      {/* Top bar */}
      <div className="absolute top-4 md:top-6 left-4 md:left-8 right-4 md:right-8 flex items-start justify-between z-20 gap-4">
        <CollabMark partner={project.partner} size="lg" />
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            aria-label={muted ? 'Unmute' : 'Mute'}
            className="w-10 h-10 border border-on-surface/30 text-on-surface hover:border-gold hover:text-gold flex items-center justify-center transition-colors backdrop-blur"
          >
            {muted ? <VolumeX className="w-3.5 h-3.5" strokeWidth={1.5} /> : <Volume2 className="w-3.5 h-3.5" strokeWidth={1.5} />}
          </button>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-10 h-10 border border-on-surface/30 text-on-surface hover:border-gold hover:text-gold flex items-center justify-center transition-colors backdrop-blur"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <button
        onClick={onPrev}
        aria-label="Previous"
        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 border border-on-surface/30 text-on-surface hover:border-gold hover:text-gold items-center justify-center transition-colors z-20 rotate-180 backdrop-blur"
      >
        <ArrowUpRight className="w-4 h-4" strokeWidth={1.5} />
      </button>
      <button
        onClick={onNext}
        aria-label="Next"
        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 border border-on-surface/30 text-on-surface hover:border-gold hover:text-gold items-center justify-center transition-colors z-20 backdrop-blur"
      >
        <ArrowUpRight className="w-4 h-4" strokeWidth={1.5} />
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease, delay: 0.2 }}
        className="absolute left-4 md:left-10 right-4 md:right-10 bottom-6 md:bottom-10 z-20"
      >
        <div className="flex items-center gap-3 mb-3 md:mb-4">
          <span
            className="font-mono text-[10px] md:text-[11px] tracking-[0.4em] uppercase"
            style={{ color: ACCENT }}
          >
            {project.id}
          </span>
          <span className="w-6 h-px" style={{ backgroundColor: `${ACCENT}70` }} />
          <span className="font-mono text-[10px] tracking-[0.35em] uppercase text-on-surface/65">
            {project.type} · {project.year} · {project.runtime}
          </span>
        </div>
        <h2
          className="font-display font-light leading-[0.92] tracking-display uppercase text-on-surface max-w-3xl"
          style={{ fontSize: 'clamp(2rem, 6.5vw, 5.5rem)' }}
        >
          {project.title}
        </h2>
        <p className="mt-3 md:mt-4 text-on-surface/70 text-sm md:text-base font-light leading-relaxed max-w-xl">
          {project.description}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[10px] tracking-[0.3em] uppercase text-on-surface/55">
          <span>Dir. {project.director}</span>
          <span className="w-1 h-1 rounded-full bg-on-surface/30" />
          <span>{project.location}</span>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Link
            to="/contact?type=booking"
            className="inline-flex items-center gap-3 px-5 py-3 border border-gold text-gold text-[10px] uppercase tracking-[0.35em] font-semibold hover:bg-gold hover:text-bg transition-colors"
          >
            Start a project
            <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.8} />
          </Link>
        </div>
      </motion.div>

      <div className="hidden lg:flex absolute bottom-4 right-8 items-center gap-2 font-mono text-[9px] tracking-[0.3em] uppercase text-on-surface/30 z-20">
        <span className="px-1.5 py-0.5 border border-on-surface/20">esc</span>
        <span className="px-1.5 py-0.5 border border-on-surface/20">←</span>
        <span className="px-1.5 py-0.5 border border-on-surface/20">→</span>
        <span className="px-1.5 py-0.5 border border-on-surface/20">m</span>
      </div>
    </motion.div>
  )
}

/* ──────────────────────────────────────────────────────────────────
   PAGE
   ────────────────────────────────────────────────────────────────── */
function useTouchDevice() {
  const [isTouch, setIsTouch] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(hover: none), (pointer: coarse)')
    setIsTouch(mq.matches)
    const onChange = (e) => setIsTouch(e.matches)
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
  }, [])
  return isTouch
}

export default function Projects() {
  const [introDone, setIntroDone] = useState(false)
  const [hovered, setHovered] = useState(null)
  const [openId, setOpenId] = useState(null)
  const isTouch = useTouchDevice()

  const openIndex = projects.findIndex((p) => p.id === openId)
  const openProject = openIndex >= 0 ? projects[openIndex] : null
  const next = useCallback(() => {
    if (openIndex < 0) return
    setOpenId(projects[(openIndex + 1) % projects.length].id)
  }, [openIndex])
  const prev = useCallback(() => {
    if (openIndex < 0) return
    setOpenId(projects[(openIndex - 1 + projects.length) % projects.length].id)
  }, [openIndex])

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="enter"
      exit="exit"
      className="bg-bg min-h-screen"
    >
      <AnimatePresence>
        {!introDone && <IntroOverlay key="intro" onDone={() => setIntroDone(true)} />}
      </AnimatePresence>

      <section className="relative w-full pt-24 md:pt-28 pb-16 md:pb-24 px-4 md:px-10">
        {/* Header */}
        <div className="max-w-[1500px] mx-auto mb-12 md:mb-16">
          <div className="flex items-center gap-3 mb-5 font-mono text-[10px] tracking-[0.4em] uppercase text-on-surface/45">
            <span className="w-4 h-px bg-gold/60" />
            archive · 2026 · 06 frames
          </div>
          <h1
            className="font-display font-light leading-[0.9] tracking-display uppercase text-on-surface max-w-5xl"
            style={{ fontSize: 'clamp(2.4rem, 7.5vw, 6.5rem)' }}
          >
            Enter the<br />
            <span className="stroke-text italic">216 000</span> matrix
          </h1>
          <div className="mt-5 md:mt-7 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <p className="text-on-surface/60 text-sm md:text-base font-light leading-relaxed max-w-lg">
              Six frames running in parallel. Each one a collaboration with a partner. Hover (or scroll) to play — tap to mute. Tap the arrow to step inside.
            </p>
            <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.4em] uppercase text-on-surface/40">
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              live · audio enabled
            </div>
          </div>
        </div>

        {/* Grid */}
        <div
          className="max-w-[1500px] mx-auto"
          onMouseLeave={() => !isTouch && setHovered(null)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {projects.map((p, i) => (
              <GridTile
                key={p.id}
                project={p}
                index={i}
                hovered={hovered}
                anyHovered={hovered !== null}
                onHover={setHovered}
                onOpen={(proj) => setOpenId(proj.id)}
                isTouch={isTouch}
              />
            ))}
          </div>
        </div>

        {/* Partner roll-call */}
        <div className="max-w-[1500px] mx-auto mt-14 md:mt-20 pt-8 border-t border-on-surface/10">
          <div className="flex items-center gap-3 mb-6 font-mono text-[10px] tracking-[0.4em] uppercase text-on-surface/45">
            <span className="w-4 h-px bg-gold/60" />
            in collaboration with
          </div>
          <div className="flex flex-wrap gap-2.5 md:gap-3">
            {projects.map((p) => (
              <CollabMark key={p.id} partner={p.partner} size="md" />
            ))}
          </div>
        </div>

        {/* Footer rail */}
        <div className="max-w-[1500px] mx-auto mt-12 md:mt-16 pt-8 border-t border-on-surface/10 flex items-end justify-between gap-6 flex-wrap">
          <div className="font-mono text-[10px] tracking-[0.35em] uppercase text-on-surface/40 max-w-md leading-loose">
            tap to mute · arrow to expand · esc to exit
          </div>
          <Link
            to="/contact?type=booking"
            className="group inline-flex items-center gap-3 px-6 py-3.5 border border-gold text-gold text-[10px] uppercase tracking-[0.35em] font-semibold hover:bg-gold hover:text-bg transition-colors"
          >
            Build the next frame
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={1.8} />
          </Link>
        </div>
      </section>

      <AnimatePresence>
        {openProject && (
          <CinematicOverlay
            project={openProject}
            onClose={() => setOpenId(null)}
            onPrev={prev}
            onNext={next}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
