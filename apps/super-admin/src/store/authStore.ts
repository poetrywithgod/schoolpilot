import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

export interface SuperAdmin {
  id: string
  authId: string
  firstName: string
  lastName: string
  email: string
  role: 'super_admin' | 'support_agent'
}

interface AuthStore {
  admin: SuperAdmin | null
  isAuthenticated: boolean
  isLoading: boolean
  setAdmin: (admin: SuperAdmin | null) => void
  setLoading: (loading: boolean) => void
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      admin: null,
      isAuthenticated: false,
      isLoading: false,

      setAdmin: (admin) =>
        set({ admin, isAuthenticated: !!admin }),

      setLoading: (isLoading) => set({ isLoading }),

      signOut: async () => {
        await supabase.auth.signOut()
        set({ admin: null, isAuthenticated: false })
      },
    }),
    {
      name: 'schoolpilot-superadmin-auth',
      partialize: (state) => ({
        admin: state.admin,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
