import { supabase } from '../lib/supabase'

export const getSubjects = async (schoolId: string) => {
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .eq('school_id', schoolId)
    .order('name', { ascending: true })

  if (error) throw error
  return data
}

export const createSubject = async (schoolId: string, payload: {
  name: string
  code?: string
}) => {
  const { data, error } = await supabase
    .from('subjects')
    .insert({ ...payload, school_id: schoolId })
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteSubject = async (subjectId: string) => {
  const { error } = await supabase
    .from('subjects')
    .delete()
    .eq('id', subjectId)

  if (error) throw error
}

export const assignSubjectToClass = async (schoolId: string, payload: {
  staff_id: string
  subject_id: string
  class_id: string
  term_id: string
}) => {
  const { data, error } = await supabase
    .from('subject_assignments')
    .insert({ ...payload, school_id: schoolId })
    .select()
    .single()

  if (error) throw error
  return data
}

export const getSubjectAssignments = async (schoolId: string) => {
  const { data, error } = await supabase
    .from('subject_assignments')
    .select(`
      *,
      subject:subjects(id, name),
      class:classes(id, level, arm),
      staff:staff(id, first_name, last_name),
      term:terms(id, name)
    `)
    .eq('school_id', schoolId)

  if (error) throw error
  return data
}

export const removeSubjectAssignment = async (assignmentId: string) => {
  const { error } = await supabase
    .from('subject_assignments')
    .delete()
    .eq('id', assignmentId)

  if (error) throw error
}