import { useState, useEffect } from 'react'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { useAuthStore } from '../../store/authStore'
import { getSubjects, createSubject, deleteSubject } from '../../services/subject.service'

interface Subject {
  id: string
  name: string
  code: string | null
}

export const SubjectList = () => {
  const { user } = useAuthStore()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', code: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = async () => {
    if (!user?.schoolId) return
    setIsLoading(true)
    try {
      const data = await getSubjects(user.schoolId)
      setSubjects(data)
    } catch {
      setError('Failed to load subjects')
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
      await createSubject(user.schoolId, {
        name: form.name,
        code: form.code || undefined,
      })
      setForm({ name: '', code: '' })
      setShowForm(false)
      setSuccess('Subject created successfully')
      setTimeout(() => setSuccess(''), 3000)
      await load()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (subjectId: string) => {
    if (!confirm('Delete this subject?')) return
    try {
      await deleteSubject(subjectId)
      setSuccess('Subject deleted')
      setTimeout(() => setSuccess(''), 3000)
      await load()
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <PageWrapper title="Subjects">
      <div className="max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Subject Management
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Create and manage subjects offered in your school
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Subject
          </button>
        </div>

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
              New Subject
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Subject Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mathematics"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Subject Code <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. MTH"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleCreate}
                disabled={saving || !form.name}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
              >
                {saving ? 'Creating...' : 'Create Subject'}
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

        {/* Subjects List */}
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : subjects.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center">
            <span className="text-5xl">📚</span>
            <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm">
              No subjects yet. Add your first subject to get started.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-purple-50 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                      <span className="text-purple-600 dark:text-purple-400 text-xs font-bold">
                        {subject.code ?? subject.name.slice(0, 3).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {subject.name}
                      </p>
                      {subject.code && (
                        <p className="text-xs text-gray-400">{subject.code}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(subject.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  )
}