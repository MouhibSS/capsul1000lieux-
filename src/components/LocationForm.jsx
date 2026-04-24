import { useState, useEffect } from 'react'
import { filterCategories } from '../data/locations'

const locationTypes = ['villa', 'loft', 'studio', 'rooftop', 'mansion', 'penthouse', 'industrial']
const cities = ['Tunis', 'Sidi Bou Said', 'La Marsa', 'Hammamet', 'Sousse', 'Djerba', 'Tozeur', 'Kairouan', 'Tataouine', 'Matmata', 'Carthage', 'Nabeul']
const architectureStyles = ['tunisian', 'colonial', 'mediterranean', 'brutalist', 'industrial', 'seventies']

// Flatten place type paths for select options
const getPlaceTypePaths = () => {
  const paths = []

  const traverse = (node, key, path = []) => {
    const currentPath = [...path, key]
    if (!node.children || Object.keys(node.children).length === 0) {
      paths.push({
        value: currentPath,
        label: node.label,
        fullPath: currentPath.join(' > ')
      })
    } else {
      Object.entries(node.children).forEach(([childKey, childNode]) => {
        traverse(childNode, childKey, currentPath)
      })
    }
  }

  Object.entries(filterCategories.placeType.children).forEach(([key, node]) => {
    traverse(node, key)
  })

  return paths
}

export default function LocationForm({ initialData, onSubmit, onCancel }) {
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
    tags: '',
    amenities: '',
    image_urls: '',
    featured: false,
    trending: false,
    published: false,
    specs: '{}',
    fallback: '',
    place_type_path: [],
    architecture_style: '',
  }

  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const placeTypePaths = getPlaceTypePaths()

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
        tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : initialData.tags || '',
        amenities: Array.isArray(initialData.amenities) ? initialData.amenities.join(', ') : initialData.amenities || '',
        image_urls: Array.isArray(initialData.image_urls) ? initialData.image_urls.join(', ') : initialData.image_urls || '',
        featured: Boolean(initialData.featured),
        trending: Boolean(initialData.trending),
        published: Boolean(initialData.published),
        specs: initialData.specs ? JSON.stringify(initialData.specs) : '{}',
        fallback: initialData.fallback || '',
        place_type_path: Array.isArray(initialData.place_type_path) ? initialData.place_type_path : [],
        architecture_style: initialData.architecture_style || '',
      })
    } else {
      setForm(emptyForm)
    }
  }, [initialData])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validateForm = () => {
    const newErrors = {}
    if (!form.name) newErrors.name = 'Name is required'
    if (!form.city) newErrors.city = 'City is required'
    if (!form.type) newErrors.type = 'Type is required'
    if (!form.price) newErrors.price = 'Price is required'
    if (!form.latitude) newErrors.latitude = 'Latitude is required'
    if (!form.longitude) newErrors.longitude = 'Longitude is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    const data = {
      ...(initialData?.id && { id: initialData.id }),
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
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      amenities: form.amenities ? form.amenities.split(',').map(a => a.trim()).filter(Boolean) : [],
      image_urls: form.image_urls ? form.image_urls.split(',').map(u => u.trim()).filter(Boolean) : [],
      featured: form.featured,
      trending: form.trending,
      published: form.published,
      specs: form.specs ? JSON.parse(form.specs) : {},
      fallback: form.fallback,
      place_type_path: form.place_type_path && form.place_type_path.length > 0 ? form.place_type_path : null,
      architecture_style: form.architecture_style || null,
    }
    onSubmit(data)
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
          <div>
            <label className={labelClass}>Type *</label>
            <select value={form.type} onChange={(e) => set('type', e.target.value)} className={`${inputClass} ${errors.type ? 'border-red-500' : ''}`}>
              <option value="">Select type</option>
              {locationTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {errors.type && <p className="text-red-400 text-xs mt-0.5">{errors.type}</p>}
          </div>
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
        <h3 className="text-sm font-light text-on-surface mb-2 uppercase tracking-wide">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Place Type</label>
            <select
              value={form.place_type_path.join('|')}
              onChange={(e) => {
                if (e.target.value) {
                  set('place_type_path', e.target.value.split('|'))
                } else {
                  set('place_type_path', [])
                }
              }}
              className={inputClass}
            >
              <option value="">Select category</option>
              {placeTypePaths.map((path, idx) => (
                <option key={idx} value={path.value.join('|')}>
                  {path.fullPath}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Architecture Style</label>
            <select value={form.architecture_style} onChange={(e) => set('architecture_style', e.target.value)} className={inputClass}>
              <option value="">None</option>
              {architectureStyles.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>
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
            <label className={labelClass}>Amenities (comma-separated)</label>
            <input
              type="text"
              value={form.amenities}
              onChange={(e) => set('amenities', e.target.value)}
              className={inputClass}
              placeholder="WiFi, Parking, Natural Light"
            />
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
          onChange={(e) => set('specs', e.target.value)}
          className={`${inputClass} resize-none h-14 font-mono text-xs`}
          placeholder='{"rooms": 6, "bathrooms": 4}'
        />
      </div>

      {/* Status */}
      <div>
        <h3 className="text-sm font-light text-on-surface mb-2 uppercase tracking-wide">Status</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} className="w-3 h-3 rounded" />
            <span className="text-xs text-on-surface">Featured</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.trending} onChange={(e) => set('trending', e.target.checked)} className="w-3 h-3 rounded" />
            <span className="text-xs text-on-surface">Trending</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.published} onChange={(e) => set('published', e.target.checked)} className="w-3 h-3 rounded" />
            <span className="text-xs text-on-surface">Published</span>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-outline-variant/25">
        <button
          type="submit"
          className="px-4 py-1.5 text-sm bg-gold text-bg font-medium rounded hover:bg-gold-light transition-colors"
        >
          {initialData ? 'Update' : 'Create'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-1.5 text-sm border border-outline-variant/40 text-on-surface-variant font-medium rounded hover:bg-surface-low transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
