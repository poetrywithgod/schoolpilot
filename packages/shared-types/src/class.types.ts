export type ClassLevel =
  | 'JSS1' | 'JSS2' | 'JSS3'
  | 'SS1' | 'SS2' | 'SS3'

export interface Class {
  id: string
  school_id: string
  level: ClassLevel
  arm: string
  session_id: string
  created_at: string
}