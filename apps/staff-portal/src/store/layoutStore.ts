import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface LayoutStore {
  collapsed: boolean
  mobileOpen: boolean
  toggleCollapsed: () => void
  setMobileOpen: (open: boolean) => void
}

export const useLayoutStore = create<LayoutStore>()(
  persist(
    (set) => ({
      collapsed: false,
      mobileOpen: false,
      toggleCollapsed: () => set((s) => ({ collapsed: !s.collapsed })),
      setMobileOpen: (mobileOpen) => set({ mobileOpen }),
    }),
    {
      name: 'schoolpilot-staff-layout',
      partialize: (s) => ({ collapsed: s.collapsed }),
    },
  ),
)
