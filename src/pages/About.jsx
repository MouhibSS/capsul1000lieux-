import { useRef, useState, useEffect } from 'react'
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useInView,
  useMotionValue,
} from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  ArrowDown,
  MapPin,
  Quote,
  Languages,
  Sparkles,
  Clock,
} from 'lucide-react'
import { getAboutImageUrl, getHeroImageUrl } from '../utils/cdn'
import { useTranslation } from '../context/LanguageContext'

const ease = [0.22, 1, 0.36, 1]

const pageVariants = {
  initial: { opacity: 0 },
  enter: { opacity: 1, transition: { duration: 0.6, ease } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
}

/* ───────────────────────── Primitives ───────────────────────── */

function Counter({ to, suffix = '', duration = 2 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [val, setVal] = useState(0)

  useEffect(() => {
    if (!inView) return
    const start = performance.now()
    let raf
    const step = (t) => {
      const p = Math.min((t - start) / (duration * 1000), 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(eased * to))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [inView, to, duration])

  return (
    <span ref={ref} className="tabular-nums">
      {val}
      {suffix}
    </span>
  )
}

function RevealText({ text, className = '', delay = 0 }) {
  const words = text.split(' ')
  return (
    <span className={className}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom mr-[0.25em]">
          <motion.span
            initial={{ y: '100%' }}
            whileInView={{ y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, delay: delay + i * 0.05, ease }}
            className="inline-block"
          >
            {w}
          </motion.span>
        </span>
      ))}
    </span>
  )
}

function RevealName({ text, className = '', delay = 0 }) {
  return (
    <span className={className} aria-label={text}>
      {text.split(' ').map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom pr-[0.2em] mr-[0.12em] last:mr-0" style={{ paddingBottom: '0.14em' }}>
          <motion.span
            initial={{ y: '110%' }}
            whileInView={{ y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.85, delay: delay + i * 0.08, ease }}
            className="inline-block"
          >
            {w}
          </motion.span>
        </span>
      ))}
    </span>
  )
}

/* ───────────────────── Chapter progress rail ───────────────────── */

function ChapterRail({ chapters, activeIndex }) {
  return (
    <div className="fixed right-5 lg:right-8 top-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col gap-4 pointer-events-none">
      {chapters.map((c, i) => (
        <div key={c.id} className="flex items-center justify-end gap-3">
          <motion.span
            animate={{
              opacity: i === activeIndex ? 1 : 0,
              x: i === activeIndex ? 0 : 8,
            }}
            transition={{ duration: 0.5, ease }}
            className="font-mono text-[9px] tracking-[0.3em] uppercase text-gold whitespace-nowrap"
          >
            {c.label}
          </motion.span>
          <motion.span
            animate={{
              scale: i === activeIndex ? 1 : 0.55,
              backgroundColor:
                i === activeIndex
                  ? 'rgb(200, 169, 106)'
                  : 'rgba(200, 169, 106, 0.3)',
              width: i === activeIndex ? 28 : 10,
            }}
            transition={{ duration: 0.5, ease }}
            className="h-px block"
          />
        </div>
      ))}
    </div>
  )
}

/* ───────────────────── Portrait with mouse tilt ─────────────── */

