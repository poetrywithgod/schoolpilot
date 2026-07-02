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
import { ClassList } from '../pages/classes/ClassList'
import { SubjectList } from '../pages/classes/SubjectList'
import { StaffList } from '../pages/staff/StaffList'
import { StudentList } from '../pages/students/StudentList'
import { CreateStudent } from '../pages/students/CreateStudent'
import { StudentDetail } from '../pages/students/StudentDetail'
import { MarkAttendance } from '../pages/attendance/MarkAttendance'
import { ScoreEntry } from '../pages/results/ScoreEntry'
import { ReportCardGenerator } from '../pages/results/ReportCardGenerator'
import { FeeSetup } from '../pages/payments/FeeSetup'
import { AnnouncementList } from '../pages/announcements/AnnouncementList'
import { IDCardGenerator } from '../pages/students/IDCardGenerator'

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
  {
    path: '/students',
    element: (
      <ProtectedRoute allowedRoles={['admin', 'teacher']}>
        <StudentList />
      </ProtectedRoute>
    ),
  },
  {
    path: '/students/create',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <CreateStudent />
      </ProtectedRoute>
    ),
  },
  {
    path: '/students/:id',
    element: (
      <ProtectedRoute allowedRoles={['admin', 'teacher']}>
        <StudentDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: '/staff',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <StaffList />
      </ProtectedRoute>
    ),
  },
  {
    path: '/classes',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <ClassList />
      </ProtectedRoute>
    ),
  },
  {
    path: '/subjects',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <SubjectList />
      </ProtectedRoute>
    ),
  },
  {
    path: '/attendance',
    element: (
      <ProtectedRoute allowedRoles={['admin', 'teacher']}>
        <MarkAttendance />
      </ProtectedRoute>
    ),
  },
  {
    path: '/results',
    element: (
      <ProtectedRoute allowedRoles={['admin', 'teacher']}>
        <ScoreEntry />
      </ProtectedRoute>
    ),
  },
  {
    path: '/report-cards',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <ReportCardGenerator />
      </ProtectedRoute>
    ),
  },
  {
    path: '/payments',
    element: (
      <ProtectedRoute allowedRoles={['admin', 'bursar']}>
        <FeeSetup />
      </ProtectedRoute>
    ),
  },
  {
    path: '/id-cards',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <IDCardGenerator />
      </ProtectedRoute>
    ),
  },
  {
    path: '/announcements',
    element: (
      <ProtectedRoute>
        <AnnouncementList />
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