import { useState, useEffect } from 'react'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { useAuthStore } from '../../store/authStore'
import { getClasses, createClass, deleteClass } from '../../services/class.service'
import { getSessions } from '../../services/session.service'

const CLASS_LEVELS = ['JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3']
const ARMS = ['A', 'B', 'C', 'D', 'E']

interface Class {
  id: string
  level: string
  arm: string
  session_id: string
  sessions: { name: string }
}

interface Session {
  id: string
  name: string
  is_current: boolean
}

export const ClassList = () => {
  const { user } = useAuthStore()
  const [classes, setClasses] = useState<Class[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    level: 'JSS1',
    arm: 'A',
    session_id: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = async () => {
    if (!user?.schoolId) return
    setIsLoading(true)
    try {
      const [classData, sessionData] = await Promise.all([
        getClasses(user.schoolId),
        getSessions(user.schoolId),
      ])
      setClasses(classData)
      setSessions(sessionData)
      const current = sessionData.find((s: Session) => s.is_current)
      if (current) setForm((f) => ({ ...f, session_id: current.id }))
    } catch {
      setError('Failed to load classes')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [user?.schoolId])

  const handleCreate = async () => {
    if (!user?.schoolId) return
    setSaving(true)
    setError('')
    try {
      await createClass(user.schoolId, form)
      setShowForm(false)
      setSuccess('Class created successfully')
      setTimeout(() => setSuccess(''), 3000)
      await load()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (classId: string) => {
    if (!confirm('Delete this class? This cannot be undone.')) return
    try {
      await deleteClass(classId)
      setSuccess('Class deleted')
      setTimeout(() => setSuccess(''), 3000)
      await load()
    } catch (err: any) {
      setError(err.message)
    }
  }

  // Group classes by level
  const grouped = CLASS_LEVELS.reduce((acc, level) => {
    acc[level] = classes.filter((c) => c.level === level)
    return acc
  }, {} as Record<string, Class[]>)

  return (
    <PageWrapper title="Classes">
      <div className="max-w-4xl">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Class Management
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Create and manage class levels and arms
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Class
          </button>
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

        {/* Form */}
        {showForm && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 mb-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              Create New Class
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Level
                </label>
                <select
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: e.target.value })}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 transition-all"
                >
                  {CLASS_LEVELS.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Arm
                </label>
                <select
                  value={form.arm}
                  onChange={(e) => setForm({ ...form, arm: e.target.value })}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 transition-all"
                >
                  {ARMS.map((arm) => (
                    <option key={arm} value={arm}>{arm}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Session
                </label>
                <select
                  value={form.session_id}
                  onChange={(e) => setForm({ ...form, session_id: e.target.value })}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 transition-all"
                >
                  <option value="">Select session</option>
                  {sessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.is_current ? '(Current)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleCreate}
                disabled={saving || !form.session_id}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
              >
                {saving ? 'Creating...' : 'Create Class'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Classes Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : classes.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center">
            <span className="text-5xl">🏫</span>
            <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm">
              No classes yet. Create your first class to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {CLASS_LEVELS.map((level) => {
              if (grouped[level].length === 0) return null
              return (
                <div key={level}>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    {level}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {grouped[level].map((cls) => (
                      <div
                        key={cls.id}
                        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex flex-col gap-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                              {cls.level}{cls.arm}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDelete(cls.id)}
                            className="text-gray-300 hover:text-red-500 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {cls.level} {cls.arm}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {cls.sessions?.name}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </PageWrapper>
  )
}