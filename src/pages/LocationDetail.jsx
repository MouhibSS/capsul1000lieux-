import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Heart, Star, MapPin, Maximize2, Users, Check,
  ChevronLeft, ChevronRight, Calendar, Share2, ArrowUpRight, X,
  Zap, Home, Bath, Car,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthContext } from '../context/AuthContext'
import { useFavoritesContext as useFavorites } from '../context/FavoritesContext'
import { useProfile } from '../hooks/useProfile'
import LocationCard from '../components/LocationCard'
import LocationMap from '../components/LocationMap'
import ProfileCompletionModal from '../components/ProfileCompletionModal'
import BookingModal from '../components/BookingModal'
import ThemedCalendar from '../components/ThemedCalendar'

const ease = [0.22, 1, 0.36, 1]

const pageVariants = {
  initial: { opacity: 0 },
  enter: { opacity: 1, transition: { duration: 0.6, ease } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
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
  const { profile, isProfileComplete } = useProfile()
  const [location, setLocation] = useState(null)
  const [similar, setSimilar] = useState([])
  const [loading, setLoading] = useState(true)
  const [imgIndex, setImgIndex] = useState(0)
  const [fullscreenOpen, setFullscreenOpen] = useState(false)
  const [touchStart, setTouchStart] = useState(null)
  const [bookingDate, setBookingDate] = useState('')
  const [bookingDays, setBookingDays] = useState(1)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [bookingModalOpen, setBookingModalOpen] = useState(false)
  const [successBanner, setSuccessBanner] = useState(null)

  const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX)
  const handleTouchEnd = (e) => {
    if (touchStart === null) return
    const distance = touchStart - e.changedTouches[0].clientX
    if (distance > 50) setImgIndex((i) => (i + 1) % location.images.length)
    if (distance < -50) setImgIndex((i) => (i - 1 + location.images.length) % location.images.length)
  }

  const handleBookNow = () => {
    if (!user) {
      navigate('/login', {
        state: {
          from: { pathname: `/location/${id}` },
          pendingBooking: true,
        },
      })
      return
    }

    if (!isProfileComplete()) {
      setProfileModalOpen(true)
      return
    }

    setBookingModalOpen(true)
  }

  // Handle post-login/post-profile booking flow continuation
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
        const mappedLocation = {
          ...data,
          images: data.image_urls || [],
          coordinates: {
            lat: data.latitude,
            lng: data.longitude,
          },
        }
        setLocation(mappedLocation)

        // Fetch similar locations
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
            coordinates: {
              lat: loc.latitude,
              lng: loc.longitude,
            },
          })))
        }
      }
      setLoading(false)
    }

    fetchLocation()
  }, [id])

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
          <Link to="/explore" className="btn-ghost">
            Back to Explore
          </Link>
        </div>
      </div>
    )
  const fav = isFavorite(location.id)
  const serviceFee = Math.round(location.price * bookingDays * 0.08)
  const total = location.price * bookingDays + serviceFee

  const specs = location.specs || {}

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
              {location.tags.map((t) => (
                <span key={t} className="chip-gold">
                  {t}
                </span>
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
                {location.coordinates.lat.toFixed(4)}°N ·{' '}
                {location.coordinates.lng.toFixed(4)}°E
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
            <button
              className="w-12 h-12 border border-outline-variant/40 hover:border-gold hover:text-gold text-on-surface-variant flex items-center justify-center transition-colors"
              aria-label="Share"
            >
              <Share2 className="w-4 h-4" strokeWidth={1.5} />
            </button>
            <button
              onClick={() => toggle(location.id)}
              className={`w-12 h-12 border flex items-center justify-center transition-colors ${
                fav
                  ? 'bg-gold border-gold text-bg'
                  : 'border-outline-variant/40 text-on-surface-variant hover:border-gold hover:text-gold'
              }`}
              aria-label="Save"
            >
              <Heart className="w-4 h-4" fill={fav ? 'currentColor' : 'none'} strokeWidth={1.5} />
            </button>
          </motion.div>
        </div>
      </div>

      {/* Gallery — one large + two small */}
      <div className="container-main pt-6 md:pt-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 md:h-[70vh] md:min-h-[480px]">
          <div className="md:col-span-2 relative overflow-hidden group bg-surface-low h-[60vh] min-h-[320px] md:h-auto md:min-h-0 cursor-pointer"
               style={{ backgroundColor: location.fallback || '#1c1b1b' }}
               onClick={() => setFullscreenOpen(true)}
               onTouchStart={handleTouchStart}
               onTouchEnd={handleTouchEnd}>
            <motion.img
              key={imgIndex}
              src={location.images[imgIndex]}
              alt={location.name}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease }}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg/40 via-transparent to-transparent pointer-events-none" />

            {/* Fullscreen button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setFullscreenOpen(true)
              }}
              className="absolute top-5 right-5 w-10 h-10 glass flex items-center justify-center text-on-surface hover:text-gold transition-colors opacity-0 group-hover:opacity-100 md:opacity-100"
              aria-label="Fullscreen"
            >
              <Maximize2 className="w-4 h-4" strokeWidth={1.5} />
            </button>

            {location.images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setImgIndex((i) => (i - 1 + location.images.length) % location.images.length)
                  }}
                  className="absolute left-5 top-1/2 -translate-y-1/2 w-12 h-12 glass flex items-center justify-center text-on-surface hover:text-gold transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setImgIndex((i) => (i + 1) % location.images.length)
                  }}
                  className="absolute right-5 top-1/2 -translate-y-1/2 w-12 h-12 glass flex items-center justify-center text-on-surface hover:text-gold transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </>
            )}

            <div className="absolute bottom-5 left-5 font-mono eyebrow-sm text-on-surface bg-bg/50 backdrop-blur px-3 py-1.5">
              {String(imgIndex + 1).padStart(2, '0')} / {String(location.images.length).padStart(2, '0')}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-1 md:grid-rows-2 gap-3 md:gap-4">
            {location.images.slice(1, 3).map((src, i) => (
              <button
                key={i}
                onClick={() => setImgIndex(i + 1)}
                className="relative overflow-hidden group bg-surface-low h-40 md:h-auto cursor-pointer"
                style={{ backgroundColor: location.fallback || '#1c1b1b' }}
              >
                <img
                  src={src}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-bg/20 group-hover:bg-bg/0 transition-colors" />
              </button>
            ))}
          </div>
        </div>

        {/* Thumbs */}
        {location.images.length > 1 && (
          <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2">
            {location.images.map((src, i) => (
              <button
                key={i}
                onClick={() => setImgIndex(i)}
                className={`relative w-20 h-14 flex-shrink-0 overflow-hidden transition-all cursor-pointer ${
                  i === imgIndex
                    ? 'ring-1 ring-gold'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen image modal */}
      <AnimatePresence>
        {fullscreenOpen && location && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center"
            onClick={() => setFullscreenOpen(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Close button */}
            <button
              onClick={() => setFullscreenOpen(false)}
              className="absolute top-4 md:top-6 right-4 md:right-6 p-2 text-white hover:text-gold transition-colors z-10"
              aria-label="Close fullscreen"
            >
              <X className="w-6 h-6 md:w-8 md:h-8" strokeWidth={1.5} />
            </button>

            {/* Main image */}
            <motion.img
              key={`fullscreen-${imgIndex}`}
              src={location.images[imgIndex]}
              alt={location.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Navigation arrows */}
            {location.images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setImgIndex((i) => (i - 1 + location.images.length) % location.images.length)
                  }}
                  className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 p-2 md:p-3 text-white hover:text-gold transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" strokeWidth={1.5} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setImgIndex((i) => (i + 1) % location.images.length)
                  }}
                  className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 p-2 md:p-3 text-white hover:text-gold transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6 md:w-8 md:h-8" strokeWidth={1.5} />
                </button>
              </>
            )}

            {/* Image counter */}
            <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 font-mono text-sm text-white bg-black/50 backdrop-blur px-4 py-2 rounded">
              {String(imgIndex + 1).padStart(2, '0')} / {String(location.images.length).padStart(2, '0')}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content — two-col with sticky booking */}
      <div className="container-main py-14 md:py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-12 lg:gap-20">
          {/* LEFT */}
          <div className="lg:col-span-8 space-y-12 md:space-y-20">
            {/* About */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <span className="w-6 h-px bg-gold" />
                <span className="eyebrow">About the space</span>
              </div>
              <p className="font-display text-xl md:text-3xl font-extralight leading-[1.4] text-on-surface max-w-2xl">
                {location.description}
              </p>
            </section>

            {/* Key metrics */}
            <section>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-outline-variant/25 border border-outline-variant/25">
                {[
                  { label: 'Surface', value: `${location.area} m²`, icon: Maximize2 },
                  { label: 'Capacity', value: `${location.capacity} pax`, icon: Users },
                  { label: 'Type', value: location.type, icon: Home },
                  { label: 'Rating', value: `${location.rating} ★`, icon: Star },
                ].map((m) => (
                  <div key={m.label} className="bg-bg p-5 md:p-6 flex flex-col gap-3 md:gap-4">
                    <m.icon className="w-4 h-4 text-gold" strokeWidth={1.5} />
                    <div>
                      <div className="font-display text-2xl md:text-4xl font-light text-on-surface tabular-nums">
                        {m.value}
                      </div>
                      <div className="eyebrow-sm text-on-surface-variant mt-1">{m.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Specs */}
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

            {/* Amenities */}
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

            {/* Map */}
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
                zoom={14}
                radius={1000}
              />
              <p className="text-on-surface-variant text-sm mt-4 font-light max-w-lg">
                For privacy, only an approximate area is shown on the map.
                The exact address is shared by our team after your booking
                request is confirmed.
              </p>
            </section>
          </div>

          {/* RIGHT — sticky booking */}
          <aside className="lg:col-span-4">
            <div className="sticky top-28">
              <div className="border border-outline-variant/30 bg-surface-low">
                <div className="p-5 md:p-7 border-b border-outline-variant/30">
                  <div className="eyebrow-sm mb-2">Rate</div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-4xl md:text-5xl font-light text-on-surface tabular-nums">
                      {location.currency}
                      {location.price}
                    </span>
                    <span className="text-on-surface-variant text-sm">/ day</span>
                  </div>
                </div>

                <div className="p-5 md:p-7 space-y-5">
                  <ThemedCalendar
                    label="Start date"
                    value={bookingDate}
                    onChange={setBookingDate}
                  />

                  <div>
                    <label className="eyebrow-sm text-on-surface-variant mb-2 block">
                      Duration
                    </label>
                    <div className="flex items-center border border-outline-variant/40">
                      <button
                        onClick={() => setBookingDays((d) => Math.max(1, d - 1))}
                        className="w-12 h-12 text-gold hover:bg-surface-container transition-colors text-xl"
                      >
                        −
                      </button>
                      <span className="flex-1 text-center text-on-surface text-sm">
                        {bookingDays} day{bookingDays > 1 ? 's' : ''}
                      </span>
                      <button
                        onClick={() => setBookingDays((d) => d + 1)}
                        className="w-12 h-12 text-gold hover:bg-surface-container transition-colors text-xl"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-5 md:p-7 border-t border-outline-variant/30 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">
                      {location.currency}
                      {location.price} × {bookingDays} day{bookingDays > 1 ? 's' : ''}
                    </span>
                    <span className="text-on-surface tabular-nums">
                      {location.currency}
                      {location.price * bookingDays}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Service fee</span>
                    <span className="text-on-surface tabular-nums">
                      {location.currency}
                      {serviceFee}
                    </span>
                  </div>
                  <div className="flex justify-between pt-4 border-t border-outline-variant/30">
                    <span className="eyebrow text-on-surface">Total</span>
                    <span className="font-display text-2xl font-light text-gold tabular-nums">
                      {location.currency}
                      {total}
                    </span>
                  </div>
                </div>

                <div className="p-5 md:p-7 pt-0">
                  <button onClick={handleBookNow} className="btn-primary w-full">
                    <Calendar className="w-3.5 h-3.5" strokeWidth={1.8} />
                    Request Booking
                  </button>
                  <p className="text-on-surface-variant text-[10px] text-center mt-3 tracking-widest uppercase">
                    You won't be charged until confirmed
                  </p>
                </div>
              </div>

              {/* Scout contact */}
              <div className="mt-5 md:mt-6 p-5 md:p-6 border border-outline-variant/30">
                <div className="eyebrow-sm mb-2">Speak to a scout</div>
                <p className="text-on-surface-variant text-sm mb-4 leading-relaxed font-light">
                  Need tailored recommendations or a multi-day production
                  package? Our scouts reply within 24 hours.
                </p>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-3 text-on-surface hover:text-gold text-[10px] tracking-[0.35em] uppercase transition-colors group"
                >
                  Get in touch
                  <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>

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
              <ArrowUpRight
                className="w-3.5 h-3.5 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                strokeWidth={1.8}
              />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {similar.map((loc, i) => (
              <LocationCard key={loc.id} location={loc} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Mobile sticky bottom bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-bg/95 backdrop-blur-xl border-t border-outline-variant/30 px-4 py-3 flex items-center gap-3 safe-bottom">
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1">
            <span className="font-display text-xl font-light text-on-surface tabular-nums">
              {location.currency}{location.price}
            </span>
            <span className="text-on-surface-variant text-xs">/ day</span>
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
          className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-3 bg-gold text-bg font-semibold text-xs tracking-[0.18em] uppercase rounded hover:bg-gold-light transition-colors"
        >
          <Calendar className="w-3.5 h-3.5" strokeWidth={1.8} />
          Book
        </button>
      </div>
      <div className="lg:hidden h-20" aria-hidden />

      {/* Modals */}
      <ProfileCompletionModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onComplete={() => {
          setProfileModalOpen(false)
          setBookingModalOpen(true)
        }}
      />
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        location={location}
      />
    </motion.div>
  )
}
