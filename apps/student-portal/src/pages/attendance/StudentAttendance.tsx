import { useState, useEffect } from 'react'
import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react'
import { PageLayout } from '../../components/layout/PageLayout'
import { useAuthStore } from '../../store/authStore'
import { getStudentAttendance, getCurrentTermForSchool } from '../../services/attendance.service'
import type { AttendanceSummary } from '../../services/attendance.service'

const statusStyle = (status: 'present' | 'absent' | 'late') => {
  if (status === 'present') return { color: '#16a34a', bg: '#dcfce7', icon: CheckCircle, label: 'Present' }
  if (status === 'late') return { color: '#b08800', bg: '#fef9c3', icon: Clock, label: 'Late' }
  return { color: '#dc2626', bg: '#fee2e2', icon: XCircle, label: 'Absent' }
}

export const StudentAttendance = () => {
  const { student } = useAuthStore()
  const [summary, setSummary] = useState<AttendanceSummary | null>(null)
  const [termName, setTermName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      if (!student?.id || !student?.schoolId) return
      setIsLoading(true)
      setError('')
      try {
        const term = await getCurrentTermForSchool(student.schoolId)
        setTermName(term.name)
        const data = await getStudentAttendance(student.id, term.id)
        setSummary(data)
      } catch (err: any) {
        setError(err.message || 'Failed to load attendance')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [student?.id, student?.schoolId])

  return (
    <PageLayout title="My Attendance">
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
              <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ backgroundColor: '#e5e7eb' }} />
            ))}
          </div>
        ) : error ? null : (
          <>
            {/* Term badge */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5"
              style={{ backgroundColor: '#0C3B2E' }}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#FFBA00' }} />
              <span className="text-xs font-semibold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {termName || 'Current Term'}
              </span>
            </div>

            {/* Attendance rate hero */}
            <div className="rounded-3xl p-5 mb-4" style={{ backgroundColor: '#0C3B2E' }}>
              <p className="text-xs mb-1" style={{ color: '#6D9773', fontFamily: 'Poppins, sans-serif' }}>
                Attendance Rate
              </p>
              <p className="text-3xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {summary?.attendanceRate ?? 0}%
              </p>
              <p className="text-xs mt-1" style={{ color: '#6D9773', fontFamily: 'Lora, serif' }}>
                Based on {summary?.totalDays ?? 0} recorded day{summary?.totalDays !== 1 ? 's' : ''} this term
              </p>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2"
                  style={{ backgroundColor: '#dcfce7' }}
                >
                  <CheckCircle size={16} style={{ color: '#16a34a' }} />
                </div>
                <p className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {summary?.presentCount ?? 0}
                </p>
                <p className="text-xs text-gray-400" style={{ fontFamily: 'Lora, serif' }}>Present</p>
              </div>
              <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2"
                  style={{ backgroundColor: '#fef9c3' }}
                >
                  <Clock size={16} style={{ color: '#b08800' }} />
                </div>
                <p className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {summary?.lateCount ?? 0}
                </p>
                <p className="text-xs text-gray-400" style={{ fontFamily: 'Lora, serif' }}>Late</p>
              </div>
              <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2"
                  style={{ backgroundColor: '#fee2e2' }}
                >
                  <XCircle size={16} style={{ color: '#dc2626' }} />
                </div>
                <p className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {summary?.absentCount ?? 0}
                </p>
                <p className="text-xs text-gray-400" style={{ fontFamily: 'Lora, serif' }}>Absent</p>
              </div>
            </div>

            {/* Day-by-day list */}
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: '#9ca3af', fontFamily: 'Poppins, sans-serif' }}
            >
              Daily Record
            </p>

            {!summary || summary.records.length === 0 ? (
              <div className="text-center py-16">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: '#e8f5f0' }}
                >
                  <Calendar size={28} style={{ color: '#0C3B2E' }} />
                </div>
                <p className="font-semibold text-gray-900 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  No attendance recorded yet
                </p>
                <p className="text-sm text-gray-400" style={{ fontFamily: 'Lora, serif' }}>
                  Records will appear here once your teacher marks attendance
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                {summary.records.map((record, index) => {
                  const style = statusStyle(record.status)
                  const Icon = style.icon
                  return (
                    <div
                      key={record.id}
                      className={`flex items-center justify-between px-4 py-3 ${index > 0 ? 'border-t border-gray-50' : ''}`}
                    >
                      <p className="text-sm font-medium text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {new Date(record.date).toLocaleDateString('en-NG', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                      <span
                        className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: style.bg, color: style.color, fontFamily: 'Poppins, sans-serif' }}
                      >
                        <Icon size={12} />
                        {style.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </PageLayout>
  )
}