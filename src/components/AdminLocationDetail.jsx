import { motion } from 'framer-motion'
import {
  X, Edit2, Trash2, MapPin, Star, Users, Maximize2, Home,
  Tag, Sparkles, Calendar, ExternalLink, Eye, EyeOff, Archive,
  ChevronLeft, ChevronRight, Image as ImageIcon,
} from 'lucide-react'
import { useState } from 'react'
import { useAmenities } from '../hooks/useAmenities'
import LocationMap from './LocationMap'
import AdminLocationPieces from '../sections/AdminLocationPieces'

const STATUS_STYLE = {
  published: { label: 'Published', icon: Eye, cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
  draft:     { label: 'Draft',     icon: EyeOff, cls: 'bg-amber-500/20 text-amber-400 border-amber-500/40' },
  archived:  { label: 'Archived',  icon: Archive, cls: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/40' },
}

function statusOf(loc) {
  if (loc.archived) return 'archived'
  if (loc.published) return 'published'
  return 'draft'
}

export default function AdminLocationDetail({ location, onClose, onEdit, onDelete }) {
  const [imgIndex, setImgIndex] = useState(0)
  const [showPieces, setShowPieces] = useState(false)
  const { getLabel: getAmenityLabel } = useAmenities()
  const images = location.image_urls || []
  const status = STATUS_STYLE[statusOf(location)]
  const StatusIcon = status.icon

  if (showPieces) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-3"
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 30, stiffness: 280 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-surface-container w-full sm:max-w-4xl h-[90vh] sm:h-auto sm:max-h-[92vh] rounded-t-2xl sm:rounded-xl overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-outline-variant/25 flex-shrink-0">
            <h3 className="font-display text-lg font-light text-on-surface uppercase tracking-wide">
              Pieces & Photos
            </h3>
            <button
              onClick={() => setShowPieces(false)}
              className="p-1.5 sm:p-2 hover:bg-surface-low rounded transition-colors text-on-surface-variant"
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <AdminLocationPieces locationId={location.id} />
          </div>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-3"
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 30 }}
        transition={{ type: 'spring', damping: 30, stiffness: 280 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-container w-full sm:max-w-4xl h-[90vh] sm:h-auto sm:max-h-[92vh] rounded-t-2xl sm:rounded-xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-outline-variant/25 flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${status.cls}`}>
              <StatusIcon className="w-3 h-3" strokeWidth={1.75} />
              {status.label}
            </span>
            <span className="text-xs text-on-surface-variant truncate hidden sm:inline">
              ID #{String(location.id).slice(0, 8)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <a
              href={`/location/${location.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 sm:p-2 hover:bg-blue-500/20 hover:text-blue-400 rounded transition-colors text-on-surface-variant"
              title="Open public page"
            >
              <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
            </a>
            <button
              onClick={() => onEdit(location)}
              className="p-1.5 sm:p-2 hover:bg-blue-500/20 hover:text-blue-400 rounded transition-colors text-on-surface-variant"
              title="Edit"
            >
              <Edit2 className="w-4 h-4" strokeWidth={1.5} />
            </button>
            <button
              onClick={() => onDelete(location.id)}
              className="p-1.5 sm:p-2 hover:bg-red-500/20 hover:text-red-400 rounded transition-colors text-on-surface-variant"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" strokeWidth={1.5} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 hover:bg-surface-low rounded transition-colors text-on-surface-variant"
              title="Close"
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto">
          {/* Image gallery */}
          {images.length > 0 && (
            <div className="relative bg-surface-low aspect-video sm:aspect-[21/9] group">
              <img
                src={images[imgIndex]}
                alt={location.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setImgIndex((i) => (i - 1 + images.length) % images.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 bg-black/50 backdrop-blur text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" strokeWidth={1.75} />
                  </button>
                  <button
                    onClick={() => setImgIndex((i) => (i + 1) % images.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 bg-black/50 backdrop-blur text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-black/60 backdrop-blur text-white text-[10px] font-mono rounded-full">
                    {imgIndex + 1} / {images.length}
                  </div>
                </>
              )}
              {(location.featured || location.trending) && (
                <div className="absolute top-3 left-3 flex gap-1.5">
                  {location.featured && (
                    <span className="px-2 py-1 bg-gold/90 text-bg text-[10px] font-bold uppercase tracking-wider rounded">
                      Featured
                    </span>
                  )}
                  {location.trending && (
                    <span className="px-2 py-1 bg-purple-500/90 text-white text-[10px] font-bold uppercase tracking-wider rounded">
                      Trending
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="p-4 sm:p-6 space-y-5">
            {/* Title section */}
            <div>
              <h2 className="font-display text-xl sm:text-3xl font-light text-on-surface uppercase tracking-wide leading-tight break-words">
                {location.name}
              </h2>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs sm:text-sm text-on-surface-variant">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gold" strokeWidth={1.5} />
                  {location.city}, {location.country}
                </span>
                <span className="text-outline-variant">·</span>
                <span className="capitalize">{location.type}</span>
                {location.rating && (
                  <>
                    <span className="text-outline-variant">·</span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-gold" fill="currentColor" />
                      {location.rating} ({location.reviews || 0})
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2 pb-4 border-b border-outline-variant/25">
              <span className="font-display text-2xl sm:text-3xl font-light text-gold tabular-nums">
                {location.currency || '€'}{location.price}
              </span>
              <span className="text-on-surface-variant text-sm">/ day</span>
            </div>

            {/* Description */}
            {location.description && (
              <div>
                <p className="text-xs uppercase tracking-wider text-on-surface-variant font-medium mb-2">Description</p>
                <p className="text-sm text-on-surface leading-relaxed font-light">
                  {location.description}
                </p>
              </div>
            )}

            {/* Dynamic stats grid */}
            {(() => {
              const stats = []
              if (location.area) stats.push({ icon: Maximize2, label: 'Surface', value: `${location.area} m²`, tags: null })
              if (location.capacity) stats.push({ icon: Users, label: 'Capacity', value: `${location.capacity} pax`, tags: null })
              if (location.type) stats.push({ icon: Home, label: 'Type', value: location.type, tags: null })
              if (location.place_type_keys?.length > 0) stats.push({ icon: Home, label: 'Type de lieu', value: null, tags: location.place_type_keys, format: (k) => k.replace('type_', '').replace(/_/g, ' ') })
              if (location.architecture_style_keys?.length > 0) stats.push({ icon: Home, label: 'Architecture', value: null, tags: location.architecture_style_keys, format: (k) => k.replace('arch_', '').replace(/_/g, ' ') })
              if (location.decoration_style_keys?.length > 0) stats.push({ icon: Sparkles, label: 'Décoration', value: null, tags: location.decoration_style_keys, format: (k) => k.replace('deco_', '').replace(/_/g, ' ') })
              if (location.max_persons_keys?.length > 0) stats.push({ icon: Users, label: 'Nb personnes', value: null, tags: location.max_persons_keys, format: (k) => k.replace('max_persons_', '').replace(/_/g, ' ') })
              if (location.type_de_demande_keys?.length > 0) stats.push({ icon: Tag, label: 'Type demande', value: null, tags: location.type_de_demande_keys, format: (k) => k.replace('type_demande_', '').charAt(0).toUpperCase() + k.replace('type_demande_', '').slice(1) })
              return (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {stats.map((stat, idx) => (
                    <Stat key={idx} icon={stat.icon} label={stat.label} value={stat.value} tags={stat.tags} format={stat.format} />
                  ))}
                </div>
              )
            })()}

            {/* Tags + Amenities */}
            {(location.tags?.length > 0 || location.amenities?.length > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {location.tags?.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-on-surface-variant font-medium mb-2 flex items-center gap-1.5">
                      <Tag className="w-3 h-3" strokeWidth={1.75} />
                      Tags
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {location.tags.map(t => (
                        <span key={t} className="px-2 py-1 bg-gold/10 text-gold border border-gold/30 rounded text-xs">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {location.amenities?.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-on-surface-variant font-medium mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" strokeWidth={1.75} />
                      Amenities
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {location.amenities.map(a => (
                        <span key={a} className="px-2 py-1 bg-surface-low text-on-surface border border-outline-variant/30 rounded text-xs">
                          {getAmenityLabel(a)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Coordinates + Map link */}
            <div className="bg-surface-low rounded-lg p-3 sm:p-4 border border-outline-variant/25 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <p className="text-xs uppercase tracking-wider text-on-surface-variant font-medium mb-1">Coordinates</p>
                  <p className="font-mono text-xs sm:text-sm text-on-surface">
                    {Number(location.latitude).toFixed(5)}, {Number(location.longitude).toFixed(5)}
                  </p>
                </div>
                {location.google_maps_link && (
                  <a
                    href={location.google_maps_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold/15 hover:bg-gold/25 border border-gold/40 text-gold rounded text-xs transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" strokeWidth={1.75} />
                    Open in Maps
                  </a>
                )}
              </div>
            </div>

            {/* Map preview */}
            {location.latitude && location.longitude && (
              <div className="rounded-lg overflow-hidden">
                <LocationMap
                  latitude={Number(location.latitude)}
                  longitude={Number(location.longitude)}
                  label={location.name}
                  city={location.city}
                  country={location.country}
                  height={260}
                  zoom={14}
                  radius={600}
                />
              </div>
            )}

            {/* Metadata */}
            <div className="pt-3 border-t border-outline-variant/25 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-on-surface-variant">
              {location.created_at && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" strokeWidth={1.75} />
                  Created {new Date(location.created_at).toLocaleDateString()}
                </div>
              )}
              {location.updated_at && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" strokeWidth={1.75} />
                  Updated {new Date(location.updated_at).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer with actions */}
        <div className="flex items-center gap-2 px-4 sm:px-6 py-3 border-t border-outline-variant/25 bg-surface-low/50 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 sm:flex-none px-4 py-2 text-sm text-on-surface-variant hover:text-on-surface bg-surface-low border border-outline-variant/30 rounded transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => setShowPieces(true)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 text-sm border border-outline-variant/40 text-on-surface-variant hover:text-gold hover:border-gold rounded transition-colors"
          >
            <ImageIcon className="w-3.5 h-3.5" strokeWidth={2} />
            Pieces
          </button>
          <button
            onClick={() => onEdit(location)}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm bg-gold text-bg font-medium rounded hover:bg-gold-light transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" strokeWidth={2} />
            Edit
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function Stat({ icon: Icon, label, value, tags, format }) {
  return (
    <div className="bg-surface-low border border-outline-variant/25 rounded-lg p-2.5 sm:p-3">
      <div className="flex items-center gap-1.5 mb-2">
        <Icon className="w-3 h-3 text-gold" strokeWidth={1.75} />
        <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">{label}</p>
      </div>
      {value ? (
        <p className="font-display text-base sm:text-lg font-light text-on-surface capitalize">
          {value}
        </p>
      ) : tags ? (
        <div className="flex flex-wrap gap-1">
          {tags.map((tag, idx) => (
            <span key={idx} className="text-[10px] px-1.5 py-0.5 bg-gold/20 text-gold rounded border border-gold/40 whitespace-nowrap">
              {format ? format(tag) : tag}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-on-surface-variant">—</p>
      )}
    </div>
  )
}
