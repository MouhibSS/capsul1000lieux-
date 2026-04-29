import { useState, useEffect, useMemo } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Heart, Star, MapPin, Maximize2, Users, Check,
  ChevronLeft, ChevronRight, Calendar, Share2, ArrowUpRight, X,
  Zap, Home, Bath, Car, Image as ImageIcon, DoorOpen, FileText,
  CalendarDays, Sun, Sunset,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthContext } from '../context/AuthContext'
import { useFavoritesContext as useFavorites } from '../context/FavoritesContext'
import { useProfile } from '../hooks/useProfile'
import { useLanguage, useTranslation } from '../context/LanguageContext'
import { useLocationPieces } from '../hooks/useLocationPieces'
import LocationCard from '../components/LocationCard'
import LocationMap from '../components/LocationMap'
import ProfileCompletionModal from '../components/ProfileCompletionModal'
import BookingModal from '../components/BookingModal'
import ThemedCalendar from '../components/ThemedCalendar'
import LocationPieces from '../components/LocationPieces'

const ease = [0.22, 1, 0.36, 1]

const pageVariants = {
  initial: { opacity: 0 },
  enter: { opacity: 1, transition: { duration: 0.6, ease } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
}

// Image-prefix → room metadata.
const ROOM_META = {
  salon: { label: 'Salon', section: 'interior' },
  living: { label: 'Salon', section: 'interior' },
  cuisine: { label: 'Cuisine', section: 'interior' },
  kitchen: { label: 'Cuisine', section: 'interior' },
  chambre: { label: 'Chambre', section: 'interior' },
  bedroom: { label: 'Chambre', section: 'interior' },
  sdb: { label: 'Salle de bain', section: 'interior' },
  bathroom: { label: 'Salle de bain', section: 'interior' },
  bath: { label: 'Salle de bain', section: 'interior' },
  entree: { label: 'Entrée', section: 'interior' },
  entrance: { label: 'Entrée', section: 'interior' },
  bureau: { label: 'Bureau', section: 'interior' },
  office: { label: 'Bureau', section: 'interior' },
  couloir: { label: 'Couloir', section: 'interior' },
  hall: { label: 'Hall', section: 'interior' },
  exterior: { label: 'Extérieur', section: 'exterior' },
  exterieur: { label: 'Extérieur', section: 'exterior' },
  outdoor: { label: 'Extérieur', section: 'exterior' },
  jardin: { label: 'Jardin', section: 'exterior' },
  garden: { label: 'Jardin', section: 'exterior' },
  terrasse: { label: 'Toit-terrasse', section: 'exterior' },
  rooftop: { label: 'Toit-terrasse', section: 'exterior' },
  piscine: { label: 'Piscine', section: 'exterior' },
  pool: { label: 'Piscine', section: 'exterior' },
  parking: { label: 'Parking', section: 'exterior' },
  plage: { label: 'Plage', section: 'exterior' },
  facade: { label: 'Façade', section: 'exterior' },
}

function groupImagesByPrefix(imageUrls = []) {
  const groups = {}
  for (const url of imageUrls) {
    const name = String(url).split('/').pop().split('?')[0]
    const base = name.replace(/\.[^.]+$/, '').toLowerCase()
    const m = base.match(/^([a-zà-ÿ]+?)(?:[-_]\d+)?$/i)
    const key = (m?.[1] || 'other').toLowerCase()
    if (!groups[key]) groups[key] = []
    groups[key].push(url)
  }

  const buckets = { interior: [], exterior: [], other: [] }
  for (const [key, images] of Object.entries(groups)) {
    const meta = ROOM_META[key]
    const entry = {
      key,
      label: meta?.label || key.charAt(0).toUpperCase() + key.slice(1),
      images,
    }
    const sec = meta?.section || 'other'
    buckets[sec].push(entry)
  }

  const result = []
  if (buckets.interior.length) result.push({ section: 'Intérieur', rooms: buckets.interior })
  if (buckets.exterior.length) result.push({ section: 'Extérieur', rooms: buckets.exterior })
  if (buckets.other.length)    result.push({ section: 'Autres',    rooms: buckets.other })
  return result
}

function SpecRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-outline-variant/25">
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4 text-gold" strokeWidth={1.5} />
        <span className="eyebrow-sm text-on-surface-variant">{label}</span>
      </div>
      <span className="font-mono text-sm text-on-surface">{value}</span>
    </div>
  )
}

