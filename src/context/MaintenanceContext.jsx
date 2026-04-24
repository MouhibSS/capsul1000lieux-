import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const MaintenanceContext = createContext()

export const MAINTENANCE_PASSWORD = 'Capsul1234'
const BYPASS_KEY = 'maint_bypass'

export function MaintenanceProvider({ children }) {
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [bypassed, setBypassed] = useState(() => sessionStorage.getItem(BYPASS_KEY) === '1')

  const [tableMissing, setTableMissing] = useState(false)

  const fetchState = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('maintenance_mode')
        .eq('id', 1)
        .single()
      if (error) {
        // Table or row doesn't exist — fail open (site stays live) and flag it
        if (error.code === 'PGRST116' || error.code === '42P01' || /schema cache|does not exist/i.test(error.message || '')) {
          setTableMissing(true)
          setMaintenanceMode(false)
        } else {
          throw error
        }
      } else {
        setMaintenanceMode(!!data?.maintenance_mode)
        setTableMissing(false)
      }
    } catch (err) {
      console.error('Error fetching maintenance state:', err)
      setMaintenanceMode(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchState() }, [fetchState])

  useEffect(() => {
    const channel = supabase
      .channel('site_settings_changes')
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'site_settings' },
        (payload) => setMaintenanceMode(!!payload.new?.maintenance_mode)
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const toggle = async (newValue) => {
    const { data, error } = await supabase
      .from('site_settings')
      .update({ maintenance_mode: newValue, updated_at: new Date().toISOString() })
      .eq('id', 1)
      .select()
      .single()
    if (error) {
      if (error.code === 'PGRST116' || error.code === '42P01' || /schema cache|does not exist/i.test(error.message || '')) {
        throw new Error('site_settings table not found in Supabase. Run supabase/maintenance_settings.sql in the SQL Editor first.')
      }
      throw error
    }
    setMaintenanceMode(!!data.maintenance_mode)
    if (newValue) {
      // Auto-bypass for the admin who just enabled it so they aren't locked out
      sessionStorage.setItem(BYPASS_KEY, '1')
      setBypassed(true)
    } else {
      sessionStorage.removeItem(BYPASS_KEY)
      setBypassed(false)
    }
    return data
  }

  const unlock = (password) => {
    if (password === MAINTENANCE_PASSWORD) {
      sessionStorage.setItem(BYPASS_KEY, '1')
      setBypassed(true)
      return true
    }
    return false
  }

  const clearBypass = () => {
    sessionStorage.removeItem(BYPASS_KEY)
    setBypassed(false)
  }

  return (
    <MaintenanceContext.Provider value={{ maintenanceMode, loading, bypassed, tableMissing, toggle, unlock, clearBypass, refresh: fetchState }}>
      {children}
    </MaintenanceContext.Provider>
  )
}

export function useMaintenanceContext() {
  const ctx = useContext(MaintenanceContext)
  if (!ctx) throw new Error('useMaintenanceContext must be inside MaintenanceProvider')
  return ctx
}
