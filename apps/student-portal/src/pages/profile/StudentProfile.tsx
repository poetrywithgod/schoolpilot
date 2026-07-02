import { useState, useRef, useEffect } from 'react'
import { Camera, LogOut, User, MapPin, Phone, Calendar, Shield } from 'lucide-react'
import { PageLayout } from '../../components/layout/PageLayout'
import { useAuthStore } from '../../store/authStore'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export const StudentProfile = () => {
  const { student, setStudent, signOut } = useAuthStore()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({
    address: student?.address ?? '',
    date_of_birth: student?.dateOfBirth ?? '',
    guardian_name: student?.guardianName ?? '',
    guardian_phone: student?.guardianPhone ?? '',
  })

  // Always pull fresh data from Supabase on mount, so the page never shows
  // stale/blank values if the auth store wasn't fully populated at login.
  useEffect(() => {
    const fetchProfile = async () => {
      if (!student?.id) {
        setIsLoading(false)
        return
      }
      try {
        const { data, error: fetchError } = await supabase
          .from('students')
          .select('address, date_of_birth, guardian_name, guardian_phone, photo_url, profile_completed')
          .eq('id', student.id)
          .single()

        if (fetchError) throw fetchError

        if (data) {
          setForm({
            address: data.address ?? '',
            date_of_birth: data.date_of_birth ?? '',
            guardian_name: data.guardian_name ?? '',
            guardian_phone: data.guardian_phone ?? '',
          })
          setStudent({
            ...student,
            address: data.address ?? '',
            dateOfBirth: data.date_of_birth ?? '',
            guardianName: data.guardian_name ?? '',
            guardianPhone: data.guardian_phone ?? '',
            photoUrl: data.photo_url ?? student.photoUrl,
            profileCompleted: !!data.profile_completed,
          })
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load profile')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student?.id])

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !student) return

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB')
      return
    }

    setIsUploading(true)
    setError('')
    try {
      const filePath = `${student.schoolId}/students/${student.id}/photo.${file.name.split('.').pop()}`

      const { error: uploadError } = await supabase.storage
        .from('school-assets')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('school-assets')
        .getPublicUrl(filePath)

      const { error: updateError } = await supabase
        .from('students')
        .update({ photo_url: data.publicUrl })
        .eq('id', student.id)

      if (updateError) throw updateError

      setStudent({ ...student, photoUrl: data.publicUrl })
      setSuccess('Photo updated successfully')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to upload photo')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const validateForm = () => {
    if (form.guardian_phone && !/^[0-9+\s-]{7,15}$/.test(form.guardian_phone)) {
      setError('Please enter a valid phone number')
      return false
    }
    if (form.date_of_birth) {
      const dob = new Date(form.date_of_birth)
      if (Number.isNaN(dob.getTime()) || dob > new Date()) {
        setError('Please enter a valid date of birth')
        return false
      }
    }
    return true
  }

  const handleSave = async () => {
    if (!student) return
    setError('')
    if (!validateForm()) return

    setIsSaving(true)
    try {
      const { error: updateError } = await supabase
        .from('students')
        .update({
          address: form.address || null,
          date_of_birth: form.date_of_birth || null,
          guardian_name: form.guardian_name || null,
          guardian_phone: form.guardian_phone || null,
          profile_completed: true,
        })
        .eq('id', student.id)

      if (updateError) throw updateError

      setStudent({
        ...student,
        address: form.address,
        dateOfBirth: form.date_of_birth,
        guardianName: form.guardian_name,
        guardianPhone: form.guardian_phone,
        profileCompleted: true,
      })
      setIsEditing(false)
      setSuccess('Profile updated successfully')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to update profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    // Revert any unsaved changes back to last known good values
    setForm({
      address: student?.address ?? '',
      date_of_birth: student?.dateOfBirth ?? '',
      guardian_name: student?.guardianName ?? '',
      guardian_phone: student?.guardianPhone ?? '',
    })
    setError('')
    setIsEditing(false)
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (err: any) {
      setError(err.message || 'Failed to sign out')
    }
  }

  if (isLoading) {
    return (
      <PageLayout title="My Profile">
        <div className="flex items-center justify-center py-20">
          <div
            className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: '#0C3B2E', borderTopColor: 'transparent' }}
          />
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="My Profile">
      <div className="px-5 py-4">

        {success && (
          <div
            className="mb-4 px-4 py-3 rounded-xl text-sm"
            style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}
          >
            {success}
          </div>
        )}
        {error && (
          <div
            className="mb-4 px-4 py-3 rounded-xl text-sm"
            style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}
          >
            {error}
          </div>
        )}

        {/* Profile Header */}
        <div
          className="rounded-3xl p-5 mb-4 flex flex-col items-center text-center"
          style={{ backgroundColor: '#0C3B2E' }}
        >
          {/* Photo */}
          <div className="relative mb-3">
            <div
              className="w-20 h-20 rounded-full overflow-hidden border-4"
              style={{ borderColor: '#FFBA00' }}
            >
              {student?.photoUrl ? (
                <img
                  src={student.photoUrl}
                  alt={student.firstName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-2xl font-bold"
                  style={{ backgroundColor: '#FFBA00', color: '#0C3B2E', fontFamily: 'Poppins, sans-serif' }}
                >
                  {student?.firstName?.[0]}{student?.lastName?.[0]}
                </div>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#FFBA00' }}
            >
              {isUploading ? (
                <div
                  className="w-3 h-3 rounded-full border-2 border-t-transparent animate-spin"
                  style={{ borderColor: '#0C3B2E' }}
                />
              ) : (
                <Camera size={12} style={{ color: '#0C3B2E' }} />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>

          <h2
            className="text-xl font-bold text-white"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            {student?.firstName} {student?.lastName}
          </h2>
          <p
            className="text-sm mt-1"
            style={{ color: '#6D9773', fontFamily: 'Lora, serif' }}
          >
            {student?.className ?? 'No class assigned'}
          </p>
          <div
            className="mt-3 px-4 py-1.5 rounded-full text-xs font-bold"
            style={{ backgroundColor: '#FFBA00', color: '#0C3B2E', fontFamily: 'Poppins, sans-serif' }}
          >
            {student?.regNumber}
          </div>

          {/* Profile completion */}
          {!student?.profileCompleted && (
            <div
              className="mt-3 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ backgroundColor: 'rgba(255,186,0,0.15)', color: '#FFBA00', fontFamily: 'Poppins, sans-serif' }}
            >
              ⚠️ Profile incomplete
            </div>
          )}
        </div>

        {/* Info Cards */}
        <div className="space-y-3 mb-4">

          {/* Student Info */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: '#9ca3af', fontFamily: 'Poppins, sans-serif' }}
              >
                Student Information
              </p>
              <button
                onClick={() => (isEditing ? handleCancelEdit() : setIsEditing(true))}
                className="text-xs font-semibold px-3 py-1 rounded-lg"
                style={{ backgroundColor: '#e8f5f0', color: '#0C3B2E', fontFamily: 'Poppins, sans-serif' }}
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: '#e8f5f0' }}
                >
                  <User size={14} style={{ color: '#0C3B2E' }} />
                </div>
                <div>
                  <p
                    className="text-xs text-gray-400"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    Full Name
                  </p>
                  <p
                    className="text-sm font-medium text-gray-900 mt-0.5"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    {student?.lastName} {student?.firstName}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: '#fdf3e8' }}
                >
                  <Shield size={14} style={{ color: '#BB8A52' }} />
                </div>
                <div>
                  <p
                    className="text-xs text-gray-400"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    Parent Linking Code
                  </p>
                  <p
                    className="text-sm font-bold mt-0.5"
                    style={{ color: '#0C3B2E', fontFamily: 'Poppins, sans-serif', letterSpacing: '2px' }}
                  >
                    {student?.parentLinkingCode}
                  </p>
                  <p
                    className="text-xs text-gray-400 mt-0.5"
                    style={{ fontFamily: 'Lora, serif' }}
                  >
                    Share with your parent to link accounts
                  </p>
                </div>
              </div>

              {isEditing ? (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label
                      className="text-xs font-semibold"
                      style={{ color: '#0C3B2E', fontFamily: 'Poppins, sans-serif' }}
                    >
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={form.date_of_birth}
                      max={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
                      className="w-full rounded-xl border-2 px-3 py-2.5 text-sm outline-none"
                      style={{ borderColor: '#e5e7eb', fontFamily: 'Poppins, sans-serif' }}
                      onFocus={(e) => e.target.style.borderColor = '#0C3B2E'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      className="text-xs font-semibold"
                      style={{ color: '#0C3B2E', fontFamily: 'Poppins, sans-serif' }}
                    >
                      Home Address
                    </label>
                    <textarea
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      placeholder="Enter your home address"
                      rows={2}
                      className="w-full rounded-xl border-2 px-3 py-2.5 text-sm outline-none resize-none"
                      style={{ borderColor: '#e5e7eb', fontFamily: 'Lora, serif' }}
                      onFocus={(e) => e.target.style.borderColor = '#0C3B2E'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      className="text-xs font-semibold"
                      style={{ color: '#0C3B2E', fontFamily: 'Poppins, sans-serif' }}
                    >
                      Guardian Name
                    </label>
                    <input
                      type="text"
                      value={form.guardian_name}
                      onChange={(e) => setForm({ ...form, guardian_name: e.target.value })}
                      placeholder="e.g. Mr. John Doe"
                      className="w-full rounded-xl border-2 px-3 py-2.5 text-sm outline-none"
                      style={{ borderColor: '#e5e7eb', fontFamily: 'Poppins, sans-serif' }}
                      onFocus={(e) => e.target.style.borderColor = '#0C3B2E'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      className="text-xs font-semibold"
                      style={{ color: '#0C3B2E', fontFamily: 'Poppins, sans-serif' }}
                    >
                      Guardian Phone
                    </label>
                    <input
                      type="tel"
                      value={form.guardian_phone}
                      onChange={(e) => setForm({ ...form, guardian_phone: e.target.value })}
                      placeholder="e.g. 08012345678"
                      className="w-full rounded-xl border-2 px-3 py-2.5 text-sm outline-none"
                      style={{ borderColor: '#e5e7eb', fontFamily: 'Poppins, sans-serif' }}
                      onFocus={(e) => e.target.style.borderColor = '#0C3B2E'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>

                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full py-3 rounded-xl text-sm font-bold transition-all"
                    style={{
                      backgroundColor: '#FFBA00',
                      color: '#0C3B2E',
                      fontFamily: 'Poppins, sans-serif',
                      opacity: isSaving ? 0.6 : 1,
                    }}
                  >
                    {isSaving ? 'Saving...' : 'Save Profile'}
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: '#fffbeb' }}
                    >
                      <Calendar size={14} style={{ color: '#b08800' }} />
                    </div>
                    <div>
                      <p
                        className="text-xs text-gray-400"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                      >
                        Date of Birth
                      </p>
                      <p
                        className="text-sm font-medium text-gray-900 mt-0.5"
                        style={{ fontFamily: 'Lora, serif' }}
                      >
                        {form.date_of_birth
                          ? new Date(form.date_of_birth).toLocaleDateString('en-NG', {
                              day: 'numeric', month: 'long', year: 'numeric'
                            })
                          : '—'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: '#f0f7f0' }}
                    >
                      <MapPin size={14} style={{ color: '#6D9773' }} />
                    </div>
                    <div>
                      <p
                        className="text-xs text-gray-400"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                      >
                        Address
                      </p>
                      <p
                        className="text-sm font-medium text-gray-900 mt-0.5"
                        style={{ fontFamily: 'Lora, serif' }}
                      >
                        {form.address || '—'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: '#fdf3e8' }}
                    >
                      <Phone size={14} style={{ color: '#BB8A52' }} />
                    </div>
                    <div>
                      <p
                        className="text-xs text-gray-400"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                      >
                        Guardian
                      </p>
                      <p
                        className="text-sm font-medium text-gray-900 mt-0.5"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                      >
                        {form.guardian_name || '—'}
                      </p>
                      <p
                        className="text-xs text-gray-400"
                        style={{ fontFamily: 'Lora, serif' }}
                      >
                        {form.guardian_phone || ''}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold"
          style={{ backgroundColor: '#fef2f2', color: '#dc2626', fontFamily: 'Poppins, sans-serif' }}
        >
          <LogOut size={16} />
          Sign Out
        </button>

        <p
          className="text-center text-xs text-gray-400 mt-4 pb-2"
          style={{ fontFamily: 'Lora, serif' }}
        >
          SchoolPilot © 2026 · {student?.schoolName}
        </p>
      </div>
    </PageLayout>
  )
}