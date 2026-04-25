import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, MapPin, User, DollarSign, Grid3X3, LayoutList, X, Mail, Phone, StickyNote, Check, Ban, CheckCheck } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function AdminBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [viewMode, setViewMode] = useState('table')
  const [selected, setSelected] = useState(null)
  const [noteText, setNoteText] = useState('')
  const [updating, setUpdating] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => { fetchBookings() }, [])

  const fetchBookings = async () => {
    try {
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error

      const locationIds = [...new Set(bookings.map(b => b.location_id))]
      const { data: locations } = await supabase
        .from('locations')
        .select('id, name, city')
        .in('id', locationIds)

      const locMap = Object.fromEntries(locations?.map(l => [l.id, l]) || [])
      setBookings(bookings.map(b => ({
        ...b,
        location: locMap[b.location_id],
        displayEmail: b.user_email || `User ${b.user_id?.slice(0, 8)}`,
      })))
    } catch (err) {
      console.error('Error fetching bookings:', err)
    } finally {
      setLoading(false)
    }
  }

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const updateStatus = async (id, newStatus) => {
    try {
      setUpdating(true)
      const { data, error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error

      const updated = { ...data, location: bookings.find(b => b.id === id)?.location, displayEmail: data.user_email }
      setBookings(prev => prev.map(b => b.id === id ? updated : b))
      if (selected?.id === id) setSelected(updated)
      showToast(`Booking ${newStatus}`)
    } catch (err) {
      showToast('Update failed', 'error')
    } finally {
      setUpdating(false)
    }
  }

  const saveNote = async () => {
    if (!selected) return
    try {
      setUpdating(true)
      const { data, error } = await supabase
        .from('bookings')
        .update({ notes: noteText })
        .eq('id', selected.id)
        .select()
        .single()
      if (error) throw error

      const updated = { ...data, location: selected.location, displayEmail: data.user_email }
      setBookings(prev => prev.map(b => b.id === selected.id ? updated : b))
      setSelected(updated)
      showToast('Note saved')
    } catch {
      showToast('Failed to save note', 'error')
    } finally {
      setUpdating(false)
    }
  }

  const openDetail = (booking) => {
    setSelected(booking)
    setNoteText(booking.notes || '')
  }

  const filteredBookings = bookings.filter(b => filter === 'all' || b.status === filter)

  const statusColor = (status) => {
    const map = { pending: 'bg-yellow-500/20 text-yellow-400', confirmed: 'bg-green-500/20 text-green-400', completed: 'bg-blue-500/20 text-blue-400', cancelled: 'bg-red-500/20 text-red-400' }
    return map[status] || 'bg-gray-500/20 text-gray-400'
  }

  const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const fmtShort = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const nights = (s, e) => Math.max(1, Math.ceil((new Date(e) - new Date(s)) / 86400000))

  if (loading) return <div className="text-center py-10 text-on-surface-variant text-sm">Loading...</div>

  return (
    <div className="space-y-3">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-sm font-medium shadow-lg ${
              toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
            }`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row gap-2 items-start md:items-center justify-between">
        <div className="flex items-center gap-1.5 flex-wrap">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded capitalize font-medium text-xs transition-all ${
                filter === s ? 'bg-gold text-bg' : 'border border-outline-variant/40 text-on-surface-variant hover:text-gold hover:border-gold'
              }`}
            >
              {s === 'all' ? `All (${bookings.length})` : `${s} (${bookings.filter(b => b.status === s).length})`}
            </button>
          ))}
        </div>
        <div className="hidden md:flex border border-outline-variant/40 rounded">
          <button onClick={() => setViewMode('table')} className={`p-1.5 transition-colors ${viewMode === 'table' ? 'text-gold bg-gold/10' : 'text-on-surface-variant hover:text-gold'}`}>
            <LayoutList className="w-4 h-4" strokeWidth={1.5} />
          </button>
          <button onClick={() => setViewMode('grid')} className={`p-1.5 transition-colors border-l border-outline-variant/40 ${viewMode === 'grid' ? 'text-gold bg-gold/10' : 'text-on-surface-variant hover:text-gold'}`}>
            <Grid3X3 className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Table View — desktop only; mobile auto uses grid */}
      {viewMode === 'table' ? (
        <div className="hidden md:block border border-outline-variant/25 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-outline-variant/25 bg-surface-low/50">
                  {['Location', 'Guest', 'Dates', 'Guests', 'Price', 'Status'].map(h => (
                    <th key={h} className="px-3 py-2 text-left font-medium text-on-surface">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length > 0 ? filteredBookings.map((b) => (
                  <motion.tr
                    key={b.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => openDetail(b)}
                    className="border-b border-outline-variant/15 hover:bg-gold/5 transition-colors cursor-pointer"
                  >
                    <td className="px-3 py-2">
                      <p className="font-medium text-on-surface truncate">{b.location?.name}</p>
                      <p className="text-on-surface-variant">{b.location?.city}</p>
                    </td>
                    <td className="px-3 py-2 text-on-surface truncate max-w-[120px]">{b.displayEmail}</td>
                    <td className="px-3 py-2 text-on-surface whitespace-nowrap">{fmtShort(b.start_date)} – {fmtShort(b.end_date)}</td>
                    <td className="px-3 py-2 text-on-surface-variant">{b.num_guests || 1}</td>
                    <td className="px-3 py-2 font-medium text-gold">€{b.total_price}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${statusColor(b.status)}`}>{b.status}</span>
                    </td>
                  </motion.tr>
                )) : (
                  <tr><td colSpan="6" className="px-3 py-8 text-center text-on-surface-variant">No bookings found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
      {/* Grid View — always visible on mobile, or when chosen on desktop */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 ${viewMode === 'table' ? 'md:hidden' : ''}`}>
          {filteredBookings.length > 0 ? filteredBookings.map((b) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => openDetail(b)}
              className="bg-surface-low border border-outline-variant/25 rounded-lg p-3 cursor-pointer hover:border-gold/40 hover:bg-gold/5 transition-all"
            >
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <MapPin className="w-3 h-3 text-on-surface-variant flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <div>
                    <p className="font-medium text-on-surface">{b.location?.name}</p>
                    <p className="text-on-surface-variant">{b.location?.city}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-3 h-3 text-on-surface-variant flex-shrink-0" strokeWidth={2} />
                  <p className="text-on-surface-variant truncate">{b.displayEmail}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-on-surface-variant flex-shrink-0" strokeWidth={2} />
                  <p className="text-on-surface-variant">{fmtShort(b.start_date)} – {fmtShort(b.end_date)}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-3 h-3 text-gold flex-shrink-0" strokeWidth={2} />
                    <p className="font-medium text-gold">€{b.total_price}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${statusColor(b.status)}`}>{b.status}</span>
                </div>
              </div>
            </motion.div>
          )) : (
            <div className="col-span-full text-center py-8 text-on-surface-variant text-xs">No bookings found</div>
          )}
        </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[
          { label: 'Total', value: bookings.length, color: 'text-gold' },
          { label: 'Pending', value: bookings.filter(b => b.status === 'pending').length, color: 'text-yellow-400' },
          { label: 'Confirmed', value: bookings.filter(b => b.status === 'confirmed').length, color: 'text-green-400' },
          { label: 'Revenue', value: `€${bookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + (b.total_price || 0), 0)}`, color: 'text-gold' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-surface-low rounded-lg p-3 border border-outline-variant/25">
            <p className="text-on-surface-variant text-xs font-medium mb-1">{label}</p>
            <p className={`font-display text-2xl font-light ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-bg/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setSelected(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="bg-surface-container border border-outline-variant/30 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between p-5 border-b border-outline-variant/20">
                <div>
                  <h3 className="font-display text-lg font-light text-on-surface uppercase tracking-wide">
                    {selected.location?.name || 'Booking'}
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">{selected.location?.city} · ID {selected.id?.slice(0, 8)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded text-xs font-medium capitalize ${statusColor(selected.status)}`}>
                    {selected.status}
                  </span>
                  <button onClick={() => setSelected(null)} className="p-1.5 text-on-surface-variant hover:text-on-surface transition-colors rounded-lg hover:bg-surface-low">
                    <X className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="space-y-0.5">
                    <p className="text-on-surface-variant text-xs uppercase tracking-wide">Guest</p>
                    <p className="text-on-surface font-medium truncate">{selected.displayEmail}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-on-surface-variant text-xs uppercase tracking-wide">Guests</p>
                    <p className="text-on-surface font-medium">{selected.num_guests || 1} {(selected.num_guests || 1) > 1 ? 'people' : 'person'}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-on-surface-variant text-xs uppercase tracking-wide">Check-in</p>
                    <p className="text-on-surface font-medium">{fmtDate(selected.start_date)}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-on-surface-variant text-xs uppercase tracking-wide">Check-out</p>
                    <p className="text-on-surface font-medium">{fmtDate(selected.end_date)}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-on-surface-variant text-xs uppercase tracking-wide">Duration</p>
                    <p className="text-on-surface font-medium">{nights(selected.start_date, selected.end_date)} nights</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-on-surface-variant text-xs uppercase tracking-wide">Total Price</p>
                    <p className="text-gold font-semibold text-base">€{selected.total_price}</p>
                  </div>
                </div>

                {/* Note */}
                <div>
                  <label className="block text-xs text-on-surface-variant uppercase tracking-wide mb-1.5">Admin Note</label>
                  <textarea
                    value={noteText}
                    onChange={e => setNoteText(e.target.value)}
                    rows={3}
                    placeholder="Add a private note..."
                    className="w-full bg-surface-low border border-outline-variant/40 rounded-lg px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-gold transition-colors resize-none"
                  />
                  <button
                    onClick={saveNote}
                    disabled={updating}
                    className="mt-1.5 flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-gold transition-colors disabled:opacity-50"
                  >
                    <StickyNote className="w-3 h-3" strokeWidth={1.5} /> Save note
                  </button>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <p className="text-xs text-on-surface-variant uppercase tracking-wide">Actions</p>
                  <div className="flex flex-wrap gap-2">
                    {selected.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateStatus(selected.id, 'confirmed')}
                          disabled={updating}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5" strokeWidth={2} /> Confirm
                        </button>
                        <button
                          onClick={() => updateStatus(selected.id, 'cancelled')}
                          disabled={updating}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                        >
                          <Ban className="w-3.5 h-3.5" strokeWidth={2} /> Decline
                        </button>
                      </>
                    )}
                    {selected.status === 'confirmed' && (
                      <>
                        <button
                          onClick={() => updateStatus(selected.id, 'completed')}
                          disabled={updating}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors disabled:opacity-50"
                        >
                          <CheckCheck className="w-3.5 h-3.5" strokeWidth={2} /> Mark Complete
                        </button>
                        <button
                          onClick={() => updateStatus(selected.id, 'cancelled')}
                          disabled={updating}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                        >
                          <Ban className="w-3.5 h-3.5" strokeWidth={2} /> Cancel
                        </button>
                      </>
                    )}
                    {selected.status === 'cancelled' && (
                      <button
                        onClick={() => updateStatus(selected.id, 'pending')}
                        disabled={updating}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-colors disabled:opacity-50"
                      >
                        Restore to Pending
                      </button>
                    )}
                    <button
                      onClick={() => showToast('Email sent (simulation)')}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-outline-variant/40 text-on-surface-variant hover:text-gold hover:border-gold transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" strokeWidth={1.5} /> Resend Email
                    </button>
                    <button
                      onClick={() => showToast('SMS sent (simulation)')}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-outline-variant/40 text-on-surface-variant hover:text-gold hover:border-gold transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" strokeWidth={1.5} /> Resend SMS
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
