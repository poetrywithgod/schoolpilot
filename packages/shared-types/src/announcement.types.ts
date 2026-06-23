export type AnnouncementAudience = 'all' | 'students' | 'parents' | 'staff' | 'class'

export interface Announcement {
  id: string
  school_id: string
  title: string
  body: string
  audience: AnnouncementAudience
  class_id: string | null
  created_by: string
  created_at: string
}