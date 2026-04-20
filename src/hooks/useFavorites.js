import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthContext } from '../context/AuthContext'

export function useFavorites() {
  const { user, loading: authLoading } = useAuthContext()
  const navigate = useNavigate()
  const location = useLocation()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchSupabaseFavorites = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('location_id')
        .eq('user_id', userId)

      if (error) throw error
      setFavorites(data.map(f => f.location_id))
    } catch (err) {
      console.error('Error fetching favorites:', err)
      setFavorites([])
    } finally {
      setLoading(false)
    }
  }, [])

  const migrateLocalStorageToSupabase = useCallback(async (userId) => {
    try {
      const localFavs = JSON.parse(localStorage.getItem('capsul_favorites') || '[]')
      if (localFavs.length === 0) return

      const rows = localFavs.map(location_id => ({ user_id: userId, location_id }))
      await supabase
        .from('favorites')
        .upsert(rows, { onConflict: 'user_id,location_id' })

      localStorage.removeItem('capsul_favorites')
    } catch (err) {
      console.error('Error migrating favorites:', err)
    }
  }, [])

  useEffect(() => {
    if (authLoading) return

    if (user) {
      setLoading(true)
      migrateLocalStorageToSupabase(user.id).then(async () => {
        // Add deferred favorite if user just logged in (check both location.state and sessionStorage)
        const pendingFav = location.state?.pendingFavoriteId || sessionStorage.getItem('pendingFavoriteId')
        if (pendingFav) {
          await supabase
            .from('favorites')
            .insert([{ user_id: user.id, location_id: pendingFav }])
          sessionStorage.removeItem('pendingFavoriteId')
          window.history.replaceState({}, document.title, window.location.pathname)
        }

        await fetchSupabaseFavorites(user.id)
      })
    } else {
      try {
        const localFavs = JSON.parse(localStorage.getItem('capsul_favorites') || '[]')
        setFavorites(localFavs)
      } catch {
        setFavorites([])
      }
      setLoading(false)
    }
  }, [user, authLoading, fetchSupabaseFavorites, migrateLocalStorageToSupabase, location.state?.pendingFavoriteId])

  const toggle = useCallback(
    async (id) => {
      if (!user) {
        navigate('/login', { state: { pendingFavoriteId: id } })
        return
      }

      const isFav = favorites.includes(id)

      if (isFav) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('location_id', id)

        if (!error) {
          setFavorites(prev => prev.filter(f => f !== id))
        }
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert([{ user_id: user.id, location_id: id }])

        if (!error) {
          setFavorites(prev => [...prev, id])
        }
      }
    },
    [user, favorites, navigate]
  )

  const isFavorite = useCallback((id) => favorites.includes(id), [favorites])

  return { favorites, toggle, isFavorite, loading }
}
