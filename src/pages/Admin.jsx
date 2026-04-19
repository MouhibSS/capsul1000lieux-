import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Edit2, Trash2, Plus, Check, X, LogOut } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

const ease = [0.22, 1, 0.36, 1]
const pageVariants = {
  initial: { opacity: 0 },
  enter: { opacity: 1, transition: { duration: 0.6, ease } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
}

const locationTypes = ['villa', 'loft', 'studio', 'rooftop', 'mansion', 'penthouse', 'industrial']

function LocationForm({ initialData, onSubmit, onCancel }) {
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
  }

  const [form, setForm] = useState(emptyForm)

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
      })
    } else {
      setForm(emptyForm)
    }
  }, [initialData])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = {
      ...(initialData?.id && { id: initialData.id }),
      ...form,
      price: parseFloat(form.price),
      rating: form.rating ? parseFloat(form.rating) : null,
      reviews: form.reviews ? parseInt(form.reviews) : 0,
      capacity: form.capacity ? parseInt(form.capacity) : null,
      area: form.area ? parseFloat(form.area) : null,
      latitude: parseFloat(form.latitude),
      longitude: parseFloat(form.longitude),
      tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [],
      amenities: form.amenities ? form.amenities.split(',').map(a => a.trim()) : [],
      image_urls: form.image_urls ? form.image_urls.split(',').map(u => u.trim()) : [],
      specs: form.specs ? JSON.parse(form.specs) : {},
    }
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="eyebrow-sm mb-2 block">Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            required
            className="w-full bg-transparent border-b border-outline-variant/40 py-3 text-on-surface text-sm outline-none focus:border-gold transition-colors font-light"
          />
        </div>
        <div>
          <label className="eyebrow-sm mb-2 block">City</label>
          <input
            type="text"
            value={form.city}
            onChange={(e) => set('city', e.target.value)}
            required
            className="w-full bg-transparent border-b border-outline-variant/40 py-3 text-on-surface text-sm outline-none focus:border-gold transition-colors font-light"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="eyebrow-sm mb-2 block">Type</label>
          <select
            value={form.type}
            onChange={(e) => set('type', e.target.value)}
            required
            className="w-full bg-transparent border-b border-outline-variant/40 py-3 text-on-surface text-sm outline-none focus:border-gold transition-colors font-light"
          >
            <option value="">Select type</option>
            {locationTypes.map(t => (
              <option key={t} value={t} className="bg-surface-low">{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="eyebrow-sm mb-2 block">Price per hour (€)</label>
          <input
            type="number"
            value={form.price}
            onChange={(e) => set('price', e.target.value)}
            required
            step="0.01"
            className="w-full bg-transparent border-b border-outline-variant/40 py-3 text-on-surface text-sm outline-none focus:border-gold transition-colors font-light"
          />
        </div>
      </div>

      <div>
        <label className="eyebrow-sm mb-2 block">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          className="w-full bg-transparent border border-outline-variant/40 p-4 text-on-surface text-sm outline-none focus:border-gold transition-colors font-light resize-none h-24"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="eyebrow-sm mb-2 block">Rating</label>
          <input
            type="number"
            value={form.rating}
            onChange={(e) => set('rating', e.target.value)}
            step="0.1"
            min="0"
            max="5"
            className="w-full bg-transparent border-b border-outline-variant/40 py-3 text-on-surface text-sm outline-none focus:border-gold transition-colors font-light"
          />
        </div>
        <div>
          <label className="eyebrow-sm mb-2 block">Capacity</label>
          <input
            type="number"
            value={form.capacity}
            onChange={(e) => set('capacity', e.target.value)}
            className="w-full bg-transparent border-b border-outline-variant/40 py-3 text-on-surface text-sm outline-none focus:border-gold transition-colors font-light"
          />
        </div>
        <div>
          <label className="eyebrow-sm mb-2 block">Area (m²)</label>
          <input
            type="number"
            value={form.area}
            onChange={(e) => set('area', e.target.value)}
            step="0.01"
            className="w-full bg-transparent border-b border-outline-variant/40 py-3 text-on-surface text-sm outline-none focus:border-gold transition-colors font-light"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="eyebrow-sm mb-2 block">Latitude</label>
          <input
            type="number"
            value={form.latitude}
            onChange={(e) => set('latitude', e.target.value)}
            required
            step="0.0001"
            className="w-full bg-transparent border-b border-outline-variant/40 py-3 text-on-surface text-sm outline-none focus:border-gold transition-colors font-light"
          />
        </div>
        <div>
          <label className="eyebrow-sm mb-2 block">Longitude</label>
          <input
            type="number"
            value={form.longitude}
            onChange={(e) => set('longitude', e.target.value)}
            required
            step="0.0001"
            className="w-full bg-transparent border-b border-outline-variant/40 py-3 text-on-surface text-sm outline-none focus:border-gold transition-colors font-light"
          />
        </div>
      </div>

      <div>
        <label className="eyebrow-sm mb-2 block">Tags (comma-separated)</label>
        <input
          type="text"
          value={form.tags}
          onChange={(e) => set('tags', e.target.value)}
          className="w-full bg-transparent border-b border-outline-variant/40 py-3 text-on-surface text-sm outline-none focus:border-gold transition-colors font-light"
          placeholder="Photo Shoot, Video, Brand Campaigns"
        />
      </div>

      <div>
        <label className="eyebrow-sm mb-2 block">Amenities (comma-separated)</label>
        <input
          type="text"
          value={form.amenities}
          onChange={(e) => set('amenities', e.target.value)}
          className="w-full bg-transparent border-b border-outline-variant/40 py-3 text-on-surface text-sm outline-none focus:border-gold transition-colors font-light"
          placeholder="Sea View, WiFi, Parking"
        />
      </div>

      <div>
        <label className="eyebrow-sm mb-2 block">Image URLs (comma-separated)</label>
        <textarea
          value={form.image_urls}
          onChange={(e) => set('image_urls', e.target.value)}
          className="w-full bg-transparent border border-outline-variant/40 p-4 text-on-surface text-sm outline-none focus:border-gold transition-colors font-light resize-none h-20"
          placeholder="https://..., https://..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => set('featured', e.target.checked)}
            className="w-4 h-4 accent-gold"
          />
          <span className="eyebrow-sm">Featured</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.trending}
            onChange={(e) => set('trending', e.target.checked)}
            className="w-4 h-4 accent-gold"
          />
          <span className="eyebrow-sm">Trending</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => set('published', e.target.checked)}
            className="w-4 h-4 accent-gold"
          />
          <span className="eyebrow-sm">Published</span>
        </label>
      </div>

      <div className="flex items-center gap-3 pt-6">
        <button type="submit" className="btn-primary">
          {initialData?.id ? 'Update Location' : 'Create Location'}
        </button>
        <button type="button" onClick={onCancel} className="btn-ghost">
          Cancel
        </button>
      </div>
    </form>
  )
}

