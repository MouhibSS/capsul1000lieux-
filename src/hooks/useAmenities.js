import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAmenities() {
  const [amenities, setAmenities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAmenities()
  }, [])

  const fetchAmenities = async () => {
    try {
      const { data, error: err } = await supabase
        .from('filter_categories')
        .select('key, label')
        .eq('category_type', 'amenity')
        .eq('enabled', true)
        .order('display_order', { ascending: true })

      if (err) throw err

      setAmenities(data || [])
    } catch (err) {
      setError(err.message)
      console.error('Error fetching amenities:', err)
    } finally {
      setLoading(false)
    }
  }

  const getLabel = (key) => {
    return amenities.find(a => a.key === key)?.label || key
  }

  return { amenities, loading, error, getLabel, refetch: fetchAmenities }
}
