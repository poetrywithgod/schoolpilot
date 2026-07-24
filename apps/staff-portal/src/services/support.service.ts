// apps/staff-portal/src/services/support.service.ts

import { supabase } from '../lib/supabase'
import type {
  SupportTicket,
  SupportMessageWithSender,
  TicketPriority,
} from '../types/support.types'

export async function getMyTickets(schoolId: string): Promise<SupportTicket[]> {
  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('school_id', schoolId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getTicketById(ticketId: string): Promise<SupportTicket> {
  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('id', ticketId)
    .single()

  if (error) throw error
  return data
}

function generateTicketNumber(): string {
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `TKT-${rand}`
}

export async function createTicket(input: {
  schoolId: string
  raisedBy: string
  subject: string
  message: string
  priority: TicketPriority
  category?: string
}): Promise<SupportTicket> {
  const { data: ticket, error } = await supabase
    .from('support_tickets')
    .insert({
      school_id: input.schoolId,
      raised_by: input.raisedBy,
      ticket_number: generateTicketNumber(),
      subject: input.subject,
      priority: input.priority,
      status: 'open',
      category: input.category ?? null,
    })
    .select()
    .single()

  if (error) throw error

  const { error: msgError } = await supabase.from('support_messages').insert({
    ticket_id: ticket.id,
    sender_type: 'school',
    sender_staff_id: input.raisedBy,
    sender_admin_id: null,
    message: input.message,
    is_internal: false,
  })
  if (msgError) throw msgError

  return ticket
}

async function getAdminNameMap(adminIds: string[]) {
  if (adminIds.length === 0) return new Map<string, string>()
  const { data, error } = await supabase
    .from('super_admins')
    .select('id, first_name, last_name')
    .in('id', adminIds)
  if (error) throw error
  return new Map((data ?? []).map((a) => [a.id, `${a.first_name} ${a.last_name}`]))
}

async function getStaffNameMap(staffIds: string[]) {
  if (staffIds.length === 0) return new Map<string, string>()
  const { data, error } = await supabase
    .from('staff')
    .select('id, first_name, last_name')
    .in('id', staffIds)
  if (error) throw error
  return new Map((data ?? []).map((s) => [s.id, `${s.first_name} ${s.last_name}`]))
}

// Only returns externally-visible messages — internal notes are excluded
// at the query level so staff can never receive them, even via devtools.
export async function getTicketMessages(ticketId: string): Promise<SupportMessageWithSender[]> {
  const { data: messages, error } = await supabase
    .from('support_messages')
    .select('*')
    .eq('ticket_id', ticketId)
    .eq('is_internal', false)
    .order('created_at', { ascending: true })

  if (error) throw error
  if (!messages) return []

  const staffIds = [...new Set(messages.map((m) => m.sender_staff_id).filter((v): v is string => !!v))]
  const adminIds = [...new Set(messages.map((m) => m.sender_admin_id).filter((v): v is string => !!v))]

  const [staffMap, adminsMap] = await Promise.all([
    getStaffNameMap(staffIds),
    getAdminNameMap(adminIds),
  ])

  return messages.map((m) => ({
    ...m,
    sender_name:
      m.sender_type === 'super_admin'
        ? (m.sender_admin_id ? adminsMap.get(m.sender_admin_id) : undefined) ?? 'SchoolPilot Support'
        : (m.sender_staff_id ? staffMap.get(m.sender_staff_id) : undefined) ?? 'You',
  }))
}

export async function sendMessage(ticketId: string, staffId: string, message: string): Promise<void> {
  const { error } = await supabase.from('support_messages').insert({
    ticket_id: ticketId,
    sender_type: 'school',
    sender_staff_id: staffId,
    sender_admin_id: null,
    message,
    is_internal: false,
  })
  if (error) throw error
}
