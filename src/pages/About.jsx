import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { getAboutImageUrl } from '../utils/cdn'

const ease = [0.22, 1, 0.36, 1]

const pageVariants = {
  initial: { opacity: 0 },
  enter: { opacity: 1, transition: { duration: 0.6, ease } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
}

const timeline = [
  { year: '2022', event: 'Founded in Tunis with 50 curated locations across Carthage and Sidi Bou Said.' },
  { year: '2023', event: 'Expanded across the Sahel and Cap Bon — surpassed 500 vetted spaces.' },
  { year: '2024', event: '10,000 productions hosted. Studio Oasis opens in Tozeur. Series A raised.' },
  { year: '2026', event: 'All 24 governorates covered. 1,000+ spaces nationwide.' },
]

const team = [
  {
    name: 'Léa Moreau',
    role: 'Co-founder & CEO',
    bio: 'Former photo editor, Condé Nast Paris. Moved to Tunis in 2021 after shooting here for a decade.',
  },
  {
    name: 'Youssef Belhadj',
    role: 'Co-founder & Head of Scouting',
    bio: 'Location scout on 40+ features shot in Tunisia — from Lucasfilm to A24.',
  },
  {
    name: 'Amira Ben Salah',
    role: 'Head of Production',
    bio: 'Ten years running production in the Maghreb. Based between Tunis and Marrakech.',
  },
]

export default function About() {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="enter" exit="exit" className="min-h-screen bg-bg">
      {/* Hero */}
      <section className="relative pt-28 md:pt-40 pb-16 md:pb-24 border-b border-outline-variant/25 overflow-hidden noise">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 25% 40%, rgba(200,169,106,0.08) 0%, transparent 60%)',
          }}
        />
        <div className="container-main relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
            <div className="lg:col-span-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease }}
                className="flex items-center gap-3 mb-6"
              >
                <span className="w-6 h-px bg-gold" />
                <span className="eyebrow">The Studio — Est. 2022</span>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.9, ease }}
                className="font-display font-light leading-[0.88] tracking-display uppercase text-on-surface"
                style={{ fontSize: 'clamp(2.6rem, 10vw, 10rem)' }}
              >
                Every space
                <br />
                <span className="stroke-text italic font-extralight">tells a</span>
                <br />
                <span className="text-gold-gradient">story.</span>
              </motion.h1>
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="lg:col-span-4 text-on-surface-variant font-light leading-relaxed text-lg"
            >
              Capsul is a Tunis-based studio building the most considered
              location index in North Africa — for directors, photographers,
              and brands who take production seriously.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Mission — editorial split */}
      <section className="py-16 md:py-24 lg:py-28 border-b border-outline-variant/25">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease }}
              className="lg:col-span-5"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="w-6 h-px bg-gold" />
                <span className="eyebrow">Mission</span>
              </div>
              <h2 className="font-display font-light text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[0.95] tracking-display uppercase text-on-surface mb-6 md:mb-8">
                Better
                <br />
                <span className="text-gold-gradient italic">infrastructure</span>
                <br />
                for creators.
              </h2>
              <p className="text-on-surface-variant text-base leading-relaxed font-light mb-4">
                We curate, verify, and represent spaces that genuinely inspire —
                not just rooms with decent light. From ksar ruins to seafront
                penthouses, every Capsul location has been walked by one of our
                scouts, photographed in multiple lights, and briefed for
                production logistics.
              </p>
              <p className="text-on-surface-variant text-base leading-relaxed font-light">
                For hosts, we offer a dignified platform where architecture is
                treated as the craft it is. For creators, we remove every
                barrier between vision and location.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 1.03 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease }}
              className="lg:col-span-6 lg:col-start-7 relative img-zoom overflow-hidden aspect-[4/5] bg-surface-low"
              style={{ backgroundColor: '#102035' }}
            >
              <img
                src={getAboutImageUrl(1)}
                alt="Tunisian coastline"
                className="w-full h-full object-cover img-mono"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg/40 to-transparent" />
              <div className="absolute top-6 left-6 w-6 h-6 border-l border-t border-gold/70" />
              <div className="absolute top-6 right-6 w-6 h-6 border-r border-t border-gold/70" />
              <div className="absolute bottom-6 left-6 w-6 h-6 border-l border-b border-gold/70" />
              <div className="absolute bottom-6 right-6 w-6 h-6 border-r border-b border-gold/70" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 md:py-24 lg:py-28 border-b border-outline-variant/25">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 mb-10 md:mb-16">
            <div className="lg:col-span-4">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-6 h-px bg-gold" />
                <span className="eyebrow">Journey</span>
              </div>
              <h2 className="font-display font-light text-3xl sm:text-4xl md:text-6xl leading-[0.95] tracking-display uppercase text-on-surface lg:sticky lg:top-32">
                How we
                <br />
                <span className="stroke-text italic font-extralight">got here.</span>
              </h2>
            </div>
            <div className="lg:col-span-7 lg:col-start-6">
              {timeline.map((item, i) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.7, ease }}
                  className="grid grid-cols-[auto_1fr] gap-5 md:gap-10 py-6 md:py-8 border-b border-outline-variant/25 last:border-none"
                >
                  <span className="font-display text-3xl md:text-5xl font-extralight text-gold/50 tabular-nums leading-none">
                    {item.year}
                  </span>
                  <p className="text-on-surface text-base md:text-xl font-light leading-relaxed">
                    {item.event}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 md:py-24 lg:py-28 border-b border-outline-variant/25">
        <div className="container-main">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-6 h-px bg-gold" />
            <span className="eyebrow">The People</span>
          </div>
          <h2 className="font-display font-light text-3xl sm:text-4xl md:text-6xl lg:text-7xl leading-[0.95] tracking-display uppercase text-on-surface mb-10 md:mb-14">
            The studio,
            <br />
            <span className="text-gold-gradient italic font-extralight">behind the scenes.</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-outline-variant/25 border border-outline-variant/25">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.7, ease }}
                className="bg-bg p-6 md:p-10 flex flex-col gap-4 md:gap-5"
              >
                <span className="font-display text-5xl font-extralight text-gold/40 tabular-nums leading-none">
                  0{i + 1}
                </span>
                <div>
                  <p className="font-display text-2xl font-light text-on-surface uppercase tracking-display">
                    {member.name}
                  </p>
                  <p className="eyebrow-sm text-gold mt-2">{member.role}</p>
                </div>
                <p className="text-on-surface-variant text-sm font-light leading-relaxed">
                  {member.bio}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 lg:py-28">
        <div className="container-main text-center max-w-3xl mx-auto">
          <h2 className="font-display font-light text-3xl sm:text-4xl md:text-6xl lg:text-7xl leading-[0.95] tracking-display uppercase text-on-surface mb-8 md:mb-10">
            Ready to
            <br />
            <span className="text-gold-gradient italic">explore?</span>
          </h2>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link to="/explore" className="btn-primary group">
              Browse spaces
              <ArrowUpRight
                className="w-3.5 h-3.5 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                strokeWidth={1.8}
              />
            </Link>
            <Link to="/list-space" className="btn-ghost">
              List your space
            </Link>
          </div>
        </div>
      </section>
    </motion.div>
  )
}
