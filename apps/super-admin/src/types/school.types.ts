// apps/super-admin/src/types/school.types.ts

export interface School {
  id: string
  name: string
  slug: string
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  website: string | null
  logo_url: string | null
  is_active: boolean
  is_suspended: boolean
  suspended_at: string | null
  suspension_reason: string | null
  onboarding_stage: string | null
  onboarded_at: string | null
  last_activity_at: string | null
  created_at: string
  updated_at: string
}

export interface SchoolWithStats extends School {
  student_count: number
  staff_count: number
}

export type SubscriptionPlan = 'trial' | 'basic' | 'standard' | 'premium'
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'trial'

export interface Subscription {
  id: string
  school_id: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  amount: number
  currency: string
  starts_at: string | null
  ends_at: string | null
  trial_ends_at: string | null
  created_at: string
}

export interface OnboardingChecklist {
  id: string
  school_id: string
  profile_completed_at: string | null
  session_created_at: string | null
  class_created_at: string | null
  subject_created_at: string | null
  staff_created_at: string | null
  student_created_at: string | null
  first_attendance_at: string | null
  first_result_at: string | null
  first_payment_at: string | null
  fully_live_at: string | null
  nudge_sent_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export const ONBOARDING_STEPS: {
  key: keyof OnboardingChecklist
  label: string
}[] = [
  { key: 'profile_completed_at', label: 'School profile completed' },
  { key: 'session_created_at', label: 'Session & term created' },
  { key: 'class_created_at', label: 'Classes created' },
  { key: 'subject_created_at', label: 'Subjects created' },
  { key: 'staff_created_at', label: 'Staff added' },
  { key: 'student_created_at', label: 'Students added' },
  { key: 'first_attendance_at', label: 'First attendance marked' },
  { key: 'first_result_at', label: 'First result entered' },
  { key: 'first_payment_at', label: 'First payment recorded' },
  { key: 'fully_live_at', label: 'Fully live' },
]

export type StaffRole = 'admin' | 'teacher' | 'bursar'

export interface SchoolStaffMember {
  id: string
  first_name: string
  last_name: string
  email: string
  role: StaffRole
  phone: string | null
  is_active: boolean
  created_at: string
}

export interface EnrollmentDataPoint {
  year: string
  students: number
}
