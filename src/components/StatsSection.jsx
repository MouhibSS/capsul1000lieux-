import { motion } from 'framer-motion'
import { useTranslation } from '../context/LanguageContext'

const ease = [0.22, 1, 0.36, 1]

export default function StatsSection() {
  const t = useTranslation('home')

  const stats = [
    { value: '1,000+', label: t.statsUniqueSpaces, desc: t.statsUniqueSpacesDesc },
    { value: '24', label: t.statsGovernorates, desc: t.statsGovernoratesDesc },
    { value: '12K+', label: t.statsProductions, desc: t.statsProductionsDesc },
    { value: '98%', label: t.statsSatisfaction, desc: t.statsSatisfactionDesc },
  ]

  const quotes = [
    { text: t.testimonial1, who: t.testimonial1Author },
    { text: t.testimonial2, who: t.testimonial2Author },
  ]
  return (
    <section className="relative py-16 md:py-24 lg:py-28 border-t border-outline-variant/25 overflow-hidden noise">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(200,169,106,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="container-main relative">
        <div className="flex items-center gap-3 mb-8 md:mb-12">
          <span className="w-6 h-px bg-gold" />
          <span className="eyebrow">{t.statsEyebrow}</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-outline-variant/25 border-y border-outline-variant/25">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.7, ease }}
              className="bg-bg p-6 md:p-10 flex flex-col gap-3 md:gap-4"
            >
              <div className="font-display text-3xl md:text-5xl font-extralight text-gold-gradient tabular-nums leading-none">
                {stat.value}
              </div>
              <div>
                <div className="eyebrow text-on-surface mb-1">{stat.label}</div>
                <div className="text-on-surface-variant text-sm font-light">{stat.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 mt-12 md:mt-20">
          {quotes.map((q, i) => (
            <motion.blockquote
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.8, ease }}
              className="relative pl-6 border-l border-gold/40"
            >
              <p className="font-display italic font-extralight text-base md:text-xl leading-[1.4] text-on-surface mb-4">
                {q.text}
              </p>
              <footer className="eyebrow-sm text-on-surface-variant">— {q.who}</footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}
