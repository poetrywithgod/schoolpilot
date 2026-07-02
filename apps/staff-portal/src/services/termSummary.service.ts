import { supabase } from '../lib/supabase'

export interface TermSummary {
  id: string
  student_id: string
  total_score: number
  average_score: number
  subjects_count: number
  class_position: number | null
  total_students_in_class: number | null
  class_teacher_remark: string | null
  head_teacher_remark: string | null
  is_finalized: boolean
}

/**
 * Recalculates term summaries (total, average, class position) for every
 * student in a class for a given term, based on currently PUBLISHED
 * results. Upserts into term_summaries. Safe to re-run any time results
 * change — e.g. after a late score correction — since it overwrites rather
 * than appends.
 */
export const calculateTermSummaries = async (
  schoolId: string,
  classId: string,
  termId: string,
  calculatedByStaffId: string
) => {
  const { data: students, error: studentsError } = await supabase
    .from('students')
    .select('id')
    .eq('class_id', classId)
    .eq('school_id', schoolId)

  if (studentsError) throw studentsError
  if (!students || students.length === 0) {
    throw new Error('No students found in this class')
  }

  const { data: results, error: resultsError } = await supabase
    .from('results')
    .select('student_id, total_score')
    .eq('term_id', termId)
    .eq('is_published', true)
    .in('student_id', students.map((s) => s.id))

  if (resultsError) throw resultsError

  // Aggregate per student
  const byStudent: Record<string, { total: number; count: number }> = {}
  ;(results ?? []).forEach((r: any) => {
    if (!byStudent[r.student_id]) byStudent[r.student_id] = { total: 0, count: 0 }
    byStudent[r.student_id].total += Number(r.total_score ?? 0)
    byStudent[r.student_id].count += 1
  })

  const summaries = students.map((s) => {
    const agg = byStudent[s.id] ?? { total: 0, count: 0 }
    const average = agg.count > 0 ? agg.total / agg.count : 0
    return {
      student_id: s.id,
      total_score: agg.total,
      average_score: Math.round(average * 100) / 100,
      subjects_count: agg.count,
    }
  })

  // Rank by average descending; students with zero subjects (no published
  // results yet) are excluded from ranking entirely rather than ranked last,
  // since they have no real standing to report.
  const ranked = summaries
    .filter((s) => s.subjects_count > 0)
    .sort((a, b) => b.average_score - a.average_score)

  const totalRanked = ranked.length
  const positionByStudent: Record<string, number> = {}
  ranked.forEach((s, index) => {
    positionByStudent[s.student_id] = index + 1
  })

  const rows = summaries.map((s) => ({
    school_id: schoolId,
    student_id: s.student_id,
    class_id: classId,
    term_id: termId,
    total_score: s.total_score,
    average_score: s.average_score,
    subjects_count: s.subjects_count,
    class_position: positionByStudent[s.student_id] ?? null,
    total_students_in_class: totalRanked,
    is_finalized: true,
    calculated_at: new Date().toISOString(),
    calculated_by: calculatedByStaffId,
  }))

  const { error: upsertError } = await supabase
    .from('term_summaries')
    .upsert(rows, { onConflict: 'student_id,term_id' })

  if (upsertError) throw upsertError

  return { studentsProcessed: students.length, ranked: totalRanked }
}

export const getTermSummary = async (studentId: string, termId: string): Promise<TermSummary | null> => {
  const { data, error } = await supabase
    .from('term_summaries')
    .select('*')
    .eq('student_id', studentId)
    .eq('term_id', termId)
    .maybeSingle()

  if (error) throw error
  return data
}

export const getTermSummariesForClass = async (classId: string, termId: string): Promise<TermSummary[]> => {
  const { data, error } = await supabase
    .from('term_summaries')
    .select('*, students(first_name, last_name, reg_number)')
    .eq('class_id', classId)
    .eq('term_id', termId)
    .order('class_position', { ascending: true, nullsFirst: false })

  if (error) throw error
  return data ?? []
}

export const updateRemarks = async (
  termSummaryId: string,
  classTeacherRemark: string,
  headTeacherRemark: string
) => {
  const { error } = await supabase
    .from('term_summaries')
    .update({
      class_teacher_remark: classTeacherRemark || null,
      head_teacher_remark: headTeacherRemark || null,
    })
    .eq('id', termSummaryId)

  if (error) throw error
}