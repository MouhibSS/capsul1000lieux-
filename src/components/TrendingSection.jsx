import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTrendingLocations } from '../hooks/useTrendingLocations'
import LocationCard from './LocationCard'
import { useTranslation } from '../context/LanguageContext'

const ease = [0.22, 1, 0.36, 1]

export default function TrendingSection() {
  const t = useTranslation('home')
  const { locations: allTrending, loading } = useTrendingLocations()
  const trending = allTrending.slice(0, 4)

  if (loading || trending.length === 0) return null
  return (
    <section className="relative py-16 md:py-24 lg:py-28 border-t border-outline-variant/25">
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
              <span className="eyebrow">{t.trendingEyebrow}</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.9, ease }}
              className="font-display font-light text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[0.9] tracking-display uppercase text-on-surface"
            >
              {t.trendingHeading.split(' ')[0]}
              <br />
              <span className="stroke-text italic font-extralight">{t.trendingHeading.split(' ').slice(1).join(' ')}</span>
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="lg:col-span-4 lg:col-start-9 flex justify-start lg:justify-end"
          >
            <Link to="/explore" className="btn-ghost group">
              {t.trendingViewAll}
              <ArrowUpRight
                className="w-3.5 h-3.5 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                strokeWidth={1.8}
              />
            </Link>
          </motion.div>
        </div>

        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 lg:gap-8 -mx-6 sm:mx-0 px-6 sm:px-0 overflow-x-auto sm:overflow-visible snap-x snap-mandatory sm:snap-none no-scrollbar pb-3 sm:pb-0">
          {trending.map((loc, i) => (
            <div key={loc.id} className="snap-start shrink-0 basis-[82%] sm:basis-auto sm:shrink">
              <LocationCard location={loc} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
