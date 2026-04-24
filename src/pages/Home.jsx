import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Zap, Shield, Globe, Camera, Film, Users } from 'lucide-react'
import { useTranslation } from '../context/LanguageContext'
import { getHeroImageUrl, getCategoryImageUrl } from '../utils/cdn'
import Hero from '../components/Hero'
import CinematicJourney from '../components/CinematicJourney'
import FeaturedCarousel from '../components/FeaturedCarousel'
import TrendingSection from '../components/TrendingSection'
import StatsSection from '../components/StatsSection'
import SearchBar from '../components/SearchBar'
import SignatureEmblem from '../components/SignatureEmblem'

const ease = [0.22, 1, 0.36, 1]

const pageVariants = {
  initial: { opacity: 0 },
  enter: { opacity: 1, transition: { duration: 0.6, ease } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
}

const TERRACOTTA = '#E8843A'

export default function Home() {
  const t = useTranslation('home')

  const categories = [
    { label: 'Sidi Bou Said',  count: 142, city: 'Sidi Bou Said', img: getCategoryImageUrl('rooftop'), fallback: '#0e1a25' },
    { label: 'La Marsa',       count: 89,  city: 'La Marsa',      img: getCategoryImageUrl('beachfront'), fallback: '#3a2614' },
    { label: 'Hammamet',       count: 67,  city: 'Hammamet',      img: getCategoryImageUrl('apartment'), fallback: '#1a1410' },
    { label: 'Tozeur',         count: 118, city: 'Tozeur',        img: getCategoryImageUrl('mountain'), fallback: '#2b1d10' },
    { label: 'Djerba',         count: 34,  city: 'Djerba',        img: getCategoryImageUrl('garden'), fallback: '#2a1810' },
    { label: 'Tunis',          count: 22,  city: 'Tunis',         img: getCategoryImageUrl('villa'), fallback: '#14232a' },
  ]

  const values = [
    { icon: Camera, num: '01', title: t.valueScoutedTitle,        desc: t.valueScoutedDesc },
    { icon: Shield, num: '02', title: t.valueProductionTitle,     desc: t.valueProductionDesc },
    { icon: Globe,  num: '03', title: t.valueGovernoratesTitle,   desc: t.valueGovernoratesDesc },
    { icon: Zap,    num: '04', title: t.valueAnswersTitle,        desc: t.valueAnswersDesc },
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

      {/* ── Location marquee ─────────────────────────────────────── */}
      <div
        className="marquee py-5 md:py-7 border-y border-outline-variant/25 overflow-hidden"
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

      {/* ── Search ──────────────────────────────────────────────── */}
      <section className="py-14 md:py-20 border-b border-outline-variant/25">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 mb-8 md:mb-10 items-center">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-3 mb-5">
                <span className="w-6 h-px bg-gold" />
                <span className="eyebrow">{t.searchEyebrow}</span>
              </div>
              <h2 className="font-display font-light text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] leading-[0.95] tracking-display uppercase text-on-surface max-w-xl">
                {t.searchHeading.split(' ').slice(0, -1).join(' ')} <span className="stroke-text italic font-extralight">{t.searchHeading.split(' ').pop()}</span>
              </h2>
              <p className="text-on-surface-variant text-sm font-light max-w-sm mt-5 leading-relaxed">
                {t.searchDesc}
              </p>
            </div>

            {/* Editorial image — right column */}
            <div className="hidden lg:block lg:col-span-4 lg:col-start-9">
              <div className="relative overflow-hidden aspect-[4/3] group">
                <img
                  src={getHeroImageUrl(1)}
                  alt="Medina interior"
                  loading="lazy"
                  className="w-full h-full object-cover img-mono"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg/70 via-transparent to-transparent" />
                <div className="absolute top-3 left-3 w-4 h-4 border-l border-t border-gold/50" />
                <div className="absolute top-3 right-3 w-4 h-4 border-r border-t border-gold/50" />
                <div className="absolute bottom-3 left-3 w-4 h-4 border-l border-b border-gold/50" />
                <div className="absolute bottom-3 right-3 w-4 h-4 border-r border-b border-gold/50" />
                <div className="absolute bottom-4 left-4 eyebrow-sm text-on-surface-variant font-mono">
                  Medina Loft · Tunis
                </div>
              </div>
            </div>
          </div>

          <SearchBar />
        </div>
      </section>

      <CinematicJourney />

      {/* ── Categories ──────────────────────────────────────────── */}
      <section className="py-16 md:py-24 lg:py-28 border-t border-outline-variant/25">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 items-end mb-10 md:mb-14">
            <div className="lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease }}
                className="flex items-center gap-3 mb-6"
              >
                <span className="w-6 h-px bg-gold" />
                <span className="eyebrow">{t.typologyEyebrow}</span>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, ease }}
                className="font-display font-light text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[0.9] tracking-display uppercase text-on-surface"
              >
                {t.typologyHeading.split(',')[0]},
                <br />
                <span className="text-gold-gradient italic font-extralight">{t.typologyHeading.split(',')[1]?.trim()}</span>
              </motion.h2>
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-4 lg:col-start-9 text-on-surface-variant text-sm font-light leading-relaxed"
            >
              {t.typologyDesc}
            </motion.p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.6, ease }}
              >
                <Link
                  to={`/explore?city=${cat.city}`}
                  className="group relative overflow-hidden block aspect-[3/4] img-zoom bg-surface-low"
                  style={{ backgroundColor: cat.fallback }}
                >
                  <img src={cat.img} alt={cat.label} className="w-full h-full object-cover transition-transform duration-700 ease-out" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
                    <div>
                      <p className="font-display text-sm font-light text-on-surface uppercase tracking-wide leading-tight group-hover:text-gold transition-colors duration-500">
                        {cat.label}
                      </p>
                      <p className="eyebrow-sm text-on-surface-variant mt-1">{cat.count} {t.typologySpaces}</p>
                    </div>
                    <ArrowUpRight className="w-3 h-3 text-gold opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500" strokeWidth={1.5} />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <FeaturedCarousel />
      <TrendingSection />

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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-outline-variant/20 border border-outline-variant/20">
            {services.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.6 }}
                className="bg-bg/55 backdrop-blur-sm p-5 md:p-6 flex flex-col gap-3 items-start hover:bg-surface-low/70 transition-colors group"
              >
                <s.icon className="w-4 h-4 text-gold" strokeWidth={1.5} />
                <span className="eyebrow text-on-surface group-hover:text-gold transition-colors">{s.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <StatsSection />

      {/* ── Values — 216 000 lieux standard ─────────────────────────────── */}
      <section className="relative py-16 md:py-24 lg:py-28 border-t border-outline-variant/25 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <img
            src={getHeroImageUrl(3)}
            alt=""
            aria-hidden
            className="w-full h-full object-cover"
            style={{ filter: 'grayscale(100%) brightness(0.1)' }}
          />
          <div className="absolute inset-0 bg-bg/88" />
        </div>
        <div className="container-main relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 items-end mb-10 md:mb-16">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-6 h-px bg-gold" />
                <span className="eyebrow">{t.valuesEyebrow}</span>
              </div>
              <h2 className="font-display font-light text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[0.9] tracking-display uppercase text-on-surface">
                {t.valuesHeading.split(' ').slice(0, 2).join(' ')}
                <br />
                <span className="stroke-text italic font-extralight">{t.valuesHeading.split(' ')[2]}</span>{' '}
                <span className="text-gold-gradient">{t.valuesHeading.split(' ').pop()}.</span>
              </h2>
            </div>
            <p className="lg:col-span-4 lg:col-start-9 text-on-surface-variant text-sm font-light leading-relaxed">
              {t.valuesDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-outline-variant/25 border border-outline-variant/25">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.7, ease }}
                className="bg-bg/90 p-6 md:p-10 lg:p-12 group"
              >
                <div className="flex items-start justify-between mb-6 md:mb-8">
                  <v.icon className="w-4 h-4 text-gold" strokeWidth={1.5} />
                  <span className="font-display text-4xl font-extralight text-gold/20 tabular-nums leading-none">
                    {v.num}
                  </span>
                </div>
                <h3 className="font-display text-lg md:text-2xl font-light text-on-surface mb-3 leading-tight">
                  {v.title}
                </h3>
                <p className="text-on-surface-variant text-sm font-light leading-relaxed max-w-md">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Owners CTA — terracotta color pop ───────────────────── */}
      <section className="relative py-16 md:py-24 lg:py-28 border-t border-outline-variant/25 overflow-hidden">
        {/* Image with warm terracotta overlay — the color pop moment */}
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
            {/* Content */}
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

            {/* Right — image card with stats overlaid */}
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
                {/* Terracotta corner marks */}
                <div className="absolute top-4 left-4 w-4 h-4 border-l border-t" style={{ borderColor: `${TERRACOTTA}60` }} />
                <div className="absolute top-4 right-4 w-4 h-4 border-r border-t" style={{ borderColor: `${TERRACOTTA}60` }} />
                <div className="absolute bottom-4 left-4 w-4 h-4 border-l border-b" style={{ borderColor: `${TERRACOTTA}60` }} />
                <div className="absolute bottom-4 right-4 w-4 h-4 border-r border-b" style={{ borderColor: `${TERRACOTTA}60` }} />
                {/* Stats */}
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
