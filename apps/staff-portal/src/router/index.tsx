import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { Login } from '../pages/auth/Login'
import { AdminDashboard } from '../pages/dashboard/AdminDashboard'
import { TeacherDashboard } from '../pages/dashboard/TeacherDashboard'
import { BursarDashboard } from '../pages/dashboard/BursarDashboard'
import { NotFound } from '../pages/NotFound'
import { Unauthorized } from '../pages/Unauthorized'
import { useAuthStore } from '../store/authStore'
import { SchoolProfile } from '../pages/settings/SchoolProfile'
import { SessionManager } from '../pages/settings/SessionManager'


const DashboardRouter = () => {
  const { user } = useAuthStore()
  if (user?.role === 'teacher') return <TeacherDashboard />
  if (user?.role === 'bursar') return <BursarDashboard />
  return <AdminDashboard />
}

// Placeholder component for pages we haven't built yet
const ComingSoon = ({ page }: { page: string }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <span className="text-6xl">🚧</span>
      <h2 className="text-2xl font-bold text-gray-900 mt-4">{page}</h2>
      <p className="text-gray-500 mt-2">This page is under construction</p>
    </div>
  </div>
)

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
  {
    path: '/students',
    element: (
      <ProtectedRoute allowedRoles={['admin', 'teacher']}>
        <ComingSoon page="Students" />
      </ProtectedRoute>
    ),
  },
  {
    path: '/staff',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <ComingSoon page="Staff" />
      </ProtectedRoute>
    ),
  },
  {
    path: '/classes',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <ComingSoon page="Classes" />
      </ProtectedRoute>
    ),
  },
  {
    path: '/attendance',
    element: (
      <ProtectedRoute allowedRoles={['admin', 'teacher']}>
        <ComingSoon page="Attendance" />
      </ProtectedRoute>
    ),
  },
  {
    path: '/results',
    element: (
      <ProtectedRoute allowedRoles={['admin', 'teacher']}>
        <ComingSoon page="Results" />
      </ProtectedRoute>
    ),
  },
  {
    path: '/payments',
    element: (
      <ProtectedRoute allowedRoles={['admin', 'bursar']}>
        <ComingSoon page="Payments" />
      </ProtectedRoute>
    ),
  },
  {
    path: '/announcements',
    element: (
      <ProtectedRoute>
        <ComingSoon page="Announcements" />
      </ProtectedRoute>
    ),
  },
  {
  path: '/settings',
  element: (
    <ProtectedRoute allowedRoles={['admin']}>
      <SchoolProfile />
    </ProtectedRoute>
  ),
 },
 {
  path: '/settings/sessions',
  element: (
    <ProtectedRoute allowedRoles={['admin']}>
      <SessionManager />
    </ProtectedRoute>
  ),
  },
  {
    path: '/unauthorized',
    element: <Unauthorized />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
])