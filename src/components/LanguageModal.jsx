import { motion } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext'

const ease = [0.22, 1, 0.36, 1]

export default function LanguageModal() {
  const { chosen, choose } = useLanguage()

  if (chosen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease }}
      className="fixed inset-0 bg-gradient-to-br from-bg via-bg to-surface-low backdrop-blur-xl z-[9999] flex items-center justify-center"
    >
      <div className="container-main max-w-2xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease }}
          className="space-y-10"
        >
          <div>
            <h1 className="font-display font-light text-6xl md:text-7xl text-on-surface uppercase tracking-display mb-3">
              216 000 lieux
            </h1>
            <p className="text-on-surface-variant font-light text-lg">
              Choose your language
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 md:gap-8">
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => choose('en')}
              className="group relative overflow-hidden rounded-lg p-8 border-2 border-outline-variant/30 hover:border-gold/50 transition-all duration-300 bg-surface-low/50 backdrop-blur"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 flex flex-col items-center gap-4">
                <span className="text-6xl">🇬🇧</span>
                <div>
                  <h3 className="font-display text-2xl font-light text-on-surface uppercase tracking-wide mb-1">
                    English
                  </h3>
                  <p className="text-sm text-on-surface-variant font-light">
                    Continue in English
                  </p>
                </div>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => choose('fr')}
              className="group relative overflow-hidden rounded-lg p-8 border-2 border-outline-variant/30 hover:border-gold/50 transition-all duration-300 bg-surface-low/50 backdrop-blur"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 flex flex-col items-center gap-4">
                <span className="text-6xl">🇫🇷</span>
                <div>
                  <h3 className="font-display text-2xl font-light text-on-surface uppercase tracking-wide mb-1">
                    Français
                  </h3>
                  <p className="text-sm text-on-surface-variant font-light">
                    Continuer en français
                  </p>
                </div>
              </div>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
