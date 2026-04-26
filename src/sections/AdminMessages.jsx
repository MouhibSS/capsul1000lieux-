import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Mail, Clock, Check, Archive, Trash2, X, User, Tag, RefreshCw, AlertTriangle, CheckCheck } from 'lucide-react'
import { supabase } from '../lib/supabase'

const REASONS = ['All', 'Book a space', 'List my space', 'Partnership', 'Press inquiry', 'Support', 'Other']

const REASON_COLORS = {
  'Book a space':  { bg: 'bg-blue-500/10',    border: 'border-blue-500/30',    text: 'text-blue-400',    dot: 'bg-blue-400' },
  'List my space': { bg: 'bg-emerald-500/10',  border: 'border-emerald-500/30', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  'Partnership':   { bg: 'bg-violet-500/10',   border: 'border-violet-500/30',  text: 'text-violet-400',  dot: 'bg-violet-400' },
  'Press inquiry': { bg: 'bg-sky-500/10',      border: 'border-sky-500/30',     text: 'text-sky-400',     dot: 'bg-sky-400' },
  'Support':       { bg: 'bg-amber-500/10',    border: 'border-amber-500/30',   text: 'text-amber-400',   dot: 'bg-amber-400' },
  'Other':         { bg: 'bg-zinc-500/10',     border: 'border-zinc-500/30',    text: 'text-zinc-400',    dot: 'bg-zinc-400' },
}

const STATUS_STYLES = {
  unread:   'bg-gold/15 text-gold border border-gold/30',
  read:     'bg-white/5 text-on-surface-variant border border-white/10',
  archived: 'bg-zinc-500/10 text-zinc-500 border border-zinc-500/20',
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function AdminMessages() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeReason, setActiveReason] = useState('All')
  const [selected, setSelected] = useState(null)
  const [toast, setToast] = useState(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => { fetchMessages() }, [])

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setMessages(data || [])
    } catch {
      showToast('Failed to load messages', 'error')
    } finally {
      setLoading(false)
    }
  }

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const updateStatus = async (id, status) => {
    setUpdating(true)
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ status })
        .eq('id', id)
      if (error) throw error
      setMessages(prev => prev.map(m => m.id === id ? { ...m, status } : m))
      if (selected?.id === id) setSelected(prev => ({ ...prev, status }))
      showToast(`Marked as ${status}`)
    } catch {
      showToast('Update failed', 'error')
    } finally {
      setUpdating(false)
    }
  }

  const deleteMessage = async (id) => {
    if (!confirm('Delete this message permanently?')) return
    setUpdating(true)
    try {
      const { error } = await supabase.from('contact_messages').delete().eq('id', id)
      if (error) throw error
      setMessages(prev => prev.filter(m => m.id !== id))
      if (selected?.id === id) setSelected(null)
      showToast('Message deleted')
    } catch {
      showToast('Delete failed', 'error')
    } finally {
      setUpdating(false)
    }
  }

  const openMessage = async (msg) => {
    setSelected(msg)
    if (msg.status === 'unread') await updateStatus(msg.id, 'read')
  }

  const filtered = activeReason === 'All'
    ? messages
    : messages.filter(m => m.reason === activeReason)

  const countFor = (reason) => reason === 'All'
    ? messages.filter(m => m.status === 'unread').length
    : messages.filter(m => m.reason === reason && m.status === 'unread').length

  return (
    <div className="space-y-4 relative">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="fixed top-5 right-5 z-[70]"
          >
            <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg shadow-xl border text-sm ${
              toast.type === 'error'
                ? 'bg-red-500/90 text-white border-red-400/60'
                : 'bg-emerald-500/90 text-white border-emerald-400/60'
            }`}>
              {toast.type === 'error'
                ? <AlertTriangle className="w-3.5 h-3.5" strokeWidth={2} />
                : <Check className="w-3.5 h-3.5" strokeWidth={2.5} />}
              <span className="font-medium">{toast.msg}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs text-on-surface-variant">
            {messages.filter(m => m.status === 'unread').length} unread · {messages.length} total
          </p>
        </div>
        <button
          onClick={fetchMessages}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-on-surface-variant hover:text-on-surface bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] rounded-lg transition-all"
        >
          <RefreshCw className="w-3 h-3" strokeWidth={2} />
          Refresh
        </button>
      </div>

      {/* Reason tabs */}
      <div className="flex flex-wrap gap-1.5">
        {REASONS.map((r) => {
          const unread = countFor(r)
          const isActive = activeReason === r
          return (
            <button
              key={r}
              onClick={() => setActiveReason(r)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-medium tracking-widest uppercase rounded-lg transition-all border ${
                isActive
                  ? 'bg-gold/15 text-gold border-gold/30'
                  : 'bg-white/[0.03] text-on-surface-variant border-white/[0.06] hover:text-on-surface hover:bg-white/[0.06]'
              }`}
            >
              {r}
              {unread > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${isActive ? 'bg-gold text-bg' : 'bg-white/10 text-on-surface-variant'}`}>
                  {unread}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-5 h-5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <MessageSquare className="w-8 h-8 text-on-surface-variant/30 mb-3" strokeWidth={1.25} />
          <p className="text-sm text-on-surface-variant font-light">No messages{activeReason !== 'All' ? ` for "${activeReason}"` : ''}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* List */}
          <div className="lg:col-span-5 space-y-1.5">
            {filtered.map((msg) => {
              const colors = REASON_COLORS[msg.reason] || REASON_COLORS['Other']
              const isSelected = selected?.id === msg.id
              return (
                <motion.button
                  key={msg.id}
                  onClick={() => openMessage(msg)}
                  layout
                  className={`w-full text-left p-3.5 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-white/[0.07] border-white/15'
                      : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.05] hover:border-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      {msg.status === 'unread' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0 mt-0.5" />
                      )}
                      <p className={`text-sm truncate font-medium ${msg.status === 'unread' ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                        {msg.name}
                      </p>
                    </div>
                    <span className="text-[10px] text-on-surface-variant/50 flex-shrink-0">{timeAgo(msg.created_at)}</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant/60 truncate mb-2">{msg.email}</p>
                  <div className="flex items-center justify-between gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-medium tracking-widest uppercase rounded border ${colors.bg} ${colors.border} ${colors.text}`}>
                      <span className={`w-1 h-1 rounded-full ${colors.dot}`} />
                      {msg.reason}
                    </span>
                    <span className={`px-2 py-0.5 text-[9px] font-medium rounded ${STATUS_STYLES[msg.status] || STATUS_STYLES.read}`}>
                      {msg.status}
                    </span>
                  </div>
                </motion.button>
              )
            })}
          </div>

          {/* Detail */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div
                  key={selected.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden"
                >
                  {/* Detail header */}
                  <div className="p-5 border-b border-white/[0.06] flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {(() => {
                          const colors = REASON_COLORS[selected.reason] || REASON_COLORS['Other']
                          return (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-medium tracking-widest uppercase rounded border ${colors.bg} ${colors.border} ${colors.text}`}>
                              <span className={`w-1 h-1 rounded-full ${colors.dot}`} />
                              {selected.reason}
                            </span>
                          )
                        })()}
                        <span className={`px-2 py-0.5 text-[9px] font-medium rounded ${STATUS_STYLES[selected.status] || STATUS_STYLES.read}`}>
                          {selected.status}
                        </span>
                      </div>
                      <h3 className="text-base font-medium text-on-surface">{selected.name}</h3>
                      <p className="text-xs text-on-surface-variant">{selected.email}</p>
                    </div>
                    <button
                      onClick={() => setSelected(null)}
                      className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>

                  {/* Meta row */}
                  <div className="px-5 py-3 border-b border-white/[0.04] flex items-center gap-5 flex-wrap">
                    <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant">
                      <Clock className="w-3 h-3" strokeWidth={1.75} />
                      {new Date(selected.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant">
                      <Mail className="w-3 h-3" strokeWidth={1.75} />
                      <a href={`mailto:${selected.email}?subject=Re: Your message about ${selected.reason}`} className="hover:text-gold transition-colors">
                        Reply to {selected.name.split(' ')[0]}
                      </a>
                    </div>
                  </div>

                  {/* Message body */}
                  <div className="p-5">
                    <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-3">Message</p>
                    <p className="text-sm font-light text-on-surface-variant leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                  </div>

                  {/* Actions */}
                  <div className="px-5 py-4 border-t border-white/[0.04] flex items-center gap-2 flex-wrap">
                    {selected.status !== 'archived' && (
                      <button
                        onClick={() => updateStatus(selected.id, 'archived')}
                        disabled={updating}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-on-surface-variant hover:text-on-surface bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] rounded-lg transition-all disabled:opacity-40"
                      >
                        <Archive className="w-3 h-3" strokeWidth={1.75} />
                        Archive
                      </button>
                    )}
                    {selected.status === 'archived' && (
                      <button
                        onClick={() => updateStatus(selected.id, 'read')}
                        disabled={updating}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-on-surface-variant hover:text-on-surface bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] rounded-lg transition-all disabled:opacity-40"
                      >
                        <CheckCheck className="w-3 h-3" strokeWidth={1.75} />
                        Unarchive
                      </button>
                    )}
                    {selected.status !== 'read' && (
                      <button
                        onClick={() => updateStatus(selected.id, 'read')}
                        disabled={updating}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-on-surface-variant hover:text-on-surface bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] rounded-lg transition-all disabled:opacity-40"
                      >
                        <Check className="w-3 h-3" strokeWidth={1.75} />
                        Mark read
                      </button>
                    )}
                    <a
                      href={`mailto:${selected.email}?subject=Re: Your message about ${selected.reason} — Capsul`}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gold/15 hover:bg-gold/25 text-gold border border-gold/30 rounded-lg transition-all"
                    >
                      <Mail className="w-3 h-3" strokeWidth={1.75} />
                      Reply via email
                    </a>
                    <button
                      onClick={() => deleteMessage(selected.id)}
                      disabled={updating}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400/70 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-lg transition-all disabled:opacity-40 ml-auto"
                    >
                      <Trash2 className="w-3 h-3" strokeWidth={1.75} />
                      Delete
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8 bg-white/[0.01] border border-white/[0.04] rounded-xl"
                >
                  <MessageSquare className="w-8 h-8 text-on-surface-variant/20 mb-3" strokeWidth={1.25} />
                  <p className="text-sm text-on-surface-variant/50 font-light">Select a message to read</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  )
}
