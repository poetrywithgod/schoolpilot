import { supabase } from '../lib/supabase'


export interface AttendanceRecord {
  id: string
  date: string
  status: 'present' | 'absent' | 'late'
  term_id: string
}

export interface AttendanceSummary {
  records: AttendanceRecord[]
  presentCount: number
  absentCount: number
  lateCount: number
  totalDays: number
  attendanceRate: number // percentage, present + late counted as attended
}

/**
 * Fetches all attendance records for a student in a given term, sorted by
 * most recent first, along with summary counts. Used by both the student's
 * own attendance view and the parent-facing equivalent (just pass the
 * child's student_id in the parent case).
 */
export const getStudentAttendance = async (
  studentId: string,
  termId: string
): Promise<AttendanceSummary> => {
  const { data, error } = await supabase
    .from('attendance')
    .select('id, date, status, term_id')
    .eq('student_id', studentId)
    .eq('term_id', termId)
    .order('date', { ascending: false })

  if (error) throw error

  const records = (data ?? []) as AttendanceRecord[]
  const presentCount = records.filter((r) => r.status === 'present').length
  const absentCount = records.filter((r) => r.status === 'absent').length
  const lateCount = records.filter((r) => r.status === 'late').length
  const totalDays = records.length
  const attendanceRate = totalDays > 0
    ? Math.round(((presentCount + lateCount) / totalDays) * 100)
    : 0

  return { records, presentCount, absentCount, lateCount, totalDays, attendanceRate }
}

/**
 * Returns the school's current term (is_current = true), so attendance
 * views default to the active term without the caller needing to know
 * the term id in advance.
 */
export const getCurrentTermForSchool = async (schoolId: string) => {
  const { data, error } = await supabase
    .from('terms')
    .select('id, name, is_current')
    .eq('school_id', schoolId)
    .eq('is_current', true)
    .single()

  if (error) throw error
  return data
}