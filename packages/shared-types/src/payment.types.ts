export type PaymentStatus = 'pending' | 'success' | 'failed'

export interface FeeItem {
  id: string
  school_id: string
  name: string
  amount: number
  term_id: string
  class_ids: string[]
  created_at: string
}

export interface Payment {
  id: string
  school_id: string
  student_id: string
  fee_item_id: string
  amount: number
  status: PaymentStatus
  paystack_reference: string | null
  paid_at: string | null
  receipt_url: string | null
  created_at: string
}