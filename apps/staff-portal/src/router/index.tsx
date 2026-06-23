import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { Login } from '../pages/auth/Login'
import { AdminDashboard } from '../pages/dashboard/AdminDashboard'
import { TeacherDashboard } from '../pages/dashboard/TeacherDashboard'
import { BursarDashboard } from '../pages/dashboard/BursarDashboard'
import { useAuthStore } from '../store/authStore'

const DashboardRouter = () => {
  const { user } = useAuthStore()
  if (user?.role === 'teacher') return <TeacherDashboard />
  if (user?.role === 'bursar') return <BursarDashboard />
  return <AdminDashboard />
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardRouter />
      </ProtectedRoute>
    ),
  },
])