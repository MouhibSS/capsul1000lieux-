import { createContext, useContext } from 'react'
import { useAuth } from '../hooks/useAuth'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const { user, loading, login, logout, signUp, isAdmin } = useAuth()

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signUp, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuthContext must be used inside AuthProvider')
  return context
}
