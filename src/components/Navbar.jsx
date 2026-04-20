import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Menu, X, LogOut } from 'lucide-react'
import { useFavorites } from '../hooks/useFavorites'
import { useLanguage, useTranslation } from '../context/LanguageContext'
import { useAuthContext } from '../context/AuthContext'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [authMenuOpen, setAuthMenuOpen] = useState(false)
  const { favorites } = useFavorites()
  const { lang, choose } = useLanguage()
  const t = useTranslation('nav')
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthContext()

  const links = [
    { href: '/explore', label: t.explore || 'Explore' },
    { href: '/about', label: 'Studio' },
    { href: '/contact', label: t.contact || 'Contact' },
  ]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMenuOpen(false), [location])

  return (
    <>
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-bg/80 backdrop-blur-xl border-b border-outline-variant/20 py-3 md:py-4'
            : 'py-4 md:py-6'
        }`}
      >
        <div className="container-main flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <span className="w-1.5 h-1.5 rounded-full bg-gold" />
            <span className="font-display text-xl font-medium tracking-[0.35em] text-on-surface group-hover:text-gold transition-colors duration-300 uppercase">
              Capsul
            </span>
            <span className="hidden md:inline text-on-surface-variant/50 eyebrow-sm ml-2">
              Tunisia
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-10">
            {links.map(({ href, label }) => {
              const active = location.pathname === href
              return (
                <Link
                  key={href}
                  to={href}
                  className={`relative text-[10px] font-medium tracking-[0.35em] uppercase transition-colors duration-300 ${
                    active ? 'text-gold' : 'text-on-surface hover:text-gold'
                  }`}
                >
                  {label}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute -bottom-2 left-0 right-0 h-px bg-gold"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              )
            })}
            <div className="text-[10px] font-medium tracking-[0.35em] uppercase flex items-center gap-2 text-on-surface-variant">
              <button
                onClick={() => choose('en')}
                className={`transition-colors ${lang === 'en' ? 'text-gold' : 'hover:text-gold'}`}
              >
                EN
              </button>
              <span>/</span>
              <button
                onClick={() => choose('fr')}
                className={`transition-colors ${lang === 'fr' ? 'text-gold' : 'hover:text-gold'}`}
              >
                FR
              </button>
            </div>
          </nav>

          <div className="hidden md:flex items-center gap-5">
            <Link
              to="/favorites"
              className="relative p-2 text-on-surface-variant hover:text-gold transition-colors"
              aria-label="Favorites"
            >
              <Heart className="w-4 h-4" strokeWidth={1.5} />
              {favorites.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-gold text-bg text-[9px] font-semibold flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </Link>
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setAuthMenuOpen(!authMenuOpen)}
                  className="w-8 h-8 rounded-full bg-gold text-bg flex items-center justify-center font-semibold text-sm hover:bg-gold-light transition-colors"
                  aria-label="User menu"
                >
                  {user.email?.[0].toUpperCase() || 'U'}
                </button>
                {authMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 mt-2 bg-surface-low border border-outline-variant/40 rounded shadow-lg min-w-[180px] z-50"
                  >
                    <button
                      onClick={async () => {
                        await logout()
                        setAuthMenuOpen(false)
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-on-surface hover:bg-surface-container transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" strokeWidth={1.5} />
                      Logout
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="text-[10px] font-medium tracking-[0.35em] uppercase text-on-surface hover:text-gold transition-colors"
              >
                Login
              </Link>
            )}
            <Link to="/list-space" className="btn-primary py-3 px-6">
              List your space
            </Link>
          </div>

          <button
            className="md:hidden p-2 text-on-surface hover:text-gold transition-colors"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
          >
            {menuOpen ? <X className="w-5 h-5" strokeWidth={1.5} /> : <Menu className="w-5 h-5" strokeWidth={1.5} />}
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-40 bg-bg/95 backdrop-blur-xl pt-24 px-6 flex flex-col gap-2 md:hidden overflow-y-auto"
          >
            {links.map(({ href, label }, i) => (
              <motion.div
                key={href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 * i, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link
                  to={href}
                  className="font-display text-4xl sm:text-5xl font-light text-on-surface hover:text-gold transition-colors uppercase tracking-display block py-2"
                >
                  {label}
                </Link>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-10 flex flex-col gap-4"
            >
              <Link to="/list-space" className="btn-primary">
                List your space
              </Link>
              <Link
                to="/favorites"
                className="inline-flex items-center gap-3 text-on-surface-variant hover:text-gold text-[10px] tracking-[0.35em] uppercase transition-colors"
              >
                <Heart className="w-3.5 h-3.5" strokeWidth={1.5} />
                Favorites {favorites.length > 0 && `(${favorites.length})`}
              </Link>
              {user ? (
                <button
                  onClick={async () => {
                    await logout()
                    setMenuOpen(false)
                  }}
                  className="inline-flex items-center gap-3 text-on-surface hover:text-gold text-[10px] tracking-[0.35em] uppercase transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} />
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex items-center gap-3 text-on-surface hover:text-gold text-[10px] tracking-[0.35em] uppercase transition-colors"
                >
                  Login
                </Link>
              )}
              <div className="text-[10px] font-medium tracking-[0.35em] uppercase flex items-center gap-4 text-on-surface-variant pt-4 border-t border-outline-variant/25">
                <button
                  onClick={() => choose('en')}
                  className={`transition-colors ${lang === 'en' ? 'text-gold' : 'hover:text-gold'}`}
                >
                  EN
                </button>
                <span>/</span>
                <button
                  onClick={() => choose('fr')}
                  className={`transition-colors ${lang === 'fr' ? 'text-gold' : 'hover:text-gold'}`}
                >
                  FR
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
