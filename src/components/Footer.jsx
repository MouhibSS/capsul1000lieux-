import { Link } from 'react-router-dom'
import { Instagram, Twitter, Linkedin, ArrowUpRight } from 'lucide-react'
import { useTranslation } from '../context/LanguageContext'

const socials = [
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
]

export default function Footer() {
  const t = useTranslation('footer')

  const nav = {
    [t.indexLabel]: [
      { label: t.indexAllSpaces, href: '/explore' },
      { label: t.indexStudios, href: '/explore?type=studio' },
      { label: t.indexVillas, href: '/explore?type=villa' },
      { label: t.indexRooftops, href: '/explore?type=rooftop' },
    ],
    [t.studioLabel]: [
      { label: t.studioProjects || 'Projects', href: '/projects' },
      { label: t.studioListSpace, href: '/list-space' },
      { label: t.studioContact, href: '/contact' },
      { label: t.studioPress, href: '/contact' },
    ],
    [t.legalLabel]: [
      { label: t.legalPrivacy, href: '#' },
      { label: t.legalTerms, href: '#' },
      { label: t.legalCookies, href: '#' },
    ],
  }

  return (
    <footer className="relative bg-bg border-t border-outline-variant/25 noise overflow-hidden">
      {/* Huge display wordmark — scene-style */}
      <div className="container-main pt-16 md:pt-24 pb-10 md:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 lg:gap-16 items-end">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-3 mb-6 md:mb-8">
              <span className="w-6 h-px bg-gold" />
              <span className="eyebrow">{t.tagline}</span>
            </div>
            <h2
              className="font-display font-light leading-[0.88] tracking-display uppercase text-on-surface"
              style={{ fontSize: 'clamp(2.5rem, 9vw, 9rem)' }}
            >
              Build your
              <br />
              <span className="stroke-text italic font-extralight">next chapter</span>
              <br />
              <span className="text-gold-gradient">in Tunisia.</span>
            </h2>
          </div>
          <div className="lg:col-span-4 lg:col-start-9 flex flex-col gap-6">
            <p className="text-on-surface-variant font-light leading-relaxed">
              {t.description}
            </p>
            <Link to="/explore" className="btn-primary group self-start">
              {t.startExploring}
              <ArrowUpRight
                className="w-3.5 h-3.5 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                strokeWidth={1.8}
              />
            </Link>
          </div>
        </div>
      </div>

      {/* Meta grid */}
      <div className="container-main pt-10 md:pt-14 pb-8 md:pb-10 border-t border-outline-variant/25 grid grid-cols-2 md:grid-cols-12 gap-8 md:gap-10">
        <div className="col-span-2 md:col-span-4">
          <Link to="/" className="inline-flex items-center gap-3 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-gold" />
            <span className="font-display text-lg font-medium tracking-[0.35em] text-on-surface uppercase">
              216 000 lieux
            </span>
          </Link>
          <p className="text-on-surface-variant text-sm leading-relaxed max-w-xs font-light mb-6">
            {t.footerTagline}
          </p>
          <div className="flex items-center gap-2">
            {socials.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="w-10 h-10 border border-outline-variant/40 flex items-center justify-center text-on-surface-variant hover:text-gold hover:border-gold transition-colors"
              >
                <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
              </a>
            ))}
          </div>
        </div>

        {Object.entries(nav).map(([section, items]) => (
          <div key={section} className="md:col-span-2">
            <h4 className="eyebrow-sm mb-5">{section}</h4>
            <ul className="space-y-3">
              {items.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    className="group inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-gold transition-colors duration-300 font-light"
                  >
                    {item.label}
                    <ArrowUpRight
                      className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                      strokeWidth={1.5}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="col-span-2 md:col-span-2">
          <h4 className="eyebrow-sm mb-5">{t.contactLabel}</h4>
          <a
            href="mailto:hello@capsul.tn"
            className="block text-sm text-on-surface-variant hover:text-gold transition-colors font-light mb-2"
          >
            {t.email}
          </a>
          <p className="text-sm text-on-surface-variant font-light">{t.location}</p>
          <p className="font-mono eyebrow-sm text-on-surface-variant mt-3">
            {t.coordinates}
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-outline-variant/25">
        <div className="container-main py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-on-surface-variant text-xs font-light">
            {t.copyright}
          </p>
          <div className="flex items-center gap-3">
            <span className="w-1 h-1 rounded-full bg-gold animate-pulse-slow" />
            <span className="eyebrow-sm text-on-surface-variant">{t.systemStatus}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
