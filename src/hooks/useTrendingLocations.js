import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useTrendingLocations() {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTrending() {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('trending', true)
        .eq('published', true)
        .order('created_at', { ascending: false })

      if (!error && data) {
        const mapped = (data || []).map((loc) => ({
          ...loc,
          images: loc.image_urls || [],
          coordinates: {
            lat: loc.latitude,
            lng: loc.longitude,
          },
        }))
        setLocations(mapped)
      }
      setLoading(false)
    }

    fetchTrending()
  }, [])

  return { locations, loading }
}
