import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ArrowRight, ArrowLeft, X, ChevronDown } from 'lucide-react'
import { useFilterCategories } from '../hooks/useFilterCategories'
import { CITIES_BY_GOVERNORATE, GOVERNORATES_GROUPED, PLACE_TYPES_GROUPED, ARCHITECTURES_GROUPED, DECORATIONS_GROUPED } from '../components/AdvancedSearchBar'
import FileUploader from '../components/FileUploader'
import { supabase } from '../lib/supabase'

// Map governorate filter_category keys (gov_tunis, gov_ariana, ...) → CITIES_BY_GOVERNORATE keys (Tunis, Ariana, ...)
const GOV_KEY_TO_NAME = {
  gov_tunis: 'Tunis', gov_ariana: 'Ariana', gov_ben_arous: 'Ben Arous', gov_manouba: 'Manouba',
  gov_nabeul: 'Nabeul', gov_zaghouan: 'Zaghouan', gov_bizerte: 'Bizerte',
  gov_beja: 'Béja', gov_jendouba: 'Jendouba', gov_le_kef: 'Le Kef', gov_siliana: 'Siliana',
  gov_sousse: 'Sousse', gov_monastir: 'Monastir', gov_mahdia: 'Mahdia', gov_sfax: 'Sfax',
  gov_kairouan: 'Kairouan', gov_kasserine: 'Kasserine', gov_sidi_bouzid: 'Sidi Bouzid',
  gov_gabes: 'Gabès', gov_medenine: 'Médenine', gov_tataouine: 'Tataouine',
  gov_gafsa: 'Gafsa', gov_tozeur: 'Tozeur', gov_kebili: 'Kébili',
}

const ease = [0.22, 1, 0.36, 1]

