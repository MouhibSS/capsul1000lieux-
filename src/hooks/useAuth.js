import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      try {
        // Try to restore session from localStorage
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user || null)
        setLoading(false)
      } catch (error) {
        console.error('Auth check error:', error)
        setLoading(false)
      }
    }

    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
      // Persist session to localStorage
      if (session) {
        localStorage.setItem('auth_token', JSON.stringify({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          user: session.user,
          expires_at: session.expires_at
        }))
      } else {
        localStorage.removeItem('auth_token')
      }
    })

    return () => subscription?.unsubscribe()
  }, [])

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    // If Supabase requires email confirmation, signUp returns no session.
    // Force-login immediately so account creation does not require verifying email.
    if (!data?.session) {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) throw signInError
      return signInData
    }
    return data
  }

  const isAdmin = user?.user_metadata?.user_role === 'admin'

  return { user, loading, login, logout, signUp, isAdmin }
}
