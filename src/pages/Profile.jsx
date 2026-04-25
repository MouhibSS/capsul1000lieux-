import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Bell, Calendar, Check, Heart, Mail, Phone, Shield,
  ShieldCheck, User as UserIcon, LogOut, Save, AlertCircle,
  ArrowUpRight, Sparkles,
} from 'lucide-react'
import { useAuthContext } from '../context/AuthContext'
import { useProfile } from '../hooks/useProfile'
import EmailVerificationModal from '../components/EmailVerificationModal'

const ease = [0.22, 1, 0.36, 1]

export default function Profile() {
  const navigate = useNavigate()
  const { user, loading: authLoading, logout } = useAuthContext()
  const { profile, isProfileComplete, updateProfile } = useProfile()

  const [emailModalOpen, setEmailModalOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    gender: '',
  })

  useEffect(() => {
    if (authLoading) return
    if (!user) navigate('/login', { state: { from: { pathname: '/profile' } } })
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (profile) {
      setForm({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        gender: profile.gender || '',
      })
    }
  }, [profile])

  const isEmailVerified = !!user?.email_confirmed_at || !!user?.confirmed_at
  const profileComplete = isProfileComplete()

  const completion = useMemo(() => {
    const checks = [
      !!profile?.first_name,
      !!profile?.last_name,
      !!profile?.phone,
      !!profile?.gender,
      isEmailVerified,
    ]
    const done = checks.filter(Boolean).length
    return Math.round((done / checks.length) * 100)
  }, [profile, isEmailVerified])

  const initials = useMemo(() => {
    const f = profile?.first_name?.[0] || ''
    const l = profile?.last_name?.[0] || ''
    if (f || l) return (f + l).toUpperCase()
    return user?.email?.[0]?.toUpperCase() || 'U'
  }, [profile, user])

  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'Welcome'

  const memberSince = useMemo(() => {
    if (!user?.created_at) return null
    return new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }, [user])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const handleSave = async (e) => {
    e?.preventDefault()
    setError(null)
    if (!form.first_name || !form.last_name || !form.phone || !form.gender) {
      setError('All fields are required to complete your profile')
      return
    }
    try {
      setSaving(true)
      await updateProfile(form)
      setEditing(false)
      showToast('Profile updated')
    } catch (err) {
      setError(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    )
  }

  const notifications = [
    !profileComplete && {
      key: 'profile',
      tone: 'gold',
      icon: AlertCircle,
      title: 'Complete your profile',
      desc: 'Add your name, phone and gender to enable bookings.',
      cta: 'Complete now',
      action: () => setEditing(true),
    },
    !isEmailVerified && {
      key: 'email',
      tone: 'gold',
      icon: Mail,
      title: 'Verify your email',
      desc: `We sent a confirmation link to ${user.email}.`,
      cta: 'Resend / verify',
      action: () => setEmailModalOpen(true),
    },
    profileComplete && isEmailVerified && {
      key: 'allset',
      tone: 'green',
      icon: ShieldCheck,
      title: "You're all set",
      desc: 'Your account is verified and ready to book any space.',
      cta: 'Browse spaces',
      action: () => navigate('/explore'),
    },
  ].filter(Boolean)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease }}
      className="min-h-screen bg-bg"
    >
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50"
          >
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-xl border backdrop-blur-md ${
              toast.type === 'error'
                ? 'bg-red-500/15 border-red-500/40 text-red-300'
                : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
            }`}>
              <Check className="w-4 h-4" strokeWidth={2.4} />
              <span className="text-sm">{toast.msg}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top breadcrumb */}
      <div className="container-main pt-20 md:pt-28 pb-4 md:pb-6 flex items-center justify-between gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-3 text-on-surface-variant hover:text-gold text-[10px] tracking-[0.35em] uppercase transition-colors group"
        >
          <span className="w-8 h-px bg-on-surface-variant group-hover:bg-gold group-hover:w-12 transition-all duration-500" />
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span>Back</span>
        </button>
        <span className="hidden md:inline eyebrow-sm text-on-surface-variant">
          Account · {user.id?.slice(0, 8)}
        </span>
      </div>

      {/* Hero header */}
      <div className="container-main pb-8 md:pb-10 border-b border-outline-variant/25">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-6 h-px bg-gold" />
          <span className="eyebrow text-gold">My account</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-10">
          <div className="relative shrink-0">
            <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-gold to-gold-light text-bg flex items-center justify-center font-display text-3xl md:text-4xl font-light shadow-[0_20px_60px_rgba(200,169,106,0.25)]">
              {initials}
            </div>
            {profileComplete && isEmailVerified && (
              <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 border-2 border-bg flex items-center justify-center">
                <ShieldCheck className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display font-light text-4xl sm:text-5xl md:text-6xl leading-[0.95] tracking-display uppercase text-on-surface break-words">
              {fullName}
            </h1>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3 text-sm text-on-surface-variant">
              <span className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-gold" strokeWidth={1.6} />
                <span className="truncate">{user.email}</span>
              </span>
              {memberSince && (
                <>
                  <span className="hidden sm:inline w-1 h-1 rounded-full bg-outline-variant" />
                  <span className="font-mono eyebrow-sm">Member since {memberSince}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Completion bar */}
        <div className="mt-8 max-w-md">
          <div className="flex items-center justify-between mb-2">
            <span className="eyebrow-sm text-on-surface-variant">Account completion</span>
            <span className="font-mono text-sm text-gold tabular-nums">{completion}%</span>
          </div>
          <div className="h-1 bg-outline-variant/30 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completion}%` }}
              transition={{ duration: 0.9, ease }}
              className="h-full bg-gradient-to-r from-gold to-gold-light"
            />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="container-main py-10 md:py-14 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
        {/* LEFT — notifications + form */}
        <div className="lg:col-span-8 space-y-10">
          {/* Notifications */}
          {notifications.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-5">
                <span className="w-6 h-px bg-gold" />
                <Bell className="w-3.5 h-3.5 text-gold" strokeWidth={1.6} />
                <span className="eyebrow">Notifications</span>
                <span className="ml-auto text-[10px] tracking-widest uppercase text-on-surface-variant">
                  {notifications.length} item{notifications.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="space-y-3">
                {notifications.map((n) => {
                  const Icon = n.icon
                  const isOk = n.tone === 'green'
                  return (
                    <motion.button
                      key={n.key}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={n.action}
                      className={`group w-full text-left flex items-start gap-4 p-4 sm:p-5 border transition-colors ${
                        isOk
                          ? 'bg-emerald-500/5 border-emerald-500/30 hover:bg-emerald-500/10'
                          : 'bg-gold/5 border-gold/30 hover:bg-gold/10'
                      }`}
                    >
                      <div className={`w-10 h-10 flex items-center justify-center rounded-full shrink-0 ${
                        isOk ? 'bg-emerald-500/15 text-emerald-400' : 'bg-gold/15 text-gold'
                      }`}>
                        <Icon className="w-4 h-4" strokeWidth={1.8} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-on-surface text-sm">{n.title}</p>
                          {!isOk && (
                            <motion.span
                              animate={{ scale: [1, 1.4, 1], opacity: [0.7, 0, 0.7] }}
                              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                              className="w-1.5 h-1.5 rounded-full bg-gold"
                            />
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-on-surface-variant mt-1 leading-relaxed">{n.desc}</p>
                      </div>
                      <span className={`hidden sm:inline-flex items-center gap-2 self-center text-[10px] tracking-[0.3em] uppercase font-medium transition-colors ${
                        isOk ? 'text-emerald-400 group-hover:text-emerald-300' : 'text-gold group-hover:text-gold-light'
                      }`}>
                        {n.cta}
                        <ArrowUpRight className="w-3 h-3" strokeWidth={1.8} />
                      </span>
                    </motion.button>
                  )
                })}
              </div>
            </section>
          )}

          {/* Personal info card */}
          <section>
            <div className="flex items-center gap-3 mb-5">
              <span className="w-6 h-px bg-gold" />
              <span className="eyebrow">Personal information</span>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="ml-auto text-[10px] tracking-[0.3em] uppercase text-on-surface-variant hover:text-gold transition-colors"
                >
                  Edit
                </button>
              )}
            </div>

            <div className="border border-outline-variant/30 bg-surface-low">
              {!editing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2">
                  <InfoRow icon={UserIcon} label="First name" value={profile?.first_name} />
                  <InfoRow icon={UserIcon} label="Last name" value={profile?.last_name} />
                  <InfoRow icon={Phone} label="Phone" value={profile?.phone} />
                  <InfoRow icon={Sparkles} label="Gender" value={profile?.gender} capitalize />
                  <InfoRow icon={Mail} label="Email" value={user.email} full />
                </div>
              ) : (
                <form onSubmit={handleSave} className="p-5 md:p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <Field
                      label="First name"
                      value={form.first_name}
                      onChange={(v) => setForm({ ...form, first_name: v })}
                      placeholder="Layla"
                    />
                    <Field
                      label="Last name"
                      value={form.last_name}
                      onChange={(v) => setForm({ ...form, last_name: v })}
                      placeholder="Ben Saïd"
                    />
                  </div>
                  <Field
                    type="tel"
                    label="Phone"
                    value={form.phone}
                    onChange={(v) => setForm({ ...form, phone: v })}
                    placeholder="+216 …"
                  />
                  <div>
                    <label className="text-[10px] tracking-[0.25em] uppercase text-on-surface-variant block mb-2">
                      Gender
                    </label>
                    <select
                      value={form.gender}
                      onChange={(e) => setForm({ ...form, gender: e.target.value })}
                      className="w-full px-3 py-3 text-sm bg-bg border border-outline-variant/40 rounded text-on-surface outline-none focus:border-gold transition-colors"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs">
                      {error}
                    </div>
                  )}

                  <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => { setEditing(false); setError(null) }}
                      className="flex-1 px-4 py-3 text-xs font-medium tracking-[0.25em] uppercase text-on-surface-variant border border-outline-variant/40 hover:text-on-surface hover:border-outline-variant transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-gold text-bg text-xs font-semibold tracking-[0.25em] uppercase hover:bg-gold-light transition-colors disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" strokeWidth={2} />
                      {saving ? 'Saving…' : 'Save changes'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </section>
        </div>

        {/* RIGHT — quick links + sign out */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="border border-outline-variant/30 bg-surface-low">
            <div className="px-5 py-4 border-b border-outline-variant/25">
              <span className="eyebrow-sm">Quick links</span>
            </div>
            <QuickLink to="/bookings" icon={Calendar} label="My bookings" desc="Stays & requests" />
            <QuickLink to="/favorites" icon={Heart} label="Favorites" desc="Saved spaces" />
            <QuickLink to="/explore" icon={ArrowUpRight} label="Browse spaces" desc="Open the catalog" last />
          </div>

          <div className="border border-outline-variant/30 bg-surface-low p-5">
            <div className="flex items-start gap-3 mb-3">
              <Shield className="w-4 h-4 text-gold mt-0.5" strokeWidth={1.6} />
              <div>
                <p className="text-sm text-on-surface font-medium">Account security</p>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  We never share your data. Reach out to support to delete your account.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <Link
                to="/contact"
                className="text-center px-3 py-2.5 text-[10px] tracking-[0.25em] uppercase text-on-surface-variant border border-outline-variant/40 hover:text-gold hover:border-gold transition-colors"
              >
                Contact
              </Link>
              <button
                onClick={async () => { await logout(); navigate('/') }}
                className="inline-flex items-center justify-center gap-2 px-3 py-2.5 text-[10px] tracking-[0.25em] uppercase text-on-surface border border-outline-variant/40 hover:text-red-400 hover:border-red-400/60 transition-colors"
              >
                <LogOut className="w-3 h-3" strokeWidth={1.8} />
                Log out
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile sticky save bar — when editing */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.3, ease }}
            className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-bg/95 backdrop-blur-xl border-t border-outline-variant/30 px-4 py-3 flex items-center gap-3 safe-bottom"
          >
            <button
              onClick={() => { setEditing(false); setError(null) }}
              className="flex-1 px-3 py-2.5 text-[10px] tracking-[0.3em] uppercase text-on-surface-variant border border-outline-variant/40 hover:text-on-surface transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 bg-gold text-bg text-[10px] tracking-[0.3em] uppercase font-semibold hover:bg-gold-light transition-colors disabled:opacity-50"
            >
              <Save className="w-3 h-3" strokeWidth={2} />
              {saving ? 'Saving' : 'Save'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <EmailVerificationModal isOpen={emailModalOpen} onClose={() => setEmailModalOpen(false)} />
    </motion.div>
  )
}

