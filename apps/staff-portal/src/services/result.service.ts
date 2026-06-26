import { supabase } from '../lib/supabase'

export const getSubjectAssignmentsByStaff = async (staffId: string, schoolId: string) => {
  const { data, error } = await supabase
    .from('subject_assignments')
    .select(`
      *,
      subject:subjects(id, name),
      class:classes(id, level, arm),
      term:terms(id, name, is_current)
    `)
    .eq('staff_id', staffId)
    .eq('school_id', schoolId)

  if (error) throw error
  return data
}

export const getAllSubjectAssignments = async (schoolId: string) => {
  const { data, error } = await supabase
    .from('subject_assignments')
    .select(`
      *,
      subject:subjects(id, name),
      class:classes(id, level, arm),
      staff:staff(id, first_name, last_name),
      term:terms(id, name, is_current)
    `)
    .eq('school_id', schoolId)

  if (error) throw error
  return data
}

export const getResults = async (subjectAssignmentId: string, termId: string) => {
  const { data, error } = await supabase
    .from('results')
    .select(`
      *,
      student:students(id, first_name, last_name, reg_number, photo_url)
    `)
    .eq('subject_assignment_id', subjectAssignmentId)
    .eq('term_id', termId)
    .order('student(last_name)', { ascending: true })

  if (error) throw error
  return data
}

export const upsertResult = async (payload: {
  school_id: string
  student_id: string
  subject_assignment_id: string
  term_id: string
  ca1_score?: number
  ca2_score?: number
  exam_score?: number
  grade?: string
}) => {
  const { data, error } = await supabase
    .from('results')
    .upsert(payload, {
      onConflict: 'student_id,subject_assignment_id,term_id',
      ignoreDuplicates: false,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const publishResults = async (
  subjectAssignmentId: string,
  termId: string,
  publishedBy: string
) => {
  const { data, error } = await supabase
    .from('results')
    .update({
      is_published: true,
      published_at: new Date().toISOString(),
      published_by: publishedBy,
    })
    .eq('subject_assignment_id', subjectAssignmentId)
    .eq('term_id', termId)
    .select()

  if (error) throw error
  return data
}

export const getResultCompletionStatus = async (schoolId: string) => {
  const { data, error } = await supabase
    .from('subject_assignments')
    .select(`
      id,
      subject:subjects(name),
      class:classes(level, arm),
      staff:staff(first_name, last_name),
      term:terms(id, name, is_current),
      results(id, is_published)
    `)
    .eq('school_id', schoolId)

  if (error) throw error
  return data
}

export const initializeResultsForClass = async (
  schoolId: string,
  subjectAssignmentId: string,
  termId: string,
  classId: string
) => {
  // Get all students in the class
  const { data: students, error: studentError } = await supabase
    .from('students')
    .select('id')
    .eq('class_id', classId)
    .eq('is_active', true)

  if (studentError) throw studentError
  if (!students || students.length === 0) return []

  // Create result records for each student
  const records = students.map((s) => ({
    school_id: schoolId,
    student_id: s.id,
    subject_assignment_id: subjectAssignmentId,
    term_id: termId,
    ca1_score: 0,
    ca2_score: 0,
    exam_score: 0,
    is_published: false,
  }))

  const { data, error } = await supabase
    .from('results')
    .upsert(records, {
      onConflict: 'student_id,subject_assignment_id,term_id',
      ignoreDuplicates: true,
    })
    .select()

  if (error) throw error
  return data
}