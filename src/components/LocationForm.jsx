import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { X } from 'lucide-react'

function parseGoogleMapsUrl(input) {
  if (!input) return null
  const raw = String(input).trim()
  if (!raw) return null

  const rawCoords = raw.match(/^\s*(-?\d{1,3}(?:\.\d+)?)[,\s]+(-?\d{1,3}(?:\.\d+)?)\s*$/)
  if (rawCoords) {
    const lat = parseFloat(rawCoords[1])
    const lng = parseFloat(rawCoords[2])
    if (Number.isFinite(lat) && Number.isFinite(lng) &&
        Math.abs(lat) <= 90 && Math.abs(lng) <= 180) return { lat, lng }
  }

  const patterns = [
    /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,
    /!8m2!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,
    /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /[?&]query=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /[?&]q=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /[?&]q=loc:(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /[?&]ll=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /[?&]center=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /[?&]destination=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /\/place\/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
  ]
  for (const re of patterns) {
    const m = raw.match(re)
    if (m) {
      const lat = parseFloat(m[1])
      const lng = parseFloat(m[2])
      if (Number.isFinite(lat) && Number.isFinite(lng) &&
          Math.abs(lat) <= 90 && Math.abs(lng) <= 180) return { lat, lng }
    }
  }
  return null
}

function isShortMapsLink(input) {
  return /^https?:\/\/(maps\.app\.goo\.gl|goo\.gl\/maps)/i.test(String(input).trim())
}

const cities = ['Tunis', 'Sidi Bou Said', 'La Marsa', 'Hammamet', 'Sousse', 'Djerba', 'Tozeur', 'Kairouan', 'Tataouine', 'Matmata', 'Carthage', 'Nabeul']

export default function LocationForm({ initialData, onSubmit, onCancel }) {
  const [filterCategories, setFilterCategories] = useState({
    placeTypes: [],
    architectureStyles: [],
    decorationStyles: [],
    amenities: [],
  })
  const [categoriesLoading, setCategoriesLoading] = useState(true)

  const emptyForm = {
    name: '',
    city: '',
    type: '',
    description: '',
    price: '',
    currency: '€',
    rating: '',
    reviews: '',
    capacity: '',
    area: '',
    latitude: '',
    longitude: '',
    google_maps_link: '',
    tags: '',
    amenities: [],
    image_urls: '',
    featured: false,
    trending: false,
    status: 'draft',
    specs: '{}',
    fallback: '',
    place_type_keys: [],
    architecture_style_keys: [],
    decoration_style_keys: [],
  }

  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [mapsUrl, setMapsUrl] = useState('')
  const [mapsHint, setMapsHint] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  // Fetch filter categories from Supabase
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('filter_categories')
          .select('key, label, category_type')
          .eq('enabled', true)
          .order('display_order', { ascending: true })

        if (error) throw error

        const grouped = {
          placeTypes: [],
          architectureStyles: [],
          decorationStyles: [],
          amenities: [],
        }

        data?.forEach(cat => {
          if (cat.category_type === 'placeType') {
            grouped.placeTypes.push({ key: cat.key, label: cat.label })
          } else if (cat.category_type === 'architectureStyle') {
            grouped.architectureStyles.push({ key: cat.key, label: cat.label })
          } else if (cat.category_type === 'decorationStyle') {
            grouped.decorationStyles.push({ key: cat.key, label: cat.label })
          } else if (cat.category_type === 'amenity') {
            grouped.amenities.push({ key: cat.key, label: cat.label })
          }
        })

        setFilterCategories(grouped)
      } catch (err) {
        console.error('Error fetching filter categories:', err)
      } finally {
        setCategoriesLoading(false)
      }
    }

    fetchCategories()
  }, [])

  useEffect(() => {
    if (initialData) {
      setForm({
        id: initialData.id || '',
        name: initialData.name || '',
        city: initialData.city || '',
        type: initialData.type || '',
        description: initialData.description || '',
        price: initialData.price || '',
        currency: initialData.currency || '€',
        rating: initialData.rating || '',
        reviews: initialData.reviews || '',
        capacity: initialData.capacity || '',
        area: initialData.area || '',
        latitude: initialData.latitude || '',
        longitude: initialData.longitude || '',
        google_maps_link: initialData.google_maps_link || '',
        tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : initialData.tags || '',
        amenities: Array.isArray(initialData.amenities) ? initialData.amenities : [],
        image_urls: Array.isArray(initialData.image_urls) ? initialData.image_urls.join(', ') : initialData.image_urls || '',
        featured: Boolean(initialData.featured),
        trending: Boolean(initialData.trending),
        status: initialData.archived
          ? 'archived'
          : initialData.published
          ? 'published'
          : 'draft',
        specs: initialData.specs ? JSON.stringify(initialData.specs) : '{}',
        fallback: initialData.fallback || '',
        place_type_keys: Array.isArray(initialData.place_type_keys) ? initialData.place_type_keys : [],
        architecture_style_keys: Array.isArray(initialData.architecture_style_keys) ? initialData.architecture_style_keys : [],
        decoration_style_keys: Array.isArray(initialData.decoration_style_keys) ? initialData.decoration_style_keys : [],
      })
    } else {
      setForm(emptyForm)
    }
    setMapsUrl(initialData?.google_maps_link || '')
    setMapsHint(initialData?.google_maps_link ? {
      type: 'ok',
      msg: `✓ Saved link · coords ${Number(initialData.latitude).toFixed(5)}, ${Number(initialData.longitude).toFixed(5)}`,
    } : null)
    setErrors({})
    setSubmitError(null)
  }, [initialData])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const applyCoords = (coords, mapUrl) => {
    set('latitude', String(coords.lat))
    set('longitude', String(coords.lng))
    if (mapUrl) set('google_maps_link', mapUrl)
    setErrors(prev => ({ ...prev, latitude: undefined, longitude: undefined }))
    setMapsHint({
      type: 'ok',
      msg: `✓ Coordinates extracted: ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`,
    })
  }

  const handleMapsInput = (raw) => {
    setMapsUrl(raw)
    if (!raw || !raw.trim()) { setMapsHint(null); return }

    const coords = parseGoogleMapsUrl(raw)
    if (coords) { applyCoords(coords, raw); return }

    if (isShortMapsLink(raw)) {
      setMapsHint({
        type: 'warn',
        msg: 'Short link — open it in your browser, then copy the FULL URL from the address bar (after the map loads) and paste it here.',
      })
      return
    }

    setMapsHint({
      type: 'warn',
      msg: 'No coordinates found. Paste a full Google Maps URL or raw "36.85, 10.21".',
    })
  }

  const validateForm = () => {
    const newErrors = {}
    if (!form.name) newErrors.name = 'Name is required'
    if (!form.city) newErrors.city = 'City is required'
    if (form.price === '' || form.price === null || form.price === undefined) newErrors.price = 'Price is required'
    if (form.latitude === '' || form.latitude === null || form.latitude === undefined) newErrors.latitude = 'Latitude is required'
    if (form.longitude === '' || form.longitude === null || form.longitude === undefined) newErrors.longitude = 'Longitude is required'
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) {
      console.warn('[LocationForm] Validation failed:', newErrors, '— current form:', form)
      setSubmitError('Please fill the highlighted required fields.')
    }
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError(null)
    if (!validateForm()) return

    // Parse specs safely
    let specs = {}
    if (form.specs && form.specs.trim()) {
      try {
        specs = JSON.parse(form.specs)
      } catch {
        setErrors(prev => ({ ...prev, specs: 'Invalid JSON' }))
        setSubmitError('Specs JSON is invalid. Fix or clear it before saving.')
        return
      }
    }

    const data = {
      name: form.name,
      city: form.city,
      country: 'Tunisia',
      type: form.type,
      description: form.description,
      price: parseFloat(form.price),
      currency: form.currency,
      rating: form.rating ? parseFloat(form.rating) : null,
      reviews: form.reviews ? parseInt(form.reviews) : 0,
      capacity: form.capacity ? parseInt(form.capacity) : null,
      area: form.area ? parseFloat(form.area) : null,
      latitude: parseFloat(form.latitude),
      longitude: parseFloat(form.longitude),
      google_maps_link: form.google_maps_link || null,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      amenities: form.amenities || [],
      image_urls: form.image_urls ? form.image_urls.split(',').map(u => u.trim()).filter(Boolean) : [],
      featured: form.featured,
      trending: form.trending,
      published: form.status === 'published',
      archived: form.status === 'archived',
      specs,
      fallback: form.fallback,
      place_type_keys: form.place_type_keys && form.place_type_keys.length > 0 ? form.place_type_keys : [],
      architecture_style_keys: form.architecture_style_keys && form.architecture_style_keys.length > 0 ? form.architecture_style_keys : [],
      decoration_style_keys: form.decoration_style_keys && form.decoration_style_keys.length > 0 ? form.decoration_style_keys : [],
    }

    console.log('[LocationForm] Submitting payload:', data)

    const optional = ['place_type_keys', 'architecture_style_keys', 'decoration_style_keys', 'google_maps_link']

    const attempt = async (payload) => {
      try {
        setSubmitting(true)
        await onSubmit(payload)
      } catch (err) {
        console.error('[LocationForm] Save error:', err)
        // PGRST204 = column not in schema cache
        if (err?.code === 'PGRST204' && err?.message) {
          for (const col of optional) {
            if (col in payload && err.message.includes(`'${col}'`)) {
              console.warn(`[LocationForm] Column '${col}' missing — retrying without it.`)
              const { [col]: _drop, ...rest } = payload
              return attempt(rest)
            }
          }
        }
        const parts = [err?.message, err?.details, err?.hint, err?.code ? `(${err.code})` : null].filter(Boolean)
        setSubmitError(parts.length ? parts.join(' · ') : 'Failed to save. Please try again.')
        throw err
      }
    }

    try {
      await attempt(data)
    } catch {
      // already logged + shown
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = 'w-full px-3 py-2 bg-surface-low border border-outline-variant/30 rounded text-on-surface outline-none focus:border-gold transition-colors text-sm'
  const labelClass = 'block text-xs font-medium text-on-surface-variant uppercase mb-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Basic Info */}
      <div>
        <h3 className="text-sm font-light text-on-surface mb-2 uppercase tracking-wide">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              className={`${inputClass} ${errors.name ? 'border-red-500' : ''}`}
              placeholder="Location name"
            />
            {errors.name && <p className="text-red-400 text-xs mt-0.5">{errors.name}</p>}
          </div>
          <div>
            <label className={labelClass}>City *</label>
            <select value={form.city} onChange={(e) => set('city', e.target.value)} className={`${inputClass} ${errors.city ? 'border-red-500' : ''}`}>
              <option value="">Select city</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.city && <p className="text-red-400 text-xs mt-0.5">{errors.city}</p>}
          </div>
          {/* Type is now handled via place_type_keys in Filters section */}
          <div>
            <label className={labelClass}>Price (€) *</label>
            <input
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => set('price', e.target.value)}
              className={`${inputClass} ${errors.price ? 'border-red-500' : ''}`}
              placeholder="0.00"
            />
            {errors.price && <p className="text-red-400 text-xs mt-0.5">{errors.price}</p>}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div>
        <h3 className="text-sm font-light text-on-surface mb-2 uppercase tracking-wide">Filters (from Supabase)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Place Types */}
          <div>
            <label className={labelClass}>Place Types</label>
            {categoriesLoading ? (
              <div className="text-xs text-on-surface-variant italic">Loading...</div>
            ) : (
              <div className="space-y-1">
                {filterCategories.placeTypes.length === 0 ? (
                  <p className="text-xs text-on-surface-variant italic">No place types available</p>
                ) : (
                  <select
                    multiple
                    value={form.place_type_keys}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, opt => opt.value)
                      set('place_type_keys', selected)
                    }}
                    className={`${inputClass} min-h-32`}
                  >
                    {filterCategories.placeTypes.map(pt => (
                      <option key={pt.key} value={pt.key}>
                        {pt.label}
                      </option>
                    ))}
                  </select>
                )}
                {form.place_type_keys.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {form.place_type_keys.map(key => {
                      const label = filterCategories.placeTypes.find(pt => pt.key === key)?.label
                      return (
                        <span key={key} className="inline-flex items-center gap-1 bg-gold/20 text-gold text-xs px-2 py-1 rounded">
                          {label}
                          <button
                            type="button"
                            onClick={() => set('place_type_keys', form.place_type_keys.filter(k => k !== key))}
                            className="hover:opacity-70"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Architecture Styles */}
          <div>
            <label className={labelClass}>Architecture Styles</label>
            {categoriesLoading ? (
              <div className="text-xs text-on-surface-variant italic">Loading...</div>
            ) : (
              <div className="space-y-1">
                {filterCategories.architectureStyles.length === 0 ? (
                  <p className="text-xs text-on-surface-variant italic">No styles available</p>
                ) : (
                  <select
                    multiple
                    value={form.architecture_style_keys}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, opt => opt.value)
                      set('architecture_style_keys', selected)
                    }}
                    className={`${inputClass} min-h-32`}
                  >
                    {filterCategories.architectureStyles.map(as => (
                      <option key={as.key} value={as.key}>
                        {as.label}
                      </option>
                    ))}
                  </select>
                )}
                {form.architecture_style_keys.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {form.architecture_style_keys.map(key => {
                      const label = filterCategories.architectureStyles.find(as => as.key === key)?.label
                      return (
                        <span key={key} className="inline-flex items-center gap-1 bg-gold/20 text-gold text-xs px-2 py-1 rounded">
                          {label}
                          <button
                            type="button"
                            onClick={() => set('architecture_style_keys', form.architecture_style_keys.filter(k => k !== key))}
                            className="hover:opacity-70"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Decoration Styles */}
          <div>
            <label className={labelClass}>Decoration Styles</label>
            {categoriesLoading ? (
              <div className="text-xs text-on-surface-variant italic">Loading...</div>
            ) : (
              <div className="space-y-1">
                {filterCategories.decorationStyles.length === 0 ? (
                  <p className="text-xs text-on-surface-variant italic">No styles available</p>
                ) : (
                  <select
                    multiple
                    value={form.decoration_style_keys}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, opt => opt.value)
                      set('decoration_style_keys', selected)
                    }}
                    className={`${inputClass} min-h-32`}
                  >
                    {filterCategories.decorationStyles.map(ds => (
                      <option key={ds.key} value={ds.key}>
                        {ds.label}
                      </option>
                    ))}
                  </select>
                )}
                {form.decoration_style_keys.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {form.decoration_style_keys.map(key => {
                      const label = filterCategories.decorationStyles.find(ds => ds.key === key)?.label
                      return (
                        <span key={key} className="inline-flex items-center gap-1 bg-gold/20 text-gold text-xs px-2 py-1 rounded">
                          {label}
                          <button
                            type="button"
                            onClick={() => set('decoration_style_keys', form.decoration_style_keys.filter(k => k !== key))}
                            className="hover:opacity-70"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <p className="text-[10px] text-on-surface-variant mt-2">Hold Ctrl/Cmd to select multiple options. Selected items appear as tags below.</p>
      </div>

      {/* Description */}
      <div>
        <label className={labelClass}>Description</label>
        <textarea
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          className={`${inputClass} resize-none h-16`}
          placeholder="Location description"
        />
      </div>

      {/* Details */}
      <div>
        <h3 className="text-sm font-light text-on-surface mb-2 uppercase tracking-wide">Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className={labelClass}>Rating</label>
            <input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(e) => set('rating', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Reviews</label>
            <input type="number" min="0" value={form.reviews} onChange={(e) => set('reviews', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Capacity</label>
            <input type="number" min="0" value={form.capacity} onChange={(e) => set('capacity', e.target.value)} className={inputClass} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          <div>
            <label className={labelClass}>Area (m²)</label>
            <input type="number" step="0.01" value={form.area} onChange={(e) => set('area', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Fallback Color</label>
            <input type="text" value={form.fallback} onChange={(e) => set('fallback', e.target.value)} className={inputClass} placeholder="#102035" />
          </div>
        </div>
      </div>

      {/* Location */}
      <div>
        <h3 className="text-sm font-light text-on-surface mb-2 uppercase tracking-wide">Location</h3>

        <div className="mb-3">
          <label className={labelClass}>Google Maps Link or Coords</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={mapsUrl}
              onChange={(e) => handleMapsInput(e.target.value)}
              onPaste={(e) => {
                const text = e.clipboardData?.getData('text') || ''
                if (text) {
                  e.preventDefault()
                  handleMapsInput(text)
                }
              }}
              className={`${inputClass} flex-1`}
              placeholder='Paste full maps URL or "36.85, 10.21"'
            />
            {isShortMapsLink(mapsUrl) && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 text-xs bg-gold/20 hover:bg-gold/30 border border-gold/40 text-gold rounded transition-colors whitespace-nowrap"
                title="Open this link to get the full URL"
              >
                Open ↗
              </a>
            )}
          </div>
          {mapsHint && (
            <p className={`text-[11px] mt-1 ${
              mapsHint.type === 'ok' ? 'text-emerald-400' :
              mapsHint.type === 'error' ? 'text-red-400' : 'text-amber-400'
            }`}>
              {mapsHint.msg}
            </p>
          )}
          <p className="text-[10px] text-on-surface-variant mt-1">
            On Google Maps: right-click the spot → click the coordinates to copy "lat, lng", paste here. Or share → "Copy link" using a desktop browser to get the long URL.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Latitude *</label>
            <input
              type="number"
              step="0.0001"
              value={form.latitude}
              onChange={(e) => set('latitude', e.target.value)}
              className={`${inputClass} ${errors.latitude ? 'border-red-500' : ''}`}
            />
            {errors.latitude && <p className="text-red-400 text-xs mt-0.5">{errors.latitude}</p>}
          </div>
          <div>
            <label className={labelClass}>Longitude *</label>
            <input
              type="number"
              step="0.0001"
              value={form.longitude}
              onChange={(e) => set('longitude', e.target.value)}
              className={`${inputClass} ${errors.longitude ? 'border-red-500' : ''}`}
            />
            {errors.longitude && <p className="text-red-400 text-xs mt-0.5">{errors.longitude}</p>}
          </div>
        </div>
      </div>

      {/* Arrays */}
      <div>
        <h3 className="text-sm font-light text-on-surface mb-2 uppercase tracking-wide">Additional Info</h3>
        <div className="space-y-3">
          <div>
            <label className={labelClass}>Tags (comma-separated)</label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => set('tags', e.target.value)}
              className={inputClass}
              placeholder="Photo Shoot, Video, Brand Campaigns"
            />
          </div>
          <div>
            <label className={labelClass}>Amenities</label>
            {categoriesLoading ? (
              <div className="text-xs text-on-surface-variant italic">Loading...</div>
            ) : (
              <div className="space-y-1">
                {filterCategories.amenities.length === 0 ? (
                  <p className="text-xs text-on-surface-variant italic">No amenities available</p>
                ) : (
                  <select
                    multiple
                    value={form.amenities}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, opt => opt.value)
                      set('amenities', selected)
                    }}
                    className={`${inputClass} min-h-32`}
                  >
                    {filterCategories.amenities.map(am => (
                      <option key={am.key} value={am.key}>
                        {am.label}
                      </option>
                    ))}
                  </select>
                )}
                {form.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {form.amenities.map(key => {
                      const label = filterCategories.amenities.find(am => am.key === key)?.label
                      return (
                        <span key={key} className="inline-flex items-center gap-1 bg-gold/20 text-gold text-xs px-2 py-1 rounded">
                          {label}
                          <button
                            type="button"
                            onClick={() => set('amenities', form.amenities.filter(k => k !== key))}
                            className="hover:opacity-70"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
          <div>
            <label className={labelClass}>Image URLs (comma-separated)</label>
            <textarea
              value={form.image_urls}
              onChange={(e) => set('image_urls', e.target.value)}
              className={`${inputClass} resize-none h-14`}
              placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
            />
          </div>
        </div>
      </div>

      {/* Specs */}
      <div>
        <label className={labelClass}>Specs (JSON)</label>
        <textarea
          value={form.specs}
          onChange={(e) => {
            set('specs', e.target.value)
            if (errors.specs) setErrors(prev => ({ ...prev, specs: undefined }))
          }}
          className={`${inputClass} resize-none h-14 font-mono text-xs ${errors.specs ? 'border-red-500' : ''}`}
          placeholder='{"rooms": 6, "bathrooms": 4}'
        />
        {errors.specs && <p className="text-red-400 text-xs mt-0.5">{errors.specs}</p>}
      </div>

      {/* Status */}
      <div>
        <h3 className="text-sm font-light text-on-surface mb-2 uppercase tracking-wide">Visibility</h3>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { value: 'draft', label: 'Draft', hint: 'Hidden from site', tone: 'amber' },
            { value: 'published', label: 'Published', hint: 'Live on the site', tone: 'emerald' },
            { value: 'archived', label: 'Archived', hint: 'Hidden + retained', tone: 'zinc' },
          ].map(opt => {
            const active = form.status === opt.value
            const ring =
              opt.tone === 'emerald' ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-300'
              : opt.tone === 'amber' ? 'border-amber-500/60 bg-amber-500/15 text-amber-300'
              : 'border-zinc-500/60 bg-zinc-500/15 text-zinc-300'
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => set('status', opt.value)}
                className={`px-3 py-2 rounded border text-xs font-medium transition-all text-left ${
                  active ? ring : 'border-outline-variant/30 bg-surface-low text-on-surface-variant hover:border-outline-variant/60'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    opt.tone === 'emerald' ? 'bg-emerald-400'
                    : opt.tone === 'amber' ? 'bg-amber-400'
                    : 'bg-zinc-400'
                  }`} />
                  {opt.label}
                </div>
                <div className="text-[10px] opacity-70 mt-0.5 font-normal">{opt.hint}</div>
              </button>
            )
          })}
        </div>

        <h3 className="text-sm font-light text-on-surface mb-2 uppercase tracking-wide">Highlights</h3>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} className="w-3 h-3 rounded" />
            <span className="text-xs text-on-surface">Featured</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.trending} onChange={(e) => set('trending', e.target.checked)} className="w-3 h-3 rounded" />
            <span className="text-xs text-on-surface">Trending</span>
          </label>
        </div>
      </div>

      {/* Submit error banner */}
      {submitError && (
        <div className="sticky bottom-0 p-3 bg-red-500/15 border-2 border-red-500/50 rounded text-sm text-red-200 shadow-lg">
          <div className="font-medium mb-1">Save failed</div>
          <div className="text-xs text-red-300/90 break-words">{submitError}</div>
          <div className="text-[10px] text-red-300/60 mt-1.5">Open the browser console for full details.</div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-outline-variant/25">
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-1.5 text-sm bg-gold text-bg font-medium rounded hover:bg-gold-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Saving…' : initialData ? 'Update' : 'Create'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="px-4 py-1.5 text-sm border border-outline-variant/40 text-on-surface-variant font-medium rounded hover:bg-surface-low disabled:opacity-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
