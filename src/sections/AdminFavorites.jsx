import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, MapPin, ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function AdminFavorites() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [{ data: favs }, { data: locations }, { data: bookings }] = await Promise.all([
        supabase.from('favorites').select('user_id, location_id, created_at'),
        supabase.from('locations').select('id, name, city, image_urls'),
        supabase.from('bookings').select('user_id, user_email'),
      ])

      const emailMap = {}
      bookings?.forEach(b => { if (b.user_id && b.user_email) emailMap[b.user_id] = b.user_email })

      const locMap = {}
      locations?.forEach(l => { locMap[l.id] = l })

      const grouped = {}
      favs?.forEach(f => {
        if (!grouped[f.location_id]) grouped[f.location_id] = { location: locMap[f.location_id], users: [] }
        grouped[f.location_id].users.push({
          user_id: f.user_id,
          email: emailMap[f.user_id] || null,
          added_at: f.created_at,
        })
      })

      const sorted = Object.entries(grouped)
        .map(([id, v]) => ({ id, ...v }))
        .sort((a, b) => b.users.length - a.users.length)

      setData(sorted)
    } catch (err) {
      console.error('Error fetching favorites analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  const totalFavs = data.reduce((s, d) => s + d.users.length, 0)
  const knownEmails = data.reduce((s, d) => s + d.users.filter(u => u.email).length, 0)

  if (loading) return <div className="text-center py-10 text-on-surface-variant text-sm">Loading...</div>

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Favorites', value: totalFavs, color: 'text-gold' },
          { label: 'Locations Saved', value: data.length, color: 'text-pink-400' },
          { label: 'Identified Users', value: knownEmails, color: 'text-blue-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-surface-low rounded-lg p-3 border border-outline-variant/25">
            <p className="text-on-surface-variant text-xs font-medium mb-1">{label}</p>
            <p className={`font-display text-2xl font-light ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Location List */}
      {data.length === 0 ? (
        <div className="text-center py-10 text-on-surface-variant text-xs">No favorites yet</div>
      ) : (
        <div className="space-y-2">
          {data.map((item) => {
            const isExpanded = expanded === item.id
            return (
              <div key={item.id} className="border border-outline-variant/25 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpanded(isExpanded ? null : item.id)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-surface-low/50 transition-colors text-left"
                >
                  {item.location?.image_urls?.[0] ? (
                    <img
                      src={item.location.image_urls[0]}
                      alt=""
                      className="w-10 h-10 rounded object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded bg-surface-low flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-on-surface-variant" strokeWidth={1.5} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-on-surface truncate">
                      {item.location?.name || `Location ${item.id.slice(0, 8)}`}
                    </p>
                    <p className="text-xs text-on-surface-variant">{item.location?.city}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex items-center gap-1 text-xs text-pink-400 font-medium">
                      <Heart className="w-3 h-3 fill-pink-400" strokeWidth={1.5} />
                      {item.users.length}
                    </div>
                    {isExpanded
                      ? <ChevronUp className="w-3.5 h-3.5 text-on-surface-variant" strokeWidth={2} />
                      : <ChevronDown className="w-3.5 h-3.5 text-on-surface-variant" strokeWidth={2} />
                    }
                  </div>
                </button>

                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-outline-variant/20 bg-surface-low/20"
                  >
                    <div className="p-3">
                      <p className="text-xs text-on-surface-variant uppercase tracking-wide mb-2">
                        Saved by {item.users.length} {item.users.length === 1 ? 'user' : 'users'}
                      </p>
                      <div className="space-y-1.5">
                        {item.users.map((u, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <div className="w-5 h-5 rounded-full bg-gold/20 text-gold text-[10px] font-semibold flex items-center justify-center flex-shrink-0">
                              {u.email?.[0]?.toUpperCase() || '?'}
                            </div>
                            <span className="text-on-surface flex-1">
                              {u.email || <span className="text-on-surface-variant italic">Unknown — {u.user_id.slice(0, 12)}…</span>}
                            </span>
                            <span className="text-on-surface-variant">
                              {new Date(u.added_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
