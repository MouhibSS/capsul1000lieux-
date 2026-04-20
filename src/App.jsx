import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { LanguageProvider } from './context/LanguageContext'
import { AuthProvider } from './context/AuthContext'
import LanguageModal from './components/LanguageModal'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CursorEffect from './components/CursorEffect'
import ScrollProgress from './components/ScrollProgress'
import ScrollToTop from './components/ScrollToTop'
import CookieConsent from './components/CookieConsent'
import Home from './pages/Home'
import Explore from './pages/Explore'
import LocationDetail from './pages/LocationDetail'
import ListSpace from './pages/ListSpace'
import About from './pages/About'
import Contact from './pages/Contact'
import Admin from './pages/Admin'
import AdminLogin from './pages/AdminLogin'
import Favorites from './pages/Favorites'
import Login from './pages/Login'
import Signup from './pages/Signup'

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/location/:id" element={<LocationDetail />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/list-space" element={<ListSpace />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <LanguageModal />
          <ScrollToTop />
          <ScrollProgress />
          <CursorEffect />
          <Navbar />
          <AnimatedRoutes />
          <Footer />
          <CookieConsent />
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  )
}
