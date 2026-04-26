import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Sparkles } from 'lucide-react'
import ChatBot from './ChatBot'

export default function ChatBotModal() {
  const [isOpen, setIsOpen] = useState(false)

  // Lock body scroll on mobile when chat is open
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    if (window.matchMedia('(max-width: 639px)').matches) {
      document.body.style.overflow = 'hidden'
    }
    return () => { document.body.style.overflow = prev }
  }, [isOpen])

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: isOpen ? 0 : 1, opacity: isOpen ? 0 : 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 group"
        aria-label="Open chat"
      >
        <span className="absolute inset-0 rounded-full bg-gold/30 blur-xl group-hover:bg-gold/50 transition-colors" />
        <span className="relative flex items-center justify-center w-14 h-14 sm:w-15 sm:h-15 bg-gradient-to-br from-gold to-gold-light text-bg rounded-full shadow-xl border border-gold-light/40">
          <Sparkles size={22} strokeWidth={1.8} />
        </span>
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400 border-2 border-bg" />
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            {/* Mobile: bottom sheet · Desktop: floating panel */}
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 280 }}
              className="
                fixed z-50
                inset-x-0 bottom-0 h-[85dvh] rounded-t-2xl
                sm:inset-auto sm:bottom-6 sm:right-6
                sm:w-[26rem] sm:h-[min(40rem,85vh)]
                md:w-[28rem]
                lg:w-[30rem] lg:h-[min(42rem,85vh)]
                sm:rounded-2xl
                overflow-hidden
                shadow-2xl
              "
            >
              <ChatBot onClose={() => setIsOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
