import { useState, useEffect } from 'react'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { useAuthStore } from '../../store/authStore'
import { getClasses } from '../../services/class.service'
import { getStudentsByClass } from '../../services/student.service'
import {
  markAttendance,
  getAttendanceByClass,
  getCurrentTerm,
} from '../../services/attendance.service'

interface Student {
  id: string
  first_name: string
  last_name: string
  photo_url: string | null
}

interface AttendanceRecord {
  student_id: string
  status: 'present' | 'absent' | 'late'
}

export const MarkAttendance = () => {
  const { user } = useAuthStore()
  const [classes, setClasses] = useState<any[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent' | 'late'>>({})
  const [currentTerm, setCurrentTerm] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

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
        setError('Failed to load data')
      }
    }
    load()
  }, [user?.schoolId])

  useEffect(() => {
    const loadStudents = async () => {
      if (!selectedClass) return
      setIsLoading(true)
      try {
        const studentData = await getStudentsByClass(selectedClass)
        setStudents(studentData)

        // Load existing attendance for this date
        const existingAttendance = await getAttendanceByClass(selectedClass, selectedDate)
        const attendanceMap: Record<string, 'present' | 'absent' | 'late'> = {}

        // Default all to present
        studentData.forEach((s: Student) => {
          attendanceMap[s.id] = 'present'
        })

        // Override with existing records
        existingAttendance?.forEach((record: any) => {
          attendanceMap[record.student_id] = record.status
        })

        setAttendance(attendanceMap)
      } catch {
        setError('Failed to load students')
      } finally {
        setIsLoading(false)
      }
    }
    loadStudents()
  }, [selectedClass, selectedDate])

  const toggleStatus = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }))
  }

  const markAll = (status: 'present' | 'absent') => {
    const all: Record<string, 'present' | 'absent' | 'late'> = {}
    students.forEach((s) => { all[s.id] = status })
    setAttendance(all)
  }

  const handleSave = async () => {
    if (!user?.schoolId || !currentTerm || !selectedClass) return
    setIsSaving(true)
    setError('')
    try {
      const records = students.map((s) => ({
        school_id: user.schoolId,
        student_id: s.id,
        class_id: selectedClass,
        term_id: currentTerm.id,
        date: selectedDate,
        status: attendance[s.id] ?? 'present',
        marked_by: user.id,
      }))

      await markAttendance(records)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const presentCount = Object.values(attendance).filter((s) => s === 'present').length
  const absentCount = Object.values(attendance).filter((s) => s === 'absent').length
  const lateCount = Object.values(attendance).filter((s) => s === 'late').length

  return (
    <PageWrapper title="Attendance">
      <div className="max-w-3xl">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Mark Attendance
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
        {saved && (
          <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-600">
            ✅ Attendance saved successfully
          </div>
        )}

        {/* Controls */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Student List */}
        {selectedClass && (
          <>
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              </div>
            ) : students.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center">
                <span className="text-5xl">👥</span>
                <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm">
                  No students in this class yet.
                </p>
              </div>
            ) : (
              <>
                {/* Summary + Quick Actions */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex gap-3">
                    <span className="text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/30 px-2.5 py-1 rounded-lg">
                      Present: {presentCount}
                    </span>
                    <span className="text-xs font-medium text-red-600 bg-red-50 dark:bg-red-900/30 px-2.5 py-1 rounded-lg">
                      Absent: {absentCount}
                    </span>
                    <span className="text-xs font-medium text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30 px-2.5 py-1 rounded-lg">
                      Late: {lateCount}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => markAll('present')}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      All Present
                    </button>
                    <span className="text-gray-300">·</span>
                    <button
                      onClick={() => markAll('absent')}
                      className="text-xs text-red-500 hover:text-red-600 font-medium"
                    >
                      All Absent
                    </button>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden mb-4">
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {students.map((student, index) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between px-5 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-400 w-5">
                            {index + 1}
                          </span>
                          <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                            {student.photo_url ? (
                              <img
                                src={student.photo_url}
                                alt={student.first_name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-blue-600 dark:text-blue-400 text-xs font-semibold">
                                {student.first_name[0]}{student.last_name[0]}
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {student.last_name} {student.first_name}
                          </p>
                        </div>

                        {/* Status Buttons */}
                        <div className="flex gap-2">
                          {(['present', 'late', 'absent'] as const).map((status) => (
                            <button
                              key={status}
                              onClick={() => toggleStatus(student.id, status)}
                              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all capitalize ${
                                attendance[student.id] === status
                                  ? status === 'present'
                                    ? 'bg-green-600 text-white'
                                    : status === 'late'
                                    ? 'bg-yellow-500 text-white'
                                    : 'bg-red-500 text-white'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:bg-blue-300 transition-colors shadow-lg shadow-blue-200"
                  >
                    {isSaving ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Save Attendance
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </PageWrapper>
  )
}