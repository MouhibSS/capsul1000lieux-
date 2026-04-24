import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Heart, Star, ArrowUpRight } from 'lucide-react'
import { useFavoritesContext as useFavorites } from '../context/FavoritesContext'

const ease = [0.22, 1, 0.36, 1]

export default function LocationCard({ location, index = 0 }) {
  const { toggle, isFavorite } = useFavorites()
  const [imgLoaded, setImgLoaded] = useState(false)
  const fav = isFavorite(location.id)
  const cardRef = useRef(null)

  // 3D tilt — desktop only (disabled on coarse pointer)
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
            {location.images && location.images[0] && (
              <img
                src={location.images[0]}
                alt={location.name}
                loading="lazy"
                onLoad={() => setImgLoaded(true)}
                className={`w-full h-full object-cover img-mono transition-opacity duration-700 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
              />
            )}

            {/* Subtle glare that follows pointer — only visible on hover, desktop only */}
            <motion.div
              className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-overlay"
              style={{
                background: useTransform(
                  [mx, my],
                  ([x, y]) => `radial-gradient(circle at ${((x + 1) / 2) * 100}% ${((y + 1) / 2) * 100}%, rgba(255,255,255,0.22), transparent 50%)`
                ),
              }}
            />

            {/* Index overlay */}
            <div className="absolute top-4 left-4 font-mono eyebrow-sm text-on-surface/80" style={{ transform: 'translateZ(24px)' }}>
              № {String(location.id).padStart(3, '0')}
            </div>

            {/* Badges */}
            <div className="absolute top-4 right-4 flex gap-2" style={{ transform: 'translateZ(24px)' }}>
              {location.featured && <span className="chip-gold">Featured</span>}
            </div>

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

            {/* Hover arrow */}
            <div
              className="absolute bottom-4 right-4 w-10 h-10 bg-gold text-bg flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500"
              style={{ transform: 'translateZ(30px)' }}
            >
              <ArrowUpRight className="w-4 h-4" strokeWidth={1.5} />
            </div>
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
