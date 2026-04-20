import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight, Mail, Check } from 'lucide-react'
import { useAuthContext } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

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
  const [success, setSuccess] = useState(false)
  const [resending, setResending] = useState(false)

  const from = location.state?.from?.pathname || '/favorites'

  const resendEmail = async () => {
    setResending(true)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      })
      if (error) throw error
      setError('')
    } catch (err) {
      setError('Failed to resend email: ' + (err.message || 'Unknown error'))
    } finally {
      setResending(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

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
      setSuccess(true)
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setTimeout(() => navigate('/login'), 2000)
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
              Create an account to save your favorite locations and unlock exclusive features.
            </p>
          </div>

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="bg-gold/10 border border-gold/30 rounded-lg p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="inline-block mb-4"
                >
                  <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center">
                    <Check className="w-8 h-8 text-gold" strokeWidth={2} />
                  </div>
                </motion.div>
                <h2 className="font-display text-2xl font-light text-on-surface mb-3">
                  Welcome to Capsul!
                </h2>
                <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
                  A verification email has been sent to
                </p>
                <p className="font-semibold text-gold text-sm mb-6 break-all">{email}</p>
                <div className="bg-surface-low rounded p-4 mb-6 text-left">
                  <div className="flex gap-3 mb-3">
                    <Mail className="w-5 h-5 text-gold shrink-0 mt-0.5" strokeWidth={1.5} />
                    <div>
                      <p className="text-sm text-on-surface font-medium mb-1">Check your inbox</p>
                      <p className="text-xs text-on-surface-variant">
                        Click the verification link in the email to activate your account
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-on-surface-variant pl-8">
                    Don't see it? Check your spam folder
                  </p>
                </div>
                <button
                  onClick={resendEmail}
                  disabled={resending}
                  className="text-sm text-gold hover:text-gold-light transition-colors disabled:opacity-50 underline"
                >
                  {resending ? 'Sending...' : 'Didn\'t receive? Resend email'}
                </button>
              </div>
              <div className="text-center">
                <p className="text-on-surface-variant text-sm mb-4">
                  Once verified, you can log in to access your saved favorites
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-gold hover:text-gold-light font-medium text-sm uppercase tracking-wide transition-colors"
                >
                  Go to login
                  <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2} />
                </Link>
              </div>
            </motion.div>
          ) : (
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
          )}

          {!success && (
            <>
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
            </>
          )}
        </div>
      </section>
    </motion.div>
  )
}
