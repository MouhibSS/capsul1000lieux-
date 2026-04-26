import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, ArrowRight, Check, Lock, AlertTriangle, Sparkles } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useMaintenanceContext } from '../context/MaintenanceContext'

const ease = [0.22, 1, 0.36, 1]

export default function Prelaunch() {
  const { unlock } = useMaintenanceContext()
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const [showStaff, setShowStaff] = useState(false)
  const [password, setPassword] = useState('')
  const [pwError, setPwError] = useState(false)

  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // Restore native cursor (site default hides it via CSS)
  useEffect(() => {
    document.body.classList.add('dashboard-active')
    return () => document.body.classList.remove('dashboard-active')
  }, [])

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')
    if (!email.trim()) return

    const trimmed = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setSubmitError('Please enter a valid email address.')
      return
    }

    setSubmitting(true)
    try {
      const { error } = await supabase
        .from('prelaunch_subscribers')
        .insert([{ email: trimmed, source: 'prelaunch_page' }])
      if (error) {
        if (error.code === '23505' || /duplicate/i.test(error.message || '')) {
          // Already subscribed — treat as success
          setSubmitted(true)
        } else if (error.code === '42P01' || /does not exist|schema cache/i.test(error.message || '')) {
          setSubmitError('Subscriptions not yet configured. Please try again later.')
        } else {
          setSubmitError(error.message || 'Could not save your email. Please try again.')
        }
      } else {
        setSubmitted(true)
      }
    } catch (err) {
      console.error('Subscribe error:', err)
      setSubmitError('Could not save your email. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStaffSubmit = (e) => {
    e.preventDefault()
    const ok = unlock(password)
    if (!ok) {
      setPwError(true)
      setPassword('')
      setTimeout(() => setPwError(false), 2000)
    } else {
      window.location.href = '/'
    }
  }

  return (
    <div className="relative min-h-[100dvh] bg-bg text-on-surface overflow-hidden flex items-center justify-center px-5 py-10 sm:px-6 sm:py-12">
      {/* Ambient background — orbital rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: [0.05, 0.16, 0.05],
              rotate: i % 2 === 0 ? 360 : -360,
              scale: 1,
            }}
            transition={{
              rotate: { duration: 50 + i * 22, repeat: Infinity, ease: 'linear' },
              opacity: { duration: 5 + i, repeat: Infinity, ease: 'easeInOut' },
              scale: { duration: 1.4, ease },
            }}
            className="absolute border border-gold/30 rounded-full"
            style={{
              width: `min(${(i + 1) * 30}vmin, ${(i + 1) * 240}px)`,
              height: `min(${(i + 1) * 30}vmin, ${(i + 1) * 240}px)`,
            }}
          />
        ))}
      </div>

      {/* Center halo */}
      <motion.div
        animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.08, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute pointer-events-none"
        style={{
          width: 'min(60vmin, 520px)',
          height: 'min(60vmin, 520px)',
          background: 'radial-gradient(circle, rgba(200,169,106,0.18) 0%, rgba(200,169,106,0.05) 40%, transparent 70%)',
          filter: 'blur(20px)',
        }}
      />

      {/* Faint grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          color: '#d4a85e',
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(18)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-gold/40"
            initial={{
              x: `${Math.random() * 100}%`,
              y: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
              opacity: [0, 0.7, 0],
            }}
            transition={{
              duration: 9 + Math.random() * 6,
              repeat: Infinity,
              delay: i * 0.4,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Vertical edge lines */}
      <div className="hidden md:block absolute top-8 bottom-8 left-8 w-px bg-gradient-to-b from-transparent via-gold/15 to-transparent pointer-events-none" />
      <div className="hidden md:block absolute top-8 bottom-8 right-8 w-px bg-gradient-to-b from-transparent via-gold/15 to-transparent pointer-events-none" />

      {/* Top brand */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8, ease }}
        className="absolute top-5 left-1/2 -translate-x-1/2 sm:top-8 z-20"
      >
        <div className="flex items-center gap-2.5 px-4 py-2 bg-bg/60 backdrop-blur-md border border-gold/20 rounded-full">
          <Sparkles className="w-3 h-3 text-gold" strokeWidth={1.75} />
          <span className="text-[9px] sm:text-[10px] tracking-[0.4em] uppercase text-gold font-medium whitespace-nowrap">
            216 000 Lieux
          </span>
        </div>
      </motion.div>

      {/* Central content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.1, ease }}
        className="relative z-10 w-full max-w-xl text-center mx-auto my-auto flex flex-col items-center justify-center pt-12 sm:pt-0"
      >
        {/* Status pill */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.6, ease }}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-gold/10 border border-gold/30 rounded-full mb-6 sm:mb-8 backdrop-blur-sm"
        >
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-gold"
          />
          <span className="text-[9px] sm:text-[10px] tracking-[0.3em] uppercase text-gold font-medium">
            Launching soon
          </span>
        </motion.div>

        {/* Centerpiece — animated diamond */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6, rotate: -45 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.6, duration: 1, ease }}
          className="relative mb-6 sm:mb-8"
        >
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
            {/* Outer rotating diamond */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 border border-gold/40 rotate-45"
            />
            {/* Inner counter-rotating diamond */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-2 border border-gold/60 rotate-45"
            />
            {/* Pulsing core */}
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="relative w-3 h-3 bg-gold rotate-45 shadow-[0_0_24px_rgba(200,169,106,0.8)]"
            />
          </div>
        </motion.div>

        {/* Main title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.9, ease }}
          className="font-display font-light text-4xl xs:text-5xl sm:text-6xl md:text-7xl text-on-surface uppercase tracking-display leading-[0.95] mb-4 md:mb-6 px-2"
        >
          Something
          <br />
          <span className="text-gold italic font-light">extraordinary</span>
          <br />
          is coming
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8, ease }}
          className="text-on-surface-variant text-sm md:text-base leading-relaxed max-w-md mx-auto mb-8 sm:mb-10 px-4"
        >
          A curated atlas of Tunisia's most cinematic spaces is taking shape.
          Be the first to step inside when we open the doors.
        </motion.p>

        {/* Email signup form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.8, ease }}
          className="w-full max-w-md px-4 sm:px-0"
        >
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.form
                key="form"
                onSubmit={handleEmailSubmit}
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, y: -8 }}
                className="relative"
              >
                <p className="text-[10px] tracking-[0.3em] uppercase text-on-surface-variant/70 mb-3">
                  Get notified at launch
                </p>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant group-focus-within:text-gold transition-colors" strokeWidth={1.5} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setSubmitError('') }}
                    placeholder="your@email.com"
                    autoComplete="email"
                    disabled={submitting}
                    className="w-full pl-11 pr-14 py-4 bg-surface-low/40 backdrop-blur-md border border-outline-variant/30 rounded-lg text-on-surface placeholder:text-on-surface-variant/50 text-sm tracking-wide focus:outline-none focus:border-gold/60 focus:bg-surface-low/60 transition-all disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!email || submitting}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-gold text-bg rounded-md hover:bg-gold-light transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Subscribe"
                  >
                    {submitting ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-bg/30 border-t-bg rounded-full"
                      />
                    ) : (
                      <ArrowRight className="w-4 h-4" strokeWidth={2} />
                    )}
                  </button>
                </div>

                <p className="text-[10px] sm:text-[11px] text-on-surface-variant/60 mt-3 leading-relaxed">
                  We'll send you one email — the moment we go live —
                  <br className="hidden sm:block" />
                  inviting you to explore. No spam, no resale.
                </p>

                <AnimatePresence>
                  {submitError && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-3 flex items-center justify-center gap-2 text-xs text-red-400"
                    >
                      <AlertTriangle className="w-3 h-3" strokeWidth={2} />
                      {submitError}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease }}
                className="relative bg-gold/10 border border-gold/40 rounded-lg p-6 sm:p-7 backdrop-blur-md"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', damping: 18, stiffness: 240 }}
                  className="w-12 h-12 rounded-full bg-gold/20 border border-gold/50 flex items-center justify-center mx-auto mb-4"
                >
                  <Check className="w-5 h-5 text-gold" strokeWidth={2.5} />
                </motion.div>
                <p className="font-display text-xl sm:text-2xl font-light text-gold uppercase tracking-wide mb-2">
                  You're on the list
                </p>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  We've saved <span className="text-on-surface font-medium">{email}</span>.
                  When we launch, you'll be the first to know — one email, no spam.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Live clock */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.8 }}
          className="font-mono text-[10px] sm:text-xs text-on-surface-variant/60 mt-8 sm:mt-10 tracking-widest"
        >
          TUNIS · {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
        </motion.div>

        {/* Footer lines */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="mt-6 sm:mt-8 flex items-center justify-center gap-3 sm:gap-4 text-[9px] sm:text-[10px] tracking-[0.3em] uppercase text-on-surface-variant/50"
        >
          <span className="w-6 sm:w-8 h-px bg-outline-variant/30" />
          <span>Est. 2026 · Tunisia</span>
          <span className="w-6 sm:w-8 h-px bg-outline-variant/30" />
        </motion.div>

        {/* Staff entry — collapsed by default */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.7, duration: 0.6 }}
          className="mt-8 sm:mt-10 w-full max-w-md px-4 sm:px-0"
        >
          {!showStaff ? (
            <button
              onClick={() => setShowStaff(true)}
              className="text-[10px] tracking-[0.3em] uppercase text-on-surface-variant/40 hover:text-gold transition-colors inline-flex items-center gap-2"
            >
              <Lock className="w-3 h-3" strokeWidth={1.5} />
              Staff entry
            </button>
          ) : (
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleStaffSubmit}
              className="relative"
            >
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface-variant group-focus-within:text-gold transition-colors" strokeWidth={1.5} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Staff passphrase"
                  autoFocus
                  autoComplete="off"
                  className={`w-full pl-10 pr-12 py-3 bg-surface-low/30 backdrop-blur-md border rounded-lg text-on-surface placeholder:text-on-surface-variant/40 text-xs tracking-wider focus:outline-none transition-all ${
                    pwError
                      ? 'border-red-500/60 shake'
                      : 'border-outline-variant/20 focus:border-gold/50'
                  }`}
                />
                <button
                  type="submit"
                  disabled={!password}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-on-surface-variant hover:text-gold transition-colors disabled:opacity-30"
                  aria-label="Unlock"
                >
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
                </button>
              </div>
              <button
                type="button"
                onClick={() => { setShowStaff(false); setPassword(''); setPwError(false) }}
                className="block mx-auto mt-2 text-[9px] tracking-[0.3em] uppercase text-on-surface-variant/40 hover:text-on-surface-variant transition-colors"
              >
                Cancel
              </button>
            </motion.form>
          )}
        </motion.div>
      </motion.div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
        .shake { animation: shake 0.35s ease-in-out; }
      `}</style>
    </div>
  )
}
