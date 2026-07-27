// apps/super-admin/src/services/settings.service.ts

import { supabase } from '../lib/supabase'
import { logAuditEvent } from './audit.service'
import type { PlatformSettings } from '../types/settings.types'

export async function getPlatformSettings(): Promise<PlatformSettings> {
  const { data, error } = await supabase
    .from('platform_settings')
    .select('*')
    .limit(1)
    .single()

  if (error) throw error
  return data
}

export async function updatePlatformSettings(
  id: string,
  updates: {
    supportEmail: string
    defaultTrialDays: number
    maintenanceMode: boolean
    maintenanceMessage: string | null
  },
  actorId: string,
  actorName: string,
  previous: PlatformSettings
): Promise<void> {
  const { error } = await supabase
    .from('platform_settings')
    .update({
      support_email: updates.supportEmail,
      default_trial_days: updates.defaultTrialDays,
      maintenance_mode: updates.maintenanceMode,
      maintenance_message: updates.maintenanceMessage,
      updated_at: new Date().toISOString(),
      updated_by: actorId,
    })
    .eq('id', id)

  if (error) throw error

  await logAuditEvent({
    actorId,
    actorName,
    action: 'update_platform_settings',
    entityType: 'platform_settings',
    entityId: id,
    entityLabel: 'Platform Settings',
    oldValues: {
      support_email: previous.support_email,
      default_trial_days: previous.default_trial_days,
      maintenance_mode: previous.maintenance_mode,
      maintenance_message: previous.maintenance_message,
    },
    newValues: {
      support_email: updates.supportEmail,
      default_trial_days: updates.defaultTrialDays,
      maintenance_mode: updates.maintenanceMode,
      maintenance_message: updates.maintenanceMessage,
    },
  })
}

export async function updateOwnProfile(
  adminId: string,
  firstName: string,
  lastName: string
): Promise<void> {
  const { error } = await supabase
    .from('super_admins')
    .update({ first_name: firstName, last_name: lastName })
    .eq('id', adminId)

  if (error) throw error
}

export async function updateOwnPassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
}