export default function Admin() {
  const navigate = useNavigate()
  const { user, loading: authLoading, logout } = useAuth()
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('list')
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/admin/login')
    }
  }, [user, authLoading, navigate])

  useEffect(() => {
    fetchLocations()
  }, [])

  const fetchLocations = async () => {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setLocations(data)
    }
    setLoading(false)
  }

  const handleSubmit = async (data) => {
    const { error } = await supabase
      .from('locations')
      .upsert({ country: 'Tunisia', ...data }, { onConflict: 'id' })

    if (!error) {
      fetchLocations()
      setView('list')
      setEditing(null)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this location?')) return
    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', id)

    if (!error) {
      fetchLocations()
    }
  }

  const handleTogglePublished = async (id, current) => {
    const { error } = await supabase
      .from('locations')
      .update({ published: !current })
      .eq('id', id)

    if (!error) {
      fetchLocations()
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <p className="font-display text-5xl font-extralight text-on-surface/30 uppercase tracking-display">
          Loading...
        </p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <motion.div variants={pageVariants} initial="initial" animate="enter" exit="exit" className="min-h-screen bg-bg">
      <div className="container-main pt-28 pb-16">
        {view === 'list' ? (
          <>
            <div className="flex items-center justify-between mb-12">
              <div>
                <span className="eyebrow mb-3 block">Admin</span>
                <h1 className="font-display font-light text-6xl text-on-surface uppercase tracking-display">
                  Locations
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setEditing(null)
                    setView('form')
                  }}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Location
                </button>
                <button
                  onClick={async () => {
                    await logout()
                    navigate('/admin/login')
                  }}
                  className="btn-ghost flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border border-outline-variant/25">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-outline-variant/15">
                    <th className="px-6 py-4 text-left eyebrow-sm">Name</th>
                    <th className="px-6 py-4 text-left eyebrow-sm">City</th>
                    <th className="px-6 py-4 text-left eyebrow-sm">Type</th>
                    <th className="px-6 py-4 text-left eyebrow-sm">Price</th>
                    <th className="px-6 py-4 text-left eyebrow-sm">Published</th>
                    <th className="px-6 py-4 text-right eyebrow-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {locations.map((loc) => (
                    <tr key={loc.id} className="border-b border-outline-variant/15 hover:bg-surface/50 transition-colors">
                      <td className="px-6 py-4 text-on-surface text-sm">{loc.name}</td>
                      <td className="px-6 py-4 text-on-surface-variant text-sm">{loc.city}</td>
                      <td className="px-6 py-4 text-on-surface-variant text-sm">{loc.type}</td>
                      <td className="px-6 py-4 text-on-surface text-sm font-mono">{loc.price}€</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleTogglePublished(loc.id, loc.published)}
                          className={`chip text-xs ${loc.published ? 'bg-gold/20 text-gold border-gold/40' : 'border-outline-variant/40 text-on-surface-variant'}`}
                        >
                          {loc.published ? 'Published' : 'Draft'}
                        </button>
                      </td>
                      <td className="px-6 py-4 flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditing(loc)
                            setView('form')
                          }}
                          className="btn-ghost p-2"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(loc.id)}
                          className="btn-ghost p-2 text-red-500 hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            <div className="mb-8">
              <span className="eyebrow mb-3 block">{editing ? 'Edit' : 'Create'}</span>
              <h1 className="font-display font-light text-6xl text-on-surface uppercase tracking-display">
                {editing ? editing.name : 'New Location'}
              </h1>
            </div>
            <div className="max-w-2xl">
              <LocationForm
                initialData={editing}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setView('list')
                  setEditing(null)
                }}
              />
            </div>
          </>
        )}
      </div>
    </motion.div>
  )
}
