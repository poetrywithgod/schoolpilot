// apps/staff-portal/src/types/support.types.ts

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
