import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Cookie } from 'lucide-react'

const ease = [0.22, 1, 0.36, 1]

const COOKIE_KEY = 'capsul-cookie-consent'

const categories = [
  { key: 'essential', label: 'Essential', desc: 'Authentication, security, core features', locked: true },
  { key: 'analytics', label: 'Analytics', desc: 'Help us improve the platform experience', locked: false },
  { key: 'marketing', label: 'Marketing', desc: 'Personalised content and partner offers', locked: false },
]

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [panel, setPanel] = useState(false)
  const [prefs, setPrefs] = useState({ analytics: true, marketing: false })

  useEffect(() => {
    if (!localStorage.getItem(COOKIE_KEY)) {
      const t = setTimeout(() => setVisible(true), 1800)
      return () => clearTimeout(t)
    }
  }, [])

  const save = (overrides = {}) => {
    localStorage.setItem(COOKIE_KEY, JSON.stringify({ essential: true, ...prefs, ...overrides, decided: true }))
    setVisible(false)
  }

  const toggle = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }))

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop — subtle, only on mobile */}
          <motion.div
            className="fixed inset-0 z-[98] bg-bg/40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => save()}
          />

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 32 }}
            transition={{ duration: 0.45, ease }}
            className="fixed bottom-5 right-5 left-5 md:left-auto md:right-8 md:bottom-8 md:w-80 z-[99] bg-surface-low border border-outline-variant/35"
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-outline-variant/25">
              <div className="flex items-center gap-2.5">
                <Cookie className="w-3.5 h-3.5 text-gold shrink-0" strokeWidth={1.5} />
                <span className="eyebrow">Cookie preferences</span>
              </div>
              <button
                onClick={() => save({ analytics: false, marketing: false })}
                className="text-on-surface-variant hover:text-on-surface transition-colors p-0.5"
                aria-label="Dismiss"
              >
                <X className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            </div>

            <div className="px-5 pt-4 pb-5">
              <p className="text-on-surface-variant text-[11px] font-light leading-relaxed mb-4">
                We use cookies to deliver a seamless experience and understand how 216 000 lieux is used. Manage your preferences or accept all to continue.
              </p>

              {/* Manage panel */}
              <AnimatePresence initial={false}>
                {panel && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease }}
                    className="overflow-hidden mb-4"
                  >
                    <div className="border border-outline-variant/25 divide-y divide-outline-variant/20">
                      {categories.map((cat) => (
                        <div key={cat.key} className="flex items-center justify-between gap-3 px-4 py-3">
                          <div className="min-w-0">
                            <div className="text-on-surface text-[11px] font-medium leading-none mb-0.5">{cat.label}</div>
                            <div className="text-on-surface-variant text-[9px] leading-tight">{cat.desc}</div>
                          </div>
                          {/* Toggle */}
                          <button
                            onClick={() => !cat.locked && toggle(cat.key)}
                            aria-label={cat.label}
                            className={`relative shrink-0 w-9 h-5 transition-colors duration-300 ${
                              cat.locked || prefs[cat.key] ? 'bg-gold' : 'bg-outline-variant/50'
                            } ${cat.locked ? 'cursor-default opacity-50' : 'cursor-pointer'}`}
                          >
                            <span
                              className={`absolute top-1 left-1 w-3 h-3 bg-bg transition-transform duration-300 ${
                                cat.locked || prefs[cat.key] ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => save({ analytics: true, marketing: true })}
                  className="btn-primary flex-1 py-3 text-[9px]"
                >
                  Accept all
                </button>
                {panel ? (
                  <button
                    onClick={() => save()}
                    className="btn-ghost flex-1 py-3 text-[9px]"
                  >
                    Save choices
                  </button>
                ) : (
                  <button
                    onClick={() => setPanel(true)}
                    className="btn-ghost flex-1 py-3 text-[9px]"
                  >
                    Manage
                  </button>
                )}
              </div>

              <button
                onClick={() => save({ analytics: false, marketing: false })}
                className="w-full text-center text-[9px] tracking-[0.22em] uppercase text-on-surface-variant hover:text-on-surface transition-colors"
              >
                Decline non-essential
              </button>
            </div>

            {/* Legal footer */}
            <div className="px-5 pb-4 border-t border-outline-variant/20 pt-3">
              <p className="text-[9px] text-on-surface-variant/60 leading-relaxed">
                By continuing you agree to our{' '}
                <a href="/privacy" className="underline underline-offset-2 hover:text-gold transition-colors">
                  Privacy Policy
                </a>{' '}
                &amp;{' '}
                <a href="/cookies" className="underline underline-offset-2 hover:text-gold transition-colors">
                  Cookie Policy
                </a>
                .
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
