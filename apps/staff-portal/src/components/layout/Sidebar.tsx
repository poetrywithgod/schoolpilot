import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  GraduationCap,
  Contact,
  Users,
  School,
  BookOpen,
  ClipboardCheck,
  BarChart3,
  FileText,
  Wallet,
  Megaphone,
  LifeBuoy,
  Settings,
  CalendarDays,
  ChevronsLeft,
  LogOut,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useSchoolStore } from '../../store/schoolStore'
import { useLayoutStore } from '../../store/layoutStore'
import { supabase } from '../../lib/supabase'

interface NavItem {
  label: string
  path: string
  icon: LucideIcon
  roles: string[]
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'bursar', 'teacher'] },
  { label: 'Students', path: '/students', icon: GraduationCap, roles: ['admin', 'teacher'] },
  { label: 'ID Cards', path: '/id-cards', icon: Contact, roles: ['admin'] },
  { label: 'Staff', path: '/staff', icon: Users, roles: ['admin'] },
  { label: 'Classes', path: '/classes', icon: School, roles: ['admin'] },
  { label: 'Subjects', path: '/subjects', icon: BookOpen, roles: ['admin'] },
  { label: 'Attendance', path: '/attendance', icon: ClipboardCheck, roles: ['admin', 'teacher'] },
  { label: 'Results', path: '/results', icon: BarChart3, roles: ['admin', 'teacher'] },
  { label: 'Report Cards', path: '/report-cards', icon: FileText, roles: ['admin'] },
  { label: 'Payments', path: '/payments', icon: Wallet, roles: ['admin', 'bursar'] },
  { label: 'Announcements', path: '/announcements', icon: Megaphone, roles: ['admin', 'bursar', 'teacher'] },
  { label: 'Support', path: '/support', icon: LifeBuoy, roles: ['admin', 'bursar', 'teacher'] },
  { label: 'School Profile', path: '/settings', icon: Settings, roles: ['admin'] },
  { label: 'Sessions & Terms', path: '/settings/sessions', icon: CalendarDays, roles: ['admin'] },
]

const ROLE_LABEL: Record<string, string> = {
  admin: 'School Admin',
  bursar: 'Bursar',
  teacher: 'Teacher',
}

export const Sidebar = () => {
  const { user, setUser } = useAuthStore()
  const { clearSchool } = useSchoolStore()
  const { collapsed, mobileOpen, toggleCollapsed, setMobileOpen } = useLayoutStore()
  const navigate = useNavigate()

  const filteredNav = navItems.filter((item) => item.roles.includes(user?.role ?? ''))

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    clearSchool()
    navigate('/login')
  }

  // On mobile the drawer is always full width; collapse only applies from lg up.
  const narrow = collapsed

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-60 flex-col bg-forest border-r border-sage/15 transition-all duration-300 lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:shrink-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 ${narrow ? 'lg:w-[72px]' : 'lg:w-60'}`}
      >
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-sage/15 px-4">
          <img
            src="/FirstPilotLogo.svg"
            alt="SchoolPilot"
            className={`object-contain ${narrow ? 'lg:h-9 lg:w-9' : ''} h-9 w-auto max-w-[180px]`}
          />
          <button
            onClick={() => setMobileOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
          {filteredNav.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/settings'}
              title={narrow ? label : undefined}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl py-2.5 text-sm font-medium transition-colors ${
                  narrow ? 'lg:justify-center lg:px-2 lg:py-3' : ''
                } px-3 ${
                  isActive
                    ? 'bg-gold/12 text-gold'
                    : 'text-gray-400 hover:bg-sage/10 hover:text-white'
                }`
              }
            >
              <Icon size={19} className="shrink-0" />
              <span className={`truncate ${narrow ? 'lg:hidden' : ''}`}>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User + collapse */}
        <div className="space-y-2 border-t border-sage/15 p-3">
          <div
            className={`flex items-center gap-2 rounded-xl bg-sage/10 px-2 py-2 ${
              narrow ? 'lg:justify-center' : ''
            }`}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold text-xs font-bold text-forest">
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </div>
            <div className={`min-w-0 flex-1 ${narrow ? 'lg:hidden' : ''}`}>
              <p className="truncate text-xs font-semibold text-white">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="truncate text-xs text-sage">{ROLE_LABEL[user?.role ?? ''] ?? user?.role}</p>
            </div>
            <button
              onClick={handleSignOut}
              title="Sign out"
              className={`shrink-0 text-gray-400 transition-colors hover:text-red-400 ${
                narrow ? 'lg:hidden' : ''
              }`}
            >
              <LogOut size={16} />
            </button>
          </div>

          <button
            onClick={toggleCollapsed}
            title={narrow ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden w-full items-center justify-center rounded-xl bg-sage/10 py-2 text-gray-400 transition-colors hover:text-white lg:flex"
          >
            <ChevronsLeft
              size={16}
              className={`transition-transform duration-300 ${narrow ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </aside>
    </>
  )
}
