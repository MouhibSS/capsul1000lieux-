import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { LanguageProvider } from './context/LanguageContext'
import { AuthProvider } from './context/AuthContext'
import { FavoritesProvider } from './context/FavoritesContext'
import { MaintenanceProvider, useMaintenanceContext } from './context/MaintenanceContext'
import LanguageModal from './components/LanguageModal'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CursorEffect from './components/CursorEffect'
import ScrollProgress from './components/ScrollProgress'
import ScrollToTop from './components/ScrollToTop'
import CookieConsent from './components/CookieConsent'
import ChatBotModal from './components/ChatBotModal'
import Home from './pages/Home'
import Explore from './pages/Explore'
import LocationDetail from './pages/LocationDetail'
import ListSpace from './pages/ListSpace'
import About from './pages/About'
import Contact from './pages/Contact'
import Dashboard from './pages/Dashboard'
import Unauthorized from './pages/Unauthorized'
import Favorites from './pages/Favorites'
import Bookings from './pages/Bookings'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Maintenance from './pages/Maintenance'

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/location/:id" element={<LocationDetail />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/list-space" element={<ListSpace />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </AnimatePresence>
  )
}

function AppContent() {
  const location = useLocation()
  const { maintenanceMode, loading: maintLoading, bypassed } = useMaintenanceContext()
  const isDashboard = location.pathname.startsWith('/dashboard')

  useEffect(() => {
    if (isDashboard) {
      document.body.classList.add('dashboard-active')
    } else {
      document.body.classList.remove('dashboard-active')
    }
    return () => document.body.classList.remove('dashboard-active')
  }, [isDashboard])

  if (maintLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    )
  }

  if (maintenanceMode && !bypassed) {
    return <Maintenance />
  }

  return (
    <FavoritesProvider>
      {!isDashboard && <LanguageModal />}
      <ScrollToTop />
      {!isDashboard && <ScrollProgress />}
      {!isDashboard && <CursorEffect />}
      {!isDashboard && <Navbar />}
      <AnimatedRoutes />
      {!isDashboard && <Footer />}
      {!isDashboard && <CookieConsent />}
      {!isDashboard && <ChatBotModal />}
    </FavoritesProvider>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MaintenanceProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </MaintenanceProvider>
      </AuthProvider>
    </LanguageProvider>
  )
}