const pageVariants = {
  initial: { opacity: 0 },
  enter: { opacity: 1, transition: { duration: 0.6, ease } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
}

const steps = ['Space', 'Details', 'Pricing', 'Photos']

// Styled dropdown matching Explore page
function StyledDropdown({ label, value, onChange, sections = [], placeholder = '— Sélectionnez —', required = false, disabled = false, multi = false }) {
  const [open, setOpen] = useState(false)
  const ref = useState(null)[1]
  const inputRef = useState(null)[1]

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (inputRef && !inputRef.contains?.(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const selectedLabel = useMemo(() => {
    if (multi) {
      if (!Array.isArray(value) || value.length === 0) return placeholder
      if (value.length === 1) {
        for (const sec of sections) {
          const opt = sec.options?.find(o => o.key === value[0])
          if (opt) return opt.label
        }
      }
      return `${value.length} sélectionné${value.length > 1 ? 's' : ''}`
    }
    if (!value) return placeholder
    for (const sec of sections) {
      const opt = sec.options?.find(o => o.key === value)
      if (opt) return opt.label
    }
    return placeholder
  }, [value, sections, placeholder, multi])

  return (
    <div>
      <label className="eyebrow-sm mb-2 block">{label}{required && ' *'}</label>
      <div className="relative" ref={inputRef}>
        <button
          type="button"
          onClick={() => setOpen(prev => !prev)}
          disabled={disabled}
          className="w-full flex items-center justify-between px-4 py-3 bg-transparent border border-outline-variant/40 text-on-surface text-sm outline-none focus:border-gold transition-colors font-light disabled:opacity-40 rounded hover:border-outline-variant/60"
        >
          <span className={value ? 'text-on-surface' : 'text-on-surface-variant'}>{selectedLabel}</span>
          <ChevronDown className={`w-4 h-4 text-on-surface-variant transition-transform duration-200 ${open ? 'rotate-180' : ''}`} strokeWidth={1.5} />
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 mt-2 bg-surface-low/95 backdrop-blur-md border border-outline-variant/30 rounded-lg z-30 max-h-64 overflow-y-auto shadow-lg p-3 min-w-full"
            >
              {sections.map((sec) => (
                <div key={sec.section} className="mb-3 last:mb-0">
                  <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 px-2">{sec.section}</p>
                  <div className="space-y-1">
                    {sec.options?.map((opt) => (
                      <label key={opt.key} className="flex items-center gap-2.5 px-2 py-1.5 rounded cursor-pointer hover:bg-gold/5 transition-colors group">
                        <input
                          type={multi ? 'checkbox' : 'radio'}
                          name={label}
                          checked={multi ? (Array.isArray(value) ? value.includes(opt.key) : false) : value === opt.key}
                          onChange={() => {
                            if (multi) {
                              const next = Array.isArray(value) && value.includes(opt.key)
                                ? value.filter(v => v !== opt.key)
                                : [...(Array.isArray(value) ? value : []), opt.key]
                              onChange(next)
                            } else {
                              onChange(opt.key)
                              setOpen(false)
                            }
                          }}
                          className="sr-only"
                        />
                        <span className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0 transition-all ${
                          (multi ? (Array.isArray(value) && value.includes(opt.key)) : value === opt.key)
                            ? 'bg-gold border-gold'
                            : 'border-on-surface-variant/50 group-hover:border-gold/60'
                        }`}>
                          {(multi ? (Array.isArray(value) && value.includes(opt.key)) : value === opt.key) && (
                            <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 text-bg" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M2 6l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
                        <span className="text-sm text-on-surface">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function ListSpace() {
  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [showReview, setShowReview] = useState(false)
  const [amenitiesOptions, setAmenitiesOptions] = useState([])
  const [form, setForm] = useState({
    name: '',
    governorate: '',
    city: '',
    address: '',
    googleMapsLink: '',
    type: '',
    architecture: [],
    decoration: [],
    area: '',
    capacity: '',
    description: '',
    price: '',
    amenities: [],
    imageUrls: [],
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
  })

  // Fetch amenities from filter_categories
  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const { data } = await supabase
          .from('filter_categories')
          .select('key, label')
          .eq('category_type', 'amenity')
          .eq('enabled', true)
        if (data) {
          setAmenitiesOptions(data)
        }
      } catch (err) {
        console.error('Error fetching amenities:', err)
      }
    }
    fetchAmenities()
  }, [])

  // Auto-show review when images are uploaded
  useEffect(() => {
    if (step === steps.length - 1 && form.imageUrls && form.imageUrls.length > 0) {
      setShowReview(true)
    }
  }, [form.imageUrls, step, steps.length])

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  // Build city sections scoped to selected governorate
  const citySections = useMemo(() => {
    if (!form.governorate) {
      return Object.entries(CITIES_BY_GOVERNORATE).map(([govKey, cities]) => {
        const govLabel = GOVERNORATES_GROUPED.flatMap(g => g.options).find(o => o.key === govKey)?.label || govKey
        return {
          section: govLabel,
          options: cities.map((c) => ({ key: c, label: c })),
        }
      })
    }
    const govLabel = GOVERNORATES_GROUPED.flatMap(g => g.options).find(o => o.key === form.governorate)?.label || form.governorate
    const cities = CITIES_BY_GOVERNORATE[form.governorate] || []
    return [{ section: govLabel, options: cities.map((c) => ({ key: c, label: c })) }]
  }, [form.governorate])
  const handleSubmit = async () => {
    // Validation
    if (!form.name || !form.governorate || !form.city || !form.type || !form.price || !form.ownerName || !form.ownerEmail) {
      alert('Please fill all required fields')
      return
    }

    try {
      const submitData = {
        name: form.name,
        governorate: form.governorate,
        city: form.city,
        address: form.address || null,
        google_maps_link: form.googleMapsLink || null,
        latitude: 35.7369,
        longitude: 10.7368,
        type: form.type,
        architecture_style: form.architecture && form.architecture.length > 0 ? form.architecture[0] : null,
        decoration_style: form.decoration && form.decoration.length > 0 ? form.decoration[0] : null,
        area: form.area ? parseFloat(form.area) : null,
        capacity: form.capacity ? parseInt(form.capacity) : null,
        description: form.description || null,
        price: parseFloat(form.price),
        currency: '€',
        amenities: Array.isArray(form.amenities) ? form.amenities : [],
        image_urls: Array.isArray(form.imageUrls) ? form.imageUrls : [],
        submitted_by_name: form.ownerName,
        submitted_by_email: form.ownerEmail,
        submitted_by_phone: form.ownerPhone || null,
        status: 'pending',
        published: false,
      }

      console.log('Submitting:', submitData)

      const { error } = await supabase
        .from('users_locations_listing')
        .insert([submitData])

      if (error) {
        console.error('Submit error:', error)
        alert(`Error submitting: ${error.message}`)
        return
      }

      setSubmitted(true)
    } catch (err) {
      console.error('Exception:', err)
      alert(`Error: ${err.message}`)
    }
  }

  const next = () => {
    if (step < steps.length - 1) {
      setStep((s) => s + 1)
    } else {
      setShowReview(true)
    }
  }
  const back = () => setStep((s) => s - 1)

  if (submitted)
    return (
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="enter"
        exit="exit"
        className="min-h-screen flex items-center justify-center bg-bg px-6"
      >
        <div className="text-center max-w-lg">
          <div className="diamond mx-auto mb-10">
            <Check className="w-5 h-5 text-gold" strokeWidth={1.5} />
          </div>
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="w-6 h-px bg-gold" />
            <span className="eyebrow">Submitted for review</span>
            <span className="w-6 h-px bg-gold" />
          </div>
          <h1 className="font-display font-light text-5xl md:text-7xl leading-[0.9] tracking-display uppercase text-on-surface mb-8">
            You're
            <br />
            <span className="text-gold-gradient italic">listed.</span>
          </h1>
          <p className="text-on-surface-variant text-base font-light leading-relaxed mb-10">
            A 216 000 lieux scout will review your space and schedule a visit within
            48 hours. Welcome to the index.
          </p>
          <Link to="/" className="btn-primary">
            Back to home
          </Link>
        </div>
      </motion.div>
    )

  return (
    <motion.div variants={pageVariants} initial="initial" animate="enter" exit="exit" className="min-h-screen bg-bg">
      {/* Hero */}
      <section className="pt-28 md:pt-36 pb-10 md:pb-14 border-b border-outline-variant/25 noise">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 items-end">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-6 h-px bg-gold" />
                <span className="eyebrow">For space owners</span>
              </div>
              <h1
                className="font-display font-light leading-[0.88] tracking-display uppercase text-on-surface"
                style={{ fontSize: 'clamp(2.6rem, 9vw, 9rem)' }}
              >
                List your
                <br />
                <span className="text-gold-gradient italic font-extralight">space.</span>
              </h1>
            </div>
            <p className="lg:col-span-4 text-on-surface-variant font-light leading-relaxed">
              Join 500+ Tunisian hosts earning from extraordinary properties —
              vetted productions, professional contracts, protected spaces.
            </p>
          </div>
        </div>
      </section>

      <section className="py-10 md:py-16">
        <div className="container-main max-w-3xl">
          {/* Progress */}
          <div className="flex items-center gap-0 mb-10 md:mb-14 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {steps.map((s, i) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 flex items-center justify-center text-[10px] font-semibold tracking-[0.2em] transition-all duration-400 ${
                      i < step
                        ? 'bg-gold text-bg'
                        : i === step
                        ? 'border border-gold text-gold bg-gold/5'
                        : 'border border-outline-variant/40 text-on-surface-variant'
                    }`}
                  >
                    {i < step ? <Check className="w-3.5 h-3.5" strokeWidth={2} /> : String(i + 1).padStart(2, '0')}
                  </div>
                  <span className="eyebrow-sm text-on-surface-variant mt-2 whitespace-nowrap">
                    {s}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`flex-1 h-px mx-3 transition-colors duration-400 ${
                      i < step ? 'bg-gold' : 'bg-outline-variant/40'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Form steps */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease }}
              className="border border-outline-variant/30 p-6 md:p-10 space-y-5 md:space-y-6"
            >
              {step === 0 && (
                <>
                  <h2 className="font-display text-2xl md:text-4xl font-light text-on-surface mb-4 uppercase tracking-display">
                    About your space
                  </h2>
                  <div>
                    <label className="eyebrow-sm mb-2 block">Space name *</label>
                    <input
                      className="w-full bg-transparent border border-outline-variant/40 py-3 px-4 text-on-surface text-sm outline-none focus:border-gold transition-colors font-light rounded"
                      placeholder="e.g. Dar El Médina"
                      value={form.name}
                      onChange={(e) => set('name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <StyledDropdown
                      label="Gouvernorat *"
                      value={form.governorate}
                      onChange={(v) => { set('governorate', v); set('city', '') }}
                      sections={GOVERNORATES_GROUPED}
                      required
                    />
                    <StyledDropdown
                      label="Ville *"
                      value={form.city}
                      onChange={(v) => set('city', v)}
                      sections={citySections}
                      disabled={!form.governorate}
                    />
                  </div>
                  <div>
                    <label className="eyebrow-sm mb-2 block">Adresse</label>
                    <input
                      className="w-full bg-transparent border border-outline-variant/40 py-3 px-4 text-on-surface text-sm outline-none focus:border-gold transition-colors font-light rounded"
                      placeholder="rue, quartier"
                      value={form.address}
                      onChange={(e) => set('address', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="eyebrow-sm mb-2 block">Google Maps Link</label>
                    <input
                      className="w-full bg-transparent border border-outline-variant/40 py-3 px-4 text-on-surface text-sm outline-none focus:border-gold transition-colors font-light rounded"
                      placeholder="Paste your Google Maps link"
                      value={form.googleMapsLink}
                      onChange={(e) => set('googleMapsLink', e.target.value)}
                    />
                    <p className="text-xs text-on-surface-variant mt-1">Share → Copy link on Google Maps, then paste here</p>
                  </div>
                  <StyledDropdown
                    label="Type de lieu *"
                    value={form.type}
                    onChange={(v) => set('type', v)}
                    sections={PLACE_TYPES_GROUPED}
                    required
                  />
                </>
              )}

              {step === 1 && (
                <>
                  <h2 className="font-display text-2xl md:text-4xl font-light text-on-surface mb-4 uppercase tracking-display">
                    Space details
                  </h2>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="eyebrow-sm mb-2 block">Area (m²)</label>
                      <input
                        className="w-full bg-transparent border border-outline-variant/40 py-3 px-4 text-on-surface text-sm outline-none focus:border-gold transition-colors font-light rounded"
                        placeholder="250"
                        type="number"
                        value={form.area}
                        onChange={(e) => set('area', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="eyebrow-sm mb-2 block">Max capacity</label>
                      <input
                        className="w-full bg-transparent border border-outline-variant/40 py-3 px-4 text-on-surface text-sm outline-none focus:border-gold transition-colors font-light rounded"
                        placeholder="30"
                        type="number"
                        value={form.capacity}
                        onChange={(e) => set('capacity', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <StyledDropdown
                      label="Style d'architecture"
                      value={form.architecture}
                      onChange={(v) => set('architecture', v)}
                      sections={ARCHITECTURES_GROUPED}
                      multi
                    />
                    <StyledDropdown
                      label="Style de décoration"
                      value={form.decoration}
                      onChange={(v) => set('decoration', v)}
                      sections={DECORATIONS_GROUPED}
                      multi
                    />
                  </div>
                  <div>
                    <label className="eyebrow-sm mb-2 block">Description</label>
                    <textarea
                      className="w-full bg-transparent border border-outline-variant/40 p-4 text-on-surface text-sm outline-none focus:border-gold transition-colors resize-none h-32 font-light rounded"
                      placeholder="Describe the character of your space — the light, the architecture, the feel…"
                      value={form.description}
                      onChange={(e) => set('description', e.target.value)}
                    />
                  </div>
                  <StyledDropdown
                    label="Amenities"
                    value={form.amenities}
                    onChange={(v) => set('amenities', v)}
                    sections={[{ section: 'Available', options: amenitiesOptions.map(a => ({ key: a.key, label: a.label })) }]}
                    multi
                  />
                </>
              )}

              {step === 2 && (
                <>
                  <h2 className="font-display text-2xl md:text-4xl font-light text-on-surface mb-4 uppercase tracking-display">
                    Pricing & contact
                  </h2>
                  <div>
                    <label className="eyebrow-sm mb-2 block">Day rate (€) *</label>
                    <input
                      className="w-full bg-transparent border border-outline-variant/40 py-3 px-4 text-on-surface text-sm outline-none focus:border-gold transition-colors font-light rounded"
                      placeholder="500"
                      type="number"
                      value={form.price}
                      onChange={(e) => set('price', e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="eyebrow-sm mb-2 block">Full name *</label>
                      <input
                        className="w-full bg-transparent border border-outline-variant/40 py-3 px-4 text-on-surface text-sm outline-none focus:border-gold transition-colors font-light rounded"
                        placeholder="Youssef Belhadj"
                        value={form.ownerName}
                        onChange={(e) => set('ownerName', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="eyebrow-sm mb-2 block">Email *</label>
                      <input
                        className="w-full bg-transparent border border-outline-variant/40 py-3 px-4 text-on-surface text-sm outline-none focus:border-gold transition-colors font-light rounded"
                        placeholder="you@example.com"
                        type="email"
                        value={form.ownerEmail}
                        onChange={(e) => set('ownerEmail', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="eyebrow-sm mb-2 block">Phone</label>
                    <input
                      className="w-full bg-transparent border border-outline-variant/40 py-3 px-4 text-on-surface text-sm outline-none focus:border-gold transition-colors font-light rounded"
                      placeholder="+216 XX XXX XXX"
                      type="tel"
                      value={form.ownerPhone}
                      onChange={(e) => set('ownerPhone', e.target.value)}
                    />
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <h2 className="font-display text-2xl md:text-4xl font-light text-on-surface mb-2 uppercase tracking-display">
                    Add photos (optional)
                  </h2>
                  <p className="text-on-surface-variant text-sm font-light mb-6">
                    High-quality photos dramatically increase your booking rate. We will also schedule an editorial shoot at no cost after the visit.
                    <br />
                    <span className="text-xs mt-2 block">Photos are optional — you can submit without them.</span>
                  </p>
                  <FileUploader
                    listingId={Date.now().toString()}
                    maxFiles={10}
                    onUploadComplete={(urls) => set('imageUrls', urls)}
                  />
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Nav */}
          <div className="flex items-center justify-between mt-6 md:mt-8 gap-3 flex-wrap">
            <button
              onClick={back}
              disabled={step === 0}
              className="btn-ghost disabled:opacity-30 disabled:cursor-not-allowed group"
            >
              <ArrowLeft
                className="w-3.5 h-3.5 transition-transform duration-500 group-hover:-translate-x-0.5"
                strokeWidth={1.8}
              />
              Back
            </button>
            <button onClick={next} className="btn-primary group">
              {step === steps.length - 1 ? 'Review & Submit' : 'Continue'}
              <ArrowRight
                className="w-3.5 h-3.5 transition-transform duration-500 group-hover:translate-x-0.5"
                strokeWidth={1.8}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Review Modal */}
      <AnimatePresence>
        {showReview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowReview(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-bg border border-outline-variant/30 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 md:p-10 border-b border-outline-variant/30">
                <h2 className="font-display text-3xl md:text-4xl font-light text-on-surface uppercase tracking-display">
                  Review your space
                </h2>
                <p className="text-on-surface-variant text-sm mt-2">Check everything looks good before posting</p>
              </div>

              <div className="p-6 md:p-10 space-y-6">
                {/* Space Info */}
                <div>
                  <h3 className="eyebrow-sm text-on-surface-variant mb-3">Space Information</h3>
                  <div className="space-y-2">
                    <p><strong>{form.name}</strong></p>
                    <p className="text-on-surface-variant text-sm">{form.city}, {form.governorate}</p>
                    {form.address && <p className="text-on-surface-variant text-sm">{form.address}</p>}
                    {form.googleMapsLink && (
                      <a href={form.googleMapsLink} target="_blank" rel="noopener noreferrer" className="text-gold text-sm hover:text-gold-light">
                        View on Google Maps →
                      </a>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="eyebrow-sm text-on-surface-variant mb-1">Type</p>
                    <p className="text-on-surface">{PLACE_TYPES_GROUPED.flatMap(g => g.options).find(o => o.key === form.type)?.label || form.type}</p>
                  </div>
                  <div>
                    <p className="eyebrow-sm text-on-surface-variant mb-1">Price</p>
                    <p className="text-on-surface font-mono">€{form.price}/day</p>
                  </div>
                  {form.area && (
                    <div>
                      <p className="eyebrow-sm text-on-surface-variant mb-1">Area</p>
                      <p className="text-on-surface">{form.area}m²</p>
                    </div>
                  )}
                  {form.capacity && (
                    <div>
                      <p className="eyebrow-sm text-on-surface-variant mb-1">Capacity</p>
                      <p className="text-on-surface">{form.capacity} people</p>
                    </div>
                  )}
                </div>

                {/* Description */}
                {form.description && (
                  <div>
                    <p className="eyebrow-sm text-on-surface-variant mb-2">Description</p>
                    <p className="text-on-surface text-sm leading-relaxed">{form.description}</p>
                  </div>
                )}

                {/* Styles */}
                {(form.architecture.length > 0 || form.decoration.length > 0) && (
                  <div className="grid grid-cols-2 gap-4">
                    {form.architecture.length > 0 && (
                      <div>
                        <p className="eyebrow-sm text-on-surface-variant mb-2">Architecture</p>
                        <div className="flex flex-wrap gap-1">
                          {form.architecture.map(key => (
                            <span key={key} className="text-xs bg-gold/10 text-gold px-2 py-1 rounded">
                              {ARCHITECTURES_GROUPED.flatMap(g => g.options).find(o => o.key === key)?.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {form.decoration.length > 0 && (
                      <div>
                        <p className="eyebrow-sm text-on-surface-variant mb-2">Decoration</p>
                        <div className="flex flex-wrap gap-1">
                          {form.decoration.map(key => (
                            <span key={key} className="text-xs bg-gold/10 text-gold px-2 py-1 rounded">
                              {DECORATIONS_GROUPED.flatMap(g => g.options).find(o => o.key === key)?.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Amenities */}
                {form.amenities.length > 0 && (
                  <div>
                    <p className="eyebrow-sm text-on-surface-variant mb-2">Amenities</p>
                    <div className="flex flex-wrap gap-2">
                      {form.amenities.map(key => (
                        <span key={key} className="text-xs bg-gold/10 text-gold px-3 py-1.5 rounded">
                          {amenitiesOptions.find(a => a.key === key)?.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Images */}
                {form.imageUrls.length > 0 && (
                  <div>
                    <p className="eyebrow-sm text-on-surface-variant mb-2">{form.imageUrls.length} Images</p>
                    <div className="grid grid-cols-3 gap-2">
                      {form.imageUrls.map((url, i) => (
                        <img key={i} src={url} alt={`Upload ${i + 1}`} className="w-full h-24 object-cover rounded" />
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact Info */}
                <div className="border-t border-outline-variant/30 pt-6">
                  <h3 className="eyebrow-sm text-on-surface-variant mb-3">Your Contact</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>{form.ownerName}</strong></p>
                    <p className="text-on-surface-variant">{form.ownerEmail}</p>
                    {form.ownerPhone && <p className="text-on-surface-variant">{form.ownerPhone}</p>}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 md:p-10 border-t border-outline-variant/30 flex gap-3 justify-end">
                <button
                  onClick={() => setShowReview(false)}
                  className="px-6 py-2.5 border border-outline-variant rounded hover:bg-surface-low transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    setShowReview(false)
                    handleSubmit()
                  }}
                  className="btn-primary"
                >
                  Post for Review
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
