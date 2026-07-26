// apps/super-admin/src/services/broadcast.service.ts

import { supabase } from '../lib/supabase'
import { logAuditEvent } from './audit.service'
import type { Broadcast, BroadcastWithSender, BroadcastTarget, BroadcastType } from '../types/broadcast.types'

async function getAdminNameMap(adminIds: string[]) {
  if (adminIds.length === 0) return new Map<string, string>()
  const { data, error } = await supabase
    .from('super_admins')
    .select('id, first_name, last_name')
    .in('id', adminIds)
  if (error) throw error
  return new Map((data ?? []).map((a) => [a.id, `${a.first_name} ${a.last_name}`]))
}

export async function getBroadcasts(): Promise<BroadcastWithSender[]> {
  const { data: broadcasts, error } = await supabase
    .from('broadcasts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  if (!broadcasts) return []

  const adminIds = [...new Set(broadcasts.map((b) => b.sent_by).filter((v): v is string => !!v))]
  const adminMap = await getAdminNameMap(adminIds)

  return broadcasts.map((b) => ({
    ...b,
    sent_by_name: adminMap.get(b.sent_by) ?? 'Unknown',
  }))
}

export async function createBroadcast(input: {
  sentBy: string
  sentByName: string
  title: string
  body: string
  target: BroadcastTarget
  targetSchoolIds: string[] | null
  type: BroadcastType
  expiresAt: string | null
  publishNow: boolean
}): Promise<Broadcast> {
  const { data, error } = await supabase
    .from('broadcasts')
    .insert({
      sent_by: input.sentBy,
      title: input.title,
      body: input.body,
      target: input.target,
      target_school_ids: input.target === 'specific_schools' ? input.targetSchoolIds : null,
      type: input.type,
      expires_at: input.expiresAt,
      is_published: input.publishNow,
      published_at: input.publishNow ? new Date().toISOString() : null,
    })
    .select()
    .single()

  if (error) throw error

  await logAuditEvent({
    actorId: input.sentBy,
    actorName: input.sentByName,
    action: input.publishNow ? 'create_and_publish_broadcast' : 'create_broadcast_draft',
    entityType: 'broadcast',
    entityId: data.id,
    entityLabel: input.title,
    oldValues: null,
    newValues: {
      title: input.title,
      target: input.target,
      type: input.type,
      is_published: input.publishNow,
    },
  })

  return data
}

export async function setBroadcastPublished(
  id: string,
  isPublished: boolean,
  actorId: string,
  actorName: string,
  title: string
): Promise<void> {
  const { error } = await supabase
    .from('broadcasts')
    .update({
      is_published: isPublished,
      published_at: isPublished ? new Date().toISOString() : null,
    })
    .eq('id', id)

  if (error) throw error

  await logAuditEvent({
    actorId,
    actorName,
    action: isPublished ? 'publish_broadcast' : 'unpublish_broadcast',
    entityType: 'broadcast',
    entityId: id,
    entityLabel: title,
    oldValues: { is_published: !isPublished },
    newValues: { is_published: isPublished },
  })
}

export async function deleteBroadcast(
  id: string,
  actorId: string,
  actorName: string,
  title: string
): Promise<void> {
  const { error } = await supabase.from('broadcasts').delete().eq('id', id)
  if (error) throw error

  await logAuditEvent({
    actorId,
    actorName,
    action: 'delete_broadcast',
    entityType: 'broadcast',
    entityId: id,
    entityLabel: title,
    oldValues: { title },
    newValues: null,
  })
}
