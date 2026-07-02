import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { BookOpen, User } from 'lucide-react'
import { PageLayout } from '../../components/layout/PageLayout'
import { useAuthStore } from '../../store/authStore'
import { getChildById } from '../../services/parent.service'
import { supabase } from '../../lib/supabase'

interface SubjectAssignment {
  id: string
  subject: { id: string; name: string; code: string | null } | null
  staff: { first_name: string; last_name: string } | null
  term: { name: string; is_current: boolean } | null
}

interface ChildInfo {
  id: string
  first_name: string
  last_name: string
  class_id: string | null
  school_id: string
}

const SUBJECT_COLORS = [
  { bg: '#e8f5f0', color: '#0C3B2E' },
  { bg: '#fdf3e8', color: '#BB8A52' },
  { bg: '#f0f7f0', color: '#6D9773' },
  { bg: '#fffbeb', color: '#b08800' },
  { bg: '#fef2f2', color: '#dc2626' },
  { bg: '#eff6ff', color: '#2563eb' },
]

export const ParentSubjects = () => {
  const { childId } = useParams<{ childId: string }>()
  const navigate = useNavigate()
  const { parent } = useAuthStore()
  const [child, setChild] = useState<ChildInfo | null>(null)
  const [subjects, setSubjects] = useState<SubjectAssignment[]>([])
  const [isLoading, setIsLoading] = useState(true)
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

        if (!childData.class_id) {
          setSubjects([])
          return
        }

        const { data, error: subError } = await supabase
          .from('subject_assignments')
          .select(`
            id,
            subject:subjects(id, name, code),
            staff:staff(first_name, last_name),
            term:terms(name, is_current)
          `)
          .eq('school_id', childData.school_id)
          .eq('class_id', childData.class_id)

        if (subError) throw subError

        const mapped: SubjectAssignment[] = (data ?? []).map((item: any) => ({
          id: item.id,
          subject: Array.isArray(item.subject) ? item.subject[0] ?? null : item.subject,
          staff: Array.isArray(item.staff) ? item.staff[0] ?? null : item.staff,
          term: Array.isArray(item.term) ? item.term[0] ?? null : item.term,
        }))

        setSubjects(mapped)
      } catch (err: any) {
        setError(err.message || 'Failed to load subjects')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [parent?.id, childId])

  const currentTermSubjects = subjects.filter((s) => s.term?.is_current)

  return (
    <PageLayout title={child ? `${child.first_name}'s Subjects` : 'Subjects'} showBack hideNav>
      <div className="px-5 py-4">

        {error && (
          <div
            className="mb-4 px-4 py-3 rounded-xl text-sm flex items-center justify-between gap-3"
            style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}
          >
            <span>{error}</span>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-xs font-semibold underline shrink-0"
            >
              Back to dashboard
            </button>
          </div>
        )}

        {!error && (
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5"
            style={{ backgroundColor: '#0C3B2E' }}
          >
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#FFBA00' }} />
            <span className="text-xs font-semibold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {currentTermSubjects[0]?.term?.name ?? 'Current Term'}
            </span>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ backgroundColor: '#e5e7eb' }} />
            ))}
          </div>
        ) : error ? null : currentTermSubjects.length === 0 ? (
          <div className="text-center py-16">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: '#f0f7f0' }}
            >
              <BookOpen size={28} style={{ color: '#6D9773' }} />
            </div>
            <p className="font-semibold text-gray-900 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
              No subjects yet
            </p>
            <p className="text-sm text-gray-400" style={{ fontFamily: 'Lora, serif' }}>
              Subjects will appear here once assigned
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {currentTermSubjects.map((assignment, index) => {
              const colorScheme = SUBJECT_COLORS[index % SUBJECT_COLORS.length]
              return (
                <div
                  key={assignment.id}
                  className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm"
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: colorScheme.bg }}
                  >
                    {assignment.subject?.code ? (
                      <span
                        className="text-xs font-black"
                        style={{ color: colorScheme.color, fontFamily: 'Poppins, sans-serif' }}
                      >
                        {assignment.subject.code.slice(0, 3).toUpperCase()}
                      </span>
                    ) : (
                      <BookOpen size={20} style={{ color: colorScheme.color }} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className="font-semibold text-gray-900 truncate"
                      style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}
                    >
                      {assignment.subject?.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <User size={11} style={{ color: '#9ca3af' }} />
                      <p className="text-xs text-gray-400 truncate" style={{ fontFamily: 'Lora, serif' }}>
                        {assignment.staff?.first_name} {assignment.staff?.last_name}
                      </p>
                    </div>
                  </div>

                  <div className="w-1.5 h-10 rounded-full shrink-0" style={{ backgroundColor: colorScheme.color }} />
                </div>
              )
            })}
          </div>
        )}

        {!error && currentTermSubjects.length > 0 && (
          <p className="text-center text-xs text-gray-400 mt-5" style={{ fontFamily: 'Lora, serif' }}>
            {currentTermSubjects.length} subject{currentTermSubjects.length !== 1 ? 's' : ''} this term
          </p>
        )}
      </div>
    </PageLayout>
  )
}