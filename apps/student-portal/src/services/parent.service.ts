import { supabase } from '../lib/supabase'

export const registerParent = async (payload: {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
}) => {
  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
  })

  if (authError) throw authError
  if (!authData.user) throw new Error('Failed to create account')

  // Create parent record
  const { data, error } = await supabase
    .from('parents')
    .insert({
      auth_id: authData.user.id,
      first_name: payload.firstName,
      last_name: payload.lastName,
      email: payload.email,
      phone: payload.phone,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const getParentByAuthId = async (authId: string) => {
  const { data, error } = await supabase
    .from('parents')
    .select('*')
    .eq('auth_id', authId)
    .single()

  if (error) throw error
  return data
}

export const linkChildToParent = async (
  parentId: string,
  regNumber: string,
  linkingCode: string
) => {
  // Find student by reg number and linking code
  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('*, classes(level, arm), schools(id, name, slug, logo_url)')
    .eq('reg_number', regNumber.toUpperCase())
    .eq('parent_linking_code', linkingCode)
    .single()

  if (studentError || !student) {
    throw new Error('Invalid reg number or linking code. Please check and try again.')
  }

  // Check if already linked
  const { data: existing } = await supabase
    .from('parent_students')
    .select('id')
    .eq('parent_id', parentId)
    .eq('student_id', student.id)
    .single()

  if (existing) throw new Error('This student is already linked to your account')

  // Create link
  const { error: linkError } = await supabase
    .from('parent_students')
    .insert({
      parent_id: parentId,
      student_id: student.id,
    })

  if (linkError) throw linkError
  return student
}

export const getLinkedChildren = async (parentId: string) => {
  const { data, error } = await supabase
    .from('parent_students')
    .select(`
      student:students(
        id,
        first_name,
        last_name,
        reg_number,
        photo_url,
        class_id,
        school_id,
        classes(level, arm),
        school:schools(id, name, slug, logo_url)
      )
    `)
    .eq('parent_id', parentId)

  if (error) throw error
  return (data ?? []).map((item: any) => ({
    ...(Array.isArray(item.student) ? item.student[0] : item.student),
  }))
}

/**
 * Fetches a single child's record by student id, verified against the
 * parent_students link table so a parent can only ever load a child they
 * are actually linked to. Used by the parent-facing Subjects/Results/Fees/
 * Announcements pages, which load directly off the URL (and therefore need
 * to be able to re-fetch on a hard refresh, not just rely on dashboard state).
 */
export const getChildById = async (parentId: string, childId: string) => {
  const { data: link, error: linkError } = await supabase
    .from('parent_students')
    .select('id')
    .eq('parent_id', parentId)
    .eq('student_id', childId)
    .single()

  if (linkError || !link) {
    throw new Error('This student is not linked to your account')
  }

  const { data, error } = await supabase
    .from('students')
    .select(`
      id,
      first_name,
      last_name,
      reg_number,
      photo_url,
      class_id,
      school_id,
      classes(level, arm),
      school:schools(id, name, slug, logo_url)
    `)
    .eq('id', childId)
    .single()

  if (error || !data) {
    throw new Error('Failed to load student record')
  }

  return {
    ...data,
    classes: Array.isArray((data as any).classes) ? (data as any).classes[0] ?? null : (data as any).classes,
    school: Array.isArray((data as any).school) ? (data as any).school[0] ?? null : (data as any).school,
  }
}