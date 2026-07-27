// apps/super-admin/src/types/settings.types.ts

export interface PlatformSettings {
  id: string
  support_email: string
  default_trial_days: number
  maintenance_mode: boolean
  maintenance_message: string | null
  updated_at: string
  updated_by: string | null
}
