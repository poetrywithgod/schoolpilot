import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface School {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  address: string | null
  phone: string | null
  email: string | null
  subscriptionTier: 'starter' | 'growth'
  subscriptionExpiresAt: string
}

interface SchoolStore {
  school: School | null
  setSchool: (school: School | null) => void
  clearSchool: () => void
}

export const useSchoolStore = create<SchoolStore>()(
  persist(
    (set) => ({
      school: null,
      setSchool: (school) => set({ school }),
      clearSchool: () => set({ school: null }),
    }),
    {
      name: 'schoolpilot-school',
    }
  )
)