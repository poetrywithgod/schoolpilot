import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, BarChart2, Wallet, Link2, LogOut, Megaphone, Calendar } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { getLinkedChildren } from '../../services/parent.service'

interface Child {
  id: string
  first_name: string
  last_name: string
  reg_number: string
  photo_url: string | null
  classes: { level: string; arm: string } | null
  school: { id: string; name: string; logo_url: string | null } | null
}

export const ParentDashboard = () => {
  const { parent, signOut } = useAuthStore()
  const navigate = useNavigate()
  const [children, setChildren] = useState<Child[]>([])
  const [activeChild, setActiveChild] = useState<Child | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (!parent?.id) return
      setIsLoading(true)
      try {
        const data = await getLinkedChildren(parent.id)
        const mapped = data.map((item: any) => ({
          ...item,
          classes: Array.isArray(item.classes) ? item.classes[0] ?? null : item.classes,
          school: Array.isArray(item.school) ? item.school[0] ?? null : item.school,
        }))
        setChildren(mapped)
        if (mapped.length > 0) setActiveChild(mapped[0])
      } catch {
        console.error('Failed to load children')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [parent?.id])

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const goToChildPage = (path: 'subjects' | 'results' | 'fees' | 'announcements' | 'attendance') => {
    if (!activeChild) return
    navigate(`/parent/${path}/${activeChild.id}`)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F5F5F0' }}>

      {/* Header */}
      <header
        className="px-5 py-4 flex items-center justify-between"
        style={{ backgroundColor: '#0C3B2E' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm"
            style={{ backgroundColor: '#FFBA00', color: '#0C3B2E', fontFamily: 'Poppins, sans-serif' }}
          >
            S
          </div>
          <div>
            <p
              className="text-white font-bold text-sm"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              SchoolPilot
            </p>
            <p
              className="text-xs"
              style={{ color: '#6D9773', fontFamily: 'Lora, serif' }}
            >
              Parent Portal
            </p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-8 h-8 flex items-center justify-center rounded-xl"
          style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
        >
          <LogOut size={16} className="text-white" />
        </button>
      </header>

      <div className="flex-1 px-5 py-4">

        {/* Welcome */}
        <p
          className="text-sm text-gray-500 mb-4"
          style={{ fontFamily: 'Lora, serif' }}
        >
          Welcome, <span style={{ color: '#0C3B2E', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
            {parent?.firstName} {parent?.lastName}
          </span>
        </p>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ backgroundColor: '#e5e7eb' }} />
            ))}
          </div>
        ) : children.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center shadow-sm">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: '#e8f5f0' }}
            >
              <Link2 size={28} style={{ color: '#0C3B2E' }} />
            </div>
            <p
              className="font-bold text-gray-900 mb-2"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              No children linked yet
            </p>
            <p
              className="text-sm text-gray-400 mb-5"
              style={{ fontFamily: 'Lora, serif' }}
            >
              Link your child using their reg number and parent linking code
            </p>
            <button
              onClick={() => navigate('/link-child')}
              className="px-6 py-3 rounded-2xl text-sm font-bold"
              style={{ backgroundColor: '#FFBA00', color: '#0C3B2E', fontFamily: 'Poppins, sans-serif' }}
            >
              Link a Child →
            </button>
          </div>
        ) : (
          <>
            {/* Child Switcher */}
            {children.length > 1 && (
              <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                {children.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => setActiveChild(child)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl shrink-0 transition-all"
                    style={{
                      backgroundColor: activeChild?.id === child.id ? '#0C3B2E' : 'white',
                      color: activeChild?.id === child.id ? 'white' : '#374151',
                    }}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        backgroundColor: activeChild?.id === child.id ? '#FFBA00' : '#e8f5f0',
                        color: '#0C3B2E',
                        fontFamily: 'Poppins, sans-serif',
                      }}
                    >
                      {child.first_name[0]}
                    </div>
                    <span className="text-xs font-semibold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {child.first_name}
                    </span>
                  </button>
                ))}
                <button
                  onClick={() => navigate('/link-child')}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl shrink-0 border-2 border-dashed"
                  style={{ borderColor: '#d1d5db', color: '#9ca3af' }}
                >
                  <Link2 size={12} />
                  <span className="text-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>Add</span>
                </button>
              </div>
            )}

            {/* Active Child Card */}
            {activeChild && (
              <div
                className="rounded-3xl p-5 mb-5"
                style={{ backgroundColor: '#0C3B2E' }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-full overflow-hidden border-2 flex items-center justify-center"
                    style={{ borderColor: '#FFBA00' }}
                  >
                    {activeChild.photo_url ? (
                      <img src={activeChild.photo_url} className="w-full h-full object-cover" />
                    ) : (
                      <span
                        className="font-bold text-sm"
                        style={{ color: '#0C3B2E', backgroundColor: '#FFBA00', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Poppins, sans-serif' }}
                      >
                        {activeChild.first_name[0]}{activeChild.last_name[0]}
                      </span>
                    )}
                  </div>
                  <div>
                    <p
                      className="font-bold text-white"
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      {activeChild.first_name} {activeChild.last_name}
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: '#6D9773', fontFamily: 'Poppins, sans-serif' }}
                    >
                      {activeChild.classes
                        ? `${activeChild.classes.level} ${activeChild.classes.arm}`
                        : 'No class'}
                      {activeChild.school ? ` · ${activeChild.school.name}` : ''}
                    </p>
                  </div>
                </div>

                <div
                  className="inline-block px-3 py-1 rounded-full text-xs font-bold"
                  style={{ backgroundColor: '#FFBA00', color: '#0C3B2E', fontFamily: 'Poppins, sans-serif' }}
                >
                  {activeChild.reg_number}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: '#9ca3af', fontFamily: 'Poppins, sans-serif' }}
            >
              Quick Actions
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: 'View Results', icon: BarChart2, color: '#0C3B2E', bg: '#e8f5f0', action: () => goToChildPage('results') },
                { label: 'Fee Balance', icon: Wallet, color: '#BB8A52', bg: '#fdf3e8', action: () => goToChildPage('fees') },
                { label: 'Subjects', icon: BookOpen, color: '#6D9773', bg: '#f0f7f0', action: () => goToChildPage('subjects') },
                { label: 'Attendance', icon: Calendar, color: '#2563eb', bg: '#eff6ff', action: () => goToChildPage('attendance') },
                { label: 'Announcements', icon: Megaphone, color: '#b08800', bg: '#fffbeb', action: () => goToChildPage('announcements') },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.label}
                    onClick={item.action}
                    disabled={!activeChild}
                    className="bg-white rounded-2xl p-4 flex flex-col gap-3 shadow-sm active:scale-95 transition-transform text-left disabled:opacity-50"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: item.bg }}
                    >
                      <Icon size={20} style={{ color: item.color }} />
                    </div>
                    <p
                      className="text-sm font-semibold text-gray-900"
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      {item.label}
                    </p>
                  </button>
                )
              })}
            </div>

            {/* Add another child */}
            <button
              onClick={() => navigate('/link-child')}
              className="w-full py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 border-2 border-dashed"
              style={{
                borderColor: '#d1d5db',
                color: '#6b7280',
                fontFamily: 'Poppins, sans-serif',
              }}
            >
              <Link2 size={16} />
              Link Another Child
            </button>
          </>
        )}
      </div>
    </div>
  )
}