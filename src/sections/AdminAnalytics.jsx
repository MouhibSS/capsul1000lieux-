import { motion } from 'framer-motion'
import { TrendingUp, Users, Eye, Star } from 'lucide-react'

export default function AdminAnalytics() {
  const stats = [
    { label: 'Views', value: '12.5K', change: '+24%', icon: Eye, color: 'from-blue-500 to-cyan-500' },
    { label: 'Users', value: '348', change: '+12%', icon: Users, color: 'from-purple-500 to-pink-500' },
    { label: 'Bookings', value: '89', change: '+18%', icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
    { label: 'Rating', value: '4.8', change: '+0.2', icon: Star, color: 'from-orange-500 to-red-500' },
  ]

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-3 bg-blue-500/10 border border-blue-500/30 rounded text-blue-400 text-sm"
      >
        📊 Analytics dashboard coming soon
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.05 }}
              className="bg-gradient-to-br from-surface-low to-surface-container rounded-lg p-3 border border-outline-variant/25"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}>
                  <Icon className="w-3 h-3 text-white" strokeWidth={2} />
                </div>
                <span className="text-green-400 text-xs font-medium">{stat.change}</span>
              </div>
              <p className="text-on-surface-variant text-xs font-medium mb-1">{stat.label}</p>
              <p className="font-display text-xl font-light text-on-surface">{stat.value}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-surface-low border border-outline-variant/25 rounded-lg p-4 h-40 flex items-center justify-center"
        >
          <div className="text-center">
            <TrendingUp className="w-8 h-8 text-on-surface-variant/50 mx-auto mb-2" strokeWidth={1.5} />
            <p className="text-on-surface-variant text-xs">Bookings Over Time</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-surface-low border border-outline-variant/25 rounded-lg p-4 h-40 flex items-center justify-center"
        >
          <div className="text-center">
            <Eye className="w-8 h-8 text-on-surface-variant/50 mx-auto mb-2" strokeWidth={1.5} />
            <p className="text-on-surface-variant text-xs">Location Views</p>
          </div>
        </motion.div>
      </div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-surface-low border border-outline-variant/25 rounded-lg p-4"
      >
        <h3 className="text-sm font-light text-on-surface uppercase tracking-wide mb-3">Coming Soon</h3>
        <ul className="space-y-2">
          {[
            'Real-time analytics',
            'Revenue tracking',
            'User behavior insights',
            'Location performance',
            'Custom reports'
          ].map((feature, i) => (
            <li key={i} className="flex items-center gap-2 text-xs text-on-surface-variant">
              <span className="text-gold">✓</span>
              {feature}
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  )
}
