import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { Login } from '../pages/auth/Login'
import { ChangePin } from '../pages/auth/ChangePin'
import { StudentDashboard } from '../pages/dashboard/StudentDashboard'
import { MySubjects } from '../pages/subjects/MySubjects'
import { ResultList } from '../pages/results/ResultList'
import { FeeBalance } from '../pages/fees/FeeBalance'

const ComingSoon = ({ page }: { page: string }) => (
  <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F5F0' }}>
    <div className="text-center">
      <span className="text-5xl">🚧</span>
      <p className="mt-4 font-semibold" style={{ color: '#0C3B2E', fontFamily: 'Poppins, sans-serif' }}>
        {page} coming soon
      </p>
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
    path: '/change-pin',
    element: (
      <ProtectedRoute>
        <ChangePin />
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <StudentDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/subjects',
    element: (
      <ProtectedRoute>
        <MySubjects />
      </ProtectedRoute>
    ),
  },
  {
    path: '/results',
    element: (
      <ProtectedRoute>
        <ResultList />
      </ProtectedRoute>
    ),
  },
  {
    path: '/fees',
    element: (
      <ProtectedRoute>
        <FeeBalance />
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <ComingSoon page="Profile" />
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
    path: '*',
    element: <Navigate to="/login" replace />,
  },
])