import { useState, useEffect } from 'react'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { useAuthStore } from '../../store/authStore'
import {
  getSessions,
  createSession,
  setCurrentSession,
  createTerm,
  setCurrentTerm,
} from '../../services/session.service'

interface Term {
  id: string
  name: string
  start_date: string
  end_date: string
  is_current: boolean
}

interface Session {
  id: string
  name: string
  start_date: string
  end_date: string
  is_current: boolean
  terms: Term[]
}

export const SessionManager = () => {
  const { user } = useAuthStore()
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedSession, setExpandedSession] = useState<string | null>(null)

  // Session form
  const [showSessionForm, setShowSessionForm] = useState(false)
  const [sessionForm, setSessionForm] = useState({
    name: '', start_date: '', end_date: ''
  })
  const [savingSession, setSavingSession] = useState(false)

  // Term form
  const [showTermForm, setShowTermForm] = useState<string | null>(null)
  const [termForm, setTermForm] = useState({
    name: '', start_date: '', end_date: ''
  })
  const [savingTerm, setSavingTerm] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = async () => {
    if (!user?.schoolId) return
    setIsLoading(true)
    try {
      const data = await getSessions(user.schoolId)
      setSessions(data)
    } catch {
      setError('Failed to load sessions')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [user?.schoolId])

  const handleCreateSession = async () => {
    if (!user?.schoolId) return
    setSavingSession(true)
    setError('')
    try {
      await createSession(user.schoolId, sessionForm)
      setSessionForm({ name: '', start_date: '', end_date: '' })
      setShowSessionForm(false)
      setSuccess('Session created successfully')
      setTimeout(() => setSuccess(''), 3000)
      await load()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSavingSession(false)
    }
  }

  const handleSetCurrentSession = async (sessionId: string) => {
    if (!user?.schoolId) return
    try {
      await setCurrentSession(user.schoolId, sessionId)
      setSuccess('Current session updated')
      setTimeout(() => setSuccess(''), 3000)
      await load()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleCreateTerm = async (sessionId: string) => {
    if (!user?.schoolId) return
    setSavingTerm(true)
    setError('')
    try {
      await createTerm(user.schoolId, { ...termForm, session_id: sessionId })
      setTermForm({ name: '', start_date: '', end_date: '' })
      setShowTermForm(null)
      setSuccess('Term created successfully')
      setTimeout(() => setSuccess(''), 3000)
      await load()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSavingTerm(false)
    }
  }

  const handleSetCurrentTerm = async (termId: string) => {
    if (!user?.schoolId) return
    try {
      await setCurrentTerm(user.schoolId, termId)
      setSuccess('Current term updated')
      setTimeout(() => setSuccess(''), 3000)
      await load()
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <PageWrapper title="Session & Term Manager">
      <div className="max-w-3xl">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Academic Sessions
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Create and manage academic sessions and terms
            </p>
          </div>
          <button
            onClick={() => setShowSessionForm(!showSessionForm)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Session
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

        {/* New Session Form */}
        {showSessionForm && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              New Academic Session
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Session Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2025/2026"
                  value={sessionForm.name}
                  onChange={(e) => setSessionForm({ ...sessionForm, name: e.target.value })}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-3 py-2 text-sm outline-none focus:border-blue-500 transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Start Date
                </label>
                <input
                  type="date"
                  value={sessionForm.start_date}
                  onChange={(e) => setSessionForm({ ...sessionForm, start_date: e.target.value })}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-3 py-2 text-sm outline-none focus:border-blue-500 transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  End Date
                </label>
                <input
                  type="date"
                  value={sessionForm.end_date}
                  onChange={(e) => setSessionForm({ ...sessionForm, end_date: e.target.value })}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-3 py-2 text-sm outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleCreateSession}
                disabled={savingSession || !sessionForm.name || !sessionForm.start_date || !sessionForm.end_date}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
              >
                {savingSession ? 'Creating...' : 'Create Session'}
              </button>
              <button
                onClick={() => setShowSessionForm(false)}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Sessions List */}
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center">
            <span className="text-5xl">📅</span>
            <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm">
              No sessions yet. Create your first academic session to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
              >
                {/* Session Header */}
                <div className="flex items-center justify-between p-5">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setExpandedSession(
                        expandedSession === session.id ? null : session.id
                      )}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                      <svg
                        className={`w-5 h-5 transition-transform ${expandedSession === session.id ? 'rotate-90' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {session.name}
                        </p>
                        {session.is_current && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(session.start_date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {' — '}
                        {new Date(session.end_date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {session.terms?.length ?? 0} term{session.terms?.length !== 1 ? 's' : ''}
                    </span>
                    {!session.is_current && (
                      <button
                        onClick={() => handleSetCurrentSession(session.id)}
                        className="px-3 py-1.5 text-xs font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        Set Current
                      </button>
                    )}
                  </div>
                </div>

                {/* Terms */}
                {expandedSession === session.id && (
                  <div className="border-t border-gray-100 dark:border-gray-800 px-5 py-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Terms
                      </p>
                      <button
                        onClick={() => setShowTermForm(
                          showTermForm === session.id ? null : session.id
                        )}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        + Add Term
                      </button>
                    </div>

                    {/* Term Form */}
                    {showTermForm === session.id && (
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Term</label>
                            <select
                              value={termForm.name}
                              onChange={(e) => setTermForm({ ...termForm, name: e.target.value })}
                              className="rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                            >
                              <option value="">Select term</option>
                              <option value="First Term">First Term</option>
                              <option value="Second Term">Second Term</option>
                              <option value="Third Term">Third Term</option>
                            </select>
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Start Date</label>
                            <input
                              type="date"
                              value={termForm.start_date}
                              onChange={(e) => setTermForm({ ...termForm, start_date: e.target.value })}
                              className="rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">End Date</label>
                            <input
                              type="date"
                              value={termForm.end_date}
                              onChange={(e) => setTermForm({ ...termForm, end_date: e.target.value })}
                              className="rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCreateTerm(session.id)}
                            disabled={savingTerm || !termForm.name || !termForm.start_date || !termForm.end_date}
                            className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
                          >
                            {savingTerm ? 'Saving...' : 'Save Term'}
                          </button>
                          <button
                            onClick={() => setShowTermForm(null)}
                            className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Terms List */}
                    {session.terms?.length === 0 ? (
                      <p className="text-xs text-gray-400 py-2">No terms yet — add your first term above.</p>
                    ) : (
                      <div className="space-y-2">
                        {session.terms?.map((term) => (
                          <div
                            key={term.id}
                            className="flex items-center justify-between py-2 px-3 rounded-xl bg-gray-50 dark:bg-gray-800"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {term.name}
                              </span>
                              {term.is_current && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                  Current
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-400">
                                {new Date(term.start_date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                                {' — '}
                                {new Date(term.end_date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                              </span>
                              {!term.is_current && (
                                <button
                                  onClick={() => handleSetCurrentTerm(term.id)}
                                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                >
                                  Set Current
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  )
}