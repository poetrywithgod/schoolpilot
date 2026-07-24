// apps/super-admin/src/services/admin.service.ts

import { supabase } from '../lib/supabase'
import type { SuperAdminAccount, SuperAdminRole } from '../types/admin.types'

export async function getSuperAdmins(): Promise<SuperAdminAccount[]> {
  const { data, error } = await supabase
    .from('super_admins')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function updateSuperAdminRole(id: string, role: SuperAdminRole): Promise<void> {
  const { error } = await supabase.from('super_admins').update({ role }).eq('id', id)
  if (error) throw error
}

export async function setSuperAdminActive(id: string, isActive: boolean): Promise<void> {
  const { error } = await supabase.from('super_admins').update({ is_active: isActive }).eq('id', id)
  if (error) throw error
}

export async function createSuperAdmin(input: {
  firstName: string
  lastName: string
  email: string
  role: SuperAdminRole
}): Promise<SuperAdminAccount> {
  const { data, error } = await supabase.functions.invoke('create-super-admin', {
    body: {
      first_name: input.firstName,
      last_name: input.lastName,
      email: input.email,
      role: input.role,
    },
  })

  if (error) throw error
  if (data?.error) throw new Error(data.error)
  return data
}