function InfoRow({ icon: Icon, label, value, full, capitalize }) {
  return (
    <div className={`p-5 border-b border-outline-variant/20 sm:[&:nth-child(odd)]:border-r ${full ? 'sm:col-span-2' : ''}`}>
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className="w-3.5 h-3.5 text-gold" strokeWidth={1.6} />
        <span className="eyebrow-sm text-on-surface-variant">{label}</span>
      </div>
      {value ? (
        <p className={`text-sm text-on-surface ${capitalize ? 'capitalize' : ''} truncate`}>{value}</p>
      ) : (
        <p className="text-sm text-on-surface-variant/60 italic">Not set</p>
      )}
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <label className="text-[10px] tracking-[0.25em] uppercase text-on-surface-variant block mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-3 text-sm bg-bg border border-outline-variant/40 rounded text-on-surface outline-none focus:border-gold transition-colors"
      />
    </div>
  )
}

function QuickLink({ to, icon: Icon, label, desc, last }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-5 py-4 hover:bg-gold/5 transition-colors group ${
        last ? '' : 'border-b border-outline-variant/20'
      }`}
    >
      <span className="w-9 h-9 flex items-center justify-center rounded-full border border-outline-variant/40 text-on-surface-variant group-hover:text-gold group-hover:border-gold transition-colors">
        <Icon className="w-4 h-4" strokeWidth={1.6} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-on-surface group-hover:text-gold transition-colors">{label}</p>
        <p className="text-[11px] text-on-surface-variant">{desc}</p>
      </div>
      <ArrowUpRight className="w-3.5 h-3.5 text-on-surface-variant/60 group-hover:text-gold transition-colors" strokeWidth={1.6} />
    </Link>
  )
}
