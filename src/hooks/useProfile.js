import { useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthContext } from '../context/AuthContext'

export function useProfile() {
  const { user } = useAuthContext()

  const isProfileComplete = useCallback(() => {
    if (!user?.user_metadata) return false
    const meta = user.user_metadata
    return meta.phone && meta.gender && meta.first_name && meta.last_name
  }, [user])

  const updateProfile = async (updates) => {
    try {
      const { data, error: err } = await supabase.auth.updateUser({
        data: updates,
      })

      if (err) throw err
      return data.user
    } catch (err) {
      throw err
    }
  }

  return {
    profile: user?.user_metadata || null,
    loading: false,
    error: null,
    isProfileComplete,
    updateProfile,
  }
}
