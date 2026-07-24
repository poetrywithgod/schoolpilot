// apps/super-admin/src/services/support.service.ts

import { supabase } from '../lib/supabase'
import type {
  SupportTicketWithDetails,
  SupportMessageWithSender,
  TicketStatus,
} from '../types/support.types'

async function getSchoolsMap(schoolIds: string[]) {
  if (schoolIds.length === 0) return new Map<string, { name: string; slug: string; logo_url: string | null }>()
  const { data, error } = await supabase
    .from('schools')
    .select('id, name, slug, logo_url')
    .in('id', schoolIds)
  if (error) throw error
  return new Map((data ?? []).map((s) => [s.id, s]))
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

async function getAdminNameMap(adminIds: string[]) {
  if (adminIds.length === 0) return new Map<string, string>()
  const { data, error } = await supabase
    .from('super_admins')
    .select('id, first_name, last_name')
    .in('id', adminIds)
  if (error) throw error
  return new Map((data ?? []).map((a) => [a.id, `${a.first_name} ${a.last_name}`]))
}

export async function getAllTickets(): Promise<SupportTicketWithDetails[]> {
  const { data: tickets, error } = await supabase
    .from('support_tickets')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  if (!tickets) return []

  const schoolIds = [...new Set(tickets.map((t) => t.school_id))]
  const staffIds = [...new Set(tickets.map((t) => t.raised_by).filter((v): v is string => !!v))]
  const adminIds = [...new Set(tickets.map((t) => t.assigned_to).filter((v): v is string => !!v))]

  const [schoolsMap, staffMap, adminsMap] = await Promise.all([
    getSchoolsMap(schoolIds),
    getStaffNameMap(staffIds),
    getAdminNameMap(adminIds),
  ])

  return tickets.map((t) => {
    const school = schoolsMap.get(t.school_id)
    return {
      ...t,
      school_name: school?.name ?? 'Unknown School',
      school_slug: school?.slug ?? '',
      logo_url: school?.logo_url ?? null,
      raised_by_name: staffMap.get(t.raised_by) ?? 'Unknown',
      assigned_to_name: t.assigned_to ? adminsMap.get(t.assigned_to) ?? 'Unknown' : null,
    }
  })
}

export async function getTicketById(ticketId: string): Promise<SupportTicketWithDetails> {
  const { data: ticket, error } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('id', ticketId)
    .single()

  if (error) throw error

  const [schoolsMap, staffMap, adminsMap] = await Promise.all([
    getSchoolsMap([ticket.school_id]),
    getStaffNameMap([ticket.raised_by]),
    getAdminNameMap(ticket.assigned_to ? [ticket.assigned_to] : []),
  ])

  const school = schoolsMap.get(ticket.school_id)

  return {
    ...ticket,
    school_name: school?.name ?? 'Unknown School',
    school_slug: school?.slug ?? '',
    logo_url: school?.logo_url ?? null,
    raised_by_name: staffMap.get(ticket.raised_by) ?? 'Unknown',
    assigned_to_name: ticket.assigned_to ? adminsMap.get(ticket.assigned_to) ?? 'Unknown' : null,
  }
}

export async function getTicketMessages(ticketId: string): Promise<SupportMessageWithSender[]> {
  const { data: messages, error } = await supabase
    .from('support_messages')
    .select('*')
    .eq('ticket_id', ticketId)
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
        ? (m.sender_admin_id ? adminsMap.get(m.sender_admin_id) : undefined) ?? 'Support Admin'
        : (m.sender_staff_id ? staffMap.get(m.sender_staff_id) : undefined) ?? 'School Staff',
  }))
}

export async function sendReply(
  ticketId: string,
  adminId: string,
  message: string,
  isInternal: boolean
): Promise<void> {
  const { error } = await supabase.from('support_messages').insert({
    ticket_id: ticketId,
    sender_type: 'super_admin',
    sender_admin_id: adminId,
    sender_staff_id: null,
    message,
    is_internal: isInternal,
  })
  if (error) throw error
}

export async function updateTicketStatus(ticketId: string, status: TicketStatus): Promise<void> {
  const update: Record<string, unknown> = { status }
  if (status === 'resolved') update.resolved_at = new Date().toISOString()
  if (status === 'closed') update.closed_at = new Date().toISOString()

  const { error } = await supabase.from('support_tickets').update(update).eq('id', ticketId)
  if (error) throw error
}

export async function assignTicket(ticketId: string, adminId: string | null): Promise<void> {
  const { error } = await supabase
    .from('support_tickets')
    .update({ assigned_to: adminId })
    .eq('id', ticketId)
  if (error) throw error
}
