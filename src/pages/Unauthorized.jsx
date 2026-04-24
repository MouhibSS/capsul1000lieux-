import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, Shield } from 'lucide-react'

const ease = [0.22, 1, 0.36, 1]

const pageVariants = {
  initial: { opacity: 0 },
  enter: { opacity: 1, transition: { duration: 0.6, ease } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
}

export default function Unauthorized() {
  const navigate = useNavigate()

  return (
    <motion.div variants={pageVariants} initial="initial" animate="enter" exit="exit">
      <section className="min-h-screen flex flex-col items-center justify-center container-main px-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease }}
          className="text-center"
        >
          {/* Icon */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="flex justify-center mb-8"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-gold to-gold-light rounded-full flex items-center justify-center">
              <Shield className="w-10 h-10 text-bg" strokeWidth={1.5} />
            </div>
          </motion.div>

          {/* 403 Code */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-4"
          >
            <p className="font-mono text-6xl md:text-7xl font-bold text-gold/80 tracking-wider">403</p>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="font-display font-light text-3xl sm:text-4xl md:text-5xl text-on-surface text-center mb-4 uppercase tracking-display"
          >
            This place is out of your reach
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-on-surface-variant text-center max-w-md mb-8 text-sm md:text-base"
          >
            The dashboard is reserved for administrators. If you're part of the team, please sign in with your admin account.
          </motion.p>

          {/* Secondary message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="bg-gold/10 border border-gold/30 rounded-lg p-4 mb-8 max-w-sm"
          >
            <p className="text-xs md:text-sm text-on-surface-variant">
              🤐 Don't worry, we're not judging. You just weren't invited to this party.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gold hover:bg-gold-light text-bg font-semibold text-[10px] uppercase tracking-[0.3em] transition-colors"
            >
              Back Home
              <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.8} />
            </button>
            <button
              onClick={() => navigate('/explore')}
              className="inline-flex items-center justify-center gap-3 px-8 py-4 border border-gold/40 text-on-surface hover:text-gold hover:border-gold font-semibold text-[10px] uppercase tracking-[0.3em] transition-colors"
            >
              Explore Spaces
              <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.8} />
            </button>
          </motion.div>
        </motion.div>
      </section>
    </motion.div>
  )
}
