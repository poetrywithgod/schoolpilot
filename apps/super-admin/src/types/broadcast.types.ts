// apps/super-admin/src/types/broadcast.types.ts

export type BroadcastTarget = 'all_schools' | 'active_only' | 'trial_only' | 'specific_schools'
export type BroadcastType = 'info' | 'warning' | 'maintenance' | 'feature'

export interface Broadcast {
  id: string
  sent_by: string
  title: string
  body: string
  target: BroadcastTarget
  target_school_ids: string[] | null
  type: BroadcastType
  is_published: boolean
  published_at: string | null
  expires_at: string | null
  created_at: string
  updated_at: string
}

export interface BroadcastWithSender extends Broadcast {
  sent_by_name: string
}
