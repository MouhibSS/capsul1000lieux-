import { useAuthContext } from '../context/AuthContext'
import AdminDashboard from './AdminDashboard'
import Unauthorized from './Unauthorized'

export default function Dashboard() {
  const { user, isAdmin, loading } = useAuthContext()

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    )
  }

  if (!user || !isAdmin) return <Unauthorized />

  return <AdminDashboard />
}