function TiltPortrait({ src, detailSrc, caption, chapterNum, side = 'left' }) {
  const ref = useRef(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rX = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), {
    stiffness: 120,
    damping: 14,
  })
  const rY = useSpring(useTransform(mx, [-0.5, 0.5], [-6, 6]), {
    stiffness: 120,
    damping: 14,
  })

  const handleMove = (e) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    mx.set((e.clientX - r.left) / r.width - 0.5)
    my.set((e.clientY - r.top) / r.height - 0.5)
  }
  const reset = () => {
    mx.set(0)
    my.set(0)
  }

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const yShift = useTransform(scrollYProgress, [0, 1], [30, -30])
  const grayscale = useTransform(scrollYProgress, [0.15, 0.5], [100, 15])
  const filter = useTransform(grayscale, (g) => `grayscale(${g}%) contrast(1.05)`)

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      className="relative w-full"
      style={{ perspective: '1400px' }}
    >
      <motion.div
        style={{ rotateX: rX, rotateY: rY, transformStyle: 'preserve-3d' }}
        className="relative"
      >
        {/* Main portrait */}
        <motion.div
          style={{ y: yShift }}
          className="relative aspect-[3/4] overflow-hidden bg-surface-low"
        >
          <motion.img
            src={src}
            alt={caption}
            loading="lazy"
            style={{ filter }}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg/60 via-transparent to-transparent" />

          {/* Brackets */}
          <div className="absolute top-5 left-5 w-7 h-7 border-l border-t border-gold/70" />
          <div className="absolute top-5 right-5 w-7 h-7 border-r border-t border-gold/70" />
          <div className="absolute bottom-5 left-5 w-7 h-7 border-l border-b border-gold/70" />
          <div className="absolute bottom-5 right-5 w-7 h-7 border-r border-b border-gold/70" />

          {/* Chapter numeral */}
          <div
            className="absolute top-6 right-6 font-mono text-[10px] tracking-[0.35em] uppercase text-gold/90"
            style={{ transform: 'translateZ(20px)' }}
          >
            {chapterNum} / 02
          </div>

          {/* Caption */}
          <div
            className="absolute bottom-6 left-6 font-mono text-[10px] tracking-[0.3em] uppercase text-gold/80"
            style={{ transform: 'translateZ(15px)' }}
          >
            {caption}
          </div>
        </motion.div>

        {/* Detail fragment — floats at corner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1, delay: 0.4, ease }}
          className={`absolute w-28 md:w-36 lg:w-44 aspect-square overflow-hidden border-2 border-bg shadow-2xl ${
            side === 'left'
              ? '-bottom-8 -right-6 md:-right-10'
              : '-bottom-8 -left-6 md:-left-10'
          }`}
          style={{ transform: 'translateZ(40px)' }}
        >
          <img
            src={detailSrc}
            alt=""
            aria-hidden
            loading="lazy"
            className="w-full h-full object-cover"
            style={{ filter: 'grayscale(100%) contrast(1.1)' }}
          />
          <div className="absolute inset-0 ring-1 ring-inset ring-gold/30" />
        </motion.div>
      </motion.div>
    </div>
  )
}

/* ───────────────────── Team member panel ─────────────────────── */

function MemberPanel({ member, index, registerRef }) {
  const t = useTranslation('about')
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  // Giant numeral parallax
  const numeralX = useTransform(
    scrollYProgress,
    [0, 1],
    index % 2 === 0 ? [-80, 80] : [80, -80],
  )
  const numeralOpacity = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [0, 0.35, 0.35, 0])

  // Name parallax
  const nameY = useTransform(scrollYProgress, [0, 1], [40, -40])

  const flipped = index % 2 === 1

  useEffect(() => {
    if (ref.current) registerRef(index, ref.current)
  }, [index, registerRef])

  return (
    <section
      ref={ref}
      className="relative py-20 md:py-28 lg:py-36 border-t border-outline-variant/25 overflow-hidden"
      data-member-panel
    >
      {/* Background giant numeral */}
      <motion.div
        style={{ x: numeralX, opacity: numeralOpacity }}
        className={`absolute top-1/2 -translate-y-1/2 pointer-events-none select-none font-display font-extralight text-gold/5 leading-none ${
          flipped ? 'right-[-8%]' : 'left-[-8%]'
        }`}
      >
        <span style={{ fontSize: 'clamp(18rem, 40vw, 46rem)' }}>0{index + 1}</span>
      </motion.div>

      <div className="container-main relative">
        <div
          className={`grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-14 lg:gap-20 items-center ${
            flipped ? 'lg:[&>*:first-child]:order-2' : ''
          }`}
        >
          {/* Portrait column */}
          <div className="lg:col-span-5">
            <TiltPortrait
              src={member.portrait}
              detailSrc={member.detail}
              caption={member.based}
              chapterNum={`0${index + 1}`}
              side={flipped ? 'right' : 'left'}
            />
          </div>

          {/* Text column */}
          <div className="lg:col-span-7">
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.7, ease }}
              className="flex items-center gap-3 mb-5"
            >
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-gold/70">
                {t.chapter05ItemPrefix} — {String(index + 1).padStart(2, '0')} / 02
              </span>
              <span className="flex-1 h-px bg-gradient-to-r from-gold/40 to-transparent max-w-[120px]" />
            </motion.div>

            {/* Name — aligned left, first name above, italic last name below */}
            <motion.div style={{ y: nameY }} className="mb-4">
              <h3
                className="font-display font-light leading-[0.92] tracking-display uppercase text-on-surface"
                style={{ fontSize: 'clamp(2.2rem, 6.5vw, 5.5rem)' }}
              >
                <span className="block">
                  <RevealName text={member.firstName} />
                </span>
                <span className="block text-gold-gradient italic font-extralight">
                  <RevealName text={member.lastName} delay={0.18} />
                </span>
              </h3>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="eyebrow text-gold mb-8 md:mb-10"
            >
              {member.role}
            </motion.p>

            {/* Pull quote */}
            <motion.blockquote
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 1, delay: 0.15, ease }}
              className="relative mb-8 md:mb-10 pl-6 md:pl-8 border-l border-gold/50"
            >
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2, ease }}
                className="absolute -top-2 -left-2.5 bg-bg p-1"
              >
                <Quote className="w-4 h-4 text-gold" strokeWidth={1.5} fill="currentColor" />
              </motion.div>
              <p
                className="font-display italic font-light text-on-surface leading-[1.15]"
                style={{ fontSize: 'clamp(1.4rem, 2.8vw, 2.25rem)' }}
              >
                "{member.quote}"
              </p>
            </motion.blockquote>

            {/* Bio */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.8, delay: 0.2, ease }}
              className="text-on-surface-variant text-base md:text-lg leading-relaxed font-light mb-5"
            >
              {member.bio1}
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.8, delay: 0.35, ease }}
              className="text-on-surface-variant text-base md:text-lg leading-relaxed font-light mb-10 md:mb-12"
            >
              {member.bio2}
            </motion.p>

            {/* Field kit grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-outline-variant/25 border border-outline-variant/25 mb-8">
              {[
                { Icon: Clock, label: member.yearsLabel, value: member.years },
                { Icon: MapPin, label: t.basedLabel, value: member.based },
                { Icon: Languages, label: t.speaksLabel, value: member.languages },
                { Icon: Sparkles, label: member.signatureLabel, value: member.signature },
              ].map(({ Icon, label, value }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: 0.4 + i * 0.08, duration: 0.6, ease }}
                  className="bg-bg p-4 md:p-5 flex flex-col gap-2 group hover:bg-surface-low transition-colors duration-500"
                >
                  <Icon className="w-3.5 h-3.5 text-gold/70 group-hover:text-gold transition-colors" strokeWidth={1.5} />
                  <p className="eyebrow-sm text-on-surface-variant/70">{label}</p>
                  <p className="font-display text-sm md:text-base font-light text-on-surface leading-tight">
                    {value}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Field note — polaroid-ish tilted card */}
            <motion.div
              initial={{ opacity: 0, y: 20, rotate: -2 }}
              whileInView={{ opacity: 1, y: 0, rotate: flipped ? 1.5 : -1.5 }}
              whileHover={{ rotate: 0, scale: 1.015 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.9, delay: 0.5, ease }}
              className="relative max-w-md bg-surface-low border border-outline-variant/40 p-5 md:p-6 cursor-default"
            >
              <div className="absolute -top-2 left-5 right-5 h-5 bg-gold/10 border-x border-gold/20" />
              <p className="font-mono text-[9px] tracking-[0.35em] uppercase text-gold/70 mb-3">
                {t.fieldNoteLabel}
              </p>
              <p className="text-on-surface text-sm md:text-base font-light italic leading-relaxed">
                {member.fieldNote}
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ───────────────────────── Page ───────────────────────── */