export default function LocationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const routerLocation = useLocation()
  const { user, loading: authLoading } = useAuthContext()
  const { toggle, isFavorite } = useFavorites()
  const { isProfileComplete } = useProfile()
  const { lang } = useLanguage()
  const { fetchPieces } = useLocationPieces()
  const [location, setLocation] = useState(null)
  const [similar, setSimilar] = useState([])
  const [pieces, setPieces] = useState([])
  const [loading, setLoading] = useState(true)
  const [imgIndex, setImgIndex] = useState(0)
  const [fullscreenOpen, setFullscreenOpen] = useState(false)
  const [touchStart, setTouchStart] = useState(null)
  const [bookingDate, setBookingDate] = useState('')
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [bookingModalOpen, setBookingModalOpen] = useState(false)
  const [successBanner, setSuccessBanner] = useState(null)
  const [tab, setTab] = useState('description') // 'pieces' | 'images' | 'description'
  const [activeRoomKey, setActiveRoomKey] = useState(null)
  const [lightbox, setLightbox] = useState(null) // { images, index, label }

  const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX)
  const handleTouchEnd = (e) => {
    if (touchStart === null || allGalleryImages.length === 0) return
    const distance = touchStart - e.changedTouches[0].clientX
    if (distance > 50) setImgIndex((i) => (i + 1) % allGalleryImages.length)
    if (distance < -50) setImgIndex((i) => (i - 1 + allGalleryImages.length) % allGalleryImages.length)
  }

  const handleBookNow = () => setBookingModalOpen(true)

  useEffect(() => {
    if (authLoading || !user || !location) return
    const justReturned = routerLocation.state?.bookingFlow || sessionStorage.getItem('pendingBooking') === '1'
    if (!justReturned) return
    sessionStorage.removeItem('pendingBooking')
    window.history.replaceState({}, document.title, window.location.pathname)
    if (!isProfileComplete()) {
      setSuccessBanner('Welcome! Complete your profile to finish your booking.')
      setProfileModalOpen(true)
    } else {
      setSuccessBanner('You\'re all set — pick your dates below to book.')
      setBookingModalOpen(true)
    }
    setTimeout(() => setSuccessBanner(null), 6000)
  }, [authLoading, user, location, routerLocation.state, isProfileComplete])

  useEffect(() => {
    async function fetchLocation() {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('id', id)
        .single()

      if (!error && data) {
        const mapped = {
          ...data,
          images: data.image_urls || [],
          coordinates: { lat: data.latitude, lng: data.longitude },
        }
        setLocation(mapped)

        const { data: similarData } = await supabase
          .from('locations')
          .select('*')
          .eq('type', data.type)
          .neq('id', id)
          .eq('published', true)
          .limit(3)

        if (similarData) {
          setSimilar(similarData.map((loc) => ({
            ...loc,
            images: loc.image_urls || [],
            coordinates: { lat: loc.latitude, lng: loc.longitude },
          })))
        }

        const piecesData = await fetchPieces(data.id)
        setPieces(piecesData || [])
      }
      setLoading(false)
    }
    fetchLocation()
  }, [id, fetchPieces])

  const groupedRooms = useMemo(
    () => (location ? groupImagesByPrefix(location.images) : []),
    [location]
  )

  const allGalleryImages = useMemo(() => {
    if (!location) return []

    const result = []

    result.push(...location.images.map((url) => ({
      url,
      label: null,
      subsection: null,
    })))

    pieces.forEach((piece) => {
      const subsectionName = lang === 'fr' ? (piece.name_fr || piece.subsection) : (piece.name_en || piece.subsection)
      if (piece.image_urls && piece.image_urls.length > 0) {
        piece.image_urls.forEach((url) => {
          result.push({
            url,
            label: subsectionName,
            subsection: piece.subsection,
          })
        })
      }
    })

    return result
  }, [location, pieces, lang])

  // Auto-pick the first room when entering Pièces tab
  useEffect(() => {
    if (tab !== 'pieces' || activeRoomKey) return
    const first = groupedRooms[0]?.rooms[0]
    if (first) setActiveRoomKey(first.key)
  }, [tab, groupedRooms, activeRoomKey])

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <p className="font-display text-5xl font-extralight text-on-surface/30 uppercase tracking-display">
          Loading...
        </p>
      </div>
    )

  if (!location)
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-center">
          <p className="font-display text-5xl font-extralight text-on-surface/30 mb-6 uppercase tracking-display">
            Space not found
          </p>
          <Link to="/explore" className="btn-ghost">Back to Explore</Link>
        </div>
      </div>
    )

  const fav = isFavorite(location.id)
  const halfPrice = Math.round(location.price * 0.55)
  const specs = location.specs || {}

  const allRooms = groupedRooms.flatMap((s) => s.rooms)
  const activeRoom = allRooms.find((r) => r.key === activeRoomKey) || allRooms[0]

  const openLightbox = (images, index, label) => setLightbox({ images, index, label })
  const closeLightbox = () => setLightbox(null)
  const lbStep = (delta) => {
    if (!lightbox) return
    const len = lightbox.images.length
    setLightbox({ ...lightbox, index: (lightbox.index + delta + len) % len })
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="enter"
      exit="exit"
      className="min-h-screen bg-bg"
    >
      {/* Success banner */}
      <AnimatePresence>
        {successBanner && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 max-w-md w-[calc(100%-2rem)]"
          >
            <div className="bg-gold text-bg px-5 py-3 rounded-lg shadow-xl flex items-center gap-3">
              <Check className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} />
              <p className="text-sm font-medium flex-1">{successBanner}</p>
              <button onClick={() => setSuccessBanner(null)} className="flex-shrink-0 hover:opacity-70 transition-opacity">
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breadcrumb + top actions */}
      <div className="container-main pt-20 md:pt-28 pb-3 md:pb-6 flex items-center justify-between gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-3 text-on-surface-variant hover:text-gold text-[10px] tracking-[0.35em] uppercase transition-colors group"
        >
          <span className="w-10 h-px bg-on-surface-variant group-hover:bg-gold group-hover:w-14 transition-all duration-500" />
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span>Back</span>
        </button>
        <div className="hidden md:flex items-center gap-6 eyebrow-sm text-on-surface-variant">
          <span>216 000 lieux</span>
          <span className="w-1 h-1 rounded-full bg-outline-variant" />
          <span>{location.type}</span>
          <span className="w-1 h-1 rounded-full bg-outline-variant" />
          <span>{location.city}</span>
          <span className="w-1 h-1 rounded-full bg-outline-variant" />
          <span className="text-gold">#{String(location.id).padStart(4, '0')}</span>
        </div>
      </div>

      {/* Editorial hero — title + coords + headline metrics */}
      <div className="container-main pb-8 md:pb-10 border-b border-outline-variant/25">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 items-end">
          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease }}
              className="flex items-center gap-3 mb-5 flex-wrap"
            >
              {(location.tags || []).map((t) => (
                <span key={t} className="chip-gold">{t}</span>
              ))}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease, delay: 0.1 }}
              className="font-display font-light text-3xl sm:text-5xl md:text-7xl lg:text-[7.5rem] leading-[0.9] tracking-display text-on-surface uppercase break-words"
            >
              {location.name}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, ease, delay: 0.25 }}
              className="flex items-center gap-5 mt-6 text-on-surface-variant text-sm flex-wrap"
            >
              <span className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-gold" strokeWidth={1.5} />
                {location.city}, {location.country}
              </span>
              <span className="w-1 h-1 rounded-full bg-outline-variant" />
              <span className="font-mono eyebrow-sm">
                {location.coordinates.lat?.toFixed(4)}°N · {location.coordinates.lng?.toFixed(4)}°E
              </span>
              <span className="w-1 h-1 rounded-full bg-outline-variant" />
              <span className="flex items-center gap-2">
                <Star className="w-3.5 h-3.5 text-gold" fill="currentColor" />
                <span className="text-on-surface">{location.rating}</span>
                <span>({location.reviews} reviews)</span>
              </span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.3 }}
            className="lg:col-span-4 lg:col-start-9 flex items-center gap-3 lg:justify-end"
          >
            <button className="w-12 h-12 border border-outline-variant/40 hover:border-gold hover:text-gold text-on-surface-variant flex items-center justify-center transition-colors" aria-label="Share">
              <Share2 className="w-4 h-4" strokeWidth={1.5} />
            </button>
            <button
              onClick={() => toggle(location.id)}
              className={`w-12 h-12 border flex items-center justify-center transition-colors ${
                fav ? 'bg-gold border-gold text-bg' : 'border-outline-variant/40 text-on-surface-variant hover:border-gold hover:text-gold'
              }`}
              aria-label="Save"
            >
              <Heart className="w-4 h-4" fill={fav ? 'currentColor' : 'none'} strokeWidth={1.5} />
            </button>
          </motion.div>
        </div>
      </div>

      {/* Hero gallery — one large + two small */}
      <div className="container-main pt-6 md:pt-10">
        {allGalleryImages.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 md:h-[70vh] md:min-h-[480px]">
            <div
              className="md:col-span-2 relative overflow-hidden group bg-surface-low h-[60vh] min-h-[320px] md:h-auto md:min-h-0 cursor-pointer"
              style={{ backgroundColor: location.fallback || '#1c1b1b' }}
              onClick={() => setFullscreenOpen(true)}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <motion.img
                key={imgIndex}
                src={allGalleryImages[imgIndex].url}
                alt={location.name}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease }}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg/40 via-transparent to-transparent pointer-events-none" />
              <button
                onClick={(e) => { e.stopPropagation(); setFullscreenOpen(true) }}
                className="absolute top-5 right-5 w-10 h-10 glass flex items-center justify-center text-on-surface hover:text-gold transition-colors opacity-0 group-hover:opacity-100 md:opacity-100"
                aria-label="Fullscreen"
              >
                <Maximize2 className="w-4 h-4" strokeWidth={1.5} />
              </button>
              {allGalleryImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); setImgIndex((i) => (i - 1 + allGalleryImages.length) % allGalleryImages.length) }}
                    className="absolute left-5 top-1/2 -translate-y-1/2 w-12 h-12 glass flex items-center justify-center text-on-surface hover:text-gold transition-colors"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setImgIndex((i) => (i + 1) % allGalleryImages.length) }}
                    className="absolute right-5 top-1/2 -translate-y-1/2 w-12 h-12 glass flex items-center justify-center text-on-surface hover:text-gold transition-colors"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                </>
              )}
              <div className="absolute bottom-5 left-5 font-mono eyebrow-sm text-on-surface bg-bg/50 backdrop-blur px-3 py-1.5 flex items-center gap-2">
                <span>{String(imgIndex + 1).padStart(2, '0')} / {String(allGalleryImages.length).padStart(2, '0')}</span>
                {allGalleryImages[imgIndex].label && (
                  <>
                    <span className="text-on-surface/40">·</span>
                    <span className="text-on-surface/70">{allGalleryImages[imgIndex].label}</span>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-1 md:grid-rows-2 gap-3 md:gap-4">
              {allGalleryImages.slice(1, 3).map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImgIndex(i + 1)}
                  className="relative overflow-hidden group bg-surface-low h-40 md:h-auto cursor-pointer"
                  style={{ backgroundColor: location.fallback || '#1c1b1b' }}
                >
                  <img src={img.url} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-bg/20 group-hover:bg-bg/0 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen image modal */}
      <AnimatePresence>
        {fullscreenOpen && allGalleryImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center"
            onClick={() => setFullscreenOpen(false)}
            onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}
          >
            <button onClick={() => setFullscreenOpen(false)} className="absolute top-4 md:top-6 right-4 md:right-6 p-2 text-white hover:text-gold transition-colors z-10" aria-label="Close fullscreen">
              <X className="w-6 h-6 md:w-8 md:h-8" strokeWidth={1.5} />
            </button>
            <motion.img
              key={`fullscreen-${imgIndex}`}
              src={allGalleryImages[imgIndex].url}
              alt={location.name}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            {allGalleryImages.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); setImgIndex((i) => (i - 1 + allGalleryImages.length) % allGalleryImages.length) }} className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 p-2 md:p-3 text-white hover:text-gold transition-colors" aria-label="Previous image">
                  <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" strokeWidth={1.5} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); setImgIndex((i) => (i + 1) % allGalleryImages.length) }} className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 p-2 md:p-3 text-white hover:text-gold transition-colors" aria-label="Next image">
                  <ChevronRight className="w-6 h-6 md:w-8 md:h-8" strokeWidth={1.5} />
                </button>
              </>
            )}
            <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 font-mono text-sm text-white bg-black/50 backdrop-blur px-4 py-2 rounded flex items-center gap-3">
              <span>{String(imgIndex + 1).padStart(2, '0')} / {String(allGalleryImages.length).padStart(2, '0')}</span>
              {allGalleryImages[imgIndex].label && (
                <>
                  <span className="text-white/40">·</span>
                  <span className="text-white/80">{allGalleryImages[imgIndex].label}</span>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs + global content area with sticky right rail */}
      <div className="container-main py-10 md:py-14 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-12 lg:gap-20">
          {/* LEFT — tabs + content */}
          <div className="lg:col-span-8 space-y-10 md:space-y-14">
            {/* Tabs nav */}
            <div className="sticky top-16 md:top-20 z-20 -mx-4 px-4 bg-bg/95 backdrop-blur-xl border-b border-outline-variant/30 pt-3 pb-3">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                {[
                  { k: 'description', label: 'Description', icon: FileText },
                  { k: 'pieces',      label: 'Pièces',      icon: DoorOpen },
                  { k: 'images',      label: 'Images',      icon: ImageIcon },
                ].map(({ k, label, icon: Icon }) => (
                  <button
                    key={k}
                    onClick={() => setTab(k)}
                    className={`flex items-center gap-2 px-5 py-3 text-[10px] tracking-[0.3em] uppercase transition-colors whitespace-nowrap border-b-2 ${
                      tab === k
                        ? 'text-gold border-gold'
                        : 'text-on-surface-variant border-transparent hover:text-gold'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {tab === 'description' && (
                <motion.div
                  key="description"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4, ease }}
                  className="space-y-12 md:space-y-16"
                >
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <span className="w-6 h-px bg-gold" />
                      <span className="eyebrow">About the space</span>
                    </div>
                    <p className="font-display text-xl md:text-3xl font-extralight leading-[1.4] text-on-surface max-w-2xl">
                      {location.description}
                    </p>
                  </section>

                  <section>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-outline-variant/25 border border-outline-variant/25">
                      {[
                        { label: 'Surface',  value: `${location.area} m²`,    icon: Maximize2 },
                        { label: 'Capacity', value: `${location.capacity} pax`, icon: Users },
                        { label: 'Type',     value: location.type,             icon: Home },
                        { label: 'Rating',   value: `${location.rating} ★`,    icon: Star },
                      ].map((m) => (
                        <div key={m.label} className="bg-bg p-5 md:p-6 flex flex-col gap-3 md:gap-4">
                          <m.icon className="w-4 h-4 text-gold" strokeWidth={1.5} />
                          <div>
                            <div className="font-display text-2xl md:text-4xl font-light text-on-surface tabular-nums">{m.value}</div>
                            <div className="eyebrow-sm text-on-surface-variant mt-1">{m.label}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center gap-3 mb-6 md:mb-8">
                      <span className="w-6 h-px bg-gold" />
                      <span className="eyebrow">Technical specs</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                      {specs.rooms !== undefined && <SpecRow icon={Home} label="Rooms" value={specs.rooms} />}
                      {specs.bathrooms !== undefined && <SpecRow icon={Bath} label="Bathrooms" value={specs.bathrooms} />}
                      {specs.ceiling && <SpecRow icon={Maximize2} label="Ceiling height" value={specs.ceiling} />}
                      {specs.power && <SpecRow icon={Zap} label="Power" value={specs.power} />}
                      {specs.parking && <SpecRow icon={Car} label="Parking" value={specs.parking} />}
                      <SpecRow icon={Maximize2} label="Total area" value={`${location.area} m²`} />
                    </div>
                  </section>

                  {(location.amenities || []).length > 0 && (
                    <section>
                      <div className="flex items-center gap-3 mb-6 md:mb-8">
                        <span className="w-6 h-px bg-gold" />
                        <span className="eyebrow">What's included</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                        {location.amenities.map((a) => (
                          <div key={a} className="flex items-center gap-3 py-3 border-b border-outline-variant/20">
                            <Check className="w-3.5 h-3.5 text-gold shrink-0" strokeWidth={1.5} />
                            <span className="text-on-surface text-sm font-light">{a}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  <section>
                    <div className="flex items-center justify-between mb-6 md:mb-8">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-px bg-gold" />
                        <span className="eyebrow">Location</span>
                      </div>
                      <span className="eyebrow-sm text-on-surface-variant">{location.city}, {location.country}</span>
                    </div>
                    <LocationMap
                      latitude={location.coordinates.lat}
                      longitude={location.coordinates.lng}
                      label={location.name}
                      city={location.city}
                      country={location.country}
                      height="clamp(360px, 55vh, 600px)"
                    />
                    <p className="text-on-surface-variant text-sm mt-4 font-light max-w-lg">
                      For privacy, only an approximate area is shown on the map. The exact address is shared by our team after your booking request is confirmed.
                    </p>
                  </section>
                </motion.div>
              )}

              {tab === 'pieces' && (
                <motion.div
                  key="pieces"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4, ease }}
                >
                  <LocationPieces locationId={location.id} />
                </motion.div>
              )}

              {tab === 'images' && (
                <motion.div
                  key="images"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4, ease }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-px bg-gold" />
                      <span className="eyebrow">Galerie</span>
                    </div>
                    <span className="font-mono eyebrow-sm text-on-surface-variant">
                      {allGalleryImages.length} photos
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                    {allGalleryImages.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => openLightbox(allGalleryImages.map(g => g.url), i, img.label)}
                        className="relative overflow-hidden bg-surface-low group aspect-[4/3]"
                      >
                        <img src={img.url} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-bg/15 group-hover:bg-bg/0 transition-colors" />
                        {img.label && (
                          <div className="absolute top-0 left-0 right-0 px-3 py-2 bg-gradient-to-b from-black/60 to-transparent">
                            <p className="text-white text-xs font-semibold uppercase tracking-wider">
                              {img.label}
                            </p>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT — global sticky booking (visible across all tabs) */}
          <aside className="lg:col-span-4">
            <div className="sticky top-28">
              <div className="border border-outline-variant/30 bg-surface-low">
                <div className="p-5 md:p-7 border-b border-outline-variant/30">
                  <div className="eyebrow-sm mb-2">Tarif</div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-4xl md:text-5xl font-light text-on-surface tabular-nums">
                      {location.currency}{location.price}
                    </span>
                    <span className="text-on-surface-variant text-sm">/ jour</span>
                  </div>
                  <div className="text-on-surface-variant text-xs mt-2 font-light">
                    Demi-journée · {location.currency}{halfPrice}
                  </div>
                </div>

                <div className="p-5 md:p-7 space-y-5">
                  <ThemedCalendar
                    label="Date"
                    value={bookingDate}
                    onChange={setBookingDate}
                  />
                </div>

                <div className="p-5 md:p-7 pt-0">
                  <button
                    onClick={handleBookNow}
                    disabled={!bookingDate}
                    className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Calendar className="w-3.5 h-3.5" strokeWidth={1.8} />
                    {bookingDate ? 'Continuer la demande' : 'Choisissez une date'}
                  </button>
                  <p className="text-on-surface-variant text-[10px] text-center mt-3 tracking-widest uppercase">
                    Aucun débit avant confirmation
                  </p>
                </div>
              </div>

              <div className="mt-5 md:mt-6 p-5 md:p-6 border border-outline-variant/30">
                <div className="eyebrow-sm mb-2">Speak to a scout</div>
                <p className="text-on-surface-variant text-sm mb-4 leading-relaxed font-light">
                  Need tailored recommendations or a multi-day production package? Our scouts reply within 24 hours.
                </p>
                <Link to="/contact" className="inline-flex items-center gap-3 text-on-surface hover:text-gold text-[10px] tracking-[0.35em] uppercase transition-colors group">
                  Get in touch
                  <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Pièces / Images lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={closeLightbox}
          >
            <button onClick={closeLightbox} className="absolute top-4 right-4 p-2 text-white hover:text-gold" aria-label="Close">
              <X className="w-6 h-6" strokeWidth={1.5} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); lbStep(-1) }} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white hover:text-gold" aria-label="Previous">
              <ChevronLeft className="w-7 h-7" strokeWidth={1.5} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); lbStep(1) }} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white hover:text-gold" aria-label="Next">
              <ChevronRight className="w-7 h-7" strokeWidth={1.5} />
            </button>
            <img
              src={lightbox.images[lightbox.index]}
              alt=""
              onClick={(e) => e.stopPropagation()}
              className="max-w-full max-h-full object-contain"
            />
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-sm text-white bg-black/50 backdrop-blur px-4 py-2 rounded flex items-center gap-3">
              <span>{String(lightbox.index + 1).padStart(2, '0')} / {String(lightbox.images.length).padStart(2, '0')}</span>
              {lightbox.label && (
                <>
                  <span className="text-white/40">·</span>
                  <span className="text-white/80">{lightbox.label}</span>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Similar */}
      {similar.length > 0 && (
        <section className="container-main pb-16 md:pb-28 pt-10 md:pt-12 border-t border-outline-variant/25">
          <div className="flex items-end justify-between mb-8 md:mb-12 flex-wrap gap-6">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <span className="w-6 h-px bg-gold" />
                <span className="eyebrow">Similar spaces</span>
              </div>
              <h2 className="font-display font-light text-3xl sm:text-4xl md:text-6xl leading-[0.9] tracking-display uppercase text-on-surface">
                More like <span className="stroke-text italic">this one</span>
              </h2>
            </div>
            <Link to="/explore" className="btn-ghost group">
              Browse all
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={1.8} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {similar.map((loc, i) => (
              <LocationCard key={loc.id} location={loc} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Mobile sticky bottom bar — global booking trigger */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-bg/95 backdrop-blur-xl border-t border-outline-variant/30 px-4 py-3 flex items-center gap-3 safe-bottom">
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1">
            <span className="font-display text-xl font-light text-on-surface tabular-nums">
              {location.currency}{location.price}
            </span>
            <span className="text-on-surface-variant text-xs">/ jour</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-on-surface-variant">
            <Star className="w-3 h-3 text-gold" fill="currentColor" />
            <span>{location.rating}</span>
            <span>·</span>
            <span className="truncate">{location.city}</span>
          </div>
        </div>
        <button
          onClick={handleBookNow}
          disabled={!bookingDate}
          className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-3 bg-gold text-bg font-semibold text-xs tracking-[0.18em] uppercase rounded hover:bg-gold-light transition-colors disabled:opacity-50"
        >
          <Calendar className="w-3.5 h-3.5" strokeWidth={1.8} />
          {bookingDate ? 'Réserver' : 'Date ?'}
        </button>
      </div>
      <div className="lg:hidden h-20" aria-hidden />

      {/* Modals */}
      <ProfileCompletionModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onComplete={() => { setProfileModalOpen(false); setBookingModalOpen(true) }}
      />
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        location={location}
        selectedDate={bookingDate}
      />
    </motion.div>
  )
}
