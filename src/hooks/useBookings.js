import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthContext } from '../context/AuthContext'

export function useBookings() {
  const { user } = useAuthContext()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const createBooking = useCallback(async (locationId, startDate, endDate, numGuests, totalPrice, notes = '') => {
    if (!user) throw new Error('User not authenticated')

    try {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('bookings')
        .insert([{
          user_id: user.id,
          user_email: user.email,
          location_id: locationId,
          start_date: startDate,
          end_date: endDate,
          num_guests: numGuests,
          total_price: totalPrice,
          notes,
          status: 'pending',
        }])
        .select()
        .single()

      if (err) throw err
      setError(null)
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [user])

  const getUserBookings = useCallback(async () => {
    if (!user) return []

    try {
      const { data, error: err } = await supabase
        .from('bookings')
        .select(`
          *,
          locations (
            id,
            name,
            city,
            image_urls
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (err) throw err
      return data || []
    } catch (err) {
      console.error('Error fetching bookings:', err)
      return []
    }
  }, [user])

  return {
    createBooking,
    getUserBookings,
    loading,
    error,
  }
}
