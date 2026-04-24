import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertCircle } from 'lucide-react'
import { useProfile } from '../hooks/useProfile'

export default function ProfileCompletionModal({ isOpen, onClose, onComplete }) {
  const { profile, updateProfile, loading } = useProfile()
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    phone: profile?.phone || '',
    gender: profile?.gender || '',
  })
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.first_name || !formData.last_name || !formData.phone || !formData.gender) {
      setError('All fields are required')
      return
    }

    try {
      await updateProfile(formData)
      setError(null)
      onComplete()
    } catch (err) {
      setError(err.message)
    }
  }

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
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-gold" strokeWidth={1.5} />
                <h2 className="font-display text-lg font-light text-on-surface uppercase tracking-wide">
                  Complete Your Profile
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-surface-container rounded transition-colors"
              >
                <X className="w-4 h-4 text-on-surface-variant" strokeWidth={1.5} />
              </button>
            </div>

            <p className="text-sm text-on-surface-variant mb-6">
              To complete your booking, please provide some additional information.
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="px-3 py-2.5 text-sm bg-bg border border-outline-variant/40 rounded text-on-surface outline-none focus:border-gold transition-colors"
                  placeholder="First name"
                />
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="px-3 py-2.5 text-sm bg-bg border border-outline-variant/40 rounded text-on-surface outline-none focus:border-gold transition-colors"
                  placeholder="Last name"
                />
              </div>

              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2.5 text-sm bg-bg border border-outline-variant/40 rounded text-on-surface outline-none focus:border-gold transition-colors"
                placeholder="Phone number"
              />

              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2.5 text-sm bg-bg border border-outline-variant/40 rounded text-on-surface outline-none focus:border-gold transition-colors"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>

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
                {loading ? 'Saving...' : 'Complete Profile & Continue'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
