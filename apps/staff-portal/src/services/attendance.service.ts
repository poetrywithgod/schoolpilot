import { supabase } from '../lib/supabase'

export const getAttendanceByClass = async (
  classId: string,
  date: string
) => {
  const { data, error } = await supabase
    .from('attendance')
    .select('*, students(id, first_name, last_name, photo_url)')
    .eq('class_id', classId)
    .eq('date', date)

  if (error) throw error
  return data
}

export const markAttendance = async (records: {
  school_id: string
  student_id: string
  class_id: string
  term_id: string
  date: string
  status: 'present' | 'absent' | 'late'
  marked_by: string
}[]) => {
  const { data, error } = await supabase
    .from('attendance')
    .upsert(records, {
      onConflict: 'student_id,date',
      ignoreDuplicates: false,
    })
    .select()

  if (error) throw error
  return data
}

export const getAttendanceReport = async (
  schoolId: string,
  classId: string,
  termId: string
) => {
  const { data, error } = await supabase
    .from('attendance')
    .select('*, students(id, first_name, last_name)')
    .eq('school_id', schoolId)
    .eq('class_id', classId)
    .eq('term_id', termId)
    .order('date', { ascending: false })

  if (error) throw error
  return data
}

export const getCurrentTerm = async (schoolId: string) => {
  const { data, error } = await supabase
    .from('terms')
    .select('*')
    .eq('school_id', schoolId)
    .eq('is_current', true)
    .single()

  if (error) throw error
  return data
}