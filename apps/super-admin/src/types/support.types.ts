// apps/super-admin/src/types/support.types.ts

// NOTE: status/priority/category are free-text columns in Supabase (no DB enum).
// These unions are assumed conventions — verify against real ticket data and
// adjust if actual values differ (won't cause type errors either way, just
// filters/badges silently not matching until confirmed).
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface SupportTicket {
  id: string
  school_id: string
  raised_by: string
  assigned_to: string | null
  ticket_number: string
  subject: string
  priority: TicketPriority
  status: TicketStatus
  category: string | null
  resolved_at: string | null
  closed_at: string | null
  created_at: string
  updated_at: string
}

export interface SupportTicketWithDetails extends SupportTicket {
  school_name: string
  school_slug: string
  logo_url: string | null
  raised_by_name: string
  assigned_to_name: string | null
}

export type MessageSenderType = 'school' | 'super_admin'

export interface SupportMessage {
  id: string
  ticket_id: string
  sender_type: MessageSenderType
  sender_staff_id: string | null
  sender_admin_id: string | null
  message: string
  is_internal: boolean
  created_at: string
}

export interface SupportMessageWithSender extends SupportMessage {
  sender_name: string
}