export default function About() {
  const t = useTranslation('about')

  const heroRef = useRef(null)
  const timelineRef = useRef(null)

  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const heroParallax = useTransform(heroProgress, [0, 1], [0, 180])
  const heroFade = useTransform(heroProgress, [0, 0.8], [1, 0])
  const heroScale = useTransform(heroProgress, [0, 1], [1, 1.08])

  const { scrollYProgress: tlProgress } = useScroll({
    target: timelineRef,
    offset: ['start 70%', 'end 50%'],
  })
  const tlHeight = useSpring(tlProgress, { stiffness: 60, damping: 20 })

  const timeline = [
    { year: '2022', count: 50, suffix: '', label: t.timelineLocations, event: t.timeline2022 },
    { year: '2023', count: 500, suffix: '+', label: t.timelineSpacesVetted, event: t.timeline2023 },
    { year: '2024', count: 10, suffix: 'K', label: t.timelineProductions, event: t.timeline2024 },
    { year: '2026', count: 24, suffix: '', label: t.timelineGovernorates, event: t.timeline2026 },
  ]

  const team = [
    {
      firstName: 'Neil',
      lastName: 'Attia',
      name: 'Neil Attia',
      role: t.roleScouting,
      bio1: t.teamMember1Bio1,
      bio2: t.teamMember1Bio2,
      quote: t.teamMember1Quote,
      based: t.teamMember1Based,
      years: t.teamMember1Years,
      yearsLabel: t.teamMember1YearsLabel,
      languages: t.teamMember1Languages,
      signature: t.teamMember1Signature,
      signatureLabel: t.teamMember1SignatureLabel,
      fieldNote: t.teamMember1FieldNote,
      portrait: '/team/neil.jpg',
      detail: getAboutImageUrl(2),
    },
    {
      firstName: 'Mouhib',
      lastName: 'Ben Gayes',
      name: 'Mouhib Ben Gayes',
      role: t.roleOperations,
      bio1: t.teamMember2Bio1,
      bio2: t.teamMember2Bio2,
      quote: t.teamMember2Quote,
      based: t.teamMember2Based,
      years: t.teamMember2Years,
      yearsLabel: t.teamMember2YearsLabel,
      languages: t.teamMember2Languages,
      signature: t.teamMember2Signature,
      signatureLabel: t.teamMember2SignatureLabel,
      fieldNote: t.teamMember2FieldNote,
      portrait: '/team/mouhib.jpg',
      detail: getAboutImageUrl(3),
    },
  ]

  const pillars = [
    { num: '01', title: t.missionPillar1Title, desc: t.missionPillar1Desc },
    { num: '02', title: t.missionPillar2Title, desc: t.missionPillar2Desc },
    { num: '03', title: t.missionPillar3Title, desc: t.missionPillar3Desc },
  ]

  /* ─── Chapter rail observer ─── */
  const chapters = [
    { id: 'hero', label: t.chapterPrologue },
    { id: 'origin', label: t.chapterOrigin },
    { id: 'vision', label: t.chapterVision },
    { id: 'journey', label: t.chapterJourney },
    { id: 'team', label: t.chapterTeam },
    { id: 'outro', label: t.chapterOutro },
  ]

  const sectionRefs = useRef({})
  const memberRefs = useRef([])
  const [activeChapter, setActiveChapter] = useState(0)

  const registerRef = (id, node) => {
    if (typeof id === 'number') memberRefs.current[id] = node
    else sectionRefs.current[id] = node
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.dataset.chapterIdx)
            if (!Number.isNaN(idx)) setActiveChapter(idx)
          }
        })
      },
      { threshold: 0.4 },
    )
    Object.values(sectionRefs.current).forEach((n) => n && observer.observe(n))
    return () => observer.disconnect()
  }, [])

  return (
    <motion.div variants={pageVariants} initial="initial" animate="enter" exit="exit" className="bg-bg">
      <ChapterRail chapters={chapters} activeIndex={activeChapter} />

      {/* ── HERO — Chapter 01 ─────────────────────────────────────────── */}
      <section
        ref={(n) => {
          heroRef.current = n
          registerRef('hero', n)
        }}
        data-chapter-idx={0}
        className="relative min-h-[100vh] flex items-center overflow-hidden noise"
      >
        <motion.div
          style={{ y: heroParallax, scale: heroScale }}
          className="absolute inset-0 pointer-events-none"
        >
          <img
            src={getHeroImageUrl(1)}
            alt=""
            aria-hidden
            className="w-full h-full object-cover"
            style={{ filter: 'grayscale(100%) brightness(0.22)' }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(10,10,10,0.5) 0%, rgba(10,10,10,0.3) 35%, rgba(10,10,10,0.9) 100%)',
            }}
          />
        </motion.div>

        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            background: [
              'radial-gradient(ellipse 60% 50% at 25% 40%, rgba(200,169,106,0.10) 0%, transparent 60%)',
              'radial-gradient(ellipse 60% 50% at 35% 50%, rgba(220,140,100,0.12) 0%, transparent 60%)',
              'radial-gradient(ellipse 60% 50% at 25% 40%, rgba(200,169,106,0.10) 0%, transparent 60%)',
            ],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div style={{ opacity: heroFade }} className="container-main relative pt-28 md:pt-0 pb-20 md:pb-0 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-end">
            <div className="lg:col-span-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease }}
                className="flex items-center gap-3 mb-6"
              >
                <span className="w-6 h-px bg-gold" />
                <span className="eyebrow">{t.eyebrow}</span>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="font-display text-xs sm:text-sm tracking-[0.35em] uppercase text-gold/70 font-light mb-6 md:mb-8"
              >
                {t.subheading}
              </motion.p>

              <h1
                className="font-display font-light leading-[0.88] tracking-display uppercase text-on-surface"
                style={{ fontSize: 'clamp(2.4rem, 9.5vw, 9rem)' }}
              >
                <span className="block overflow-hidden">
                  <motion.span
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    transition={{ duration: 1.1, delay: 0.2, ease }}
                    className="block"
                  >
                    {t.heroHeadline1}
                  </motion.span>
                </span>
                <span className="block overflow-hidden">
                  <motion.span
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    transition={{ duration: 1.1, delay: 0.35, ease }}
                    className="stroke-text italic font-extralight block"
                  >
                    {t.heroHeadline2}
                  </motion.span>
                </span>
                <span className="block overflow-hidden">
                  <motion.span
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    transition={{ duration: 1.1, delay: 0.5, ease }}
                    className="text-gold-gradient block"
                  >
                    {t.heroHeadline3}
                  </motion.span>
                </span>
              </h1>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.9 }}
              className="lg:col-span-4 text-on-surface-variant font-light leading-relaxed text-base md:text-lg"
            >
              {t.description}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="hidden md:flex absolute bottom-10 left-1/2 -translate-x-1/2 flex-col items-center gap-3 text-on-surface-variant/60"
          >
            <span className="eyebrow-sm">{t.scrollHint}</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ArrowDown className="w-3.5 h-3.5 text-gold" strokeWidth={1.5} />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── ORIGIN — Chapter 02 ───────────────────────────────────────── */}
      <section
        ref={(n) => registerRef('origin', n)}
        data-chapter-idx={1}
        className="relative py-20 md:py-32 lg:py-40 border-t border-outline-variant/25 overflow-hidden"
      >
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 1.05 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 1.2, ease }}
              className="lg:col-span-6 order-2 lg:order-1"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={getAboutImageUrl(1)}
                  alt=""
                  className="w-full h-full object-cover"
                  style={{ filter: 'grayscale(30%) contrast(1.05)' }}
                  loading="lazy"
                />
                <div className="absolute top-5 left-5 w-8 h-8 border-l border-t border-gold/70" />
                <div className="absolute top-5 right-5 w-8 h-8 border-r border-t border-gold/70" />
                <div className="absolute bottom-5 left-5 w-8 h-8 border-l border-b border-gold/70" />
                <div className="absolute bottom-5 right-5 w-8 h-8 border-r border-b border-gold/70" />
                <div className="absolute bottom-6 left-6 font-mono text-[10px] tracking-[0.3em] uppercase text-gold/80">
                  {t.originCaption}
                </div>
              </div>
            </motion.div>

            <div className="lg:col-span-6 order-1 lg:order-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease }}
                className="flex items-center gap-3 mb-6"
              >
                <span className="w-6 h-px bg-gold" />
                <span className="eyebrow">{t.originEyebrow}</span>
              </motion.div>

              <h2 className="font-display font-light text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[0.95] tracking-display uppercase text-on-surface mb-8 md:mb-10">
                <RevealText text={t.originHeading1} />
                <br />
                <span className="stroke-text italic font-extralight">
                  <RevealText text={t.originHeading2} delay={0.15} />
                </span>
              </h2>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2, ease }}
                className="text-on-surface-variant text-base md:text-lg leading-relaxed font-light mb-5"
              >
                {t.originBody1}
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.35, ease }}
                className="text-on-surface-variant text-base md:text-lg leading-relaxed font-light"
              >
                {t.originBody2}
              </motion.p>
            </div>
          </div>
        </div>
      </section>

      {/* ── VISION — Chapter 03 ───────────────────────────────────────── */}
      <section
        ref={(n) => registerRef('vision', n)}
        data-chapter-idx={2}
        className="relative py-20 md:py-32 lg:py-40 border-t border-outline-variant/25 overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none">
          <img
            src={getHeroImageUrl(3)}
            alt=""
            aria-hidden
            className="w-full h-full object-cover"
            style={{ filter: 'grayscale(100%) brightness(0.08)' }}
          />
          <div className="absolute inset-0 bg-bg/88" />
        </div>

        <div className="container-main relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-end mb-14 md:mb-20">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-6 h-px bg-gold" />
                <span className="eyebrow">{t.missionEyebrow}</span>
              </div>
              <h2 className="font-display font-light text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[0.95] tracking-display uppercase text-on-surface">
                <RevealText text={t.missionHeading1} />
                <br />
                <span className="text-gold-gradient italic">
                  <RevealText text={t.missionHeading2} delay={0.15} />
                </span>
                <br />
                <RevealText text={t.missionHeading3} delay={0.3} />
              </h2>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.3 }}
              className="lg:col-span-4 lg:col-start-9"
            >
              <p className="text-on-surface-variant text-base leading-relaxed font-light mb-4">
                {t.missionBody1}
              </p>
              <p className="text-on-surface-variant text-base leading-relaxed font-light">
                {t.missionBody2}
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-outline-variant/25 border border-outline-variant/25">
            {pillars.map((p, i) => (
              <motion.div
                key={p.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.12, duration: 0.8, ease }}
                className="bg-bg/80 backdrop-blur-sm p-6 md:p-10 flex flex-col gap-4 group hover:bg-surface-low/70 transition-colors duration-500"
              >
                <span className="font-display text-5xl md:text-6xl font-extralight text-gold/40 tabular-nums leading-none group-hover:text-gold/70 transition-colors duration-500">
                  {p.num}
                </span>
                <div>
                  <p className="font-display text-xl md:text-2xl font-light text-on-surface uppercase tracking-display mb-3">
                    {p.title}
                  </p>
                  <p className="text-on-surface-variant text-sm font-light leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── JOURNEY — Chapter 04 ──────────────────────────────────────── */}
      <section
        ref={(n) => {
          timelineRef.current = n
          registerRef('journey', n)
        }}
        data-chapter-idx={3}
        className="relative py-20 md:py-32 lg:py-40 border-t border-outline-variant/25"
      >
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 mb-12 md:mb-20">
            <div className="lg:col-span-5">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-6 h-px bg-gold" />
                <span className="eyebrow">{t.journeyEyebrow}</span>
              </div>
              <h2 className="font-display font-light text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[0.95] tracking-display uppercase text-on-surface">
                <RevealText text={t.journeyHeading1} />
                <br />
                <span className="stroke-text italic font-extralight">
                  <RevealText text={t.journeyHeading2} delay={0.15} />
                </span>
              </h2>
            </div>
          </div>

          <div className="relative pl-8 md:pl-16 lg:pl-24">
            <div className="absolute left-2 md:left-6 lg:left-8 top-0 bottom-0 w-px bg-outline-variant/25" />
            <motion.div
              style={{ scaleY: tlHeight }}
              className="absolute left-2 md:left-6 lg:left-8 top-0 bottom-0 w-px bg-gold origin-top"
            />

            {timeline.map((item, i) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ delay: i * 0.1, duration: 0.8, ease }}
                className="relative pb-12 md:pb-16 last:pb-0"
              >
                <div className="absolute -left-[26px] md:-left-[30px] lg:-left-[36px] top-2 w-3.5 h-3.5 rounded-full bg-bg border border-gold flex items-center justify-center">
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full bg-gold"
                    whileInView={{ scale: [0.6, 1.4, 1] }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, delay: i * 0.1 + 0.2, ease }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4 md:gap-10 items-start">
                  <div className="md:min-w-[180px]">
                    <p className="font-display text-4xl md:text-6xl lg:text-7xl font-extralight text-gold/60 tabular-nums leading-none mb-2">
                      {item.year}
                    </p>
                    <p className="font-display text-2xl md:text-3xl text-on-surface tabular-nums">
                      <Counter to={item.count} suffix={item.suffix} />
                    </p>
                    <p className="eyebrow-sm text-on-surface-variant mt-1">{item.label}</p>
                  </div>
                  <p className="text-on-surface text-base md:text-lg font-light leading-relaxed max-w-2xl pt-2">
                    {item.event}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM INTRO + PANELS — Chapter 05 ──────────────────────────── */}
      <section
        ref={(n) => registerRef('team', n)}
        data-chapter-idx={4}
        className="relative pt-20 md:pt-32 lg:pt-40 border-t border-outline-variant/25"
      >
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 items-end mb-14 md:mb-20">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-6 h-px bg-gold" />
                <span className="eyebrow">{t.peopleEyebrow}</span>
              </div>
              <h2
                className="font-display font-light leading-[0.9] tracking-display uppercase text-on-surface"
                style={{ fontSize: 'clamp(2.4rem, 8.5vw, 7.5rem)' }}
              >
                <RevealText text={t.teamHeading1} />
                <br />
                <span className="text-gold-gradient italic font-extralight">
                  <RevealText text={t.teamHeading2} delay={0.2} />
                </span>
              </h2>
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.3 }}
              className="lg:col-span-4 text-on-surface-variant text-sm md:text-base font-light leading-relaxed"
            >
              <p className="mb-4">{t.peopleSubheading}</p>
              <div className="flex items-center gap-2 text-gold/70 text-[10px] tracking-[0.3em] uppercase">
                <span className="w-4 h-px bg-gold/50" />
                {t.teamDragHint}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {team.map((m, i) => (
        <MemberPanel key={m.name} member={m} index={i} registerRef={registerRef} />
      ))}

      {/* ── Collective epilogue ───────────────────────────────────────── */}
      <section className="relative py-20 md:py-32 border-t border-outline-variant/25 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0"
          >
            <img
              src={getAboutImageUrl(2)}
              alt=""
              aria-hidden
              className="w-full h-full object-cover"
              style={{ filter: 'grayscale(100%) brightness(0.14)' }}
            />
          </motion.div>
          <div className="absolute inset-0 bg-bg/80" />
        </div>

        <div className="container-main relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center">
            <div className="lg:col-span-5">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9 }}
                className="flex items-center gap-3 mb-6"
              >
                <span className="w-6 h-px bg-gold" />
                <span className="eyebrow">{t.teamCollectiveEyebrow}</span>
              </motion.div>
              <h3 className="font-display font-light text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[0.95] tracking-display uppercase text-on-surface mb-8">
                <RevealText text={t.collectiveHeading1} />
                <br />
                <span className="stroke-text italic font-extralight">
                  <RevealText text={t.collectiveHeading2} delay={0.15} />
                </span>
              </h3>
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.3 }}
              className="lg:col-span-6 lg:col-start-7"
            >
              <p className="text-on-surface text-lg md:text-xl font-light leading-relaxed mb-10">
                {t.teamCollectiveBody}
              </p>
              <div className="grid grid-cols-3 gap-px bg-outline-variant/25 border border-outline-variant/25">
                {[
                  { num: 30, suffix: '', label: t.collectiveYears },
                  { num: 5, suffix: '', label: t.collectiveLanguages },
                  { num: 24, suffix: '/24', label: t.collectiveGovernorates },
                ].map((s) => (
                  <div key={s.label} className="bg-bg/80 backdrop-blur-sm p-5 md:p-6 text-center">
                    <p className="font-display text-3xl md:text-4xl font-extralight text-gold tabular-nums leading-none mb-2">
                      <Counter to={s.num} suffix={s.suffix} />
                    </p>
                    <p className="eyebrow-sm text-on-surface-variant">{s.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CTA — Chapter 06 ──────────────────────────────────────────── */}
      <section
        ref={(n) => registerRef('outro', n)}
        data-chapter-idx={5}
        className="relative py-20 md:py-32 lg:py-40 border-t border-outline-variant/25 overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none">
          <img
            src={getHeroImageUrl(2)}
            alt=""
            aria-hidden
            className="w-full h-full object-cover"
            style={{ filter: 'grayscale(100%) brightness(0.14)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-bg/60 via-bg/70 to-bg" />
        </div>

        <div className="container-main relative text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease }}
          >
            <p className="font-mono text-[10px] tracking-[0.35em] uppercase text-gold/70 mb-6">
              {t.chapter06Label}
            </p>
            <h2 className="font-display font-light text-3xl sm:text-4xl md:text-6xl lg:text-7xl leading-[0.95] tracking-display uppercase text-on-surface mb-6 md:mb-8">
              <RevealText text={t.readyHeading1} />
              <br />
              <span className="text-gold-gradient italic">
                <RevealText text={t.readyHeading2} delay={0.15} />
              </span>
            </h2>
            <p className="text-on-surface-variant text-base md:text-lg font-light leading-relaxed mb-10">
              {t.readyBody}
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link to="/explore" className="btn-primary group">
                {t.browseCTA}
                <ArrowUpRight
                  className="w-3.5 h-3.5 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  strokeWidth={1.8}
                />
              </Link>
              <Link to="/list-space" className="btn-ghost">
                {t.listSpaceLabel}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  )
}
