// apps/staff-portal/src/types/broadcast.types.ts

export type BroadcastTarget = 'all_schools' | 'active_only' | 'trial_only' | 'specific_schools'
export type BroadcastType = 'info' | 'warning' | 'maintenance' | 'feature'

export interface ActiveBroadcast {
  id: string
  title: string
  body: string
  type: BroadcastType
  expires_at: string | null
}
