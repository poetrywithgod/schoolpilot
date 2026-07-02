import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { registerParent } from '../../services/parent.service'
import { useAuthStore } from '../../store/authStore'

export const ParentRegister = () => {
  const navigate = useNavigate()
  const { setParent } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  })

  const handleRegister = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.password) {
      setError('Please fill in all fields')
      return
    }
    setIsLoading(true)
    setError('')
    try {
      const parent = await registerParent(form)

      setParent({
        id: parent.id,
        authId: parent.auth_id,
        firstName: parent.first_name,
        lastName: parent.last_name,
        email: parent.email,
        phone: parent.phone,
      })

      navigate('/link-child')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F5F5F0' }}>
      <div className="px-6 pt-16 pb-10" style={{ backgroundColor: '#0C3B2E' }}>
        <button
          onClick={() => navigate('/login')}
          className="text-sm mb-6 flex items-center gap-1"
          style={{ color: '#6D9773', fontFamily: 'Poppins, sans-serif' }}
        >
          ← Back to Login
        </button>
        <h1
          className="text-3xl font-bold text-white mb-2"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          Create Account 👋
        </h1>
        <p
          className="text-sm"
          style={{ color: '#6D9773', fontFamily: 'Lora, serif' }}
        >
          Register as a parent to monitor your child's progress
        </p>
      </div>

      <div className="flex-1 px-6 -mt-4">
        <div className="bg-white rounded-3xl shadow-sm p-6">

          {error && (
            <div
              className="mb-4 px-4 py-3 rounded-xl text-sm"
              style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}
            >
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: '#0C3B2E', fontFamily: 'Poppins, sans-serif' }}
                >
                  First Name
                </label>
                <input
                  type="text"
                  placeholder="John"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="w-full rounded-2xl border-2 px-3 py-3 text-sm outline-none"
                  style={{ borderColor: '#e5e7eb', fontFamily: 'Poppins, sans-serif' }}
                  onFocus={(e) => e.target.style.borderColor = '#0C3B2E'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: '#0C3B2E', fontFamily: 'Poppins, sans-serif' }}
                >
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="Doe"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="w-full rounded-2xl border-2 px-3 py-3 text-sm outline-none"
                  style={{ borderColor: '#e5e7eb', fontFamily: 'Poppins, sans-serif' }}
                  onFocus={(e) => e.target.style.borderColor = '#0C3B2E'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: '#0C3B2E', fontFamily: 'Poppins, sans-serif' }}
              >
                Email Address
              </label>
              <input
                type="email"
                placeholder="john@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-2xl border-2 px-4 py-3 text-sm outline-none"
                style={{ borderColor: '#e5e7eb', fontFamily: 'Poppins, sans-serif' }}
                onFocus={(e) => e.target.style.borderColor = '#0C3B2E'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: '#0C3B2E', fontFamily: 'Poppins, sans-serif' }}
              >
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="08012345678"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-2xl border-2 px-4 py-3 text-sm outline-none"
                style={{ borderColor: '#e5e7eb', fontFamily: 'Poppins, sans-serif' }}
                onFocus={(e) => e.target.style.borderColor = '#0C3B2E'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: '#0C3B2E', fontFamily: 'Poppins, sans-serif' }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full rounded-2xl border-2 px-4 py-3 text-sm outline-none pr-12"
                  style={{ borderColor: '#e5e7eb', fontFamily: 'Poppins, sans-serif' }}
                  onFocus={(e) => e.target.style.borderColor = '#0C3B2E'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              onClick={handleRegister}
              disabled={isLoading}
              className="w-full py-4 rounded-2xl text-sm font-bold transition-all mt-2"
              style={{
                backgroundColor: '#FFBA00',
                color: '#0C3B2E',
                fontFamily: 'Poppins, sans-serif',
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              {isLoading ? 'Creating account...' : 'Create Account →'}
            </button>

            <p
              className="text-center text-sm"
              style={{ color: '#6b7280', fontFamily: 'Lora, serif' }}
            >
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="font-semibold"
                style={{ color: '#0C3B2E', fontFamily: 'Poppins, sans-serif' }}
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}