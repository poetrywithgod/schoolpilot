import { useState, useEffect } from 'react'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { useAuthStore } from '../../store/authStore'
import { useSchoolStore } from '../../store/schoolStore'
import { getSchool, updateSchool, uploadSchoolLogo } from '../../services/school.service'

export const SchoolProfile = () => {
  const { user } = useAuthStore()
  const { school, setSchool } = useSchoolStore()

  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  useEffect(() => {
    const loadSchool = async () => {
      if (!user?.schoolId) return
      setIsLoading(true)
      try {
        const data = await getSchool(user.schoolId)
        setForm({
          name: data.name ?? '',
          address: data.address ?? '',
          phone: data.phone ?? '',
          email: data.email ?? '',
        })
        setLogoPreview(data.logo_url)
      } catch (err) {
        setError('Failed to load school profile')
      } finally {
        setIsLoading(false)
      }
    }
    loadSchool()
  }, [user?.schoolId])

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    if (!user?.schoolId) return
    setIsSaving(true)
    setError('')
    setSuccess(false)
    try {
      let logoUrl = school?.logoUrl ?? null

      if (logoFile) {
        logoUrl = await uploadSchoolLogo(user.schoolId, logoFile)
      }

      const updated = await updateSchool(user.schoolId, {
        name: form.name,
        address: form.address,
        phone: form.phone,
        email: form.email,
        logo_url: logoUrl ?? undefined,
      })

      setSchool({
        id: updated.id,
        name: updated.name,
        slug: updated.slug,
        logoUrl: updated.logo_url,
        address: updated.address,
        phone: updated.phone,
        email: updated.email,
        subscriptionTier: updated.subscription_tier,
        subscriptionExpiresAt: updated.subscription_expires_at,
      })

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <PageWrapper title="School Profile">
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper title="School Profile">
      <div className="max-w-2xl">

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">School Information</h2>
          <p className="text-sm text-gray-500 mt-1">
            This information appears on ID cards, result slips, and certificates.
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-600 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            School profile updated successfully
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">

          {/* Logo Upload */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-3">
              School Logo
            </label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="School logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
              <div>
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Upload Logo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-400 mt-1.5">PNG, JPG up to 2MB</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* School Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              School Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Dominion Academy"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              School Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="info@dominionacademy.edu.ng"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all"
            />
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="08012345678"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all"
            />
          </div>

          {/* Address */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              School Address
            </label>
            <textarea
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="12 School Road, Port Harcourt, Rivers State"
              rows={3}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all resize-none"
            />
          </div>

          {/* Subscription info */}
          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Subscription Plan</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Expires {school?.subscriptionExpiresAt
                    ? new Date(school.subscriptionExpiresAt).toLocaleDateString('en-NG', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })
                    : '—'}
                </p>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 capitalize">
                {school?.subscriptionTier ?? 'starter'}
              </span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving || !form.name}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
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
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </PageWrapper>
  )
}