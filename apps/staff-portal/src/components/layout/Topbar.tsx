import { Menu, Moon, Sun } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useSchoolStore } from '../../store/schoolStore'
import { useThemeStore } from '../../store/themeStore'
import { useLayoutStore } from '../../store/layoutStore'

export const Topbar = ({ title }: { title: string }) => {
  const { user } = useAuthStore()
  const { school } = useSchoolStore()
  const { theme, toggleTheme } = useThemeStore()
  const { setMobileOpen } = useLayoutStore()

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-gray-200 bg-white/80 px-4 backdrop-blur-md transition-colors dark:border-sage/15 dark:bg-forest/40 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sage/10 text-sage lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
        <h1 className="truncate text-lg font-semibold text-forest dark:text-white">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        {school?.name && (
          <span className="hidden max-w-[220px] truncate text-sm text-gray-500 dark:text-sage md:block">
            {school.name}
          </span>
        )}

        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-sage/10 text-sage transition-colors hover:bg-sage/20"
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold text-xs font-bold text-forest"
          title={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()}
        >
          {user?.firstName?.[0]}
          {user?.lastName?.[0]}
        </div>
      </div>
    </header>
  )
}
