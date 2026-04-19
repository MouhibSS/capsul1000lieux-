import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, Star, ArrowUpRight } from 'lucide-react'
import { useFavorites } from '../hooks/useFavorites'

const ease = [0.22, 1, 0.36, 1]

export default function LocationCard({ location, index = 0 }) {
  const { toggle, isFavorite } = useFavorites()
  const [imgLoaded, setImgLoaded] = useState(false)
  const fav = isFavorite(location.id)

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay: index * 0.06, ease }}
      className="group relative"
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
          <img
            src={location.images[0]}
            alt={location.name}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-cover img-mono transition-opacity duration-700 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          />

          {/* Index overlay */}
          <div className="absolute top-4 left-4 font-mono eyebrow-sm text-on-surface/80">
            № {String(location.id).padStart(3, '0')}
          </div>

          {/* Badges */}
          <div className="absolute top-4 right-4 flex gap-2">
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
          >
            <Heart className="w-3.5 h-3.5" fill={fav ? 'currentColor' : 'none'} strokeWidth={1.5} />
          </button>

          {/* Hover arrow */}
          <div className="absolute bottom-4 right-4 w-10 h-10 bg-gold text-bg flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
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
              {location.tags.slice(0, 2).map((t) => (
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
  )
}
