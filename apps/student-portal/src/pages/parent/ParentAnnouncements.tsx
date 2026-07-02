import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Megaphone, Clock } from 'lucide-react'
import { PageLayout } from '../../components/layout/PageLayout'
import { useAuthStore } from '../../store/authStore'
import { getChildById } from '../../services/parent.service'
import { supabase } from '../../lib/supabase'
import { formatDate } from '@schoolpilot/shared-utils'

interface Announcement {
  id: string
  title: string
  body: string
  audience: string
  created_at: string
  staff: { first_name: string; last_name: string } | null
}

interface ChildInfo {
  id: string
  first_name: string
  last_name: string
  school_id: string
}

const AUDIENCE_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  all: { bg: '#e8f5f0', color: '#0C3B2E', label: 'Everyone' },
  students: { bg: '#dbeafe', color: '#2563eb', label: 'Students' },
  parents: { bg: '#f3e8ff', color: '#7c3aed', label: 'Parents' },
  staff: { bg: '#fef9c3', color: '#b08800', label: 'Staff' },
}

export const ParentAnnouncements = () => {
  const { childId } = useParams<{ childId: string }>()
  const navigate = useNavigate()
  const { parent } = useAuthStore()
  const [child, setChild] = useState<ChildInfo | null>(null)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      if (!parent?.id || !childId) {
        setError('Missing student reference')
        setIsLoading(false)
        return
      }
      setIsLoading(true)
      setError('')
      try {
        const childData = await getChildById(parent.id, childId)
        setChild(childData)

        const { data, error: annError } = await supabase
          .from('announcements')
          .select('*, staff:staff(first_name, last_name)')
          .eq('school_id', childData.school_id)
          // Parents should only see announcements meant for them or everyone,
          // not staff-only or student-only notices.
          .or('audience.eq.all,audience.ilike.%parents%')
          .order('created_at', { ascending: false })

        if (annError) throw annError

        const mapped = (data ?? []).map((item: any) => ({
          ...item,
          staff: Array.isArray(item.staff) ? item.staff[0] ?? null : item.staff,
        }))

        setAnnouncements(mapped)
      } catch (err: any) {
        setError(err.message || 'Failed to load announcements')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [parent?.id, childId])

  const getAudienceStyle = (audience: string) => {
    const parts = audience.split(',')
    if (parts.length > 1) return { bg: '#e8f5f0', color: '#0C3B2E', label: parts.join(' & ') }
    return AUDIENCE_COLORS[audience] ?? AUDIENCE_COLORS.all
  }

  return (
    <PageLayout title={child ? `${child.first_name}'s School` : 'Announcements'} showBack hideNav>
      <div className="px-5 py-4">

        {error && (
          <div
            className="mb-4 px-4 py-3 rounded-xl text-sm flex items-center justify-between gap-3"
            style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}
          >
            <span>{error}</span>
            <button onClick={() => navigate('/dashboard')} className="text-xs font-semibold underline shrink-0">
              Back to dashboard
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ backgroundColor: '#e5e7eb' }} />
            ))}
          </div>
        ) : error ? null : announcements.length === 0 ? (
          <div className="text-center py-16">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: '#fffbeb' }}
            >
              <Megaphone size={28} style={{ color: '#b08800' }} />
            </div>
            <p className="font-semibold text-gray-900 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
              No announcements yet
            </p>
            <p className="text-sm text-gray-400" style={{ fontFamily: 'Lora, serif' }}>
              School announcements will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map((announcement) => {
              const audienceStyle = getAudienceStyle(announcement.audience)
              const isExpanded = expanded === announcement.id

              return (
                <button
                  key={announcement.id}
                  onClick={() => setExpanded(isExpanded ? null : announcement.id)}
                  className="w-full bg-white rounded-2xl shadow-sm text-left overflow-hidden active:scale-98 transition-transform"
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: audienceStyle.bg }}
                      >
                        <Megaphone size={18} style={{ color: audienceStyle.color }} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {announcement.title}
                          </p>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
                            style={{ backgroundColor: audienceStyle.bg, color: audienceStyle.color, fontFamily: 'Poppins, sans-serif' }}
                          >
                            {audienceStyle.label}
                          </span>
                        </div>

                        <p
                          className={`text-sm text-gray-500 mt-1 ${!isExpanded ? 'line-clamp-2' : ''}`}
                          style={{ fontFamily: 'Lora, serif' }}
                        >
                          {announcement.body}
                        </p>

                        <div className="flex items-center gap-1.5 mt-2">
                          <Clock size={10} style={{ color: '#9ca3af' }} />
                          <p className="text-xs text-gray-400" style={{ fontFamily: 'Lora, serif' }}>
                            {formatDate(announcement.created_at)}
                            {announcement.staff && ` · ${announcement.staff.first_name} ${announcement.staff.last_name}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 py-2 border-t flex justify-center" style={{ borderColor: '#f3f4f6' }}>
                    <p className="text-xs font-medium" style={{ color: '#0C3B2E', fontFamily: 'Poppins, sans-serif' }}>
                      {isExpanded ? 'Show less ↑' : 'Read more ↓'}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </PageLayout>
  )
}