import { supabase } from '../lib/supabase'

export const getSchool = async (schoolId: string) => {
  const { data, error } = await supabase
    .from('schools')
    .select('*')
    .eq('id', schoolId)
    .single()

  if (error) throw error
  return data
}

export const updateSchool = async (schoolId: string, updates: {
  name?: string
  address?: string
  phone?: string
  email?: string
  logo_url?: string
  stamp_url?: string
}) => {
  const { data, error } = await supabase
    .from('schools')
    .update(updates)
    .eq('id', schoolId)
    .select()
    .single()

  if (error) throw error
  return data
}

export const uploadSchoolLogo = async (schoolId: string, file: File) => {
  const fileExt = file.name.split('.').pop()
  const filePath = `${schoolId}/logo.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('school-assets')
    .upload(filePath, file, { upsert: true })

  if (uploadError) throw uploadError

  const { data } = supabase.storage
    .from('school-assets')
    .getPublicUrl(filePath)

  return data.publicUrl
}