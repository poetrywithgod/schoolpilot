import { ChevronLeft, Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

interface HeaderProps {
  title: string
  showBack?: boolean
  showNotification?: boolean
}

export const Header = ({ title, showBack, showNotification = true }: HeaderProps) => {
  const { student } = useAuthStore()
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const loadUnread = async () => {
      if (!student?.schoolId) return
      const { count } = await supabase
        .from('announcements')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', student.schoolId)
      setUnreadCount(count ?? 0)
    }
    loadUnread()
  }, [student?.schoolId])

  return (
    <header
      className="sticky top-0 z-40 px-5 py-4 flex items-center gap-3"
      style={{ backgroundColor: '#0C3B2E' }}
    >
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-xl shrink-0"
          style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
        >
          <ChevronLeft size={18} className="text-white" />
        </button>
      )}

      {!showBack && student?.schoolLogoUrl && (
        <img
          src={student.schoolLogoUrl}
          alt="School"
          className="w-7 h-7 rounded-lg object-contain bg-white p-0.5 shrink-0"
        />
      )}

      {!showBack && !student?.schoolLogoUrl && (
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
          style={{ backgroundColor: '#FFBA00', color: '#0C3B2E' }}
        >
          S
        </div>
      )}

      <h1
        className="text-white font-bold text-base flex-1 truncate"
        style={{ fontFamily: 'Poppins, sans-serif' }}
      >
        {title}
      </h1>

      <div className="flex items-center gap-2">
        {showNotification && (
          <button
            className="w-8 h-8 flex items-center justify-center rounded-xl relative"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
            onClick={() => {
              setUnreadCount(0)
              navigate('/announcements')
            }}
          >
            <Bell size={16} className="text-white" />
            {unreadCount > 0 && (
              <span
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center font-bold"
                style={{
                  backgroundColor: '#FFBA00',
                  color: '#0C3B2E',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '9px',
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        )}

        {student?.photoUrl ? (
          <img
            src={student.photoUrl}
            alt={student.firstName}
            className="w-8 h-8 rounded-full object-cover border-2 shrink-0"
            style={{ borderColor: '#FFBA00' }}
          />
        ) : student ? (
          <button
            onClick={() => navigate('/profile')}
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{ backgroundColor: '#FFBA00', color: '#0C3B2E', fontFamily: 'Poppins, sans-serif' }}
          >
            {student.firstName[0]}{student.lastName[0]}
          </button>
        ) : null}
      </div>
    </header>
  )
}