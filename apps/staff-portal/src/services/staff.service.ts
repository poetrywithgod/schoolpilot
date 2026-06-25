import { supabase } from '../lib/supabase'

export const getStaff = async (schoolId: string) => {
  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .eq('school_id', schoolId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export const createStaff = async (schoolId: string, payload: {
  first_name: string
  last_name: string
  email: string
  phone?: string
  role: 'admin' | 'bursar' | 'teacher'
}) => {
  // Create auth user first
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: payload.email,
    password: 'SchoolPilot2026!',
    email_confirm: true,
  })

  if (authError) throw authError

  // Create staff record
  const { data, error } = await supabase
    .from('staff')
    .insert({
      ...payload,
      school_id: schoolId,
      auth_id: authData.user.id,
      is_active: true,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateStaffStatus = async (staffId: string, isActive: boolean) => {
  const { data, error } = await supabase
    .from('staff')
    .update({ is_active: isActive })
    .eq('id', staffId)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteStaff = async (staffId: string) => {
  const { error } = await supabase
    .from('staff')
    .delete()
    .eq('id', staffId)

  if (error) throw error
}