import { supabase } from '../lib/supabase'

export const getClasses = async (schoolId: string) => {
  const { data, error } = await supabase
    .from('classes')
    .select('*, sessions(name), subjects:subject_assignments(subject:subjects(id, name))')
    .eq('school_id', schoolId)
    .order('level', { ascending: true })

  if (error) throw error
  return data
}

export const createClass = async (schoolId: string, payload: {
  level: string
  arm: string
  session_id: string
}) => {
  const { data, error } = await supabase
    .from('classes')
    .insert({ ...payload, school_id: schoolId })
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteClass = async (classId: string) => {
  const { error } = await supabase
    .from('classes')
    .delete()
    .eq('id', classId)

  if (error) throw error
}