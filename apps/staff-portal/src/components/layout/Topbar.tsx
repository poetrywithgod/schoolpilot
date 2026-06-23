import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useSchoolStore } from '../../store/schoolStore'
import { useThemeStore } from '../../store/themeStore'
import { supabase } from '../../lib/supabase'

export const Topbar = ({ title }: { title: string }) => {
  const { user, setUser } = useAuthStore()
  const { school, clearSchool } = useSchoolStore()
  const { theme, toggleTheme } = useThemeStore()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    clearSchool()
    navigate('/login')
  }

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-6 transition-colors">
      <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h1>

      <div className="flex items-center gap-4">
        {/* School name */}
        <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
          {school?.name}
        </span>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )}
        </button>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
        >
          Sign out
        </button>
      </div>
    </header>
  )
}