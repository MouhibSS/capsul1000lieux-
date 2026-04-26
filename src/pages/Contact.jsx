import { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Mail, MessageSquare, Send, Check, MapPin, Clock, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

const ease = [0.22, 1, 0.36, 1]

const pageVariants = {
  initial: { opacity: 0 },
  enter: { opacity: 1, transition: { duration: 0.6, ease } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
}

const reasons = ['Book a space', 'List my space', 'Partnership', 'Press inquiry', 'Support', 'Other']

const contactPoints = [
  { icon: Mail, label: 'Email', value: 'hello@capsul.tn' },
  { icon: MapPin, label: 'Studio', value: 'Tunis, Tunisia' },
  { icon: Clock, label: 'Response', value: 'Within 24 hours' },
]

export default function Contact() {
  const [searchParams] = useSearchParams()
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', reason: '', message: '' })
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  useEffect(() => {
    const type = searchParams.get('type')
    if (type === 'support') set('reason', 'Support')
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.reason) { setError('Please select a reason.'); return }
    setSubmitting(true)
    setError('')
    try {
      const { error: dbErr } = await supabase.from('contact_messages').insert({
        name: form.name,
        email: form.email,
        reason: form.reason,
        message: form.message,
        status: 'unread',
      })
      if (dbErr) throw dbErr

      await fetch('http://localhost:3001/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      }).catch(() => {})

      setSent(true)
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const headerRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: headerRef, offset: ['start center', 'end center'] })

  return (
    <motion.div variants={pageVariants} initial="initial" animate="enter" exit="exit" className="min-h-screen bg-bg">
      <section ref={headerRef} className="relative pt-28 md:pt-36 pb-12 md:pb-16 border-b border-outline-variant/25 noise overflow-hidden">
        {/* Animated shimmer gradient */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            background: [
              'radial-gradient(ellipse 70% 60% at 20% 35%, rgba(200,169,106,0.06) 0%, transparent 60%)',
              'radial-gradient(ellipse 70% 60% at 30% 45%, rgba(220,140,100,0.1) 0%, transparent 60%)',
              'radial-gradient(ellipse 70% 60% at 20% 35%, rgba(200,169,106,0.06) 0%, transparent 60%)',
            ],
            x: [0, 40, -40, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="container-main relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 items-end">
            <div className="lg:col-span-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease }}
                className="flex items-center gap-3 mb-6"
              >
                <span className="w-6 h-px bg-gold" />
                <span className="eyebrow">Say hello</span>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.9, ease }}
                className="font-display font-light leading-[0.88] tracking-display uppercase text-on-surface"
                style={{ fontSize: 'clamp(2.6rem, 10vw, 10rem)' }}
              >
                Let's
                <br />
                <span className="text-gold-gradient italic font-extralight">talk.</span>
              </motion.h1>
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="lg:col-span-4 text-on-surface-variant font-light leading-relaxed"
            >
              Booking enquiries, host applications, press, partnerships — a
              human reads every message. Expect a real reply within 24 hours.
            </motion.p>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-12 lg:gap-16">
            {/* Left — contact points */}
            <div className="lg:col-span-5">
              <div className="space-y-px border-y border-outline-variant/25">
                {contactPoints.map((item) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease }}
                    className="flex items-center gap-5 py-6 border-b border-outline-variant/25 last:border-none"
                  >
                    <div className="w-12 h-12 border border-outline-variant/40 flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-gold" strokeWidth={1.5} />
                    </div>
                    <div>
                      <div className="eyebrow-sm mb-1">{item.label}</div>
                      <div className="text-on-surface text-lg font-light">{item.value}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-10 md:mt-12">
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-6 h-px bg-gold" />
                  <span className="eyebrow">Studio hours</span>
                </div>
                <div className="grid grid-cols-2 gap-4 font-mono text-sm">
                  <div>
                    <div className="eyebrow-sm mb-1">Mon — Fri</div>
                    <div className="text-on-surface">09:00 — 19:00</div>
                  </div>
                  <div>
                    <div className="eyebrow-sm mb-1">Sat</div>
                    <div className="text-on-surface">By appointment</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right — form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.9, ease }}
              className="lg:col-span-7"
            >
              {sent ? (
                <div className="border border-outline-variant/30 p-12 text-center flex flex-col items-center justify-center gap-5 min-h-[500px]">
                  <div className="diamond">
                    <Check className="w-5 h-5 text-gold" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-display text-4xl font-light text-on-surface uppercase tracking-display">
                    Message sent
                  </h3>
                  <p className="text-on-surface-variant text-sm font-light max-w-xs">
                    A scout will reply to your message within 24 hours. Check
                    your inbox.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="border border-outline-variant/30 p-6 md:p-10 space-y-5 md:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="eyebrow-sm mb-2 block">Name</label>
                      <input
                        className="w-full bg-transparent border-b border-outline-variant/40 py-3 text-on-surface text-sm outline-none focus:border-gold transition-colors font-light"
                        placeholder="Your full name"
                        value={form.name}
                        onChange={(e) => set('name', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="eyebrow-sm mb-2 block">Email</label>
                      <input
                        className="w-full bg-transparent border-b border-outline-variant/40 py-3 text-on-surface text-sm outline-none focus:border-gold transition-colors font-light"
                        placeholder="you@example.com"
                        type="email"
                        value={form.email}
                        onChange={(e) => set('email', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="eyebrow-sm mb-3 block">Reason</label>
                    <div className="flex flex-wrap gap-2">
                      {reasons.map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => set('reason', r)}
                          className={`px-4 py-2 text-[10px] font-medium tracking-[0.25em] uppercase transition-all ${
                            form.reason === r
                              ? 'bg-gold text-bg'
                              : 'border border-outline-variant/40 text-on-surface-variant hover:text-gold hover:border-gold'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="eyebrow-sm mb-2 block">Message</label>
                    <textarea
                      className="w-full bg-transparent border border-outline-variant/40 p-4 text-on-surface text-sm outline-none focus:border-gold transition-colors resize-none h-40 font-light"
                      placeholder="Tell us about your project, the space you're looking for, or the question on your mind…"
                      value={form.message}
                      onChange={(e) => set('message', e.target.value)}
                      required
                    />
                  </div>

                  {error && (
                    <p className="text-red-400 text-xs font-light">{error}</p>
                  )}
                  <button type="submit" disabled={submitting} className="btn-primary w-full justify-center disabled:opacity-50">
                    {submitting
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.8} />
                      : <Send className="w-3.5 h-3.5" strokeWidth={1.8} />
                    }
                    {submitting ? 'Sending…' : 'Send message'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </motion.div>
  )
}
