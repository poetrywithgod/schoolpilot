import { supabase } from '../lib/supabase'

export const getAnnouncements = async (schoolId: string) => {
  const { data, error } = await supabase
    .from('announcements')
    .select('*, staff(first_name, last_name)')
    .eq('school_id', schoolId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export const createAnnouncement = async (schoolId: string, payload: {
  title: string
  body: string
  audience: string
  class_id?: string
  created_by: string
}) => {
  const { data, error } = await supabase
    .from('announcements')
    .insert({ ...payload, school_id: schoolId })
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteAnnouncement = async (announcementId: string) => {
  const { error } = await supabase
    .from('announcements')
    .delete()
    .eq('id', announcementId)

  if (error) throw error
}