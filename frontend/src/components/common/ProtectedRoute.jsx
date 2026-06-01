import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import AdminLayout from './AdminLayout'

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />
  return <AdminLayout><Outlet /></AdminLayout>
}
