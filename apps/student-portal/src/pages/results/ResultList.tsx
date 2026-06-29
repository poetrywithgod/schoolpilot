import { useState, useEffect } from 'react'
import { BarChart2, ChevronRight, Trophy } from 'lucide-react'
import { PageLayout } from '../../components/layout/PageLayout'
import { useAuthStore } from '../../store/authStore'
import { supabase } from '../../lib/supabase'

interface Result {
  id: string
  ca1_score: number
  ca2_score: number
  exam_score: number
  total_score: number
  grade: string
  is_published: boolean
  subject_assignment: {
    subject: { name: string; code: string | null }
    term: { name: string; is_current: boolean }
  } | null
  term: { id: string; name: string; is_current: boolean } | null
}

interface GroupedResults {
  termName: string
  isCurrent: boolean
  results: Result[]
  average: number
}

const gradeColor = (grade: string) => {
  if (['A1', 'B2', 'B3'].includes(grade)) return { color: '#16a34a', bg: '#dcfce7' }
  if (['C4', 'C5', 'C6'].includes(grade)) return { color: '#2563eb', bg: '#dbeafe' }
  if (grade === 'D7') return { color: '#b08800', bg: '#fef9c3' }
  return { color: '#dc2626', bg: '#fee2e2' }
}

export const ResultList = () => {
  const { student } = useAuthStore()
  const [grouped, setGrouped] = useState<GroupedResults[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      if (!student?.id) return
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from('results')
          .select(`
            id,
            ca1_score,
            ca2_score,
            exam_score,
            total_score,
            grade,
            is_published,
            subject_assignment:subject_assignments(
              subject:subjects(name, code),
              term:terms(name, is_current)
            ),
            term:terms(id, name, is_current)
          `)
          .eq('student_id', student.id)
          .eq('is_published', true)
          .order('created_at', { ascending: false })

        if (error) throw error

        const mapped = (data ?? []).map((item: any) => ({
          ...item,
          subject_assignment: Array.isArray(item.subject_assignment)
            ? item.subject_assignment[0] ?? null
            : item.subject_assignment,
          term: Array.isArray(item.term) ? item.term[0] ?? null : item.term,
        }))

        // Group by term
        const groups: Record<string, GroupedResults> = {}
        mapped.forEach((result: any) => {
          const termName = result.term?.name ?? 'Unknown Term'
          if (!groups[termName]) {
            groups[termName] = {
              termName,
              isCurrent: result.term?.is_current ?? false,
              results: [],
              average: 0,
            }
          }
          groups[termName].results.push(result)
        })

        // Calculate averages
        Object.values(groups).forEach((group) => {
          const total = group.results.reduce((sum, r) => sum + (r.total_score ?? 0), 0)
          group.average = group.results.length > 0
            ? Math.round(total / group.results.length)
            : 0
        })

        const sortedGroups = Object.values(groups).sort((a, b) =>
          b.isCurrent ? 1 : -1
        )

        setGrouped(sortedGroups)

        // Auto expand current term
        const current = sortedGroups.find((g) => g.isCurrent)
        if (current) setExpandedTerm(current.termName)
      } catch (err: any) {
        setError('Failed to load results')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [student?.id])

  return (
    <PageLayout title="My Results">
      <div className="px-5 py-4">

        {error && (
          <div
            className="mb-4 px-4 py-3 rounded-xl text-sm"
            style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}
          >
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 rounded-2xl animate-pulse"
                style={{ backgroundColor: '#e5e7eb' }}
              />
            ))}
          </div>
        ) : grouped.length === 0 ? (
          <div className="text-center py-16">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: '#e8f5f0' }}
            >
              <BarChart2 size={28} style={{ color: '#0C3B2E' }} />
            </div>
            <p
              className="font-semibold text-gray-900 mb-1"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              No results yet
            </p>
            <p
              className="text-sm text-gray-400"
              style={{ fontFamily: 'Lora, serif' }}
            >
              Your results will appear here once published by your teachers
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {grouped.map((group) => (
              <div
                key={group.termName}
                className="bg-white rounded-2xl overflow-hidden shadow-sm"
              >
                {/* Term Header */}
                <button
                  onClick={() => setExpandedTerm(
                    expandedTerm === group.termName ? null : group.termName
                  )}
                  className="w-full flex items-center justify-between p-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: group.isCurrent ? '#0C3B2E' : '#f3f4f6' }}
                    >
                      <Trophy
                        size={18}
                        style={{ color: group.isCurrent ? '#FFBA00' : '#9ca3af' }}
                      />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <p
                          className="text-sm font-semibold text-gray-900"
                          style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                          {group.termName}
                        </p>
                        {group.isCurrent && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-semibold"
                            style={{ backgroundColor: '#FFBA00', color: '#0C3B2E', fontFamily: 'Poppins, sans-serif' }}
                          >
                            Current
                          </span>
                        )}
                      </div>
                      <p
                        className="text-xs text-gray-400 mt-0.5"
                        style={{ fontFamily: 'Lora, serif' }}
                      >
                        {group.results.length} subject{group.results.length !== 1 ? 's' : ''} · Avg: {group.average}%
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-gray-400 transition-transform"
                    style={{
                      transform: expandedTerm === group.termName ? 'rotate(90deg)' : 'rotate(0deg)'
                    }}
                  />
                </button>

                {/* Results List */}
                {expandedTerm === group.termName && (
                  <div className="border-t border-gray-100">
                    {/* Table Header */}
                    <div
                      className="grid grid-cols-12 gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider"
                      style={{ color: '#9ca3af', fontFamily: 'Poppins, sans-serif', backgroundColor: '#fafafa' }}
                    >
                      <div className="col-span-5">Subject</div>
                      <div className="col-span-2 text-center">CA1</div>
                      <div className="col-span-2 text-center">CA2</div>
                      <div className="col-span-1 text-center">Exam</div>
                      <div className="col-span-2 text-center">Grade</div>
                    </div>

                    {group.results.map((result) => {
                      const gc = gradeColor(result.grade)
                      const subjectName = result.subject_assignment?.subject?.name ?? '—'
                      return (
                        <div
                          key={result.id}
                          className="grid grid-cols-12 gap-2 px-4 py-3 border-t border-gray-50 items-center"
                        >
                          <div className="col-span-5">
                            <p
                              className="text-xs font-medium text-gray-900 truncate"
                              style={{ fontFamily: 'Poppins, sans-serif' }}
                            >
                              {subjectName}
                            </p>
                            <p
                              className="text-xs font-bold mt-0.5"
                              style={{ color: '#0C3B2E', fontFamily: 'Poppins, sans-serif' }}
                            >
                              {result.total_score ?? 0}/100
                            </p>
                          </div>
                          <div className="col-span-2 text-center">
                            <span
                              className="text-xs font-medium"
                              style={{ color: '#6b7280', fontFamily: 'Poppins, sans-serif' }}
                            >
                              {result.ca1_score ?? 0}
                            </span>
                          </div>
                          <div className="col-span-2 text-center">
                            <span
                              className="text-xs font-medium"
                              style={{ color: '#6b7280', fontFamily: 'Poppins, sans-serif' }}
                            >
                              {result.ca2_score ?? 0}
                            </span>
                          </div>
                          <div className="col-span-1 text-center">
                            <span
                              className="text-xs font-medium"
                              style={{ color: '#6b7280', fontFamily: 'Poppins, sans-serif' }}
                            >
                              {result.exam_score ?? 0}
                            </span>
                          </div>
                          <div className="col-span-2 flex justify-center">
                            <span
                              className="text-xs font-bold px-2 py-0.5 rounded-lg"
                              style={{
                                backgroundColor: gc.bg,
                                color: gc.color,
                                fontFamily: 'Poppins, sans-serif',
                              }}
                            >
                              {result.grade}
                            </span>
                          </div>
                        </div>
                      )
                    })}

                    {/* Term Summary */}
                    <div
                      className="px-4 py-3 border-t border-gray-100 flex items-center justify-between"
                      style={{ backgroundColor: '#f9fafb' }}
                    >
                      <p
                        className="text-xs text-gray-500"
                        style={{ fontFamily: 'Lora, serif' }}
                      >
                        Term Average
                      </p>
                      <p
                        className="text-sm font-bold"
                        style={{ color: '#0C3B2E', fontFamily: 'Poppins, sans-serif' }}
                      >
                        {group.average}/100
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  )
}