import { supabase } from '../lib/supabase'
import { generateRegNumber, generateDefaultPin, generateLinkingCode } from '@schoolpilot/shared-utils'

export const getStudents = async (schoolId: string) => {
  const { data, error } = await supabase
    .from('students')
    .select('*, classes(level, arm)')
    .eq('school_id', schoolId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export const getStudentsByClass = async (classId: string) => {
  const { data, error } = await supabase
    .from('students')
    .select('*, classes(level, arm)')
    .eq('class_id', classId)
    .order('last_name', { ascending: true })

  if (error) throw error
  return data
}

export const getStudent = async (studentId: string) => {
  const { data, error } = await supabase
    .from('students')
    .select('*, classes(level, arm)')
    .eq('id', studentId)
    .single()

  if (error) throw error
  return data
}

export const getNextSequence = async (schoolId: string) => {
  const { count } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('school_id', schoolId)

  return (count ?? 0) + 1
}

export const createStudent = async (schoolId: string, schoolCode: string, payload: {
  first_name: string
  last_name: string
  middle_name?: string
  class_id: string
  gender?: string
  date_of_birth?: string
  guardian_name?: string
  guardian_phone?: string
}) => {
  const year = new Date().getFullYear()
  const sequence = await getNextSequence(schoolId)
  const reg_number = generateRegNumber(schoolCode, year, sequence)
  const parent_linking_code = generateLinkingCode()

  // Create auth user for student
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-student`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        school_id: schoolId,
        reg_number,
        parent_linking_code,
        default_pin: generateDefaultPin(reg_number),
        ...payload,
      }),
    }
  )

  const result = await response.json()
  if (!response.ok) throw new Error(result.error || 'Failed to create student')
  return { ...result, reg_number, parent_linking_code }
}

export const updateStudent = async (studentId: string, updates: Record<string, any>) => {
  const { data, error } = await supabase
    .from('students')
    .update(updates)
    .eq('id', studentId)
    .select()
    .single()

  if (error) throw error
  return data
}

export const bulkCreateStudents = async (schoolId: string, schoolCode: string, students: any[]) => {
  const results = []
  for (const student of students) {
    const result = await createStudent(schoolId, schoolCode, student)
    results.push(result)
  }
  return results
}