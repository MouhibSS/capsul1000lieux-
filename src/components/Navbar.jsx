import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Menu, X, LogOut, Bell, UserCog, LayoutDashboard, Calendar, Mail } from 'lucide-react'
import { useFavoritesContext as useFavorites } from '../context/FavoritesContext'
import { useLanguage, useTranslation } from '../context/LanguageContext'
import { useAuthContext } from '../context/AuthContext'
import { useProfile } from '../hooks/useProfile'
import ProfileCompletionModal from './ProfileCompletionModal'
import EmailVerificationModal from './EmailVerificationModal'


export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [authMenuOpen, setAuthMenuOpen] = useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [emailModalOpen, setEmailModalOpen] = useState(false)
  const { favorites } = useFavorites()
  const { isProfileComplete } = useProfile()
  const { lang, choose } = useLanguage()
  const t = useTranslation('nav')
  const location = useLocation()
  const { user, logout } = useAuthContext()
  const isEmailVerified = !!user?.email_confirmed_at || !!user?.confirmed_at

  const { isAdmin } = useAuthContext()

  const links = [
    { href: '/explore', label: t.explore || 'Explore' },
    { href: '/projects', label: t.projects || 'Projects' },
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
              216 000 lieux
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
              <motion.div
                animate={favorites.length > 0 ? { scale: [1, 1.22, 1] } : { scale: 1 }}
                transition={favorites.length > 0 ? { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } : {}}
              >
                <Heart className={`w-4 h-4 transition-colors ${favorites.length > 0 ? 'text-gold fill-gold/25' : ''}`} strokeWidth={1.5} />
              </motion.div>
              {favorites.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-gold text-bg text-[9px] font-semibold flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </Link>
            {user ? (
              <div className="flex items-center gap-3">
                {!isProfileComplete() && (
                  <button
                    onClick={() => setProfileModalOpen(true)}
                    className="relative p-2 text-on-surface-variant hover:text-gold transition-colors group"
                    aria-label="Complete your profile"
                    title="Complete your profile to book"
                  >
                    <Bell className="w-4 h-4" strokeWidth={1.5} />
                    <motion.span
                      animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                      className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-gold"
                    />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-gold" />
                    <span className="absolute top-full right-0 mt-2 px-2.5 py-1.5 text-[10px] font-medium text-on-surface bg-surface-container border border-outline-variant/40 rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap uppercase tracking-wider">
                      Complete profile
                    </span>
                  </button>
                )}
                {!isEmailVerified && (
                  <button
                    onClick={() => setEmailModalOpen(true)}
                    className="relative p-2 text-on-surface-variant hover:text-gold transition-colors group"
                    aria-label="Verify your email"
                    title="Verify your email"
                  >
                    <Mail className="w-4 h-4" strokeWidth={1.5} />
                    <motion.span
                      animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay: 0.4 }}
                      className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-gold"
                    />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-gold" />
                    <span className="absolute top-full right-0 mt-2 px-2.5 py-1.5 text-[10px] font-medium text-on-surface bg-surface-container border border-outline-variant/40 rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap uppercase tracking-wider">
                      Verify email
                    </span>
                  </button>
                )}
                <div className="relative">
                  <button
                    onClick={() => setAuthMenuOpen(!authMenuOpen)}
                    className="w-8 h-8 rounded-full bg-gold text-bg flex items-center justify-center font-semibold text-sm hover:bg-gold-light transition-colors"
                    aria-label="User menu"
                  >
                    {user.email?.[0].toUpperCase() || 'U'}
                  </button>
                  <AnimatePresence>
                    {authMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute right-0 mt-2 bg-surface-low border border-outline-variant/40 rounded-lg shadow-xl min-w-[220px] z-50 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-outline-variant/25">
                          <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Signed in as</p>
                          <p className="text-sm text-on-surface truncate">{user.email}</p>
                        </div>
                        <Link
                          to="/profile"
                          onClick={() => setAuthMenuOpen(false)}
                          className={`w-full text-left px-4 py-3 text-sm hover:bg-gold/10 transition-colors flex items-center gap-2 border-b border-outline-variant/25 ${
                            !isProfileComplete() ? 'text-gold' : 'text-on-surface'
                          }`}
                        >
                          <UserCog className="w-4 h-4" strokeWidth={1.5} />
                          {!isProfileComplete() ? 'Complete profile' : 'View / edit profile'}
                          {!isProfileComplete() && (
                            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                          )}
                        </Link>
                        {!isEmailVerified && (
                          <button
                            onClick={() => { setEmailModalOpen(true); setAuthMenuOpen(false) }}
                            className="w-full text-left px-4 py-3 text-sm text-gold hover:bg-gold/10 transition-colors flex items-center gap-2 border-b border-outline-variant/25"
                          >
                            <Mail className="w-4 h-4" strokeWidth={1.5} />
                            Verify email
                            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                          </button>
                        )}
                        <Link
                          to="/bookings"
                          onClick={() => setAuthMenuOpen(false)}
                          className="w-full text-left px-4 py-3 text-sm text-on-surface hover:bg-surface-container transition-colors flex items-center gap-2"
                        >
                          <Calendar className="w-4 h-4" strokeWidth={1.5} />
                          My Bookings
                        </Link>
                        <Link
                          to="/favorites"
                          onClick={() => setAuthMenuOpen(false)}
                          className="w-full text-left px-4 py-3 text-sm text-on-surface hover:bg-surface-container transition-colors flex items-center gap-2"
                        >
                          <Heart className="w-4 h-4" strokeWidth={1.5} />
                          Favorites {favorites.length > 0 && <span className="ml-auto text-xs text-on-surface-variant">{favorites.length}</span>}
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/dashboard"
                            onClick={() => setAuthMenuOpen(false)}
                            className="w-full text-left px-4 py-3 text-sm text-on-surface hover:bg-surface-container transition-colors flex items-center gap-2 border-t border-outline-variant/25"
                          >
                            <LayoutDashboard className="w-4 h-4" strokeWidth={1.5} />
                            Dashboard
                          </Link>
                        )}
                        <button
                          onClick={async () => { await logout(); setAuthMenuOpen(false) }}
                          className="w-full text-left px-4 py-3 text-sm text-on-surface hover:bg-surface-container transition-colors flex items-center gap-2 border-t border-outline-variant/25"
                        >
                          <LogOut className="w-4 h-4" strokeWidth={1.5} />
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : null}
            <Link to="/list-space" className="btn-primary py-3 px-6">
              List your space
            </Link>
          </div>

          <div className="flex md:hidden items-center gap-1">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setAuthMenuOpen((v) => !v)}
                  className="relative p-1.5 text-on-surface-variant hover:text-gold transition-colors"
                  aria-label="Account menu"
                  aria-expanded={authMenuOpen}
                >
                  <div className="w-8 h-8 rounded-full bg-gold text-bg flex items-center justify-center font-semibold text-sm">
                    {user.email?.[0].toUpperCase() || 'U'}
                  </div>
                  {(!isProfileComplete() || !isEmailVerified) && (
                    <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-gold border-2 border-bg animate-pulse" />
                  )}
                </button>
                <AnimatePresence>
                  {authMenuOpen && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40"
                        onClick={() => setAuthMenuOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute right-0 mt-2 z-50 w-[260px] bg-surface-low border border-outline-variant/40 rounded-lg shadow-2xl overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-outline-variant/25 bg-gradient-to-r from-gold/5 to-transparent">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gold text-bg flex items-center justify-center font-semibold">
                              {user.email?.[0].toUpperCase() || 'U'}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[9px] text-on-surface-variant uppercase tracking-[0.25em]">Signed in</p>
                              <p className="text-xs text-on-surface truncate">{user.email}</p>
                            </div>
                          </div>
                        </div>
                        <Link
                          to="/profile"
                          onClick={() => setAuthMenuOpen(false)}
                          className="w-full text-left px-4 py-3 text-sm text-on-surface hover:bg-gold/10 hover:text-gold transition-colors flex items-center gap-3 border-b border-outline-variant/20"
                        >
                          <UserCog className="w-4 h-4" strokeWidth={1.5} />
                          <span className="flex-1">View / edit profile</span>
                          {!isProfileComplete() && <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />}
                        </Link>
                        {!isEmailVerified && (
                          <button
                            onClick={() => { setEmailModalOpen(true); setAuthMenuOpen(false) }}
                            className="w-full text-left px-4 py-3 text-sm text-gold hover:bg-gold/10 transition-colors flex items-center gap-3 border-b border-outline-variant/20"
                          >
                            <Mail className="w-4 h-4" strokeWidth={1.5} />
                            <span className="flex-1">Verify email</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                          </button>
                        )}
                        <Link
                          to="/bookings"
                          onClick={() => setAuthMenuOpen(false)}
                          className="w-full text-left px-4 py-3 text-sm text-on-surface hover:bg-gold/10 hover:text-gold transition-colors flex items-center gap-3 border-b border-outline-variant/20"
                        >
                          <Calendar className="w-4 h-4" strokeWidth={1.5} />
                          My bookings
                        </Link>
                        <Link
                          to="/favorites"
                          onClick={() => setAuthMenuOpen(false)}
                          className="w-full text-left px-4 py-3 text-sm text-on-surface hover:bg-gold/10 hover:text-gold transition-colors flex items-center gap-3 border-b border-outline-variant/20"
                        >
                          <Heart className="w-4 h-4" strokeWidth={1.5} />
                          <span className="flex-1">Favorites</span>
                          {favorites.length > 0 && (
                            <span className="text-[10px] text-on-surface-variant">{favorites.length}</span>
                          )}
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/dashboard"
                            onClick={() => setAuthMenuOpen(false)}
                            className="w-full text-left px-4 py-3 text-sm text-on-surface hover:bg-gold/10 hover:text-gold transition-colors flex items-center gap-3 border-b border-outline-variant/20"
                          >
                            <LayoutDashboard className="w-4 h-4" strokeWidth={1.5} />
                            Admin dashboard
                          </Link>
                        )}
                        <button
                          onClick={async () => { await logout(); setAuthMenuOpen(false) }}
                          className="w-full text-left px-4 py-3 text-sm text-on-surface hover:bg-red-500/10 hover:text-red-400 transition-colors flex items-center gap-3"
                        >
                          <LogOut className="w-4 h-4" strokeWidth={1.5} />
                          Log out
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : null}
            <Link
              to="/favorites"
              className="relative p-2 text-on-surface-variant hover:text-gold transition-colors"
              aria-label="Favorites"
            >
              <Heart className={`w-5 h-5 ${favorites.length > 0 ? 'text-gold fill-gold/25' : ''}`} strokeWidth={1.5} />
              {favorites.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-gold text-bg text-[9px] font-semibold flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </Link>
            <button
              className="p-2 text-on-surface hover:text-gold transition-colors"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu"
            >
              {menuOpen ? <X className="w-5 h-5" strokeWidth={1.5} /> : <Menu className="w-5 h-5" strokeWidth={1.5} />}
            </button>
          </div>
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
              {user && (
                <Link
                  to="/bookings"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex items-center gap-3 text-on-surface hover:text-gold text-[10px] tracking-[0.35em] uppercase transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />
                  My Bookings
                </Link>
              )}
              <Link
                to="/favorites"
                onClick={() => setMenuOpen(false)}
                className="inline-flex items-center gap-3 text-on-surface-variant hover:text-gold text-[10px] tracking-[0.35em] uppercase transition-colors"
              >
                <Heart className="w-3.5 h-3.5" strokeWidth={1.5} />
                Favorites {favorites.length > 0 && `(${favorites.length})`}
              </Link>
              {user && isAdmin && (
                <Link
                  to="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex items-center gap-3 text-on-surface hover:text-gold text-[10px] tracking-[0.35em] uppercase transition-colors"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" strokeWidth={1.5} />
                  Dashboard
                </Link>
              )}
              {user && (
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className={`inline-flex items-center gap-3 text-[10px] tracking-[0.35em] uppercase transition-colors ${
                    !isProfileComplete() ? 'text-gold hover:text-gold-light' : 'text-on-surface hover:text-gold'
                  }`}
                >
                  <UserCog className="w-3.5 h-3.5" strokeWidth={1.5} />
                  {!isProfileComplete() ? 'Complete profile' : 'My profile'}
                  {!isProfileComplete() && <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />}
                </Link>
              )}
              {user && !isEmailVerified && (
                <button
                  onClick={() => { setEmailModalOpen(true); setMenuOpen(false) }}
                  className="inline-flex items-center gap-3 text-gold hover:text-gold-light text-[10px] tracking-[0.35em] uppercase transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" strokeWidth={1.5} />
                  Verify email
                  <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                </button>
              )}
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
              ) : null}
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

      <ProfileCompletionModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onComplete={() => setProfileModalOpen(false)}
      />

      <EmailVerificationModal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
      />
    </>
  )
}
