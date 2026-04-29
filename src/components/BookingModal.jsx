import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronDown, Sun, Sunset, CalendarDays, Calendar } from 'lucide-react'
import { useBookings } from '../hooks/useBookings'
import ThemedCalendar from './ThemedCalendar'

const EVENT_TYPES = [
  'Photo shoot',
  'Film / Video production',
  'Brand campaign',
  'Editorial',
  'Influencer shoot',
  'Wedding',
  'Birthday',
  'Corporate event',
  'Conference / Seminar',
  'Private party',
  'Music video',
  'Other',
]

function formatDate(s) {
  if (!s) return ''
  const d = new Date(s)
  if (isNaN(d.getTime())) return s
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
}

export default function BookingModal({ isOpen, onClose, location, selectedDate, selectedRange }) {
  const { createBooking, loading } = useBookings()

  // Date selection
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [duration, setDuration] = useState('full')
  const [dayPart, setDayPart] = useState('morning')

  // Guest info
  const [guests, setGuests] = useState(1)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [eventType, setEventType] = useState('')
  const [description, setDescription] = useState('')

  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  // Initialize dates from props
  useEffect(() => {
    if (selectedDate && !startDate) {
      setStartDate(selectedDate)
      setEndDate(selectedDate)
    }
  }, [selectedDate, startDate])

  const isMultiDay = startDate && endDate && startDate !== endDate
  const isSingleDay = startDate && endDate && startDate === endDate

  const handleStartDateChange = (value) => {
    setStartDate(value)
    if (endDate && new Date(value) > new Date(endDate)) {
      setEndDate(value)
    }
  }

  const handleEndDateChange = (value) => {
    setEndDate(value)
  }

  const calculatePrice = () => {
    if (!location?.price || !startDate || !endDate) return 0

    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)))

    if (isMultiDay) {
      return days * location.price
    }

    if (isSingleDay) {
      return duration === 'full' ? location.price : Math.round(location.price * 0.55)
    }

    return 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!startDate || !endDate) {
      setError('Veuillez sélectionner les dates.')
      return
    }

    if (!fullName.trim() || !email.trim() || !phone.trim() || !eventType) {
      setError('Veuillez renseigner nom, email, téléphone et type d\'événement.')
      return
    }

    try {
      const totalPrice = calculatePrice()
      await createBooking({
        locationId: location.id,
        startDate: startDate,
        endDate: endDate,
        dayPart: isSingleDay ? (duration === 'full' ? 'full' : dayPart) : null,
        guestFullName: fullName,
        guestEmail: email,
        guestPhone: phone,
        eventType,
        eventDescription: description,
        numGuests: guests,
        totalPrice,
      })
      setSuccess(true)
      setTimeout(() => {
        onClose()
        setSuccess(false)
        setStartDate('')
        setEndDate('')
        setFullName('')
        setEmail('')
        setPhone('')
        setEventType('')
        setDescription('')
        setGuests(1)
        setDuration('full')
        setDayPart('morning')
      }, 2200)
    } catch (err) {
      setError(err.message)
    }
  }

  if (!location) return null

  const total = calculatePrice()

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-bg/80 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-low border border-outline-variant/25 rounded-lg max-w-lg w-full p-6 my-8 max-h-[90vh] overflow-y-auto"
          >
            {success ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-green-400">✓</span>
                </div>
                <h3 className="font-display text-lg font-light text-on-surface uppercase mb-2">
                  Demande envoyée
                </h3>
                <p className="text-sm text-on-surface-variant">
                  Nous vous contactons rapidement à l'adresse {email} ou au {phone}.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-display text-lg font-light text-on-surface uppercase tracking-wide">
                    Réserver — {location.name}
                  </h2>
                  <button onClick={onClose} className="p-1 hover:bg-surface-container rounded transition-colors">
                    <X className="w-4 h-4 text-on-surface-variant" strokeWidth={1.5} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* DATE SELECTION — TWO CALENDARS */}
                  <div className="space-y-3">
                    <p className="text-[10px] tracking-[0.25em] text-on-surface-variant uppercase">Sélectionnez vos dates</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <ThemedCalendar
                        mode="single"
                        value={startDate}
                        onChange={handleStartDateChange}
                        label="Date de début"
                        placeholder="Check-in"
                      />
                      <ThemedCalendar
                        mode="single"
                        value={endDate}
                        onChange={handleEndDateChange}
                        minDate={startDate}
                        label="Date de fin"
                        placeholder="Check-out"
                      />
                    </div>

                    {startDate && endDate && (
                      <div className="p-3 bg-gold/10 border border-gold/30 rounded text-sm">
                        <div className="flex items-center gap-2 text-on-surface">
                          <Calendar className="w-4 h-4 text-gold" />
                          <span>
                            {formatDate(startDate)} → {formatDate(endDate)}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant mt-1">
                          {isSingleDay
                            ? '1 jour'
                            : `${Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))} jours`}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* DURATION SELECTOR — Only for single day */}
                  {isSingleDay && (
                    <div>
                      <label className="text-[10px] tracking-[0.25em] text-on-surface-variant uppercase block mb-2">
                        Durée
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setDuration('full')}
                          className={`flex items-center justify-center gap-2 px-3 py-3 border text-[10px] tracking-[0.2em] uppercase transition-colors ${
                            duration === 'full'
                              ? 'bg-gold text-bg border-gold'
                              : 'border-outline-variant/40 text-on-surface-variant hover:border-gold'
                          }`}
                        >
                          <CalendarDays className="w-4 h-4" strokeWidth={1.5} />
                          Journée complète
                        </button>
                        <button
                          type="button"
                          onClick={() => setDuration('half')}
                          className={`flex items-center justify-center gap-2 px-3 py-3 border text-[10px] tracking-[0.2em] uppercase transition-colors ${
                            duration === 'half'
                              ? 'bg-gold text-bg border-gold'
                              : 'border-outline-variant/40 text-on-surface-variant hover:border-gold'
                          }`}
                        >
                          <Sun className="w-4 h-4" strokeWidth={1.5} />
                          Demi-journée
                        </button>
                      </div>

                      {duration === 'half' && (
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {[
                            { k: 'morning',   label: 'Matin',      icon: Sun },
                            { k: 'afternoon', label: 'Après-midi', icon: Sunset },
                          ].map(({ k, label, icon: Icon }) => (
                            <button
                              key={k}
                              type="button"
                              onClick={() => setDayPart(k)}
                              className={`flex items-center justify-center gap-2 px-3 py-2.5 border text-[10px] tracking-[0.2em] uppercase transition-colors ${
                                dayPart === k
                                  ? 'bg-gold text-bg border-gold'
                                  : 'border-outline-variant/40 text-on-surface-variant hover:border-gold'
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                              {label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* GUEST INFO */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Nom complet *">
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="w-full px-3 py-2.5 text-sm bg-bg border border-outline-variant/40 rounded text-on-surface outline-none focus:border-gold transition-colors"
                      />
                    </Field>
                    <Field label="Téléphone *">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="w-full px-3 py-2.5 text-sm bg-bg border border-outline-variant/40 rounded text-on-surface outline-none focus:border-gold transition-colors"
                        placeholder="+216 ..."
                      />
                    </Field>
                  </div>

                  <Field label="Email *">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 text-sm bg-bg border border-outline-variant/40 rounded text-on-surface outline-none focus:border-gold transition-colors"
                    />
                  </Field>

                  <Field label="Type d'événement *">
                    <div className="relative">
                      <select
                        value={eventType}
                        onChange={(e) => setEventType(e.target.value)}
                        required
                        className="w-full appearance-none px-3 py-2.5 pr-9 text-sm bg-bg border border-outline-variant/40 rounded text-on-surface outline-none focus:border-gold transition-colors"
                      >
                        <option value="">— Sélectionnez —</option>
                        {EVENT_TYPES.map((t) => (<option key={t} value={t}>{t}</option>))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-on-surface-variant absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={1.5} />
                    </div>
                  </Field>

                  <Field label="Description du projet">
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2.5 text-sm bg-bg border border-outline-variant/40 rounded text-on-surface outline-none focus:border-gold transition-colors resize-none"
                      placeholder="Détails utiles : équipe, matériel, horaires précis..."
                    />
                  </Field>

                  <Field label="Nombre de personnes">
                    <input
                      type="number"
                      min="1"
                      max="500"
                      value={guests}
                      onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2.5 text-sm bg-bg border border-outline-variant/40 rounded text-on-surface outline-none focus:border-gold transition-colors"
                    />
                  </Field>

                  {total > 0 && (
                    <div className="p-3 bg-gold/10 border border-gold/30 rounded">
                      <div className="flex justify-between text-sm">
                        <span className="text-on-surface-variant">Estimation</span>
                        <span className="text-gold font-medium">€{total.toFixed(0)}</span>
                      </div>
                      <p className="text-[10px] text-on-surface-variant mt-1">
                        Tarif indicatif — confirmé par notre équipe.
                      </p>
                    </div>
                  )}

                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !startDate || !endDate}
                    className="w-full px-4 py-3 bg-gold text-bg font-medium rounded text-sm hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-[0.2em]"
                  >
                    {loading ? 'Envoi...' : 'Envoyer la demande'}
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

function Field({ label, children }) {
  return (
    <div>
      <label className="text-[10px] tracking-[0.25em] text-on-surface-variant uppercase block mb-2">
        {label}
      </label>
      {children}
    </div>
  )
}
