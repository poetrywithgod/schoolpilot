export type StaffRole = 'admin' | 'bursar' | 'teacher'

export interface Staff {
  id: string
  school_id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  role: StaffRole
  is_active: boolean
  created_at: string
}