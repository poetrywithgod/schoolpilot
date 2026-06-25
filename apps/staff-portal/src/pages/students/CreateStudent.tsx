import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { useAuthStore } from '../../store/authStore'
import { useSchoolStore } from '../../store/schoolStore'
import { createStudent } from '../../services/student.service'
import { getClasses } from '../../services/class.service'

interface Class {
  id: string
  level: string
  arm: string
}

export const CreateStudent = () => {
  const { user } = useAuthStore()
  const { school } = useSchoolStore()
  const navigate = useNavigate()
  const [classes, setClasses] = useState<Class[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    middle_name: '',
    class_id: '',
    gender: '',
    date_of_birth: '',
    guardian_name: '',
    guardian_phone: '',
  })

  useEffect(() => {
    const load = async () => {
      if (!user?.schoolId) return
      const data = await getClasses(user.schoolId)
      setClasses(data)
    }
    load()
  }, [user?.schoolId])

  const handleCreate = async () => {
    if (!user?.schoolId || !school) return
    setSaving(true)
    setError('')
    try {
      const schoolCode = school.slug.split('-').map((w: string) => w[0]).join('').toUpperCase()
      await createStudent(user.schoolId, schoolCode, {
        first_name: form.first_name,
        last_name: form.last_name,
        middle_name: form.middle_name || undefined,
        class_id: form.class_id,
        gender: form.gender || undefined,
        date_of_birth: form.date_of_birth || undefined,
        guardian_name: form.guardian_name || undefined,
        guardian_phone: form.guardian_phone || undefined,
      })
      navigate('/students')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageWrapper title="Add Student">
      <div className="max-w-2xl">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            New Student
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            A reg number and PIN will be auto-generated after creation
          </p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-5">

          {/* Name Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Chidera"
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                className="rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Nwosu"
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                className="rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Middle Name
              </label>
              <input
                type="text"
                placeholder="e.g. Blessing"
                value={form.middle_name}
                onChange={(e) => setForm({ ...form, middle_name: e.target.value })}
                className="rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Class & Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Class <span className="text-red-500">*</span>
              </label>
              <select
                value={form.class_id}
                onChange={(e) => setForm({ ...form, class_id: e.target.value })}
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
                Gender
              </label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 transition-all"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          {/* Date of Birth */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Date of Birth
            </label>
            <input
              type="date"
              value={form.date_of_birth}
              onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
              className="rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 transition-all"
            />
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Guardian Information
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Guardian Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mr. Emeka Nwosu"
                  value={form.guardian_name}
                  onChange={(e) => setForm({ ...form, guardian_name: e.target.value })}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Guardian Phone
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 08012345678"
                  value={form.guardian_phone}
                  onChange={(e) => setForm({ ...form, guardian_phone: e.target.value })}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-3 justify-end">
          <button
            onClick={() => navigate('/students')}
            className="px-6 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={saving || !form.first_name || !form.last_name || !form.class_id}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:bg-blue-300 transition-colors shadow-lg shadow-blue-200"
          >
            {saving ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Creating...
              </>
            ) : (
              'Create Student'
            )}
          </button>
        </div>
      </div>
    </PageWrapper>
  )
}