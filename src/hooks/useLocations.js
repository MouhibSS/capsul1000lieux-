import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useLocations() {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchLocations() {
      try {
        const { data, error: err } = await supabase
          .from('locations')
          .select('*')
          .eq('published', true)

        if (err) throw err
        const mapped = (data || []).map((loc) => ({
          ...loc,
          images: loc.image_urls || [],
          coordinates: {
            lat: loc.latitude,
            lng: loc.longitude,
          },
        }))
        setLocations(mapped)
      } catch (err) {
        setError(err.message)
        console.error('Failed to fetch locations:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchLocations()
  }, [])

  return { locations, loading, error }
}
