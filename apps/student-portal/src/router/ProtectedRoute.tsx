import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireRole?: 'student' | 'parent'
}

export const ProtectedRoute = ({ children, requireRole }: ProtectedRouteProps) => {
  const { isAuthenticated, role } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requireRole && role !== requireRole) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}