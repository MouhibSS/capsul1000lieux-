import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthContext } from '../context/AuthContext'

export default function EmailVerificationModal({ isOpen, onClose }) {
  const { user } = useAuthContext()
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)

  const resend = async () => {
    if (!user?.email) return
    setSending(true)
    setError(null)
    try {
      const { error: err } = await supabase.auth.resend({ type: 'signup', email: user.email })
      if (err) throw err
      setSent(true)
    } catch (err) {
      setError(err.message || 'Failed to send verification email')
    } finally {
      setSending(false)
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
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gold" strokeWidth={1.5} />
                <h2 className="font-display text-lg font-light text-on-surface uppercase tracking-wide">
                  Verify your email
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-surface-container rounded transition-colors"
              >
                <X className="w-4 h-4 text-on-surface-variant" strokeWidth={1.5} />
              </button>
            </div>

            <p className="text-sm text-on-surface-variant mb-2">
              Confirm your email to secure your account and receive booking updates.
            </p>
            <p className="text-sm font-medium text-gold break-all mb-6">{user?.email}</p>

            {sent ? (
              <div className="bg-gold/10 border border-gold/30 rounded p-4 flex items-start gap-3">
                <Check className="w-4 h-4 text-gold shrink-0 mt-0.5" strokeWidth={2} />
                <div>
                  <p className="text-sm text-on-surface font-medium mb-1">Email sent</p>
                  <p className="text-xs text-on-surface-variant">
                    Check your inbox (and spam folder) for the verification link.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {error && (
                  <div className="p-3 mb-4 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs">
                    {error}
                  </div>
                )}
                <button
                  onClick={resend}
                  disabled={sending}
                  className="w-full px-4 py-3 bg-gold text-bg font-medium rounded text-sm hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? 'Sending...' : 'Send verification email'}
                </button>
                <p className="text-[11px] text-on-surface-variant/70 mt-3 text-center">
                  Optional — your account works without it, but verifying unlocks email notifications.
                </p>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
