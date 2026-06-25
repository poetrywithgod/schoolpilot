import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { useAuthStore } from '../../store/authStore'
import { getStudents } from '../../services/student.service'
import { getClasses } from '../../services/class.service'

interface Student {
  id: string
  first_name: string
  last_name: string
  middle_name: string | null
  reg_number: string
  gender: string | null
  photo_url: string | null
  profile_completed: boolean
  is_active: boolean
  parent_linking_code: string
  class_id: string | null
  classes: { level: string; arm: string } | null
}

interface Class {
  id: string
  level: string
  arm: string
}

export const StudentList = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [students, setStudents] = useState<Student[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('')
  const [error, setError] = useState('')

  const load = async () => {
    if (!user?.schoolId) return
    setIsLoading(true)
    try {
      const [studentData, classData] = await Promise.all([
        getStudents(user.schoolId),
        getClasses(user.schoolId),
      ])
      setStudents(studentData)
      setClasses(classData)
    } catch {
      setError('Failed to load students')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [user?.schoolId])

  const filtered = students.filter((s) => {
    const matchesSearch =
      !search ||
      `${s.first_name} ${s.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      s.reg_number.toLowerCase().includes(search.toLowerCase())
    const matchesClass = !classFilter || s.class_id === classFilter
    return matchesSearch && matchesClass
  })

  return (
    <PageWrapper title="Students">
      <div className="max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Student Management
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {students.length} student{students.length !== 1 ? 's' : ''} enrolled
            </p>
          </div>
          <button
            onClick={() => navigate('/students/create')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Student
          </button>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name or reg number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white pl-9 pr-4 py-2.5 text-sm outline-none focus:border-blue-500 transition-all"
            />
          </div>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 transition-all"
          >
            <option value="">All Classes</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.level} {cls.arm}
              </option>
            ))}
          </select>
        </div>

        {/* Students List */}
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center">
            <span className="text-5xl">🎓</span>
            <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm">
              {search || classFilter ? 'No students match your search.' : 'No students yet. Add your first student to get started.'}
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map((student) => (
                <div
                  key={student.id}
                  onClick={() => navigate(`/students/${student.id}`)}
                  className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0">
                      {student.photo_url ? (
                        <img
                          src={student.photo_url}
                          alt={`${student.first_name} ${student.last_name}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-blue-50 dark:bg-blue-900/30">
                          <span className="text-blue-600 dark:text-blue-400 text-sm font-semibold">
                            {student.first_name[0]}{student.last_name[0]}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {student.last_name} {student.first_name} {student.middle_name ?? ''}
                        </p>
                        {!student.profile_completed && (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                            Incomplete
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {student.reg_number} · {student.classes ? `${student.classes.level} ${student.classes.arm}` : 'No class'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 hidden sm:block">
                      PIN: {student.reg_number.slice(-4)}
                    </span>
                    <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  )
}