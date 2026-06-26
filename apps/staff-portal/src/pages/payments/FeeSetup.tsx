import { useState, useEffect } from 'react'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { useAuthStore } from '../../store/authStore'
import { getFeeItems, createFeeItem, deleteFeeItem } from '../../services/payment.service'
import { getClasses } from '../../services/class.service'
import { getCurrentTerm } from '../../services/attendance.service'
import { formatCurrency } from '@schoolpilot/shared-utils'

interface FeeItem {
  id: string
  name: string
  amount: number
  applies_to_all: boolean
  terms: { name: string } | null
  fee_item_classes: { class_id: string; classes: { level: string; arm: string } }[]
}

export const FeeSetup = () => {
  const { user } = useAuthStore()
  const [feeItems, setFeeItems] = useState<FeeItem[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [currentTerm, setCurrentTerm] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    name: '',
    amount: '',
    applies_to_all: true,
    class_ids: [] as string[],
  })

  const load = async () => {
    if (!user?.schoolId) return
    setIsLoading(true)
    try {
      const [feeData, classData, termData] = await Promise.all([
        getFeeItems(user.schoolId),
        getClasses(user.schoolId),
        getCurrentTerm(user.schoolId),
      ])
      setFeeItems(feeData)
      setClasses(classData)
      setCurrentTerm(termData)
    } catch {
      setError('Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [user?.schoolId])

  const handleCreate = async () => {
    if (!user?.schoolId || !currentTerm) return
    setSaving(true)
    setError('')
    try {
      await createFeeItem(user.schoolId, {
        name: form.name,
        amount: Number(form.amount),
        term_id: currentTerm.id,
        applies_to_all: form.applies_to_all,
        class_ids: form.applies_to_all ? [] : form.class_ids,
      })
      setForm({ name: '', amount: '', applies_to_all: true, class_ids: [] })
      setShowForm(false)
      setSuccess('Fee item created successfully')
      setTimeout(() => setSuccess(''), 3000)
      await load()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this fee item?')) return
    try {
      await deleteFeeItem(id)
      setSuccess('Fee item deleted')
      setTimeout(() => setSuccess(''), 3000)
      await load()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const toggleClass = (classId: string) => {
    setForm((prev) => ({
      ...prev,
      class_ids: prev.class_ids.includes(classId)
        ? prev.class_ids.filter((id) => id !== classId)
        : [...prev.class_ids, classId],
    }))
  }

  return (
    <PageWrapper title="Payments">
      <div className="max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Fee Setup
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {currentTerm ? `${currentTerm.name} · Current Term` : 'No active term'}
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Fee Item
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
              New Fee Item
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Fee Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. School Fees, PTA Levy"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Amount (₦) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. 50000"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Applies to */}
            <div className="mt-4">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-2">
                Applies To
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setForm({ ...form, applies_to_all: true, class_ids: [] })}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    form.applies_to_all
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  All Classes
                </button>
                <button
                  onClick={() => setForm({ ...form, applies_to_all: false })}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    !form.applies_to_all
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Specific Classes
                </button>
              </div>

              {!form.applies_to_all && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {classes.map((cls) => (
                    <button
                      key={cls.id}
                      onClick={() => toggleClass(cls.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        form.class_ids.includes(cls.id)
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      {cls.level} {cls.arm}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleCreate}
                disabled={saving || !form.name || !form.amount}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
              >
                {saving ? 'Creating...' : 'Create Fee Item'}
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

        {/* Fee Items List */}
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : feeItems.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center">
            <span className="text-5xl">💰</span>
            <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm">
              No fee items yet. Create your first fee item to get started.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {feeItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-50 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-gray-400">
                          {item.terms?.name}
                        </p>
                        <span className="text-gray-300">·</span>
                        <p className="text-xs text-gray-400">
                          {item.applies_to_all
                            ? 'All classes'
                            : item.fee_item_classes?.map((fc) =>
                                `${fc.classes?.level} ${fc.classes?.arm}`
                              ).join(', ')}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {formatCurrency(item.amount)}
                    </span>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
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