// apps/super-admin/src/services/audit.service.ts

import { supabase } from '../lib/supabase'
import type { AuditLogWithSchool } from '../types/audit.types'

export async function getAuditLogs(limit = 100): Promise<AuditLogWithSchool[]> {
  const { data: logs, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  if (!logs) return []

  const schoolIds = [...new Set(logs.map((l) => l.school_id).filter((v): v is string => !!v))]

  let schoolMap = new Map<string, string>()
  if (schoolIds.length > 0) {
    const { data: schools, error: schoolError } = await supabase
      .from('schools')
      .select('id, name')
      .in('id', schoolIds)
    if (schoolError) throw schoolError
    schoolMap = new Map((schools ?? []).map((s) => [s.id, s.name]))
  }

  return logs.map((log) => ({
    ...log,
    school_name: log.school_id ? schoolMap.get(log.school_id) ?? null : null,
  }))
}

export async function logAuditEvent(entry: {
  schoolId?: string | null
  actorId: string
  actorName: string
  action: string
  entityType: string
  entityId?: string | null
  entityLabel?: string | null
  oldValues?: Record<string, unknown> | null
  newValues?: Record<string, unknown> | null
}): Promise<void> {
  const { error } = await supabase.from('audit_logs').insert({
    school_id: entry.schoolId ?? null,
    actor_type: 'super_admin',
    actor_id: entry.actorId,
    actor_name: entry.actorName,
    action: entry.action,
    entity_type: entry.entityType,
    entity_id: entry.entityId ?? null,
    entity_label: entry.entityLabel ?? null,
    old_values: entry.oldValues ?? null,
    new_values: entry.newValues ?? null,
  })

  // Audit logging failures should never block the actual admin action —
  // log to console and swallow the error rather than throwing.
  if (error) console.error('Failed to write audit log:', error)
}
