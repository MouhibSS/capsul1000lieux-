import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import {
  BarChart3, MapPin, Settings, Calendar, LogOut, Heart, Search, Bell, ExternalLink, Sparkles,
  Power, AlertTriangle, ShieldCheck, X, Eye, Info, Check, Menu,
} from 'lucide-react'
import { useAuthContext } from '../context/AuthContext'
import { useMaintenanceContext } from '../context/MaintenanceContext'
import AdminLocations from '../sections/AdminLocations'
import AdminFilters from '../sections/AdminFilters'
import AdminBookings from '../sections/AdminBookings'
import AdminAnalytics from '../sections/AdminAnalytics'
import AdminFavorites from '../sections/AdminFavorites'

const tabs = [
  { id: 'locations', label: 'Locations', icon: MapPin, desc: 'Manage listed spaces', accent: 'from-blue-500/20 to-cyan-500/10', dot: 'bg-blue-400' },
  { id: 'bookings', label: 'Bookings', icon: Calendar, desc: 'Requests & status', accent: 'from-orange-500/20 to-red-500/10', dot: 'bg-orange-400' },
  { id: 'favorites', label: 'Favorites', icon: Heart, desc: 'User wishlist analytics', accent: 'from-pink-500/20 to-rose-500/10', dot: 'bg-pink-400' },
  { id: 'filters', label: 'Filters', icon: Settings, desc: 'Category management', accent: 'from-purple-500/20 to-violet-500/10', dot: 'bg-purple-400' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, desc: 'Performance overview', accent: 'from-emerald-500/20 to-green-500/10', dot: 'bg-emerald-400' },
]

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('locations')
  const [search, setSearch] = useState('')
  const [maintModalOpen, setMaintModalOpen] = useState(false)
  const [maintBusy, setMaintBusy] = useState(false)
  const [maintError, setMaintError] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const navigate = useNavigate()
  const [toast, setToast] = useState(null)
  const { user, logout } = useAuthContext()
  const { maintenanceMode, toggle: toggleMaintenance, clearBypass } = useMaintenanceContext()

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  const handlePreviewMaintenance = () => {
    clearBypass()
    // navigate to home — AppContent will show Maintenance page
    window.location.href = '/'
  }

  useEffect(() => {
    document.body.classList.add('dashboard-active')
    return () => document.body.classList.remove('dashboard-active')
  }, [])

  const handleLogout = async () => { await logout(); navigate('/') }

  const handleMaintenanceToggle = async (enable) => {
    setMaintBusy(true)
    setMaintError('')
    try {
      await toggleMaintenance(enable)
      setMaintModalOpen(false)
      showToast(enable ? 'Site is now offline for visitors' : 'Site is live again — welcome back')
    } catch (err) {
      setMaintError(err.message || 'Failed to update maintenance mode')
    } finally {
      setMaintBusy(false)
    }
  }

  const activeTabData = tabs.find(t => t.id === activeTab)
  const now = new Date()
  const initials = user?.email?.slice(0, 2).toUpperCase() || 'AD'

  return (
    <div className="dashboard-root min-h-screen bg-[#0a0a0a] text-on-surface flex">
      {/* Global toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-[60] max-w-sm"
          >
            <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl border backdrop-blur-md ${
              toast.type === 'error'
                ? 'bg-red-500/90 text-white border-red-400/60'
                : 'bg-emerald-500/90 text-white border-emerald-400/60'
            }`}>
              {toast.type === 'error'
                ? <AlertTriangle className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} />
                : <Check className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} />
              }
              <p className="text-sm font-medium">{toast.msg}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Mobile drawer backdrop */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
            onClick={() => setDrawerOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar (desktop static / mobile drawer) */}
      <aside className={`fixed md:sticky top-0 left-0 z-50 md:z-auto w-60 flex-shrink-0 h-screen md:h-screen bg-[#0f0f0f] border-r border-white/5 flex flex-col transition-transform duration-300 ease-out ${
        drawerOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        {/* Brand */}
        <Link to="/" className="px-5 py-5 border-b border-white/5 flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold to-gold-light flex items-center justify-center flex-shrink-0 shadow-lg shadow-gold/20">
            <Sparkles className="w-4 h-4 text-bg" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-on-surface uppercase tracking-[0.2em] group-hover:text-gold transition-colors">216 000</p>
            <p className="text-[9px] text-on-surface-variant uppercase tracking-[0.3em]">Admin Panel</p>
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
          <p className="px-3 pb-2 text-[9px] text-on-surface-variant/60 uppercase tracking-widest font-medium">Workspace</p>
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setDrawerOpen(false) }}
                className={`relative w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all ${
                  isActive
                    ? 'bg-white/[0.06] text-on-surface'
                    : 'text-on-surface-variant hover:bg-white/[0.03] hover:text-on-surface'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-tab-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-gold rounded-r"
                  />
                )}
                <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${
                  isActive ? `bg-gradient-to-br ${tab.accent}` : 'bg-white/[0.03]'
                }`}>
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-on-surface' : 'text-on-surface-variant'}`} strokeWidth={1.75} />
                </div>
                <span className="text-xs font-medium flex-1">{tab.label}</span>
                {isActive && <div className={`w-1.5 h-1.5 rounded-full ${tab.dot} shadow-lg`} />}
              </button>
            )
          })}
        </nav>

        {/* User / Logout */}
        <div className="px-3 py-3 border-t border-white/5 space-y-1">
          <div className="flex items-center gap-2.5 px-2 py-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold to-gold-light text-bg flex items-center justify-center font-semibold text-xs flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-on-surface truncate">{user?.email?.split('@')[0] || 'Admin'}</p>
              <p className="text-[10px] text-on-surface-variant truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-on-surface-variant hover:text-red-400 hover:bg-red-500/[0.08] transition-all text-xs font-medium"
          >
            <LogOut className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.75} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Topbar — redesigned */}
        <div className="sticky top-0 z-30 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
          <div className="px-3 md:px-6 py-2.5 md:py-3 flex items-center gap-2 md:gap-4">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="md:hidden p-2 -ml-1 text-on-surface hover:text-gold rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" strokeWidth={1.75} />
            </button>

            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface-variant" strokeWidth={2} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-white/[0.04] border border-white/[0.06] rounded-lg text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-gold/40 focus:bg-white/[0.06] transition-all"
              />
              <kbd className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[9px] font-mono text-on-surface-variant bg-white/[0.05] border border-white/[0.06] rounded">⌘K</kbd>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1.5 md:gap-2 ml-auto">
              <div className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                maintenanceMode
                  ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                  : 'bg-white/[0.03] text-on-surface-variant'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${maintenanceMode ? 'bg-red-400' : 'bg-emerald-400'}`} />
                <span>{maintenanceMode ? 'Offline' : 'Live'}</span>
              </div>
              <div className="hidden md:block text-xs text-on-surface-variant px-3">
                {now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
              <a
                href="/"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-on-surface-variant hover:text-gold bg-white/[0.03] hover:bg-white/[0.06] rounded-lg transition-colors"
              >
                <ExternalLink className="w-3 h-3" strokeWidth={2} />
                <span className="hidden sm:inline">View site</span>
              </a>
              <button className="relative p-2 text-on-surface-variant hover:text-on-surface bg-white/[0.03] hover:bg-white/[0.06] rounded-lg transition-colors">
                <Bell className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-gold" />
              </button>

              {/* Emergency Maintenance Button */}
              <button
                onClick={() => { setMaintError(''); setMaintModalOpen(true) }}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all border ${
                  maintenanceMode
                    ? 'bg-red-500/15 text-red-400 border-red-500/40 hover:bg-red-500/25'
                    : 'bg-white/[0.03] text-on-surface-variant border-white/[0.06] hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/10'
                }`}
                title={maintenanceMode ? 'Site is offline — click to restore' : 'Emergency: close site for maintenance'}
              >
                {maintenanceMode ? (
                  <motion.span
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-1.5 h-1.5 rounded-full bg-red-400"
                  />
                ) : (
                  <Power className="w-3 h-3" strokeWidth={2.5} />
                )}
                <span className="hidden sm:inline">
                  {maintenanceMode ? 'Site Offline' : 'Emergency'}
                </span>
              </button>
            </div>
          </div>

          {/* Section header with accent */}
          {activeTabData && (
            <div className="relative px-4 md:px-6 py-4 md:py-5 border-t border-white/5 overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-r ${activeTabData.accent} opacity-40 pointer-events-none`} />
              <div className="relative flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 md:gap-4 min-w-0">
                  <div className={`w-9 h-9 md:w-11 md:h-11 rounded-xl bg-gradient-to-br ${activeTabData.accent} border border-white/10 flex items-center justify-center flex-shrink-0 backdrop-blur-sm`}>
                    <activeTabData.icon className="w-4 h-4 md:w-5 md:h-5 text-on-surface" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                    <div className="hidden md:flex items-center gap-2 mb-0.5">
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-[0.25em]">Dashboard</p>
                      <span className="text-on-surface-variant/40">/</span>
                      <p className="text-[10px] text-gold uppercase tracking-[0.25em]">{activeTabData.label}</p>
                    </div>
                    <h1 className="font-display text-lg md:text-2xl font-light text-on-surface uppercase tracking-wide truncate">
                      {activeTabData.label}
                    </h1>
                    <p className="text-[11px] md:text-xs text-on-surface-variant mt-0.5 truncate">{activeTabData.desc}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-3 md:p-6"
            >
              {activeTab === 'locations' && <AdminLocations />}
              {activeTab === 'filters' && <AdminFilters />}
              {activeTab === 'bookings' && <AdminBookings />}
              {activeTab === 'analytics' && <AdminAnalytics />}
              {activeTab === 'favorites' && <AdminFavorites />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0f0f0f]/95 backdrop-blur-xl border-t border-white/10">
        <div className="flex items-stretch justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 transition-colors ${
                  isActive ? 'text-gold' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gold rounded-b-full" />
                )}
                <Icon className="w-4 h-4" strokeWidth={isActive ? 2 : 1.5} />
                <span className="text-[9px] font-medium tracking-wider uppercase">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Maintenance Mode Modal */}
      <AnimatePresence>
        {maintModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setMaintModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="bg-[#0f0f0f] border border-white/10 rounded-xl w-full max-w-md shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className={`relative p-6 border-b border-white/5 overflow-hidden ${
                maintenanceMode ? 'bg-gradient-to-br from-emerald-500/15 to-green-500/5' : 'bg-gradient-to-br from-red-500/15 to-orange-500/5'
              }`}>
                <div className="relative flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${
                      maintenanceMode
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                        : 'bg-red-500/20 border-red-500/40 text-red-400'
                    }`}>
                      {maintenanceMode
                        ? <ShieldCheck className="w-5 h-5" strokeWidth={1.75} />
                        : <AlertTriangle className="w-5 h-5" strokeWidth={1.75} />
                      }
                    </div>
                    <div>
                      <p className="text-[10px] tracking-[0.25em] uppercase text-on-surface-variant">
                        {maintenanceMode ? 'Site is offline' : 'Emergency control'}
                      </p>
                      <h3 className="font-display text-xl font-light text-on-surface uppercase tracking-wide">
                        {maintenanceMode ? 'Restore access' : 'Maintenance mode'}
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={() => setMaintModalOpen(false)}
                    className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                {maintenanceMode ? (
                  <>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      The site is currently closed to the public. Only those with the passphrase can access it.
                      Click below to make the site live again for everyone.
                    </p>
                    <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                      <div className="text-xs text-blue-300 leading-relaxed">
                        <p className="font-medium mb-1">Why does your browser still work?</p>
                        <p className="text-blue-300/80">You're auto-bypassed via session storage so you don't lock yourself out of the dashboard. To see what visitors see, use <strong>Preview</strong> below or open an incognito window.</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      This will immediately take the entire site offline. Visitors will see a maintenance page and can only enter with the staff passphrase.
                    </p>
                    <div className="p-3 bg-white/[0.03] border border-white/5 rounded-lg">
                      <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Passphrase</p>
                      <p className="font-mono text-sm text-gold">Capsul1234</p>
                    </div>
                    <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                      <p className="text-xs text-red-300">
                        Active bookings, explore, and all other pages will be inaccessible to visitors until you disable maintenance.
                      </p>
                    </div>
                  </>
                )}

                {maintError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-xs text-red-400">{maintError}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-2 pt-2">
                  {maintenanceMode && (
                    <button
                      onClick={handlePreviewMaintenance}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium rounded-lg transition-colors uppercase tracking-wider bg-white/[0.04] hover:bg-white/[0.08] text-on-surface border border-white/10"
                    >
                      <Eye className="w-3.5 h-3.5" strokeWidth={2} />
                      Preview maintenance page
                    </button>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setMaintModalOpen(false)}
                      className="flex-1 px-4 py-2.5 text-xs font-medium text-on-surface-variant bg-white/[0.03] hover:bg-white/[0.06] rounded-lg transition-colors uppercase tracking-wider"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleMaintenanceToggle(!maintenanceMode)}
                      disabled={maintBusy}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg transition-all uppercase tracking-wider disabled:opacity-50 ${
                        maintenanceMode
                          ? 'bg-emerald-500 text-white hover:bg-emerald-400'
                          : 'bg-red-500 text-white hover:bg-red-400'
                      }`}
                    >
                      {maintBusy
                        ? 'Working...'
                        : maintenanceMode
                          ? (<><ShieldCheck className="w-3.5 h-3.5" strokeWidth={2.5} /> Restore site</>)
                          : (<><Power className="w-3.5 h-3.5" strokeWidth={2.5} /> Close site</>)
                      }
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
