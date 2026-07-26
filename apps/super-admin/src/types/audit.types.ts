// apps/super-admin/src/types/audit.types.ts

export interface AuditLog {
  id: string
  school_id: string | null
  actor_type: string
  actor_id: string | null
  actor_name: string
  action: string
  entity_type: string
  entity_id: string | null
  entity_label: string | null
  old_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
}

export interface AuditLogWithSchool extends AuditLog {
  school_name: string | null
}
