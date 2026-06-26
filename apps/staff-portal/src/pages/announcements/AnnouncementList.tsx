import { useState, useEffect } from 'react'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { useAuthStore } from '../../store/authStore'
import {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
} from '../../services/announcement.service'
import { formatDate } from '@schoolpilot/shared-utils'

interface Announcement {
  id: string
  title: string
  body: string
  audience: string
  created_at: string
  staff: { first_name: string; last_name: string } | null
}

const AUDIENCE_COLORS: Record<string, string> = {
  all: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  students: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  parents: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  staff: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
}

export const AnnouncementList = () => {
  const { user } = useAuthStore()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>(['all'])
  const [form, setForm] = useState({
    title: '',
    body: '',
  })

  const load = async () => {
    if (!user?.schoolId) return
    setIsLoading(true)
    try {
      const data = await getAnnouncements(user.schoolId)
      setAnnouncements(data)
    } catch {
      setError('Failed to load announcements')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [user?.schoolId])

  const toggleAudience = (audience: string) => {
    if (audience === 'all') {
      setSelectedAudiences(['all'])
      return
    }
    const without = selectedAudiences.filter((a) => a !== 'all')
    if (without.includes(audience)) {
      const updated = without.filter((a) => a !== audience)
      setSelectedAudiences(updated.length === 0 ? ['all'] : updated)
    } else {
      setSelectedAudiences([...without, audience])
    }
  }

  const handleCreate = async () => {
    if (!user?.schoolId || !user?.id) return
    setSaving(true)
    setError('')
    try {
      const audience = selectedAudiences.includes('all')
        ? 'all'
        : selectedAudiences.join(',')

      await createAnnouncement(user.schoolId, {
        title: form.title,
        body: form.body,
        audience,
        created_by: user.id,
      })
      setForm({ title: '', body: '' })
      setSelectedAudiences(['all'])
      setShowForm(false)
      setSuccess('Announcement published successfully')
      setTimeout(() => setSuccess(''), 3000)
      await load()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this announcement?')) return
    try {
      await deleteAnnouncement(id)
      setSuccess('Announcement deleted')
      setTimeout(() => setSuccess(''), 3000)
      await load()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const getAudienceBadge = (audience: string) => {
    if (audience === 'all') {
      return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${AUDIENCE_COLORS.all}`}>
          Everyone
        </span>
      )
    }
    const parts = audience.split(',')
    return (
      <div className="flex gap-1 flex-wrap">
        {parts.map((a) => (
          <span
            key={a}
            className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${AUDIENCE_COLORS[a] ?? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}
          >
            {a}
          </span>
        ))}
      </div>
    )
  }

  return (
    <PageWrapper title="Announcements">
      <div className="max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Announcements
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Broadcast messages to students, parents or staff
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Announcement
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
              New Announcement
            </h3>
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. End of Term Examination Schedule"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Type your announcement here..."
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  rows={4}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 transition-all resize-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Send To <span className="text-xs text-gray-400">(select one or more)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['all', 'students', 'parents', 'staff'] as const).map((audience) => (
                    <button
                      key={audience}
                      onClick={() => toggleAudience(audience)}
                      className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-colors capitalize ${
                        selectedAudiences.includes(audience)
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      {audience === 'all' ? 'Everyone' : audience}
                    </button>
                  ))}
                </div>
                {!selectedAudiences.includes('all') && (
                  <p className="text-xs text-blue-500 mt-1">
                    Sending to: {selectedAudiences.map((a) => a.charAt(0).toUpperCase() + a.slice(1)).join(' & ')}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={handleCreate}
                disabled={saving || !form.title || !form.body}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
              >
                {saving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                    Publish
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowForm(false)
                  setForm({ title: '', body: '' })
                  setSelectedAudiences(['all'])
                }}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Announcements List */}
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : announcements.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center">
            <span className="text-5xl">📢</span>
            <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm">
              No announcements yet. Create your first announcement.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {announcement.title}
                      </h3>
                      {getAudienceBadge(announcement.audience)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {announcement.body}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      By {announcement.staff?.first_name} {announcement.staff?.last_name} · {formatDate(announcement.created_at)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(announcement.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  )
}