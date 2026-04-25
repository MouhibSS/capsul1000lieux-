import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useBookings } from '../hooks/useBookings'
import ThemedCalendar from './ThemedCalendar'

export default function BookingModal({ isOpen, onClose, location }) {
  const { createBooking, loading } = useBookings()
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    guests: 1,
  })
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const calculatePrice = () => {
    if (!formData.startDate || !formData.endDate || !location?.price) return 0
    const start = new Date(formData.startDate)
    const end = new Date(formData.endDate)
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
    return nights > 0 ? nights * location.price : 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.startDate || !formData.endDate) {
      setError('Please select check-in and check-out dates')
      return
    }

    const start = new Date(formData.startDate)
    const end = new Date(formData.endDate)
    if (end <= start) {
      setError('Check-out date must be after check-in date')
      return
    }

    try {
      const totalPrice = calculatePrice()
      await createBooking(
        location.id,
        formData.startDate,
        formData.endDate,
        formData.guests,
        totalPrice
      )
      setSuccess(true)
      setTimeout(() => {
        onClose()
        setSuccess(false)
        setFormData({ startDate: '', endDate: '', guests: 1 })
      }, 2000)
    } catch (err) {
      setError(err.message)
    }
  }

  if (!location) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-bg/80 backdrop-blur-xl flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-low border border-outline-variant/25 rounded-lg max-w-md w-full p-6"
          >
            {success ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-green-400">✓</span>
                </div>
                <h3 className="font-display text-lg font-light text-on-surface uppercase mb-2">
                  Booking Pending
                </h3>
                <p className="text-sm text-on-surface-variant">
                  Your booking request has been received. Check your email for confirmation details.
                </p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-lg font-light text-on-surface uppercase tracking-wide">
                    Book {location.name}
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-1 hover:bg-surface-container rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-on-surface-variant" strokeWidth={1.5} />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <ThemedCalendar
                    mode="range"
                    label="Stay dates"
                    value={{ start: formData.startDate, end: formData.endDate }}
                    onChange={({ start, end }) => setFormData({ ...formData, startDate: start, endDate: end })}
                  />

                  <div>
                    <label className="text-xs text-on-surface-variant uppercase tracking-wide block mb-2">
                      Number of Guests
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.guests}
                      onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) })}
                      className="w-full px-3 py-2.5 text-sm bg-bg border border-outline-variant/40 rounded text-on-surface outline-none focus:border-gold transition-colors"
                    />
                  </div>

                  {/* Price Summary */}
                  {formData.startDate && formData.endDate && (
                    <div className="p-3 bg-gold/10 border border-gold/30 rounded">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-on-surface-variant">
                          {Math.ceil((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24))} nights
                        </span>
                        <span className="text-on-surface">
                          €{location.price}/night
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-on-surface font-medium">Total</span>
                        <span className="text-gold font-medium">€{calculatePrice().toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-4 py-3 bg-gold text-bg font-medium rounded text-sm hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Processing...' : 'Request Booking'}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
