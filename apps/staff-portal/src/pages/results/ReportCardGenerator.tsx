import { useState, useEffect } from 'react'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { useAuthStore } from '../../store/authStore'
import { getClasses } from '../../services/class.service'
import { getCurrentTerm } from '../../services/attendance.service'
import {
  calculateTermSummaries,
  getTermSummariesForClass,
  updateRemarks,
} from '../../services/termSummary.service'
import type { TermSummary } from '../../services/termSummary.service'

// Base URL of the standalone PDF microservice (pdf-service/). Configure via
// VITE_PDF_SERVICE_URL in .env — defaults to local dev port.
const PDF_SERVICE_URL = import.meta.env.VITE_PDF_SERVICE_URL || 'http://localhost:4001'

interface SummaryRow extends TermSummary {
  students: { first_name: string; last_name: string; reg_number: string }
}

export const ReportCardGenerator = () => {
  const { user } = useAuthStore()
  const [classes, setClasses] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState('')
  const [currentTerm, setCurrentTerm] = useState<any>(null)
  const [summaries, setSummaries] = useState<SummaryRow[]>([])
  const [isCalculating, setIsCalculating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editingRemarks, setEditingRemarks] = useState<Record<string, { classTeacher: string; headTeacher: string }>>({})
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!user?.schoolId) return
      try {
        const [classData, termData] = await Promise.all([
          getClasses(user.schoolId),
          getCurrentTerm(user.schoolId),
        ])
        setClasses(classData)
        setCurrentTerm(termData)
      } catch {
        setError('Failed to load classes/term')
      }
    }
    load()
  }, [user?.schoolId])

  const loadSummaries = async () => {
    if (!selectedClass || !currentTerm) return
    setIsLoading(true)
    setError('')
    try {
      const data = await getTermSummariesForClass(selectedClass, currentTerm.id)
      setSummaries(data as SummaryRow[])
      const drafts: Record<string, { classTeacher: string; headTeacher: string }> = {}
      data.forEach((s: any) => {
        drafts[s.id] = {
          classTeacher: s.class_teacher_remark ?? '',
          headTeacher: s.head_teacher_remark ?? '',
        }
      })
      setEditingRemarks(drafts)
    } catch {
      setError('Failed to load report card data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (selectedClass && currentTerm) loadSummaries()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass, currentTerm])

  const handleCalculatePositions = async () => {
    if (!user?.schoolId || !selectedClass || !currentTerm || !user?.id) return
    setIsCalculating(true)
    setError('')
    setSuccess('')
    try {
      const result = await calculateTermSummaries(user.schoolId, selectedClass, currentTerm.id, user.id)
      setSuccess(`Positions calculated for ${result.ranked} of ${result.studentsProcessed} students`)
      await loadSummaries()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err: any) {
      setError(err.message || 'Failed to calculate positions')
    } finally {
      setIsCalculating(false)
    }
  }

  const handleSaveRemark = async (summaryId: string) => {
    const draft = editingRemarks[summaryId]
    if (!draft) return
    try {
      await updateRemarks(summaryId, draft.classTeacher, draft.headTeacher)
      setSuccess('Remark saved')
      setTimeout(() => setSuccess(''), 2000)
      await loadSummaries()
    } catch (err: any) {
      setError(err.message || 'Failed to save remark')
    }
  }

  const handleDownload = async (studentId: string, regNumber: string) => {
    if (!currentTerm) return
    setDownloadingId(studentId)
    setError('')
    try {
      const res = await fetch(`${PDF_SERVICE_URL}/report-card/${studentId}/${currentTerm.id}`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Failed to generate report card')
      }
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${regNumber}-report-card.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      setError(err.message || 'Failed to download report card. Is the PDF service running?')
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <PageWrapper title="Report Cards">
      <div className="max-w-4xl">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Generate Report Cards
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {currentTerm ? `${currentTerm.name} · Current Term` : 'No active term'}
          </p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-600">
            ✅ {success}
          </div>
        )}

        {/* Controls */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Class
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 transition-all"
              >
                <option value="">Select class</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.level} {cls.arm}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleCalculatePositions}
              disabled={!selectedClass || isCalculating}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
            >
              {isCalculating ? 'Calculating...' : 'Calculate Class Positions'}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Run this whenever results change, before printing report cards — it ranks students
            by their term average across all published subject results.
          </p>
        </div>

        {/* Student list */}
        {selectedClass && (
          <>
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              </div>
            ) : summaries.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center">
                <span className="text-5xl">📋</span>
                <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm">
                  No data yet — click "Calculate Class Positions" to generate summaries.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {summaries.map((s) => (
                  <div
                    key={s.id}
                    className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {s.students.last_name} {s.students.first_name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {s.students.reg_number} · Avg: {s.average_score}% ·{' '}
                          {s.class_position
                            ? `Position: ${s.class_position} of ${s.total_students_in_class}`
                            : 'Not ranked'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDownload(s.student_id, s.students.reg_number)}
                        disabled={downloadingId === s.student_id || !s.class_position}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-semibold rounded-lg hover:opacity-90 disabled:opacity-40 transition-opacity"
                        title={!s.class_position ? 'Calculate positions first' : ''}
                      >
                        {downloadingId === s.student_id ? 'Generating...' : 'Download PDF'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500">Class Teacher's Remark</label>
                        <textarea
                          rows={2}
                          value={editingRemarks[s.id]?.classTeacher ?? ''}
                          onChange={(e) =>
                            setEditingRemarks((prev) => ({
                              ...prev,
                              [s.id]: { ...prev[s.id], classTeacher: e.target.value, headTeacher: prev[s.id]?.headTeacher ?? '' },
                            }))
                          }
                          className="rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-3 py-2 text-xs outline-none resize-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500">Head Teacher's Remark</label>
                        <textarea
                          rows={2}
                          value={editingRemarks[s.id]?.headTeacher ?? ''}
                          onChange={(e) =>
                            setEditingRemarks((prev) => ({
                              ...prev,
                              [s.id]: { ...prev[s.id], headTeacher: e.target.value, classTeacher: prev[s.id]?.classTeacher ?? '' },
                            }))
                          }
                          className="rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-3 py-2 text-xs outline-none resize-none"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={() => handleSaveRemark(s.id)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                      >
                        Save remarks
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </PageWrapper>
  )
}