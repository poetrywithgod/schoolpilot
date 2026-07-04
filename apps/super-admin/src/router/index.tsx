import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { AppLayout } from '../components/layout/AppLayout'
import { Login } from '../pages/auth/Login'
import { Dashboard } from '../pages/dashboard/Dashboard'
import { Schools } from '../pages/schools/Schools'
import { SchoolDetail } from '../pages/schools/SchoolDetail'
import { Subscriptions } from '../pages/subscriptions/Subscriptions'
import { SupportTickets } from '../pages/support/SupportTickets'
import { TicketDetail } from '../pages/support/TicketDetail'
import { OnboardingPipeline } from '../pages/onboarding/OnboardingPipeline'
import { StaffAccounts } from '../pages/staff/StaffAccounts'
import { Broadcasts } from '../pages/broadcasts/Broadcasts'
import { AuditLogs } from '../pages/audit/AuditLogs'
import { Settings } from '../pages/settings/Settings'

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
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'schools', element: <Schools /> },
      { path: 'schools/:id', element: <SchoolDetail /> },
      { path: 'subscriptions', element: <Subscriptions /> },
      { path: 'support', element: <SupportTickets /> },
      { path: 'support/:ticketId', element: <TicketDetail /> },
      { path: 'onboarding', element: <OnboardingPipeline /> },
      { path: 'staff', element: <StaffAccounts /> },
      { path: 'broadcasts', element: <Broadcasts /> },
      { path: 'audit', element: <AuditLogs /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
])
