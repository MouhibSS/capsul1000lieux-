import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Camera, Film, Users, Search, MessageCircle, FileCheck, Sparkles, Headphones } from 'lucide-react'
import { useTranslation } from '../context/LanguageContext'
import { getHeroImageUrl, getCategoryImageUrl } from '../utils/cdn'
import Hero from '../components/Hero'
import CinematicJourney from '../components/CinematicJourney'
import FeaturedCarousel from '../components/FeaturedCarousel'
import TrendingSection from '../components/TrendingSection'
import SignatureEmblem from '../components/SignatureEmblem'
import AdvancedSearchBar from '../components/AdvancedSearchBar'

const ease = [0.22, 1, 0.36, 1]

const pageVariants = {
  initial: { opacity: 0 },
  enter: { opacity: 1, transition: { duration: 0.6, ease } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
}

const TERRACOTTA = '#E8843A'

export default function Home() {
  const t = useTranslation('home')
  const tHero = useTranslation('hero')

  const categories = [
    { label: 'Sidi Bou Said',  count: 142, city: 'Sidi Bou Said', img: getCategoryImageUrl('rooftop'), fallback: '#0e1a25' },
    { label: 'La Marsa',       count: 89,  city: 'La Marsa',      img: getCategoryImageUrl('beachfront'), fallback: '#3a2614' },
    { label: 'Hammamet',       count: 67,  city: 'Hammamet',      img: getCategoryImageUrl('apartment'), fallback: '#1a1410' },
    { label: 'Tozeur',         count: 118, city: 'Tozeur',        img: getCategoryImageUrl('mountain'), fallback: '#2b1d10' },
    { label: 'Djerba',         count: 34,  city: 'Djerba',        img: getCategoryImageUrl('garden'), fallback: '#2a1810' },
    { label: 'Tunis',          count: 22,  city: 'Tunis',         img: getCategoryImageUrl('villa'), fallback: '#14232a' },
  ]

  const services = [
    { label: t.servicesPhotoShoots,     icon: Camera },
    { label: t.servicesFilmProductions, icon: Film },
    { label: t.servicesBrandCampaigns,  icon: Users },
    { label: t.servicesEditorials,      icon: Camera },
    { label: t.servicesEvents,          icon: Users },
    { label: t.servicesInfluencerShoots, icon: Camera },
  ]
  const doubled = [
    'Sidi Bou Said','✦','La Marsa','✦','Tozeur','✦',
    'Tataouine','✦','Djerba','✦','Matmata','✦',
    'Kairouan','✦','Tunis','✦',
    'Sidi Bou Said','✦','La Marsa','✦','Tozeur','✦',
    'Tataouine','✦','Djerba','✦','Matmata','✦',
    'Kairouan','✦','Tunis','✦',
  ]

  return (
    <motion.div variants={pageVariants} initial="initial" animate="enter" exit="exit">
      <Hero />

      {/* ── Search bar — blends into next section ── */}
      <div className="relative z-50 -mt-12 md:-mt-20">
        {/* Gradient blend overlay */}
        <div
          className="absolute inset-x-0 -top-20 md:-top-32 h-40 md:h-56 pointer-events-none z-0"
          style={{
            background: 'linear-gradient(180deg, rgba(10,10,10,0) 0%, rgba(10,10,10,0.4) 40%, rgba(10,10,10,0.85) 80%, rgba(10,10,10,1) 100%)',
          }}
        />
        <div className="container-main relative">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.4 }}
          >
            <AdvancedSearchBar />
          </motion.div>
        </div>
      </div>

      {/* ── Hero intro — description + stats ── */}
      <div className="relative z-20 bg-bg">
        <div className="container-main pt-12 md:pt-16 pb-10 md:pb-14">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.5 }}
            className="max-w-3xl text-on-surface-variant text-sm md:text-base font-light leading-relaxed mb-8 md:mb-10"
          >
            {tHero.description}
          </motion.p>

          {/* Stats row — clients, places, governorates */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease, delay: 0.7 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-px bg-outline-variant/25 border border-outline-variant/25"
          >
            {[
              { val: '850+', label: 'Clients served',     desc: 'Directors, brands & agencies' },
              { val: '1K+',  label: 'Curated places',     desc: 'Hand-scouted across Tunisia' },
              { val: '24/24', label: 'Governorates covered', desc: 'From Tunis to Tataouine' },
            ].map(({ val, label, desc }) => (
              <div key={label} className="bg-bg px-6 py-6 md:px-8 md:py-7 flex flex-col gap-2">
                <span className="font-display text-3xl md:text-4xl font-light text-gold tabular-nums leading-none">{val}</span>
                <span className="eyebrow text-on-surface mt-1">{label}</span>
                <span className="text-on-surface-variant text-xs font-light leading-relaxed">{desc}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Location marquee ─────────────────────────────────────── */}
      <div
        className="marquee py-5 md:py-7 border-y border-outline-variant/25 overflow-hidden relative z-10"
        style={{ background: 'linear-gradient(90deg,#0a0a0a 0%,#12080200 30%,#0a100e 60%,#080a12 85%,#0a0a0a 100%)' }}
      >
        <div className="marquee-track gap-6 md:gap-10">
          {doubled.map((it, i) => (
            <span
              key={i}
              className="font-display text-sm md:text-base font-extralight uppercase tracking-[0.2em] text-on-surface-variant/55 shrink-0"
            >
              {it === '✦' ? <span className="text-gold/50">✦</span> : it}
            </span>
          ))}
        </div>
      </div>

      {/* ── Signature Emblem — 3D interactive centerpiece ────────── */}
      <SignatureEmblem />

      {/* ── Featured & Trending — moved up after centerpiece ─────── */}
      <FeaturedCarousel />
      <TrendingSection />

    

      <CinematicJourney />

      {/* ── Services — desert backdrop ───────────────────────────── */}
      <section className="relative py-14 md:py-20 border-t border-outline-variant/25 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <img
            src={getHeroImageUrl(2)}
            alt=""
            aria-hidden
            className="w-full h-full object-cover"
            style={{ filter: 'grayscale(100%) brightness(0.16)' }}
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg,rgba(10,10,10,0.75)0%,rgba(10,10,10,0.5)50%,rgba(10,10,10,0.75)100%)' }} />
        </div>
        <div className="container-main relative">
          <div className="flex items-center gap-3 mb-8 md:mb-10">
            <span className="w-6 h-px bg-gold" />
            <span className="eyebrow">{t.servicesEyebrow}</span>
          </div>
          <div className="flex md:grid md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-px md:bg-outline-variant/20 md:border md:border-outline-variant/20 -mx-6 md:mx-0 px-6 md:px-0 overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none no-scrollbar pb-3 md:pb-0">
            {services.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.6 }}
                className="snap-start shrink-0 basis-[58%] sm:basis-[42%] md:basis-auto md:shrink bg-bg/55 backdrop-blur-sm p-5 md:p-6 flex flex-col gap-3 items-start hover:bg-surface-low/70 transition-colors group border border-outline-variant/20 md:border-0"
              >
                <s.icon className="w-4 h-4 text-gold" strokeWidth={1.5} />
                <span className="eyebrow text-on-surface group-hover:text-gold transition-colors">{s.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Accompaniment — we walk you through every booking ───────────── */}
      <section className="relative py-16 md:py-24 lg:py-32 border-t border-outline-variant/25 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <img
            src={getHeroImageUrl(3)}
            alt=""
            aria-hidden
            className="w-full h-full object-cover"
            style={{ filter: 'grayscale(100%) brightness(0.08)' }}
          />
          <div className="absolute inset-0 bg-bg/90" />
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                'radial-gradient(ellipse 50% 50% at 20% 30%, rgba(200,169,106,0.05) 0%, transparent 70%)',
                'radial-gradient(ellipse 50% 50% at 80% 60%, rgba(200,169,106,0.07) 0%, transparent 70%)',
                'radial-gradient(ellipse 50% 50% at 20% 30%, rgba(200,169,106,0.05) 0%, transparent 70%)',
              ],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="container-main relative">
          {/* Heading */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 items-end mb-12 md:mb-20">
            <div className="lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease }}
                className="flex items-center gap-3 mb-6"
              >
                <span className="w-6 h-px bg-gold" />
                <span className="eyebrow">By your side, end to end</span>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, ease, delay: 0.1 }}
                className="font-display font-light text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[0.9] tracking-display uppercase text-on-surface"
              >
                We walk you through
                <br />
                <span className="stroke-text italic font-extralight">every step</span>{' '}
                <span className="text-gold-gradient">of the booking.</span>
              </motion.h2>
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="lg:col-span-4 lg:col-start-9 text-on-surface-variant text-sm font-light leading-relaxed"
            >
              From the first scout call to wrap day, our team stays close — handling logistics, permits, and on-set details so you can focus on your shoot.
            </motion.p>
          </div>

          {/* Animated journey timeline */}
          <div className="relative">
            {/* Connecting line — animated */}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.6, ease, delay: 0.4 }}
              className="hidden md:block absolute top-[42px] left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent origin-left"
            />

            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-4 lg:gap-6">
              {[
                { icon: Search,        num: '01', title: 'Discover',  desc: "Browse 1000+ vetted locations or tell us what you're looking for." },
                { icon: MessageCircle, num: '02', title: 'Connect',   desc: 'A scout responds within 24 hours with tailored recommendations.' },
                { icon: FileCheck,     num: '03', title: 'Book',      desc: 'We handle contracts, permits, and confirmation with the owner.' },
                { icon: Sparkles,      num: '04', title: 'Shoot',     desc: 'On-set support throughout the day — logistics, gear, parking.' },
                { icon: Headphones,    num: '05', title: 'Aftercare', desc: 'Wrap-up review and we keep your favorite spaces ready for next time.' },
              ].map((step, i) => (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: 0.5 + i * 0.12, duration: 0.7, ease }}
                  className="relative group"
                >
                  {/* Animated dot on the line */}
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.7 + i * 0.12, duration: 0.4, type: 'spring', stiffness: 200 }}
                    className="hidden md:flex absolute top-[34px] left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-bg border border-gold/60 items-center justify-center z-10"
                  >
                    <motion.div
                      className="w-1.5 h-1.5 rounded-full bg-gold"
                      animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
                    />
                  </motion.div>

                  <div className="md:pt-20 flex flex-col items-start md:items-center text-left md:text-center px-2">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="w-12 h-12 mb-5 flex items-center justify-center border border-gold/30 bg-bg/60 backdrop-blur-sm group-hover:border-gold group-hover:bg-gold/10 transition-colors"
                    >
                      <step.icon className="w-5 h-5 text-gold" strokeWidth={1.5} />
                    </motion.div>
                    <span className="font-display text-xs font-extralight text-gold/50 tabular-nums tracking-[0.3em] mb-3">
                      {step.num}
                    </span>
                    <h3 className="font-display text-lg md:text-xl font-light text-on-surface mb-2 leading-tight uppercase tracking-wide">
                      {step.title}
                    </h3>
                    <p className="text-on-surface-variant text-xs md:text-[13px] font-light leading-relaxed max-w-[220px]">
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA — leads to contact form with booking pre-ticked */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="mt-16 md:mt-24 flex flex-col sm:flex-row items-center justify-center gap-6 md:gap-10 pt-12 md:pt-16 border-t border-outline-variant/25"
          >
            <p className="text-on-surface-variant text-sm font-light text-center sm:text-left max-w-md">
              Ready to start your booking? Tell us about your project — a scout replies within 24 hours.
            </p>
            <Link
              to="/contact?type=booking"
              className="group inline-flex items-center gap-3 px-8 md:px-10 py-4 bg-gold text-bg font-semibold text-[10px] uppercase tracking-[0.3em] hover:bg-gold-light hover:shadow-lg hover:shadow-gold/20 hover:-translate-y-0.5 transition-all duration-300 ease-out shrink-0"
            >
              Start a booking
              <ArrowUpRight
                className="w-3.5 h-3.5 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                strokeWidth={1.8}
              />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Owners CTA — terracotta color pop ───────────────────── */}
      <section className="relative py-16 md:py-24 lg:py-28 border-t border-outline-variant/25 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <img
            src={getHeroImageUrl(4)}
            alt=""
            aria-hidden
            className="w-full h-full object-cover"
            style={{ filter: 'brightness(0.5) saturate(1.1)' }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(130deg, rgba(8,3,1,0.95) 0%, rgba(85,32,6,0.78) 50%, rgba(8,3,1,0.9) 100%)',
            }}
          />
        </div>

        <div className="container-main relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-6 h-px" style={{ backgroundColor: TERRACOTTA }} />
                <span className="eyebrow" style={{ color: TERRACOTTA }}>{t.ownersEyebrow}</span>
              </div>
              <h2 className="font-display font-light text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[0.9] tracking-display uppercase text-on-surface mb-6 md:mb-8">
                {t.ownersHeading.split(' into a')[0]} into a
                <br />
                <span className="italic font-extralight" style={{ color: TERRACOTTA }}>
                  {t.ownersHeading.split(' into a')[1]}.
                </span>
              </h2>
              <p className="text-on-surface-variant text-sm font-light leading-relaxed max-w-lg mb-8 md:mb-10">
                {t.ownersDesc}
              </p>
              <Link
                to="/list-space"
                className="inline-flex items-center gap-3 px-10 py-4 text-bg font-semibold text-[10px] uppercase tracking-[0.3em] group transition-all duration-300"
                style={{ backgroundColor: TERRACOTTA }}
              >
                {t.ownersButton}
                <ArrowUpRight
                  className="w-3.5 h-3.5 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  strokeWidth={1.8}
                />
              </Link>
            </div>

            <div className="lg:col-span-4 lg:col-start-9">
              <div className="relative overflow-hidden" style={{ minHeight: '400px' }}>
                <img
                  src={getCategoryImageUrl('rooftop')}
                  alt="Rooftop terrace"
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ filter: 'brightness(0.55) saturate(1.1)' }}
                />
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(180deg,rgba(50,18,4,0.25)0%,rgba(8,3,1,0.88)100%)' }}
                />
                <div className="absolute top-4 left-4 w-4 h-4 border-l border-t" style={{ borderColor: `${TERRACOTTA}60` }} />
                <div className="absolute top-4 right-4 w-4 h-4 border-r border-t" style={{ borderColor: `${TERRACOTTA}60` }} />
                <div className="absolute bottom-4 left-4 w-4 h-4 border-l border-b" style={{ borderColor: `${TERRACOTTA}60` }} />
                <div className="absolute bottom-4 right-4 w-4 h-4 border-r border-b" style={{ borderColor: `${TERRACOTTA}60` }} />
                <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3 border-t border-white/8">
                  {[
                    ['+500', t.hostsEarning],
                    ['10 min', t.avgListingTime],
                    ['€3,200', t.avgMonthly],
                  ].map(([val, label]) => (
                    <div key={label} className="flex items-baseline justify-between">
                      <span className="text-on-surface-variant text-[9px] tracking-[0.2em] uppercase font-light">{label}</span>
                      <span className="font-display text-xl font-light text-on-surface tabular-nums">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  )
}
