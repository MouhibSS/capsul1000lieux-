import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  // Check admin status without blocking. Runs in background, fails silently.
  const checkAdminStatus = (currentUser) => {
    if (!currentUser) { setIsAdmin(false); return }
    supabase
      .from('admins')
      .select('user_id')
      .eq('user_id', currentUser.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          console.warn('[useAuth] admin lookup failed (non-fatal):', error.message)
          setIsAdmin(false)
          return
        }
        setIsAdmin(!!data)
      })
      .catch((err) => {
        console.warn('[useAuth] admin lookup error (non-fatal):', err)
        setIsAdmin(false)
      })
  }

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const u = session?.user || null
        setUser(u)
        checkAdminStatus(u) // fire-and-forget — never blocks loading
      } catch (error) {
        console.error('Auth check error:', error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const u = session?.user || null
      setUser(u)
      checkAdminStatus(u)
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

  return { user, loading, login, logout, signUp, isAdmin }
}
