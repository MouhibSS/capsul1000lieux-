import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, Search, Grid3X3, LayoutList, Eye } from 'lucide-react'
import { supabase } from '../lib/supabase'
import LocationForm from '../components/LocationForm'
import AdminLocationDetail from '../components/AdminLocationDetail'

function statusOf(loc) {
  if (loc.archived) return 'archived'
  if (loc.published) return 'published'
  return 'draft'
}

const STATUS_STYLE = {
  published: { label: 'Published', cls: 'bg-emerald-500/20 text-emerald-400' },
  draft:     { label: 'Draft',     cls: 'bg-amber-500/20 text-amber-400' },
  archived:  { label: 'Archived',  cls: 'bg-zinc-500/20 text-zinc-400' },
}

export default function AdminLocations() {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'published' | 'draft' | 'archived'
  const [showForm, setShowForm] = useState(false)
  const [editingLocation, setEditingLocation] = useState(null)
  const [viewingLocation, setViewingLocation] = useState(null)
  const [viewMode, setViewMode] = useState('table') // 'table' or 'grid'

  useEffect(() => {
    fetchLocations()
  }, [])

  const fetchLocations = async () => {
    try {
      const { data, error } = await supabase.from('locations').select('*').order('created_at', { ascending: false })
      if (error) throw error
      setLocations(data || [])
    } catch (err) {
      console.error('Error fetching locations:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddLocation = () => {
    setEditingLocation(null)
    setShowForm(true)
  }

  const handleEditLocation = (location) => {
    setEditingLocation(location)
    setShowForm(true)
  }

  const handleDeleteLocation = async (id) => {
    if (!window.confirm('Delete this location?')) return

    try {
      const { error } = await supabase.from('locations').delete().eq('id', id)
      if (error) throw error
      setLocations(locations.filter(l => l.id !== id))
    } catch (err) {
      console.error('Error deleting location:', err)
    }
  }

  const handleSubmitLocation = async (formData) => {
    if (editingLocation?.id) {
      console.log('[AdminLocations] UPDATE id=', editingLocation.id, 'payload=', formData)
      const { data, error } = await supabase
        .from('locations')
        .update(formData)
        .eq('id', editingLocation.id)
        .select()
      if (error) {
        console.error('[AdminLocations] Supabase update error:', error)
        throw error
      }
      console.log('[AdminLocations] UPDATE success — rows affected:', data?.length, data)
      if (!data || data.length === 0) {
        throw new Error('No rows updated. Check RLS policy on the locations table — the anon key may not have UPDATE permission.')
      }
      // Update viewing location if it's currently being viewed
      if (viewingLocation?.id === editingLocation.id) {
        setViewingLocation(data[0])
      }
    } else {
      console.log('[AdminLocations] INSERT payload=', formData)
      const { data, error } = await supabase
        .from('locations')
        .insert([formData])
        .select()
      if (error) {
        console.error('[AdminLocations] Supabase insert error:', error)
        throw error
      }
      console.log('[AdminLocations] INSERT success:', data)
    }
    setShowForm(false)
    setEditingLocation(null)
    fetchLocations()
  }

  const filteredLocations = locations.filter(loc => {
    const matchesSearch =
      loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.city.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || statusOf(loc) === statusFilter
    return matchesSearch && matchesStatus
  })

  const counts = {
    all: locations.length,
    published: locations.filter(l => statusOf(l) === 'published').length,
    draft: locations.filter(l => statusOf(l) === 'draft').length,
    archived: locations.filter(l => statusOf(l) === 'archived').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-on-surface-variant">Loading locations...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with Search and Controls */}
      <div className="flex flex-col md:flex-row gap-2 items-start md:items-center justify-between">
        <div className="flex-1 relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-on-surface-variant" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-surface-low border border-outline-variant/30 rounded text-on-surface placeholder-on-surface-variant outline-none focus:border-gold transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border border-outline-variant/40 rounded">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('table')}
              className={`p-1.5 transition-colors ${viewMode === 'table' ? 'text-gold bg-gold/10' : 'text-on-surface-variant hover:text-gold'}`}
              title="Table view"
            >
              <LayoutList className="w-4 h-4" strokeWidth={1.5} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('grid')}
              className={`p-1.5 transition-colors border-l border-outline-variant/40 ${viewMode === 'grid' ? 'text-gold bg-gold/10' : 'text-on-surface-variant hover:text-gold'}`}
              title="Grid view"
            >
              <Grid3X3 className="w-4 h-4" strokeWidth={1.5} />
            </motion.button>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddLocation}
            className="flex items-center gap-1.5 px-4 py-1.5 text-sm bg-gold text-bg font-medium rounded hover:bg-gold-light transition-colors"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2} />
            Add
          </motion.button>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-1 border-b border-outline-variant/25 pb-2 -mt-1">
        {[
          { key: 'all', label: 'All' },
          { key: 'published', label: 'Published' },
          { key: 'draft', label: 'Drafts' },
          { key: 'archived', label: 'Archived' },
        ].map(tab => {
          const active = statusFilter === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors flex items-center gap-1.5 ${
                active
                  ? 'bg-gold/15 border border-gold/40 text-gold'
                  : 'border border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-low'
              }`}
            >
              {tab.label}
              <span className="text-[10px] opacity-70 tabular-nums">
                {counts[tab.key]}
              </span>
            </button>
          )
        })}
      </div>

      {/* Detail View Modal */}
      <AnimatePresence>
        {viewingLocation && (
          <AdminLocationDetail
            location={viewingLocation}
            onClose={() => setViewingLocation(null)}
            onEdit={(loc) => {
              setViewingLocation(null)
              handleEditLocation(loc)
            }}
            onDelete={(id) => {
              setViewingLocation(null)
              handleDeleteLocation(id)
            }}
          />
        )}
      </AnimatePresence>

      {/* Form Modal */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-3"
          onClick={() => setShowForm(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-container rounded-t-2xl sm:rounded-xl p-4 sm:p-5 w-full sm:max-w-3xl h-[92vh] sm:h-auto sm:max-h-[92vh] overflow-y-auto"
          >
            <h2 className="text-lg font-light text-on-surface uppercase tracking-wide mb-4">
              {editingLocation ? 'Edit Location' : 'Add New Location'}
            </h2>
            <LocationForm
              initialData={editingLocation}
              onSubmit={handleSubmitLocation}
              onCancel={() => setShowForm(false)}
            />
          </motion.div>
        </motion.div>
      )}

      {/* Locations View */}
      {viewMode === 'table' ? (
        <div className="border border-outline-variant/25 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-outline-variant/25 bg-surface-low/50">
                  <th className="px-3 py-2 text-left font-medium text-on-surface">Name</th>
                  <th className="px-3 py-2 text-left font-medium text-on-surface">City</th>
                  <th className="px-3 py-2 text-left font-medium text-on-surface">Type</th>
                  <th className="px-3 py-2 text-left font-medium text-on-surface">Price</th>
                  <th className="px-3 py-2 text-left font-medium text-on-surface">Status</th>
                  <th className="px-3 py-2 text-right font-medium text-on-surface">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLocations.length > 0 ? (
                  filteredLocations.map((location) => (
                    <motion.tr
                      key={location.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => setViewingLocation(location)}
                      className="border-b border-outline-variant/15 hover:bg-surface-low/40 transition-colors cursor-pointer"
                    >
                      <td className="px-3 py-2 text-on-surface font-medium truncate">{location.name}</td>
                      <td className="px-3 py-2 text-on-surface-variant text-xs">{location.city}</td>
                      <td className="px-3 py-2 text-on-surface-variant text-xs capitalize">{location.type}</td>
                      <td className="px-3 py-2 text-on-surface text-xs">€{location.price}</td>
                      <td className="px-3 py-2">
                        {(() => {
                          const s = STATUS_STYLE[statusOf(location)]
                          return (
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${s.cls}`}>
                              {s.label}
                            </span>
                          )
                        })()}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setViewingLocation(location)}
                            className="p-1 hover:bg-emerald-500/20 hover:text-emerald-400 rounded transition-colors"
                            title="View"
                          >
                            <Eye className="w-3 h-3" strokeWidth={1.5} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleEditLocation(location)}
                            className="p-1 hover:bg-blue-500/20 hover:text-blue-400 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3 h-3" strokeWidth={1.5} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDeleteLocation(location.id)}
                            className="p-1 hover:bg-red-500/20 hover:text-red-400 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" strokeWidth={1.5} />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-3 py-6 text-center text-on-surface-variant text-xs">
                      No locations found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredLocations.length > 0 ? (
            filteredLocations.map((location) => (
              <motion.div
                key={location.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setViewingLocation(location)}
                className="bg-surface-low border border-outline-variant/25 rounded-lg overflow-hidden hover:border-gold/40 transition-all cursor-pointer group"
              >
                {/* Thumbnail */}
                {location.image_urls?.[0] && (
                  <div className="aspect-video bg-surface-container overflow-hidden">
                    <img
                      src={location.image_urls[0]}
                      alt={location.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="p-3 space-y-2">
                  <p className="font-medium text-on-surface text-sm truncate">{location.name}</p>
                  <div className="space-y-1 text-xs text-on-surface-variant">
                    <p>{location.city}</p>
                    <p className="capitalize">{location.type}</p>
                    <p className="text-gold font-medium">€{location.price}</p>
                  </div>
                  <div className="flex items-center gap-1 pt-2" onClick={(e) => e.stopPropagation()}>
                    {(() => {
                      const s = STATUS_STYLE[statusOf(location)]
                      return (
                        <span className={`flex-1 px-2 py-0.5 rounded text-xs font-medium text-center ${s.cls}`}>
                          {s.label}
                        </span>
                      )
                    })()}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEditLocation(location)}
                      className="p-1.5 hover:bg-blue-500/20 hover:text-blue-400 rounded transition-colors"
                    >
                      <Edit2 className="w-3 h-3" strokeWidth={1.5} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeleteLocation(location.id)}
                      className="p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded transition-colors"
                    >
                      <Trash2 className="w-3 h-3" strokeWidth={1.5} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-on-surface-variant text-sm">
              No locations found
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-surface-low rounded-lg p-3 border border-outline-variant/25">
          <p className="text-on-surface-variant text-xs font-medium mb-1">Total</p>
          <p className="font-display text-2xl font-light text-gold">{counts.all}</p>
        </div>
        <div className="bg-surface-low rounded-lg p-3 border border-outline-variant/25">
          <p className="text-on-surface-variant text-xs font-medium mb-1">Published</p>
          <p className="font-display text-2xl font-light text-emerald-400">{counts.published}</p>
        </div>
        <div className="bg-surface-low rounded-lg p-3 border border-outline-variant/25">
          <p className="text-on-surface-variant text-xs font-medium mb-1">Drafts</p>
          <p className="font-display text-2xl font-light text-amber-400">{counts.draft}</p>
        </div>
        <div className="bg-surface-low rounded-lg p-3 border border-outline-variant/25">
          <p className="text-on-surface-variant text-xs font-medium mb-1">Archived</p>
          <p className="font-display text-2xl font-light text-zinc-400">{counts.archived}</p>
        </div>
      </div>
    </div>
  )
}
