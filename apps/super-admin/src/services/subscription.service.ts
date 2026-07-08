// apps/super-admin/src/services/subscription.service.ts

import { supabase } from '../lib/supabase'
import type {
  SchoolSubscriptionRow,
  SubscriptionPlan,
  SubscriptionStatus,
} from '../types/school.types'

export async function getAllSubscriptions(): Promise<SchoolSubscriptionRow[]> {
  const { data: schools, error: schoolsError } = await supabase
    .from('schools')
    .select('id, name, slug, logo_url')
    .order('name', { ascending: true })

  if (schoolsError) throw schoolsError
  if (!schools) return []

  const { data: subscriptions, error: subsError } = await supabase
    .from('subscriptions')
    .select('*')
    .order('created_at', { ascending: false })

  if (subsError) throw subsError

  const latestBySchool = new Map<string, typeof subscriptions[number]>()
  ;(subscriptions ?? []).forEach((sub) => {
    if (!latestBySchool.has(sub.school_id)) {
      latestBySchool.set(sub.school_id, sub)
    }
  })

  return schools.map((school) => {
    const sub = latestBySchool.get(school.id)
    return {
      subscription_id: sub?.id ?? null,
      school_id: school.id,
      school_name: school.name,
      school_slug: school.slug,
      logo_url: school.logo_url,
      plan: sub?.plan ?? null,
      status: sub?.status ?? null,
      amount_naira: sub?.amount_naira ?? null,
      current_period_end: sub?.current_period_end ?? null,
      trial_ends_at: sub?.trial_ends_at ?? null,
    }
  })
}

interface UpdateSubscriptionInput {
  plan: SubscriptionPlan
  status: SubscriptionStatus
  amount_naira: number
  current_period_end: string | null
}

export async function upsertSubscription(
  schoolId: string,
  subscriptionId: string | null,
  input: UpdateSubscriptionInput
): Promise<void> {
  if (subscriptionId) {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        plan: input.plan,
        status: input.status,
        amount_naira: input.amount_naira,
        current_period_end: input.current_period_end,
      })
      .eq('id', subscriptionId)

    if (error) throw error
  } else {
    const { error } = await supabase.from('subscriptions').insert({
      school_id: schoolId,
      plan: input.plan,
      status: input.status,
      amount_naira: input.amount_naira,
      current_period_start: new Date().toISOString(),
      current_period_end: input.current_period_end,
      auto_renew: false,
    })

    if (error) throw error
  }
}
