import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ArrowRight, ArrowLeft, Image as ImageIcon } from 'lucide-react'

const ease = [0.22, 1, 0.36, 1]

const pageVariants = {
  initial: { opacity: 0 },
  enter: { opacity: 1, transition: { duration: 0.6, ease } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
}

const steps = ['Space', 'Details', 'Pricing', 'Photos']
const types = ['Loft', 'Villa', 'Studio', 'Rooftop', 'Industrial', 'Penthouse', 'Mansion', 'Other']

export default function ListSpace() {
  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    name: '',
    city: '',
    address: '',
    type: '',
    area: '',
    capacity: '',
    description: '',
    price: '',
    amenities: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
  })

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))
  const next = () => (step < steps.length - 1 ? setStep((s) => s + 1) : setSubmitted(true))
  const back = () => setStep((s) => s - 1)

  if (submitted)
    return (
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="enter"
        exit="exit"
        className="min-h-screen flex items-center justify-center bg-bg px-6"
      >
        <div className="text-center max-w-lg">
          <div className="diamond mx-auto mb-10">
            <Check className="w-5 h-5 text-gold" strokeWidth={1.5} />
          </div>
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="w-6 h-px bg-gold" />
            <span className="eyebrow">Submitted for review</span>
            <span className="w-6 h-px bg-gold" />
          </div>
          <h1 className="font-display font-light text-5xl md:text-7xl leading-[0.9] tracking-display uppercase text-on-surface mb-8">
            You're
            <br />
            <span className="text-gold-gradient italic">listed.</span>
          </h1>
          <p className="text-on-surface-variant text-base font-light leading-relaxed mb-10">
            A 216 000 lieux scout will review your space and schedule a visit within
            48 hours. Welcome to the index.
          </p>
          <Link to="/" className="btn-primary">
            Back to home
          </Link>
        </div>
      </motion.div>
    )

  return (
    <motion.div variants={pageVariants} initial="initial" animate="enter" exit="exit" className="min-h-screen bg-bg">
      {/* Hero */}
      <section className="pt-28 md:pt-36 pb-10 md:pb-14 border-b border-outline-variant/25 noise">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 items-end">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-6 h-px bg-gold" />
                <span className="eyebrow">For space owners</span>
              </div>
              <h1
                className="font-display font-light leading-[0.88] tracking-display uppercase text-on-surface"
                style={{ fontSize: 'clamp(2.6rem, 9vw, 9rem)' }}
              >
                List your
                <br />
                <span className="text-gold-gradient italic font-extralight">space.</span>
              </h1>
            </div>
            <p className="lg:col-span-4 text-on-surface-variant font-light leading-relaxed">
              Join 500+ Tunisian hosts earning from extraordinary properties —
              vetted productions, professional contracts, protected spaces.
            </p>
          </div>
        </div>
      </section>

      <section className="py-10 md:py-16">
        <div className="container-main max-w-3xl">
          {/* Progress */}
          <div className="flex items-center gap-0 mb-10 md:mb-14 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {steps.map((s, i) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 flex items-center justify-center text-[10px] font-semibold tracking-[0.2em] transition-all duration-400 ${
                      i < step
                        ? 'bg-gold text-bg'
                        : i === step
                        ? 'border border-gold text-gold bg-gold/5'
                        : 'border border-outline-variant/40 text-on-surface-variant'
                    }`}
                  >
                    {i < step ? <Check className="w-3.5 h-3.5" strokeWidth={2} /> : String(i + 1).padStart(2, '0')}
                  </div>
                  <span className="eyebrow-sm text-on-surface-variant mt-2 whitespace-nowrap">
                    {s}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`flex-1 h-px mx-3 transition-colors duration-400 ${
                      i < step ? 'bg-gold' : 'bg-outline-variant/40'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Form steps */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease }}
              className="border border-outline-variant/30 p-6 md:p-10 space-y-5 md:space-y-6"
            >
              {step === 0 && (
                <>
                  <h2 className="font-display text-2xl md:text-4xl font-light text-on-surface mb-4 uppercase tracking-display">
                    About your space
                  </h2>
                  <div>
                    <label className="eyebrow-sm mb-2 block">Space name</label>
                    <input
                      className="w-full bg-transparent border-b border-outline-variant/40 py-3 text-on-surface text-sm outline-none focus:border-gold transition-colors font-light"
                      placeholder="e.g. Dar El Médina"
                      value={form.name}
                      onChange={(e) => set('name', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="eyebrow-sm mb-2 block">City</label>
                      <input
                        className="w-full bg-transparent border-b border-outline-variant/40 py-3 text-on-surface text-sm outline-none focus:border-gold transition-colors font-light"
                        placeholder="Sidi Bou Said"
                        value={form.city}
                        onChange={(e) => set('city', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="eyebrow-sm mb-2 block">Governorate</label>
                      <input
                        className="w-full bg-transparent border-b border-outline-variant/40 py-3 text-on-surface text-sm outline-none focus:border-gold transition-colors font-light"
                        placeholder="Tunis"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="eyebrow-sm mb-3 block">Space type</label>
                    <div className="flex flex-wrap gap-2">
                      {types.map((t) => (
                        <button
                          key={t}
                          onClick={() => set('type', t)}
                          type="button"
                          className={`px-4 py-2 text-[10px] font-medium tracking-[0.25em] uppercase transition-all ${
                            form.type === t
                              ? 'bg-gold text-bg'
                              : 'border border-outline-variant/40 text-on-surface-variant hover:text-gold hover:border-gold'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {step === 1 && (
                <>
                  <h2 className="font-display text-2xl md:text-4xl font-light text-on-surface mb-4 uppercase tracking-display">
                    Space details
                  </h2>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="eyebrow-sm mb-2 block">Area (m²)</label>
                      <input
                        className="w-full bg-transparent border-b border-outline-variant/40 py-3 text-on-surface text-sm outline-none focus:border-gold transition-colors font-light"
                        placeholder="250"
                        type="number"
                        value={form.area}
                        onChange={(e) => set('area', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="eyebrow-sm mb-2 block">Max capacity</label>
                      <input
                        className="w-full bg-transparent border-b border-outline-variant/40 py-3 text-on-surface text-sm outline-none focus:border-gold transition-colors font-light"
                        placeholder="30"
                        type="number"
                        value={form.capacity}
                        onChange={(e) => set('capacity', e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="eyebrow-sm mb-2 block">Description</label>
                    <textarea
                      className="w-full bg-transparent border border-outline-variant/40 p-4 text-on-surface text-sm outline-none focus:border-gold transition-colors resize-none h-32 font-light"
                      placeholder="Describe the character of your space — the light, the architecture, the feel…"
                      value={form.description}
                      onChange={(e) => set('description', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="eyebrow-sm mb-2 block">Amenities</label>
                    <input
                      className="w-full bg-transparent border-b border-outline-variant/40 py-3 text-on-surface text-sm outline-none focus:border-gold transition-colors font-light"
                      placeholder="Natural light, WiFi, Parking, Kitchen…"
                      value={form.amenities}
                      onChange={(e) => set('amenities', e.target.value)}
                    />
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <h2 className="font-display text-2xl md:text-4xl font-light text-on-surface mb-4 uppercase tracking-display">
                    Pricing & contact
                  </h2>
                  <div>
                    <label className="eyebrow-sm mb-2 block">Day rate (€)</label>
                    <input
                      className="w-full bg-transparent border-b border-outline-variant/40 py-3 text-on-surface text-sm outline-none focus:border-gold transition-colors font-light"
                      placeholder="500"
                      type="number"
                      value={form.price}
                      onChange={(e) => set('price', e.target.value)}
                    />
                  </div>

                  <div className="border border-gold/30 p-5 bg-gold/[0.03]">
                    <div className="eyebrow-sm text-gold mb-2">Earnings estimate</div>
                    <p className="text-on-surface text-sm font-light">
                      At €{form.price || 0}/day × 10 bookings/month ={' '}
                      <strong className="text-gold font-mono tabular-nums">
                        €{(parseInt(form.price || 0) * 10 * 0.85).toLocaleString()}
                      </strong>{' '}
                      after platform fees
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="eyebrow-sm mb-2 block">Full name</label>
                      <input
                        className="w-full bg-transparent border-b border-outline-variant/40 py-3 text-on-surface text-sm outline-none focus:border-gold transition-colors font-light"
                        placeholder="Youssef Belhadj"
                        value={form.ownerName}
                        onChange={(e) => set('ownerName', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="eyebrow-sm mb-2 block">Email</label>
                      <input
                        className="w-full bg-transparent border-b border-outline-variant/40 py-3 text-on-surface text-sm outline-none focus:border-gold transition-colors font-light"
                        placeholder="you@example.com"
                        type="email"
                        value={form.ownerEmail}
                        onChange={(e) => set('ownerEmail', e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <h2 className="font-display text-2xl md:text-4xl font-light text-on-surface mb-2 uppercase tracking-display">
                    Add photos
                  </h2>
                  <p className="text-on-surface-variant text-sm font-light mb-6">
                    High-quality photos dramatically increase your booking
                    rate. We will also schedule an editorial shoot at no cost
                    after the visit.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`border border-dashed border-outline-variant/40 ${
                          i === 0 ? 'col-span-2 h-48' : 'h-32'
                        } flex flex-col items-center justify-center gap-2 hover:border-gold transition-colors cursor-pointer group`}
                      >
                        <ImageIcon
                          className="w-5 h-5 text-on-surface-variant group-hover:text-gold transition-colors"
                          strokeWidth={1.5}
                        />
                        <span className="eyebrow-sm group-hover:text-gold transition-colors">
                          {i === 0 ? 'Main photo (hero)' : `Photo ${i + 1}`}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="eyebrow-sm text-on-surface-variant">
                    Drag & drop or click to upload — JPG/PNG, min 1920×1080.
                  </p>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Nav */}
          <div className="flex items-center justify-between mt-6 md:mt-8 gap-3 flex-wrap">
            <button
              onClick={back}
              disabled={step === 0}
              className="btn-ghost disabled:opacity-30 disabled:cursor-not-allowed group"
            >
              <ArrowLeft
                className="w-3.5 h-3.5 transition-transform duration-500 group-hover:-translate-x-0.5"
                strokeWidth={1.8}
              />
              Back
            </button>
            <button onClick={next} className="btn-primary group">
              {step === steps.length - 1 ? 'Submit for review' : 'Continue'}
              <ArrowRight
                className="w-3.5 h-3.5 transition-transform duration-500 group-hover:translate-x-0.5"
                strokeWidth={1.8}
              />
            </button>
          </div>
        </div>
      </section>
    </motion.div>
  )
}
