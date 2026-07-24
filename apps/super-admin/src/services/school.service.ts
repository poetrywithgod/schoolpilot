// apps/super-admin/src/services/school.service.ts

import { supabase } from '../lib/supabase'
import { ONBOARDING_STEPS } from '../types/school.types'
import type {
  SchoolWithStats,
  Subscription,
  OnboardingChecklist,
  OnboardingStage,
  OnboardingPipelineCard,
  SchoolStaffMember,
  EnrollmentDataPoint,
} from '../types/school.types'

export async function getSchools(): Promise<SchoolWithStats[]> {
  const { data: schools, error } = await supabase
    .from('schools')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  if (!schools) return []

  const withStats: SchoolWithStats[] = await Promise.all(
    schools.map(async (school) => {
      const [{ count: studentCount }, { count: staffCount }] = await Promise.all([
        supabase
          .from('students')
          .select('id', { count: 'exact', head: true })
          .eq('school_id', school.id),
        supabase
          .from('staff')
          .select('id', { count: 'exact', head: true })
          .eq('school_id', school.id),
      ])

      return {
        ...school,
        student_count: studentCount ?? 0,
        staff_count: staffCount ?? 0,
      }
    })
  )

  return withStats
}

export async function getSchoolById(schoolId: string): Promise<SchoolWithStats> {
  const { data: school, error } = await supabase
    .from('schools')
    .select('*')
    .eq('id', schoolId)
    .single()

  if (error) throw error

  const [{ count: studentCount }, { count: staffCount }] = await Promise.all([
    supabase
      .from('students')
      .select('id', { count: 'exact', head: true })
      .eq('school_id', schoolId),
    supabase
      .from('staff')
      .select('id', { count: 'exact', head: true })
      .eq('school_id', schoolId),
  ])

  return {
    ...school,
    student_count: studentCount ?? 0,
    staff_count: staffCount ?? 0,
  }
}

export async function suspendSchool(schoolId: string, reason: string): Promise<void> {
  const { error } = await supabase
    .from('schools')
    .update({
      is_suspended: true,
      is_active: false,
      suspended_at: new Date().toISOString(),
      suspension_reason: reason,
    })
    .eq('id', schoolId)

  if (error) throw error
}

export async function activateSchool(schoolId: string): Promise<void> {
  const { error } = await supabase
    .from('schools')
    .update({
      is_suspended: false,
      is_active: true,
      suspended_at: null,
      suspension_reason: null,
    })
    .eq('id', schoolId)

  if (error) throw error
}

export async function getSchoolSubscription(schoolId: string): Promise<Subscription | null> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('school_id', schoolId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function getOnboardingChecklist(schoolId: string): Promise<OnboardingChecklist | null> {
  const { data, error } = await supabase
    .from('onboarding_checklist')
    .select('*')
    .eq('school_id', schoolId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function getSchoolStaff(schoolId: string): Promise<SchoolStaffMember[]> {
  const { data, error } = await supabase
    .from('staff')
    .select('id, first_name, last_name, email, role, phone, is_active, created_at')
    .eq('school_id', schoolId)
    .order('first_name', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function getEnrollmentTrend(schoolId: string): Promise<EnrollmentDataPoint[]> {
  const { data, error } = await supabase
    .from('students')
    .select('created_at')
    .eq('school_id', schoolId)

  if (error) throw error
  if (!data) return []

  const yearCounts: Record<string, number> = {}
  data.forEach((row) => {
    const year = new Date(row.created_at).getFullYear().toString()
    yearCounts[year] = (yearCounts[year] || 0) + 1
  })

  return Object.entries(yearCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([year, students]) => ({ year, students }))
}

// Groups schools into coarse pipeline stages based on onboarding_checklist
// milestones, since the 10 individual ONBOARDING_STEPS are too granular
// for a kanban board.
function computeStage(checklist: OnboardingChecklist | null): OnboardingStage {
  if (!checklist) return 'not_started'
  if (checklist.fully_live_at) return 'fully_live'
  if (!checklist.profile_completed_at) return 'not_started'
  if (!checklist.staff_created_at) return 'setting_up'
  if (!checklist.student_created_at) return 'adding_data'
  if (!checklist.first_attendance_at && !checklist.first_result_at) return 'getting_active'
  return 'getting_active'
}

export async function getOnboardingPipeline(): Promise<OnboardingPipelineCard[]> {
  const [{ data: schools, error: schoolsError }, { data: checklists, error: checklistError }] =
    await Promise.all([
      supabase.from('schools').select('id, name, slug, logo_url, created_at'),
      supabase.from('onboarding_checklist').select('*'),
    ])

  if (schoolsError) throw schoolsError
  if (checklistError) throw checklistError
  if (!schools) return []

  const checklistBySchool = new Map<string, OnboardingChecklist>(
    (checklists ?? []).map((c) => [c.school_id, c])
  )

  return schools.map((school) => {
    const checklist = checklistBySchool.get(school.id) ?? null
    const completedSteps = checklist
      ? ONBOARDING_STEPS.filter((step) => !!checklist[step.key]).length
      : 0

    return {
      school_id: school.id,
      school_name: school.name,
      school_slug: school.slug,
      logo_url: school.logo_url,
      created_at: school.created_at,
      stage: computeStage(checklist),
      completed_steps: completedSteps,
      total_steps: ONBOARDING_STEPS.length,
    }
  })
}
