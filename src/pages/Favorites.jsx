import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'
import { useFavoritesContext as useFavorites } from '../context/FavoritesContext'
import { supabase } from '../lib/supabase'
import LocationCard from '../components/LocationCard'
import { ArrowUpRight, X } from 'lucide-react'

const ease = [0.22, 1, 0.36, 1]

const pageVariants = {
  initial: { opacity: 0 },
  enter: { opacity: 1, transition: { duration: 0.6, ease } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
}

export default function Favorites() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuthContext()
  const { toggle } = useFavorites()

  const handleRemove = async (id) => {
    await toggle(id)
    setLocations(prev => prev.filter(l => l.id !== id))
  }
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      setLoading(false)
      return
    }

    const fetchFavorites = async () => {
      try {
        // Fetch favorites with related location data in one query
        const { data: favs, error: favsError } = await supabase
          .from('favorites')
          .select(`
            location_id,
            locations (
              id,
              name,
              city,
              type,
              rating,
              price,
              currency,
              image_urls,
              featured,
              fallback,
              tags
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (favsError) throw favsError

        if (!favs || favs.length === 0) {
          setLocations([])
          setLoading(false)
          return
        }

        // Extract locations from the joined result and map image_urls to images
        const locs = favs
          .map(fav => fav.locations)
          .filter(Boolean)
          .map(loc => ({
            ...loc,
            images: loc.image_urls || [],
          }))

        setLocations(locs)
      } catch (err) {
        console.error('Error fetching favorites:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchFavorites()
  }, [user, authLoading])

  if (authLoading || loading) {
    return (
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="enter"
        exit="exit"
        className="min-h-screen flex items-center justify-center"
      >
        <div className="text-on-surface-variant">Loading...</div>
      </motion.div>
    )
  }

  if (!user) {
    return (
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="enter"
        exit="exit"
      >
        <section className="min-h-screen flex flex-col items-center justify-center container-main">
          <h1 className="font-display font-light text-4xl md:text-5xl text-on-surface text-center mb-6">
            Log in to view your favorites
          </h1>
          <p className="text-on-surface-variant text-center max-w-md mb-8">
            Create an account or log in to save your favorite locations and access them anytime.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gold hover:bg-gold-light text-bg font-semibold text-[10px] uppercase tracking-[0.3em] transition-colors"
          >
            Go to Login
            <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.8} />
          </button>
        </section>
      </motion.div>
    )
  }

  if (locations.length === 0) {
    return (
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="enter"
        exit="exit"
      >
        <section className="min-h-screen flex flex-col items-center justify-center container-main">
          <h1 className="font-display font-light text-4xl md:text-5xl text-on-surface text-center mb-6">
            No favorites yet
          </h1>
          <p className="text-on-surface-variant text-center max-w-md">
            Start exploring and add spaces to your favorites to see them here.
          </p>
        </section>
      </motion.div>
    )
  }

  return (
    <motion.div variants={pageVariants} initial="initial" animate="enter" exit="exit">
      <section className="py-16 md:py-24 border-b border-outline-variant/25 container-main">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-6 h-px bg-gold" />
            <span className="eyebrow">Your collection</span>
          </div>
          <h1 className="font-display font-light text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[0.9] tracking-display uppercase text-on-surface">
            Saved spaces
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((location, i) => (
            <motion.div
              key={location.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              className="relative group"
            >
              <LocationCard location={location} />
              <button
                onClick={() => handleRemove(location.id)}
                className="absolute top-4 right-4 w-10 h-10 bg-red-500/90 text-white flex items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                aria-label="Remove from favorites"
                title="Remove from favorites"
              >
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            </motion.div>
          ))}
        </div>
      </section>
    </motion.div>
  )
}
