import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

export type PortalRole = 'student' | 'parent'

export interface StudentUser {
  id: string
  authId: string
  firstName: string
  lastName: string
  regNumber: string
  classId: string | null
  className: string | null
  photoUrl: string | null
  profileCompleted: boolean
  schoolId: string
  schoolName: string
  schoolSlug: string
  schoolLogoUrl: string | null
  parentLinkingCode: string
  address: string | null
  dateOfBirth: string | null
  guardianName: string | null
  guardianPhone: string | null
}

export interface ParentUser {
  id: string
  authId: string
  firstName: string
  lastName: string
  email: string | null
  phone: string
}

interface AuthStore {
  role: PortalRole | null
  student: StudentUser | null
  parent: ParentUser | null
  isLoading: boolean
  isAuthenticated: boolean
  setStudent: (student: StudentUser | null) => void
  setParent: (parent: ParentUser | null) => void
  setRole: (role: PortalRole | null) => void
  setLoading: (loading: boolean) => void
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      role: null,
      student: null,
      parent: null,
      isLoading: false,
      isAuthenticated: false,

      setStudent: (student) =>
        set({ student, isAuthenticated: !!student, role: 'student' }),

      setParent: (parent) =>
        set({ parent, isAuthenticated: !!parent, role: 'parent' }),

      setRole: (role) => set({ role }),

      setLoading: (isLoading) => set({ isLoading }),

      signOut: async () => {
        await supabase.auth.signOut()
        set({
          student: null,
          parent: null,
          role: null,
          isAuthenticated: false,
        })
      },
    }),
    {
      name: 'schoolpilot-student-auth',
      partialize: (state) => ({
        student: state.student,
        parent: state.parent,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)