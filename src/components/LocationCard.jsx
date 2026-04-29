import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Heart, Star, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { useFavoritesContext as useFavorites } from '../context/FavoritesContext'
import { useLanguage } from '../context/LanguageContext'
import { useLocationPieces } from '../hooks/useLocationPieces'

const ease = [0.22, 1, 0.36, 1]

export default function LocationCard({ location, index = 0 }) {
  const { toggle, isFavorite } = useFavorites()
  const { lang } = useLanguage()
  const { fetchPieces } = useLocationPieces()
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgIndex, setImgIndex] = useState(0)
  const [allImages, setAllImages] = useState([])
  const fav = isFavorite(location.id)
  const cardRef = useRef(null)

  useEffect(() => {
    const loadImages = async () => {
      const baseImages = location.images && location.images.length ? location.images : []
      const pieces = await fetchPieces(location.id)

      const combined = baseImages.map(url => ({ url, label: null }))

      if (pieces && pieces.length > 0) {
        pieces.forEach(piece => {
          if (piece.image_urls && piece.image_urls.length > 0) {
            const subsectionName = lang === 'fr' ? (piece.name_fr || piece.subsection) : (piece.name_en || piece.subsection)
            piece.image_urls.forEach(url => {
              combined.push({ url, label: subsectionName })
            })
          }
        })
      }

      setAllImages(combined)
    }

    loadImages()
  }, [location.id, lang, fetchPieces])

  const images = allImages.length > 0 ? allImages.map(img => img.url) : []
  const hasMany = images.length > 1

  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const springCfg = { stiffness: 200, damping: 18 }
  const rotX = useSpring(useTransform(my, [-1, 1], [6, -6]), springCfg)
  const rotY = useSpring(useTransform(mx, [-1, 1], [-8, 8]), springCfg)
  const translateZ = useSpring(useTransform(mx, [-1, 1], [0, 0]), springCfg)

  const handleMouseMove = (e) => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(pointer: coarse)').matches) return
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    mx.set(px * 2 - 1)
    my.set(py * 2 - 1)
  }

  const handleMouseLeave = () => { mx.set(0); my.set(0) }

  const goPrev = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setImgLoaded(false)
    setImgIndex((i) => (i - 1 + images.length) % images.length)
  }
  const goNext = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setImgLoaded(false)
    setImgIndex((i) => (i + 1) % images.length)
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay: index * 0.06, ease }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative"
      style={{ perspective: '1000px' }}
    >
      <motion.div
        style={{
          rotateX: rotX,
          rotateY: rotY,
          translateZ,
          transformStyle: 'preserve-3d',
        }}
      >
        <Link to={`/location/${location.id}`} className="block">
          {/* Image */}
          <div
            className="img-zoom relative overflow-hidden aspect-[4/5] bg-surface-low"
            style={{ backgroundColor: location.fallback || '#1c1b1b' }}
          >
            {!imgLoaded && (
              <div className="absolute inset-0 animate-pulse" style={{ backgroundColor: location.fallback || '#1c1b1b' }} />
            )}
            {images[imgIndex] && (
              <img
                key={imgIndex}
                src={images[imgIndex]}
                alt={location.name}
                loading="lazy"
                onLoad={() => setImgLoaded(true)}
                className={`w-full h-full object-cover img-mono transition-opacity duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
              />
            )}

            {/* Subsection label */}
            {allImages[imgIndex]?.label && (
              <div className="absolute top-0 left-0 right-0 px-3 py-2 bg-gradient-to-b from-black/60 to-transparent">
                <p className="text-white text-xs font-semibold uppercase tracking-wider">
                  {allImages[imgIndex].label}
                </p>
              </div>
            )}

            {/* Pointer-following glare (desktop) */}
            <motion.div
              className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-overlay"
              style={{
                background: useTransform(
                  [mx, my],
                  ([x, y]) => `radial-gradient(circle at ${((x + 1) / 2) * 100}% ${((y + 1) / 2) * 100}%, rgba(255,255,255,0.22), transparent 50%)`
                ),
              }}
            />

            {/* Index */}
            <div className="absolute top-4 left-4 font-mono eyebrow-sm text-on-surface/80" style={{ transform: 'translateZ(24px)' }}>
              № {String(location.id).padStart(3, '0')}
            </div>

            {/* Badges */}
            <div className="absolute top-4 right-4 flex gap-2" style={{ transform: 'translateZ(24px)' }}>
              {location.featured && <span className="chip-gold">Featured</span>}
            </div>

            {/* Photo swipe arrows */}
            {hasMany && (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Previous photo"
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-bg/55 backdrop-blur text-on-surface hover:bg-bg/80 hover:text-gold opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ transform: 'translateY(-50%) translateZ(30px)' }}
                >
                  <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Next photo"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-bg/55 backdrop-blur text-on-surface hover:bg-bg/80 hover:text-gold opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ transform: 'translateY(-50%) translateZ(30px)' }}
                >
                  <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
                </button>
                {/* Dots */}
                <div
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5"
                  style={{ transform: 'translateX(-50%) translateZ(30px)' }}
                >
                  {images.map((_, i) => (
                    <span
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${i === imgIndex ? 'bg-gold' : 'bg-on-surface/40'}`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Favorite */}
            <button
              onClick={(e) => {
                e.preventDefault()
                toggle(location.id)
              }}
              className={`absolute bottom-4 left-4 w-10 h-10 flex items-center justify-center transition-colors ${
                fav ? 'bg-gold text-bg' : 'bg-bg/50 backdrop-blur text-on-surface hover:text-gold'
              }`}
              aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
              style={{ transform: 'translateZ(30px)' }}
            >
              <Heart className="w-3.5 h-3.5" fill={fav ? 'currentColor' : 'none'} strokeWidth={1.5} />
            </button>

            {/* Yellow arrow → opens detail in NEW TAB */}
            <a
              href={`/location/${location.id}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              aria-label="Open in new tab"
              className="absolute bottom-4 right-4 w-10 h-10 bg-gold text-bg flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 hover:bg-gold-light"
              style={{ transform: 'translateZ(30px)' }}
            >
              <ArrowUpRight className="w-4 h-4" strokeWidth={1.5} />
            </a>
          </div>

          {/* Info */}
          <div className="mt-5">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="min-w-0">
                <div className="eyebrow-sm mb-1.5">
                  {location.city} · {location.type}
                </div>
                <h3 className="font-display text-2xl font-light text-on-surface leading-[1.1] tracking-display uppercase truncate group-hover:text-gold transition-colors duration-300">
                  {location.name}
                </h3>
              </div>
              <div className="flex items-center gap-1 shrink-0 mt-1">
                <Star className="w-3 h-3 text-gold" fill="currentColor" />
                <span className="text-on-surface text-xs font-medium">{location.rating}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-outline-variant/25">
              <div className="flex flex-wrap gap-1.5">
                {location.tags && location.tags.slice(0, 2).map((t) => (
                  <span key={t} className="text-[9px] tracking-[0.25em] uppercase text-on-surface-variant">
                    {t}
                  </span>
                ))}
              </div>
              <div className="font-mono text-sm text-on-surface tabular-nums">
                {location.currency}
                {location.price}
                <span className="text-on-surface-variant text-[10px]"> /day</span>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    </motion.div>
  )
}
