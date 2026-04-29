import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthContext } from '../context/AuthContext'

export function useBookings() {
  const { user } = useAuthContext()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Guest booking — no auth required.
  // payload: { locationId, startDate, endDate, dayPart, guestFullName, guestEmail, guestPhone, eventType, eventDescription, numGuests, totalPrice }
  const createBooking = useCallback(async (payload) => {
    try {
      setLoading(true)
      const row = {
        user_id: user?.id ?? null,
        user_email: user?.email ?? payload.guestEmail ?? null,
        location_id: payload.locationId,
        start_date: payload.startDate,
        end_date: payload.endDate || payload.startDate,
        day_part: payload.dayPart || null,
        num_guests: payload.numGuests ?? 1,
        total_price: payload.totalPrice ?? 0,
        notes: payload.eventDescription || '',
        guest_full_name: payload.guestFullName || null,
        guest_email: payload.guestEmail || null,
        guest_phone: payload.guestPhone || null,
        event_type: payload.eventType || null,
        event_description: payload.eventDescription || null,
        status: 'pending',
      }
      const { data, error: err } = await supabase
        .from('bookings')
        .insert([row])
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
        .select(`*, locations ( id, name, city, image_urls )`)
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
