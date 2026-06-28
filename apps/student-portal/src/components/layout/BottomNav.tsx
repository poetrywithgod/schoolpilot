import { NavLink } from 'react-router-dom'
import { Home, BookOpen, BarChart2, Wallet, User } from 'lucide-react'

const navItems = [
  { path: '/dashboard', label: 'Home', icon: Home },
  { path: '/subjects', label: 'Subjects', icon: BookOpen },
  { path: '/results', label: 'Results', icon: BarChart2 },
  { path: '/fees', label: 'Fees', icon: Wallet },
  { path: '/profile', label: 'Profile', icon: User },
]

export const BottomNav = () => {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2"
      style={{
        backgroundColor: '#0C3B2E',
        paddingTop: '8px',
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
      }}
    >
      {navItems.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all"
            style={({ isActive }) => ({
              color: isActive ? '#FFBA00' : '#6D9773',
            })}
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 1.5}
                />
                <span
                  className="text-xs font-semibold"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        )
      })}
    </nav>
  )
}