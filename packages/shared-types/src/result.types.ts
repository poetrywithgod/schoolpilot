export interface Result {
  id: string
  school_id: string
  student_id: string
  subject_assignment_id: string
  term_id: string
  ca1_score: number | null
  ca2_score: number | null
  exam_score: number | null
  total_score: number | null
  grade: string | null
  position: number | null
  is_published: boolean
  published_at: string | null
  published_by: string | null
  created_at: string
}