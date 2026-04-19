import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'

const ease = [0.22, 1, 0.36, 1]
const pageVariants = {
  initial: { opacity: 0 },
  enter: { opacity: 1, transition: { duration: 0.6, ease } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
}

export default function AdminLogin() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(form.email, form.password)
      navigate('/admin')
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div variants={pageVariants} initial="initial" animate="enter" exit="exit" className="min-h-screen bg-bg flex items-center justify-center">
      <div className="container-main max-w-md">
        <div className="mb-12">
          <h1 className="font-display font-light text-5xl text-on-surface uppercase tracking-display mb-3">
            Admin
          </h1>
          <p className="text-on-surface-variant font-light">Enter credentials to access the dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="border border-red-500/30 bg-red-500/5 p-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="eyebrow-sm mb-2 block">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              required
              className="w-full bg-transparent border-b border-outline-variant/40 py-3 text-on-surface text-sm outline-none focus:border-gold transition-colors font-light"
            />
          </div>

          <div>
            <label className="eyebrow-sm mb-2 block">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              required
              className="w-full bg-transparent border-b border-outline-variant/40 py-3 text-on-surface text-sm outline-none focus:border-gold transition-colors font-light"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </motion.div>
  )
}
