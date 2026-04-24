import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'
import AdminDashboard from './AdminDashboard'
import Unauthorized from './Unauthorized'

export default function Admin() {
  const { user, isAdmin, loading } = useAuthContext()
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return
    if (!user) {
      navigate('/admin/login')
    }
  }, [user, loading, navigate])

  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-bg via-bg to-surface-low flex items-center justify-center">
      <div className="text-on-surface-variant">Loading...</div>
    </div>
  }

  if (!isAdmin) {
    return <Unauthorized />
  }

  return <AdminDashboard />
}
