import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { useAuthContext } from '../context/AuthContext'

const ease = [0.22, 1, 0.36, 1]

const pageVariants = {
  initial: { opacity: 0 },
  enter: { opacity: 1, transition: { duration: 0.6, ease } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
}

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuthContext()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const pendingFavoriteId = location.state?.pendingFavoriteId
  const from = location.state?.from?.pathname || '/favorites'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      // Store pending favorite in sessionStorage so it persists across navigation
      if (pendingFavoriteId) {
        sessionStorage.setItem('pendingFavoriteId', pendingFavoriteId)
      }
      // If user came from a favorite action, go to favorites; otherwise go to the original location
      const redirectTo = from.includes('/login') ? '/favorites' : from
      navigate(redirectTo)
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div variants={pageVariants} initial="initial" animate="enter" exit="exit">
      <section className="min-h-screen flex items-center justify-center px-6 py-16 container-main">
        <div className="w-full max-w-md">
          <div className="mb-12">
            <h1 className="font-display font-light text-3xl sm:text-4xl md:text-5xl text-on-surface mb-3 tracking-display uppercase">
              Welcome back
            </h1>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Log in to access your saved favorites and manage your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2 tracking-wide uppercase eyebrow-sm">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-surface-container border border-outline-variant/40 rounded px-4 py-3 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-gold transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-2 tracking-wide uppercase eyebrow-sm">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-surface-container border border-outline-variant/40 rounded px-4 py-3 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-gold transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 rounded px-4 py-3"
              >
                <p className="text-sm text-red-400">{error}</p>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold hover:bg-gold-light text-bg px-6 py-3 rounded font-semibold text-sm uppercase tracking-wide transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Logging in...' : 'Login'}
              {!loading && <ArrowUpRight className="w-4 h-4" strokeWidth={1.8} />}
            </button>
          </form>

          <div className="relative mb-8">
            <div className="absolute inset-x-0 top-1/2 h-px bg-outline-variant/20" />
            <div className="relative flex justify-center">
              <span className="bg-bg px-3 text-sm text-on-surface-variant">Or</span>
            </div>
          </div>

          <Link
            to="/signup"
            className="block w-full border border-outline-variant/40 hover:border-gold text-center px-6 py-3 rounded font-medium text-sm uppercase tracking-wide text-on-surface hover:text-gold transition-colors"
          >
            Create new account
          </Link>
        </div>
      </section>
    </motion.div>
  )
}
