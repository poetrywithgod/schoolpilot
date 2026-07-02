import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { Login } from '../pages/auth/Login'
import { ChangePin } from '../pages/auth/ChangePin'
import { ParentRegister } from '../pages/auth/ParentRegister'
import { LinkChild } from '../pages/auth/LinkChild'
import { StudentDashboard } from '../pages/dashboard/StudentDashboard'
import { ParentDashboard } from '../pages/dashboard/ParentDashboard'
import { MySubjects } from '../pages/subjects/MySubjects'
import { ResultList } from '../pages/results/ResultList'
import { FeeBalance } from '../pages/fees/FeeBalance'
import { Announcements } from '../pages/announcements/Announcements'
import { StudentAttendance } from '../pages/attendance/StudentAttendance'
import { StudentProfile } from '../pages/profile/StudentProfile'
import { ParentSubjects } from '../pages/parent/ParentSubjects'
import { ParentResults } from '../pages/parent/ParentResults'
import { ParentFeeBalance } from '../pages/parent/ParentFeeBalance'
import { ParentAnnouncements } from '../pages/parent/ParentAnnouncements'
import { ParentAttendance } from '../pages/parent/ParentAttendance'
import { useAuthStore } from '../store/authStore'

const DashboardRouter = () => {
  const { role } = useAuthStore()
  if (role === 'parent') return <ParentDashboard />
  return <StudentDashboard />
}

export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  { path: '/register', element: <ParentRegister /> },
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  {
    path: '/change-pin',
    element: <ProtectedRoute><ChangePin /></ProtectedRoute>,
  },
  {
    path: '/link-child',
    element: <ProtectedRoute requireRole="parent"><LinkChild /></ProtectedRoute>,
  },
  {
    path: '/dashboard',
    element: <ProtectedRoute><DashboardRouter /></ProtectedRoute>,
  },
  // Student-facing routes (logged-in student viewing their own data)
  {
    path: '/subjects',
    element: <ProtectedRoute requireRole="student"><MySubjects /></ProtectedRoute>,
  },
  {
    path: '/results',
    element: <ProtectedRoute requireRole="student"><ResultList /></ProtectedRoute>,
  },
  {
    path: '/fees',
    element: <ProtectedRoute requireRole="student"><FeeBalance /></ProtectedRoute>,
  },
  {
    path: '/announcements',
    element: <ProtectedRoute requireRole="student"><Announcements /></ProtectedRoute>,
  },
  {
    path: '/attendance',
    element: <ProtectedRoute requireRole="student"><StudentAttendance /></ProtectedRoute>,
  },
  {
    path: '/profile',
    element: <ProtectedRoute requireRole="student"><StudentProfile /></ProtectedRoute>,
  },
  // Parent-facing routes (parent viewing a specific linked child's data)
  {
    path: '/parent/subjects/:childId',
    element: <ProtectedRoute requireRole="parent"><ParentSubjects /></ProtectedRoute>,
  },
  {
    path: '/parent/results/:childId',
    element: <ProtectedRoute requireRole="parent"><ParentResults /></ProtectedRoute>,
  },
  {
    path: '/parent/fees/:childId',
    element: <ProtectedRoute requireRole="parent"><ParentFeeBalance /></ProtectedRoute>,
  },
  {
    path: '/parent/announcements/:childId',
    element: <ProtectedRoute requireRole="parent"><ParentAnnouncements /></ProtectedRoute>,
  },
  {
    path: '/parent/attendance/:childId',
    element: <ProtectedRoute requireRole="parent"><ParentAttendance /></ProtectedRoute>,
  },
  { path: '*', element: <Navigate to="/login" replace /> },
])