export interface Student {
  id: string
  school_id: string
  reg_number: string
  first_name: string
  last_name: string
  middle_name: string | null
  class_id: string | null
  date_of_birth: string | null
  gender: 'male' | 'female' | null
  address: string | null
  photo_url: string | null
  guardian_name: string | null
  guardian_phone: string | null
  guardian_email: string | null
  parent_linking_code: string
  is_active: boolean
  profile_completed: boolean
  created_at: string
}