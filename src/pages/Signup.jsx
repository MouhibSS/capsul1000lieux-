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

export default function Signup() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signUp } = useAuthContext()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const from = location.state?.from?.pathname || '/'
  const pendingBooking = location.state?.pendingBooking
  const pendingFavoriteId = location.state?.pendingFavoriteId

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      await signUp(email, password)
      // No email verification required — user is signed in immediately.
      // The navbar shows a profile-completion notification until they fill it in.
      navigate(from, { replace: true, state: { pendingBooking, pendingFavoriteId, justSignedUp: true } })
    } catch (err) {
      setError(err.message || 'Signup failed')
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
              Get started
            </h1>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Create an account to save favorites and book locations. You can complete your profile any time from the bell icon in the menu.
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
                placeholder="At least 6 characters"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-2 tracking-wide uppercase eyebrow-sm">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-surface-container border border-outline-variant/40 rounded px-4 py-3 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-gold transition-colors"
                placeholder="Confirm your password"
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
              {loading ? 'Creating account...' : 'Sign up'}
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
            to="/login"
            className="block w-full border border-outline-variant/40 hover:border-gold text-center px-6 py-3 rounded font-medium text-sm uppercase tracking-wide text-on-surface hover:text-gold transition-colors"
          >
            Already have an account? Log in
          </Link>
        </div>
      </section>
    </motion.div>
  )
}
