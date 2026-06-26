import { useState, useEffect } from 'react'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { useAuthStore } from '../../store/authStore'
import {
  getAllSubjectAssignments,
  getResults,
  upsertResult,
  publishResults,
  initializeResultsForClass,
} from '../../services/result.service'
import { getCurrentTerm } from '../../services/attendance.service'
import { calculateGrade } from '@schoolpilot/shared-utils'

interface ScoreRow {
  resultId?: string
  studentId: string
  studentName: string
  regNumber: string
  photoUrl: string | null
  ca1: number
  ca2: number
  exam: number
  total: number
  grade: string
  isPublished: boolean
}

export const ScoreEntry = () => {
  const { user } = useAuthStore()
  const [assignments, setAssignments] = useState<any[]>([])
  const [selectedAssignment, setSelectedAssignment] = useState('')
  const [currentTerm, setCurrentTerm] = useState<any>(null)
  const [scores, setScores] = useState<ScoreRow[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPublishConfirm, setShowPublishConfirm] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!user?.schoolId) return
      try {
        const [assignmentData, termData] = await Promise.all([
          getAllSubjectAssignments(user.schoolId),
          getCurrentTerm(user.schoolId),
        ])
        setAssignments(assignmentData)
        setCurrentTerm(termData)
      } catch {
        setError('Failed to load data')
      }
    }
    load()
  }, [user?.schoolId])

  useEffect(() => {
    const loadScores = async () => {
      if (!selectedAssignment || !currentTerm || !user?.schoolId) return
      setIsLoading(true)
      setError('')
      try {
        const assignment = assignments.find((a) => a.id === selectedAssignment)
        if (!assignment) return

        // Initialize results for all students in the class
        await initializeResultsForClass(
          user.schoolId,
          selectedAssignment,
          currentTerm.id,
          assignment.class.id
        )

        // Load results
        const results = await getResults(selectedAssignment, currentTerm.id)

        const rows: ScoreRow[] = results.map((r: any) => ({
          resultId: r.id,
          studentId: r.student.id,
          studentName: `${r.student.last_name} ${r.student.first_name}`,
          regNumber: r.student.reg_number,
          photoUrl: r.student.photo_url,
          ca1: r.ca1_score ?? 0,
          ca2: r.ca2_score ?? 0,
          exam: r.exam_score ?? 0,
          total: (r.ca1_score ?? 0) + (r.ca2_score ?? 0) + (r.exam_score ?? 0),
          grade: calculateGrade((r.ca1_score ?? 0) + (r.ca2_score ?? 0) + (r.exam_score ?? 0)),
          isPublished: r.is_published,
        }))

        setScores(rows)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    loadScores()
  }, [selectedAssignment, currentTerm])

  const updateScore = (
    studentId: string,
    field: 'ca1' | 'ca2' | 'exam',
    value: number
  ) => {
    setScores((prev) =>
      prev.map((s) => {
        if (s.studentId !== studentId) return s
        const updated = { ...s, [field]: value }
        updated.total = updated.ca1 + updated.ca2 + updated.exam
        updated.grade = calculateGrade(updated.total)
        return updated
      })
    )
  }

  const handleSave = async () => {
    if (!user?.schoolId || !currentTerm || !selectedAssignment) return
    setIsSaving(true)
    setError('')
    try {
      for (const score of scores) {
        await upsertResult({
          school_id: user.schoolId,
          student_id: score.studentId,
          subject_assignment_id: selectedAssignment,
          term_id: currentTerm.id,
          ca1_score: score.ca1,
          ca2_score: score.ca2,
          exam_score: score.exam,
          grade: score.grade,
        })
      }
      setSuccess('Scores saved successfully')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!user?.id || !currentTerm || !selectedAssignment) return
    setIsPublishing(true)
    setError('')
    try {
      // Save first
      await handleSave()

      // Then publish
      await publishResults(selectedAssignment, currentTerm.id, user.id)

      setScores((prev) => prev.map((s) => ({ ...s, isPublished: true })))
      setSuccess('Results published successfully! Students and parents have been notified.')
      setShowPublishConfirm(false)
      setTimeout(() => setSuccess(''), 5000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsPublishing(false)
    }
  }

  const selectedAssignmentData = assignments.find((a) => a.id === selectedAssignment)
  const isPublished = scores.length > 0 && scores.every((s) => s.isPublished)

  const gradeColor = (grade: string) => {
    if (['A1', 'B2', 'B3'].includes(grade)) return 'text-green-600 dark:text-green-400'
    if (['C4', 'C5', 'C6'].includes(grade)) return 'text-blue-600 dark:text-blue-400'
    if (grade === 'D7') return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  return (
    <PageWrapper title="Results">
      <div className="max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Score Entry
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {currentTerm ? `${currentTerm.name} · Current Term` : 'No active term'}
            </p>
          </div>

          {scores.length > 0 && !isPublished && (
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {isSaving ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                onClick={() => setShowPublishConfirm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Publish Results
              </button>
            </div>
          )}

          {isPublished && (
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm font-semibold rounded-xl">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Published
            </span>
          )}
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-600">
            {success}
          </div>
        )}

        {/* Publish Confirm Modal */}
        {showPublishConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowPublishConfirm(false)} />
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Publish Results?
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Once published, results will be visible to students and parents. This action locks the scores — you'll need admin approval to make changes.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPublishConfirm(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="flex-1 px-4 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:bg-green-300 transition-colors"
                >
                  {isPublishing ? 'Publishing...' : 'Yes, Publish'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Subject Assignment Selector */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 mb-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Select Subject & Class
            </label>
            <select
              value={selectedAssignment}
              onChange={(e) => setSelectedAssignment(e.target.value)}
              className="rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 transition-all"
            >
              <option value="">Select subject and class...</option>
              {assignments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.subject?.name} — {a.class?.level} {a.class?.arm}
                  {a.term?.is_current ? ' (Current Term)' : ''}
                </option>
              ))}
            </select>
          </div>

          {selectedAssignmentData && (
            <div className="flex gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Teacher: {selectedAssignmentData.staff?.first_name} {selectedAssignmentData.staff?.last_name}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {scores.length} student{scores.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Score Table */}
        {selectedAssignment && (
          isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          ) : scores.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center">
              <span className="text-5xl">📝</span>
              <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm">
                No students found in this class.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              {/* Score limits info */}
              <div className="px-5 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-900/30">
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  CA1 (max 20) · CA2 (max 20) · Exam (max 60) · Total (100)
                </p>
              </div>

              {/* Header */}
              <div className="grid grid-cols-12 gap-2 px-5 py-3 bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                <div className="col-span-4">Student</div>
                <div className="col-span-2 text-center">CA1 /20</div>
                <div className="col-span-2 text-center">CA2 /20</div>
                <div className="col-span-2 text-center">Exam /60</div>
                <div className="col-span-1 text-center">Total</div>
                <div className="col-span-1 text-center">Grade</div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {scores.map((score) => (
                  <div
                    key={score.studentId}
                    className="grid grid-cols-12 gap-2 px-5 py-3 items-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    {/* Student */}
                    <div className="col-span-4 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                        {score.photoUrl ? (
                          <img src={score.photoUrl} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="text-blue-600 text-xs font-semibold">
                            {score.studentName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-900 dark:text-white">
                          {score.studentName}
                        </p>
                        <p className="text-xs text-gray-400">{score.regNumber}</p>
                      </div>
                    </div>

                    {/* CA1 */}
                    <div className="col-span-2 flex justify-center">
                      <input
                        type="number"
                        min={0}
                        max={20}
                        value={score.ca1}
                        onChange={(e) => updateScore(score.studentId, 'ca1', Number(e.target.value))}
                        disabled={isPublished}
                        className="w-16 text-center rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white py-1.5 text-sm outline-none focus:border-blue-500 disabled:opacity-50 transition-all"
                      />
                    </div>

                    {/* CA2 */}
                    <div className="col-span-2 flex justify-center">
                      <input
                        type="number"
                        min={0}
                        max={20}
                        value={score.ca2}
                        onChange={(e) => updateScore(score.studentId, 'ca2', Number(e.target.value))}
                        disabled={isPublished}
                        className="w-16 text-center rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white py-1.5 text-sm outline-none focus:border-blue-500 disabled:opacity-50 transition-all"
                      />
                    </div>

                    {/* Exam */}
                    <div className="col-span-2 flex justify-center">
                      <input
                        type="number"
                        min={0}
                        max={60}
                        value={score.exam}
                        onChange={(e) => updateScore(score.studentId, 'exam', Number(e.target.value))}
                        disabled={isPublished}
                        className="w-16 text-center rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white py-1.5 text-sm outline-none focus:border-blue-500 disabled:opacity-50 transition-all"
                      />
                    </div>

                    {/* Total */}
                    <div className="col-span-1 text-center">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {score.total}
                      </span>
                    </div>

                    {/* Grade */}
                    <div className="col-span-1 text-center">
                      <span className={`text-sm font-bold ${gradeColor(score.grade)}`}>
                        {score.grade}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Summary */}
              <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                <div className="flex gap-6 text-xs text-gray-500 dark:text-gray-400">
                  <span>
                    Average: <strong className="text-gray-900 dark:text-white">
                      {scores.length > 0
                        ? (scores.reduce((s, r) => s + r.total, 0) / scores.length).toFixed(1)
                        : 0}
                    </strong>
                  </span>
                  <span>
                    Highest: <strong className="text-green-600">
                      {Math.max(...scores.map((s) => s.total))}
                    </strong>
                  </span>
                  <span>
                    Lowest: <strong className="text-red-500">
                      {Math.min(...scores.map((s) => s.total))}
                    </strong>
                  </span>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </PageWrapper>
  )
}