// apps/staff-portal/src/services/broadcast.service.ts

import { supabase } from '../lib/supabase'
import type { ActiveBroadcast } from '../types/broadcast.types'

export async function getActiveBroadcastsForSchool(schoolId: string): Promise<ActiveBroadcast[]> {
  const nowIso = new Date().toISOString()

  const [{ data: broadcasts, error: broadcastError }, { data: subscription }] = await Promise.all([
    supabase
      .from('broadcasts')
      .select('id, title, body, type, target, target_school_ids, expires_at')
      .eq('is_published', true)
      .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
      .order('created_at', { ascending: false }),
    supabase
      .from('subscriptions')
      .select('status')
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  if (broadcastError) throw broadcastError
  if (!broadcasts) return []

  const subStatus = subscription?.status ?? null

  return broadcasts
    .filter((b) => {
      if (b.target === 'all_schools') return true
      if (b.target === 'specific_schools') return (b.target_school_ids ?? []).includes(schoolId)
      if (b.target === 'active_only') return subStatus === 'active'
      if (b.target === 'trial_only') return subStatus === 'trial'
      return false
    })
    .map((b) => ({
      id: b.id,
      title: b.title,
      body: b.body,
      type: b.type,
      expires_at: b.expires_at,
    }))
}
