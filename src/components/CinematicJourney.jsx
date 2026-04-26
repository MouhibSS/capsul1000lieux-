import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight, MapPin, Film, RotateCcw, Sparkles } from 'lucide-react'
import { useTranslation } from '../context/LanguageContext'

/**
 * Polaroid Deck — tap-driven postcard interaction.
 * No horizontal swiping, no scrolling. The user taps the top card to
 * flip it; the back reveals the chapter copy + CTA. Tapping the
 * "Next chapter" pill (or any card behind the top one) sends the
 * front card to the back of the stack.
 */
export default function CinematicJourney() {
  const t = useTranslation('cinematic')

  const chapters = useMemo(() => [
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
      stamp: 'Côte Nord',
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
      stamp: 'Chott',
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
      stamp: 'Ksar',
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
      stamp: 'Marina',
    },
  ], [t])

  // order[0] = top of deck; tail = back of deck
  const [order, setOrder] = useState(chapters.map((_, i) => i))
  const [flipped, setFlipped] = useState(false)

  const cycle = () => {
    setFlipped(false)
    // Wait for un-flip before reordering
    setTimeout(() => {
      setOrder((o) => [...o.slice(1), o[0]])
    }, 220)
  }

  const jumpTo = (chapterIdx) => {
    if (order[0] === chapterIdx) return
    setFlipped(false)
    setTimeout(() => {
      const pos = order.indexOf(chapterIdx)
      const newOrder = [...order.slice(pos), ...order.slice(0, pos)]
      setOrder(newOrder)
    }, 200)
  }

  const top = chapters[order[0]]

  return (
    <section className="relative py-16 md:py-24 lg:py-28 bg-bg overflow-hidden border-y border-outline-variant/20">
      {/* Ambient backdrop tied to top card accent */}
      <motion.div
        animate={{ opacity: [0.45, 0.7, 0.45] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 pointer-events-none transition-colors duration-700"
        style={{
          background: `radial-gradient(ellipse 60% 45% at 50% 35%, ${top.accent}28 0%, transparent 70%)`,
        }}
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      <div className="container-main relative">
        <div className="flex items-end justify-between gap-6 mb-8 md:mb-12 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Film className="w-3.5 h-3.5 text-gold" strokeWidth={1.6} />
              <span className="eyebrow text-gold">{t.fieldNotesTitle || 'Polaroid Deck — Vol. 01'}</span>
            </div>
            <h2 className="font-display font-light text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[0.92] tracking-display uppercase text-on-surface max-w-3xl">
              Tap to <span className="stroke-text italic">turn the</span> postcard
            </h2>
            <p className="text-on-surface-variant text-sm md:text-base mt-4 md:mt-5 max-w-md font-light leading-relaxed">
              Each postcard hides a story on its back. Tap the card to flip it — tap again or pick another chapter to deal the next.
            </p>
          </div>

          {/* Chapter chips — tap to jump (no swipe) */}
          <div className="flex flex-wrap items-center gap-2">
            {chapters.map((c, i) => {
              const isTop = order[0] === i
              return (
                <button
                  key={c.id}
                  onClick={() => jumpTo(i)}
                  aria-label={`Show ${c.name}`}
                  className={`relative px-3 py-2 text-[10px] tracking-[0.3em] uppercase border transition-all ${
                    isTop
                      ? 'text-bg font-semibold border-transparent'
                      : 'text-on-surface-variant border-outline-variant/40 hover:text-on-surface hover:border-on-surface-variant'
                  }`}
                  style={isTop ? { backgroundColor: c.accent, boxShadow: `0 6px 20px ${c.accent}55` } : {}}
                >
                  {c.index}
                  {isTop && (
                    <motion.span
                      layoutId="chip-active"
                      className="absolute inset-0 -z-10"
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Deck stage */}
        <div
          className="relative mx-auto"
          style={{
            perspective: '1600px',
            perspectiveOrigin: 'center 35%',
            height: 'clamp(440px, 70vmin, 620px)',
            maxWidth: '380px',
          }}
        >
          {/* Stack — render from back to front so top is on top */}
          {order
            .slice()
            .reverse()
            .map((chapterIdx, stackPos) => {
              // stackPos: 0 = back-most, last = top
              const depth = order.length - 1 - stackPos // 0 = top, larger = deeper
              const c = chapters[chapterIdx]
              const isTop = depth === 0
              return (
                <DeckCard
                  key={chapterIdx}
                  chapter={c}
                  depth={depth}
                  isTop={isTop}
                  flipped={isTop && flipped}
                  onTap={() => {
                    if (isTop) setFlipped((f) => !f)
                    else jumpTo(chapterIdx)
                  }}
                  enterSpaceText={t.enterSpace || 'Enter the space'}
                />
              )
            })}
        </div>

        {/* Controls under the deck */}
        <div className="mt-10 md:mt-12 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-[10px] tracking-[0.3em] uppercase text-on-surface-variant">
            <Sparkles className="w-3 h-3 text-gold" strokeWidth={1.8} />
            <span>{flipped ? 'Tap card to flip back' : 'Tap top card to reveal'}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFlipped((f) => !f)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-[10px] tracking-[0.3em] uppercase border border-outline-variant/40 text-on-surface hover:text-gold hover:border-gold transition-colors"
            >
              <RotateCcw className="w-3 h-3" strokeWidth={1.8} />
              Flip
            </button>
            <button
              onClick={cycle}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-[10px] tracking-[0.3em] uppercase font-semibold text-bg transition-colors"
              style={{ backgroundColor: top.accent }}
            >
              Next chapter
              <ArrowUpRight className="w-3 h-3" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Active card meta */}
        <div className="mt-8 md:mt-10 flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-outline-variant/20">
          <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.3em] uppercase">
            <span style={{ color: top.accent }}>{top.index}</span>
            <span className="w-8 h-px bg-outline-variant/50" />
            <span className="text-on-surface-variant">{String(chapters.length).padStart(2, '0')}</span>
            <span className="hidden sm:inline-flex items-center gap-2 ml-2 text-on-surface-variant">
              <MapPin className="w-3 h-3 text-gold" strokeWidth={1.8} />
              {top.city} · {top.coords}
            </span>
          </div>
          <Link
            to={`/explore?city=${top.city}`}
            className="inline-flex items-center gap-3 text-on-surface hover:text-gold text-[10px] tracking-[0.35em] uppercase font-medium transition-colors group"
          >
            {t.browseLibrary || 'Browse the library'}
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform duration-500" strokeWidth={1.6} />
          </Link>
        </div>
      </div>
    </section>
  )
}

function DeckCard({ chapter, depth, isTop, flipped, onTap, enterSpaceText }) {
  // Behind cards fan out with offset/rotation/scale
  const offsetY = depth * 14
  const offsetX = depth * 10 * (depth % 2 === 0 ? 1 : -1)
  const tilt = depth * (depth % 2 === 0 ? -3 : 3)
  const scale = 1 - depth * 0.05
  const z = -depth * 30

  return (
    <motion.button
      type="button"
      onClick={onTap}
      initial={false}
      animate={{
        x: offsetX,
        y: offsetY,
        rotate: tilt,
        scale,
        translateZ: z,
        opacity: depth > 3 ? 0 : 1,
      }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={`absolute inset-0 mx-auto outline-none ${isTop ? 'cursor-pointer' : 'cursor-pointer'}`}
      style={{
        zIndex: 10 - depth,
        transformStyle: 'preserve-3d',
        transformOrigin: 'center',
        WebkitTapHighlightColor: 'transparent',
      }}
      aria-label={isTop ? `Flip ${chapter.name} postcard` : `Bring ${chapter.name} to front`}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* FRONT */}
        <CardFace chapter={chapter} side="front" />
        {/* BACK */}
        <CardFace chapter={chapter} side="back" enterSpaceText={enterSpaceText} />
      </motion.div>
    </motion.button>
  )
}

function CardFace({ chapter, side, enterSpaceText }) {
  const isFront = side === 'front'
  return (
    <div
      className="absolute inset-0 overflow-hidden border border-outline-variant/30 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]"
      style={{
        backgroundColor: chapter.fallback,
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        transform: isFront ? 'rotateY(0deg)' : 'rotateY(180deg)',
      }}
    >
      {isFront ? (
        <FrontFace chapter={chapter} />
      ) : (
        <BackFace chapter={chapter} enterSpaceText={enterSpaceText} />
      )}
    </div>
  )
}

function FrontFace({ chapter }) {
  return (
    <>
      <img
        src={chapter.image}
        alt={chapter.name}
        loading="lazy"
        draggable={false}
        className="absolute inset-0 w-full h-full object-cover img-mono"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-bg/80 via-bg/30 to-transparent" />
      <div
        className="absolute inset-0 opacity-50 mix-blend-overlay pointer-events-none"
        style={{ background: `radial-gradient(ellipse at top, ${chapter.accent}55 0%, transparent 65%)` }}
      />

      {/* Postal stamp top-right */}
      <div
        className="absolute top-4 right-4 px-2 py-1 border-2 rotate-3"
        style={{ borderColor: `${chapter.accent}aa`, color: chapter.accent }}
      >
        <span className="block text-[8px] font-mono tracking-[0.25em] uppercase">{chapter.stamp}</span>
        <span className="block text-[7px] font-mono tracking-[0.2em] opacity-70">216 000</span>
      </div>

      {/* Coords top-left */}
      <div className="absolute top-4 left-4 flex items-center gap-2 px-2.5 py-1 rounded-full bg-bg/65 backdrop-blur border border-outline-variant/30">
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: chapter.accent, boxShadow: `0 0 8px ${chapter.accent}` }}
        />
        <span className="font-mono text-[9px] tracking-[0.25em] text-on-surface-variant">{chapter.coords}</span>
      </div>

      {/* Footer */}
      <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[9px] tracking-[0.35em] uppercase font-medium" style={{ color: chapter.accent }}>
            {chapter.region}
          </span>
          <span className="w-6 h-px" style={{ background: `${chapter.accent}80` }} />
          <span className="font-mono text-[9px] tracking-[0.2em] text-on-surface-variant uppercase">
            {chapter.index}
          </span>
        </div>
        <h3 className="font-display font-light text-2xl md:text-3xl text-on-surface uppercase tracking-display leading-[0.95] mb-1.5">
          {chapter.name}
        </h3>
        <p className="font-display italic font-extralight text-sm md:text-base" style={{ color: chapter.accent }}>
          {chapter.subtitle}
        </p>
      </div>

      {/* Corner brackets */}
      {[
        'top-3 left-3 border-l border-t',
        'top-3 right-3 border-r border-t',
        'bottom-3 left-3 border-l border-b',
        'bottom-3 right-3 border-r border-b',
      ].map((c, i) => (
        <span key={i} className={`absolute w-3 h-3 ${c}`} style={{ borderColor: `${chapter.accent}aa` }} />
      ))}

      {/* Tap hint pulse */}
      <motion.div
        animate={{ opacity: [0.35, 0.95, 0.35] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-bg/70 backdrop-blur border border-outline-variant/40 text-[8px] tracking-[0.25em] uppercase text-on-surface-variant"
      >
        <RotateCcw className="w-2.5 h-2.5" strokeWidth={2} />
        Tap to flip
      </motion.div>
    </>
  )
}

function BackFace({ chapter, enterSpaceText }) {
  return (
    <div
      className="absolute inset-0 flex flex-col"
      style={{
        background: `linear-gradient(160deg, ${chapter.fallback} 0%, #0a0a0a 100%)`,
      }}
    >
      {/* Postcard back grid lines */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute left-1/2 top-12 bottom-20 w-px" style={{ background: `${chapter.accent}40` }} />
        <div className="absolute right-5 top-12 bottom-20 w-1/3 border-2" style={{ borderColor: `${chapter.accent}40` }}>
          <div className="absolute inset-2 flex items-center justify-center">
            <span
              className="font-display text-5xl font-extralight rotate-12"
              style={{ color: `${chapter.accent}aa` }}
            >
              {chapter.index}
            </span>
          </div>
        </div>
      </div>

      <div className="relative p-5 md:p-7 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="text-[9px] tracking-[0.4em] uppercase mb-1" style={{ color: chapter.accent }}>
              {chapter.region}
            </p>
            <p className="font-mono text-[9px] tracking-[0.25em] text-on-surface-variant">
              {chapter.coords}
            </p>
          </div>
          <Sparkles className="w-3.5 h-3.5 text-gold" strokeWidth={1.6} />
        </div>

        {/* Title */}
        <h3 className="font-display font-light text-2xl md:text-3xl text-on-surface uppercase tracking-display leading-[0.95] mb-2">
          {chapter.name}
        </h3>
        <p className="font-display italic font-extralight text-sm md:text-base mb-4" style={{ color: chapter.accent }}>
          “{chapter.subtitle}”
        </p>

        {/* Body — handwritten feel */}
        <div className="relative flex-1 flex flex-col">
          <p
            className="text-on-surface text-sm md:text-base leading-relaxed mb-4 max-w-[58%] italic font-light"
            style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
          >
            {chapter.copy}
          </p>

          <div className="flex flex-wrap gap-1.5 mb-5 max-w-[58%]">
            {chapter.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-[9px] tracking-[0.18em] uppercase border rounded-full"
                style={{ borderColor: `${chapter.accent}55`, color: chapter.accent }}
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-auto flex items-center justify-between gap-3">
            <Link
              to={`/explore?city=${chapter.city}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase font-semibold text-on-surface group"
              style={{ color: chapter.accent }}
            >
              <span className="w-6 h-px transition-all group-hover:w-10" style={{ background: chapter.accent }} />
              {enterSpaceText}
              <ArrowUpRight className="w-3 h-3" strokeWidth={2} />
            </Link>
            <span className="font-mono text-[8px] tracking-[0.3em] text-on-surface-variant uppercase">
              {chapter.index} / 04
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
