import { supabase } from '../lib/supabase'

export const getSessions = async (schoolId: string) => {
  const { data, error } = await supabase
    .from('sessions')
    .select('*, terms(*)')
    .eq('school_id', schoolId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export const createSession = async (schoolId: string, payload: {
  name: string
  start_date: string
  end_date: string
}) => {
  const { data, error } = await supabase
    .from('sessions')
    .insert({ ...payload, school_id: schoolId })
    .select()
    .single()

  if (error) throw error
  return data
}

export const setCurrentSession = async (schoolId: string, sessionId: string) => {
  // Unset all current sessions first
  await supabase
    .from('sessions')
    .update({ is_current: false })
    .eq('school_id', schoolId)

  // Set the selected one as current
  const { data, error } = await supabase
    .from('sessions')
    .update({ is_current: true })
    .eq('id', sessionId)
    .select()
    .single()

  if (error) throw error
  return data
}

export const createTerm = async (schoolId: string, payload: {
  session_id: string
  name: string
  start_date: string
  end_date: string
}) => {
  const { data, error } = await supabase
    .from('terms')
    .insert({ ...payload, school_id: schoolId })
    .select()
    .single()

  if (error) throw error
  return data
}

export const setCurrentTerm = async (schoolId: string, termId: string) => {
  await supabase
    .from('terms')
    .update({ is_current: false })
    .eq('school_id', schoolId)

  const { data, error } = await supabase
    .from('terms')
    .update({ is_current: true })
    .eq('id', termId)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteSession = async (sessionId: string) => {
  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('id', sessionId)

  if (error) throw error
}