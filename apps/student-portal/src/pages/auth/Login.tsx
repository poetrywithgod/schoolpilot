import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'

export const Login = () => {
  const navigate = useNavigate()
  const { setStudent, setLoading, isLoading } = useAuthStore()
  const [mode, setMode] = useState<'student' | 'parent'>('student')
  const [regNumber, setRegNumber] = useState('')
  const [pin, setPin] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [error, setError] = useState('')

  const getSchoolFromSubdomain = () => {
    const hostname = window.location.hostname
    if (hostname === 'localhost') return 'dominion-academy'
    return hostname.split('.')[0]
  }

  const handleStudentLogin = async () => {
    if (!regNumber || !pin) return
    setLoading(true)
    setError('')
    try {
      const slug = getSchoolFromSubdomain()

      // Get school
      const { data: school, error: schoolError } = await supabase
        .from('schools')
        .select('*')
        .eq('slug', slug)
        .single()

      if (schoolError || !school) throw new Error('School not found')

      // Build internal email from reg number
      const email = `${regNumber.toLowerCase().replace(/\//g, '.')}@schoolpilot.internal`

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: pin,
      })

      if (authError) throw new Error('Invalid reg number or PIN')

      // Get student record
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('*, classes(level, arm)')
        .eq('auth_id', authData.user.id)
        .eq('school_id', school.id)
        .single()

      if (studentError || !student) throw new Error('Student record not found')

      setStudent({
        id: student.id,
        authId: authData.user.id,
        firstName: student.first_name,
        lastName: student.last_name,
        regNumber: student.reg_number,
        classId: student.class_id,
        className: student.classes ? `${student.classes.level} ${student.classes.arm}` : null,
        photoUrl: student.photo_url,
        profileCompleted: student.profile_completed,
        schoolId: school.id,
        schoolName: school.name,
        schoolSlug: school.slug,
        schoolLogoUrl: school.logo_url,
        parentLinkingCode: student.parent_linking_code,
      })

      // Check if first login — PIN equals last 4 of reg number
      const defaultPin = student.reg_number.slice(-4)
      if (pin === defaultPin) {
        navigate('/change-pin')
      } else {
        navigate('/dashboard')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleParentLogin = async () => {
    if (!email || !password) return
    setLoading(true)
    setError('')
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw new Error('Invalid email or password')

      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F5F5F0' }}>

      {/* Header */}
      <div className="px-6 pt-16 pb-10" style={{ backgroundColor: '#0C3B2E' }}>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FFBA00' }}>
            <span className="font-black text-lg" style={{ color: '#0C3B2E' }}>S</span>
          </div>
          <span className="text-white font-bold text-xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
            SchoolPilot
          </span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Welcome back 👋
        </h1>
        <p className="text-sm" style={{ color: '#6D9773', fontFamily: 'Lora, serif' }}>
          Sign in to your account to continue
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 -mt-4">
        <div className="bg-white rounded-3xl shadow-sm p-6">

          {/* Mode Toggle */}
          <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
            <button
              onClick={() => { setMode('student'); setError('') }}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                fontFamily: 'Poppins, sans-serif',
                backgroundColor: mode === 'student' ? '#0C3B2E' : 'transparent',
                color: mode === 'student' ? 'white' : '#6b7280',
              }}
            >
              Student
            </button>
            <button
              onClick={() => { setMode('parent'); setError('') }}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                fontFamily: 'Poppins, sans-serif',
                backgroundColor: mode === 'parent' ? '#0C3B2E' : 'transparent',
                color: mode === 'parent' ? 'white' : '#6b7280',
              }}
            >
              Parent / Guardian
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}>
              {error}
            </div>
          )}

          {mode === 'student' ? (
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#0C3B2E', fontFamily: 'Poppins, sans-serif' }}>
                  Reg Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. DA/2026/0001"
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value.toUpperCase())}
                  className="w-full rounded-2xl border-2 px-4 py-3.5 text-sm outline-none transition-all"
                  style={{
                    borderColor: '#e5e7eb',
                    fontFamily: 'Poppins, sans-serif',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#0C3B2E'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#0C3B2E', fontFamily: 'Poppins, sans-serif' }}>
                  PIN
                </label>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    placeholder="Enter your PIN"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full rounded-2xl border-2 px-4 py-3.5 text-sm outline-none transition-all pr-12"
                    style={{
                      borderColor: '#e5e7eb',
                      fontFamily: 'Poppins, sans-serif',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#0C3B2E'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPin ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                onClick={handleStudentLogin}
                disabled={isLoading || !regNumber || !pin}
                className="w-full py-4 rounded-2xl text-sm font-bold transition-all mt-2"
                style={{
                  backgroundColor: '#FFBA00',
                  color: '#0C3B2E',
                  fontFamily: 'Poppins, sans-serif',
                  opacity: isLoading || !regNumber || !pin ? 0.6 : 1,
                }}
              >
                {isLoading ? 'Signing in...' : 'Sign In →'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#0C3B2E', fontFamily: 'Poppins, sans-serif' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border-2 px-4 py-3.5 text-sm outline-none transition-all"
                  style={{ borderColor: '#e5e7eb', fontFamily: 'Poppins, sans-serif' }}
                  onFocus={(e) => e.target.style.borderColor = '#0C3B2E'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#0C3B2E', fontFamily: 'Poppins, sans-serif' }}>
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border-2 px-4 py-3.5 text-sm outline-none transition-all"
                  style={{ borderColor: '#e5e7eb', fontFamily: 'Poppins, sans-serif' }}
                  onFocus={(e) => e.target.style.borderColor = '#0C3B2E'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <button
                onClick={handleParentLogin}
                disabled={isLoading || !email || !password}
                className="w-full py-4 rounded-2xl text-sm font-bold transition-all mt-2"
                style={{
                  backgroundColor: '#FFBA00',
                  color: '#0C3B2E',
                  fontFamily: 'Poppins, sans-serif',
                  opacity: isLoading || !email || !password ? 0.6 : 1,
                }}
              >
                {isLoading ? 'Signing in...' : 'Sign In →'}
              </button>

              <div className="text-center pt-2">
                <p className="text-sm" style={{ color: '#6b7280', fontFamily: 'Lora, serif' }}>
                  Don't have an account?{' '}
                  <button
                    onClick={() => window.location.href = '/register'}
                    className="font-semibold"
                    style={{ color: '#0C3B2E', fontFamily: 'Poppins, sans-serif' }}
                  >
                    Register here
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs mt-6 pb-8" style={{ color: '#9ca3af', fontFamily: 'Lora, serif' }}>
          SchoolPilot © 2026 · Built for Nigerian Schools 🇳🇬
        </p>
      </div>
    </div>
  )
}