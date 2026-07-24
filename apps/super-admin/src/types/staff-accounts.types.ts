// apps/super-admin/src/types/staff-accounts.types.ts

export type SuperAdminRole = 'super_admin' | 'support_agent'

export interface SuperAdminAccount {
  id: string
  auth_id: string
  first_name: string
  last_name: string
  email: string
  role: SuperAdminRole
  is_active: boolean
  last_login_at: string | null
  created_at: string
  updated_at: string
}
