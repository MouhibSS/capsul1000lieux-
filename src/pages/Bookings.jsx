import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'
import { useBookings } from '../hooks/useBookings'
import { Calendar, MapPin, User, DollarSign, ArrowUpRight } from 'lucide-react'

const ease = [0.22, 1, 0.36, 1]

const pageVariants = {
  initial: { opacity: 0 },
  enter: { opacity: 1, transition: { duration: 0.6, ease } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
}

export default function Bookings() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuthContext()
  const { getUserBookings } = useBookings()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      setLoading(false)
      return
    }

    const fetchBookings = async () => {
      try {
        const data = await getUserBookings()
        setBookings(data)
      } catch (err) {
        console.error('Error fetching bookings:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [user, authLoading, getUserBookings])

  if (authLoading || loading) {
    return (
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="enter"
        exit="exit"
        className="min-h-screen flex items-center justify-center"
      >
        <div className="text-on-surface-variant">Loading...</div>
      </motion.div>
    )
  }

  if (!user) {
    return (
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="enter"
        exit="exit"
      >
        <section className="min-h-screen flex flex-col items-center justify-center container-main">
          <h1 className="font-display font-light text-4xl md:text-5xl text-on-surface text-center mb-6">
            Log in to view your bookings
          </h1>
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gold hover:bg-gold-light text-bg font-semibold text-[10px] uppercase tracking-[0.3em] transition-colors"
          >
            Go to Login
            <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.8} />
          </button>
        </section>
      </motion.div>
    )
  }

  if (bookings.length === 0) {
    return (
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="enter"
        exit="exit"
      >
        <section className="min-h-screen flex flex-col items-center justify-center container-main">
          <h1 className="font-display font-light text-4xl md:text-5xl text-on-surface text-center mb-6">
            No bookings yet
          </h1>
          <p className="text-on-surface-variant text-center max-w-md mb-8">
            Start exploring and book spaces to see them here.
          </p>
          <button
            onClick={() => navigate('/explore')}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gold hover:bg-gold-light text-bg font-semibold text-[10px] uppercase tracking-[0.3em] transition-colors"
          >
            Explore Spaces
            <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.8} />
          </button>
        </section>
      </motion.div>
    )
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400'
      case 'confirmed':
        return 'bg-green-500/20 text-green-400'
      case 'completed':
        return 'bg-blue-500/20 text-blue-400'
      case 'cancelled':
        return 'bg-red-500/20 text-red-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })

  return (
    <motion.div variants={pageVariants} initial="initial" animate="enter" exit="exit">
      <section className="py-16 md:py-24 border-b border-outline-variant/25 container-main">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-6 h-px bg-gold" />
            <span className="eyebrow">Your reservations</span>
          </div>
          <h1 className="font-display font-light text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[0.9] tracking-display uppercase text-on-surface">
            My bookings
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {bookings.map((booking) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface-low border border-outline-variant/25 rounded-lg p-6 hover:border-gold/30 transition-colors"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Location Info */}
                <div className="md:col-span-2">
                  <h3 className="font-display text-xl font-light text-on-surface uppercase mb-2">
                    {booking.locations?.name || 'Location'}
                  </h3>
                  <div className="space-y-2 text-sm text-on-surface-variant">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
                      {booking.locations?.city}
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div>
                  <p className="text-xs text-on-surface-variant uppercase tracking-wide mb-2">Dates</p>
                  <div className="flex items-center gap-2 text-sm text-on-surface">
                    <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>
                      {formatDate(booking.start_date)} — {formatDate(booking.end_date)}
                    </span>
                  </div>
                </div>

                {/* Price & Status */}
                <div className="flex items-end justify-between md:flex-col md:justify-start gap-4">
                  <div>
                    <p className="text-xs text-on-surface-variant uppercase tracking-wide mb-2">Total</p>
                    <p className="text-xl font-light text-gold">€{booking.total_price}</p>
                  </div>
                  <span className={`px-3 py-1.5 rounded text-xs font-medium capitalize inline-block ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
              </div>

              {booking.status === 'pending' && (
                <div className="mt-4 pt-4 border-t border-outline-variant/15 text-xs text-on-surface-variant">
                  ⏳ Pending confirmation. We'll send you an email once this is confirmed.
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>
    </motion.div>
  )
}
