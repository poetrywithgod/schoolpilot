import { supabase } from '../lib/supabase'

export const getFeeItems = async (schoolId: string) => {
  const { data, error } = await supabase
    .from('fee_items')
    .select('*, terms(name), fee_item_classes(class_id, classes(level, arm))')
    .eq('school_id', schoolId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export const createFeeItem = async (schoolId: string, payload: {
  name: string
  amount: number
  term_id: string
  applies_to_all: boolean
  class_ids?: string[]
}) => {
  const { class_ids, ...feePayload } = payload

  const { data, error } = await supabase
    .from('fee_items')
    .insert({ ...feePayload, school_id: schoolId })
    .select()
    .single()

  if (error) throw error

  if (!payload.applies_to_all && class_ids && class_ids.length > 0) {
    const classRecords = class_ids.map((class_id) => ({
      fee_item_id: data.id,
      class_id,
    }))

    const { error: classError } = await supabase
      .from('fee_item_classes')
      .insert(classRecords)

    if (classError) throw classError
  }

  return data
}

export const deleteFeeItem = async (feeItemId: string) => {
  const { error } = await supabase
    .from('fee_items')
    .delete()
    .eq('id', feeItemId)

  if (error) throw error
}

export const getPayments = async (schoolId: string) => {
  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      student:students(id, first_name, last_name, reg_number, classes(level, arm)),
      fee_item:fee_items(id, name, amount)
    `)
    .eq('school_id', schoolId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export const getPaymentSummary = async (schoolId: string, termId: string) => {
  const { data, error } = await supabase
    .from('payments')
    .select('amount, status')
    .eq('school_id', schoolId)

  if (error) throw error

  const total = data?.reduce((sum, p) => sum + (p.status === 'success' ? p.amount : 0), 0) ?? 0
  const pending = data?.filter((p) => p.status === 'pending').length ?? 0
  const successful = data?.filter((p) => p.status === 'success').length ?? 0

  return { total, pending, successful }
}

export const recordManualPayment = async (schoolId: string, payload: {
  student_id: string
  fee_item_id: string
  amount: number
  paid_by: string
}) => {
  const { data, error } = await supabase
    .from('payments')
    .insert({
      ...payload,
      school_id: schoolId,
      status: 'success',
      paid_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const generateGuestPaymentLink = async (schoolId: string, payload: {
  student_id: string
  fee_item_id: string
}) => {
  const token = crypto.randomUUID()
  const { data, error } = await supabase
    .from('guest_payment_links')
    .insert({
      ...payload,
      school_id: schoolId,
      token,
      is_used: false,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return { ...data, link: `${window.location.origin}/pay/${token}` }
}