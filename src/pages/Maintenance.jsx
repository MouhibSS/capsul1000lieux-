import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, ArrowRight, AlertTriangle } from 'lucide-react'
import { useMaintenanceContext } from '../context/MaintenanceContext'

const ease = [0.22, 1, 0.36, 1]

export default function Maintenance() {
  const { unlock } = useMaintenanceContext()
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
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

  const handleSubmit = (e) => {
    e.preventDefault()
    const ok = unlock(password)
    if (!ok) {
      setError(true)
      setPassword('')
      setTimeout(() => setError(false), 2000)
    } else {
      window.location.href = '/'
    }
  }

  return (
    <div className="relative min-h-[100dvh] bg-bg text-on-surface overflow-hidden flex items-center justify-center px-5 py-10 sm:px-6 sm:py-12">
      {/* Ambient background — orbital rings (sized responsively so they never overflow and stay centered) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: [0.06, 0.14, 0.06],
              rotate: i % 2 === 0 ? 360 : -360,
              scale: 1,
            }}
            transition={{
              rotate: { duration: 40 + i * 20, repeat: Infinity, ease: 'linear' },
              opacity: { duration: 4 + i, repeat: Infinity, ease: 'easeInOut' },
              scale: { duration: 1.2, ease },
            }}
            className="absolute border border-gold/30 rounded-full"
            style={{
              width: `min(${(i + 1) * 35}vmin, ${(i + 1) * 280}px)`,
              height: `min(${(i + 1) * 35}vmin, ${(i + 1) * 280}px)`,
            }}
          />
        ))}
      </div>

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
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-gold/40"
            initial={{
              x: `${Math.random() * 100}%`,
              y: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 8 + Math.random() * 6,
              repeat: Infinity,
              delay: i * 0.5,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Central content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease }}
        className="relative z-10 w-full max-w-lg text-center mx-auto my-auto flex flex-col items-center justify-center"
      >
        {/* Top label */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          <span className="w-10 h-px bg-gold" />
          <span className="text-[10px] font-medium tracking-[0.4em] uppercase text-gold">
            216 000 lieux
          </span>
          <span className="w-10 h-px bg-gold" />
        </motion.div>

        {/* Status pill */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6, ease }}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-gold/10 border border-gold/30 rounded-full mb-8 backdrop-blur-sm"
        >
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-gold"
          />
          <span className="text-[10px] tracking-[0.3em] uppercase text-gold font-medium">
            Temporarily Offline
          </span>
        </motion.div>

        {/* Main title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8, ease }}
          className="font-display font-light text-4xl xs:text-5xl sm:text-6xl md:text-7xl text-on-surface uppercase tracking-display leading-[0.95] mb-5 md:mb-6 px-2"
        >
          At rest
          <br />
          <span className="text-gold italic font-light">for a moment</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8, ease }}
          className="text-on-surface-variant text-sm md:text-base leading-relaxed max-w-md mx-auto mb-3"
        >
          The atelier is closed while we polish the details.
          Our curators are refining the collection — we'll open the doors again very soon.
        </motion.p>

        {/* Live clock */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="font-mono text-xs text-on-surface-variant/60 mb-10 tracking-widest"
        >
          TUNIS · {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
        </motion.div>

        {/* Password form — admins/team */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8, ease }}
          className="relative"
        >
          <p className="text-[10px] tracking-[0.3em] uppercase text-on-surface-variant/70 mb-3">
            Staff entry
          </p>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant group-focus-within:text-gold transition-colors" strokeWidth={1.5} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter passphrase"
              autoComplete="off"
              className={`w-full pl-11 pr-14 py-4 bg-surface-low/40 backdrop-blur-md border rounded-lg text-on-surface placeholder:text-on-surface-variant/50 text-sm tracking-wider focus:outline-none transition-all ${
                error
                  ? 'border-red-500/60 shake'
                  : 'border-outline-variant/30 focus:border-gold/60 focus:bg-surface-low/60'
              }`}
            />
            <button
              type="submit"
              disabled={!password}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-gold text-bg rounded-md hover:bg-gold-light transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Unlock"
            >
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-3 flex items-center justify-center gap-2 text-xs text-red-400"
              >
                <AlertTriangle className="w-3 h-3" strokeWidth={2} />
                Incorrect passphrase
              </motion.div>
            )}
          </AnimatePresence>
        </motion.form>

        {/* Footer lines */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.8 }}
          className="mt-10 md:mt-16 flex items-center justify-center gap-4 text-[10px] tracking-[0.3em] uppercase text-on-surface-variant/50"
        >
          <span className="w-8 h-px bg-outline-variant/30" />
          <span>Est. 2026 · Tunisia</span>
          <span className="w-8 h-px bg-outline-variant/30" />
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
