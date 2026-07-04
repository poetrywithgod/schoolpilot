import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'

export const Login = () => {
  const navigate = useNavigate()
  const { setAdmin, setLoading, isLoading } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    if (!email || !password) return
    setLoading(true)
    setError('')
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (authError) throw new Error('Invalid email or password')

      const { data: adminData, error: adminError } = await supabase
        .from('super_admins')
        .select('*')
        .eq('auth_id', authData.user.id)
        .eq('is_active', true)
        .single()

      if (adminError || !adminData) throw new Error('No super admin account found for this user')

      setAdmin({
        id: adminData.id,
        authId: authData.user.id,
        firstName: adminData.first_name,
        lastName: adminData.last_name,
        email: adminData.email,
        role: adminData.role,
      })

      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: '#081f19' }}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(12,59,46,0.8) 0%, transparent 70%)',
        }}
      />

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl"
            style={{ backgroundColor: '#FFBA00', color: '#0C3B2E', fontFamily: 'Poppins, sans-serif' }}
          >
            S
          </div>
          <div>
            <p className="text-white font-bold text-xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
              SchoolPilot
            </p>
            <p className="text-xs" style={{ color: '#6D9773', fontFamily: 'Lora, serif' }}>
              Super Admin Console
            </p>
          </div>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl p-8"
          style={{
            backgroundColor: '#0C3B2E',
            border: '1px solid rgba(109,151,115,0.2)',
          }}
        >
          <h1
            className="text-2xl font-bold text-white mb-1"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Welcome back
          </h1>
          <p className="text-sm mb-8" style={{ color: '#6D9773', fontFamily: 'Lora, serif' }}>
            Sign in to the admin console
          </p>

          {error && (
            <div
              className="mb-4 px-4 py-3 rounded-xl text-sm"
              style={{ backgroundColor: 'rgba(220,38,38,0.1)', color: '#f87171', border: '1px solid rgba(220,38,38,0.2)' }}
            >
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: '#6D9773', fontFamily: 'Poppins, sans-serif' }}
              >
                Email Address
              </label>
              <input
                type="email"
                placeholder="admin@schoolpilot.ng"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none text-white placeholder-gray-500 transition-all"
                style={{
                  backgroundColor: 'rgba(109,151,115,0.08)',
                  border: '1px solid rgba(109,151,115,0.2)',
                  fontFamily: 'Poppins, sans-serif',
                }}
                onFocus={(e) => e.target.style.borderColor = '#FFBA00'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(109,151,115,0.2)'}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: '#6D9773', fontFamily: 'Poppins, sans-serif' }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  className="w-full rounded-xl px-4 py-3 pr-12 text-sm outline-none text-white placeholder-gray-500 transition-all"
                  style={{
                    backgroundColor: 'rgba(109,151,115,0.08)',
                    border: '1px solid rgba(109,151,115,0.2)',
                    fontFamily: 'Poppins, sans-serif',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#FFBA00'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(109,151,115,0.2)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  style={{ color: '#6D9773' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={isLoading || !email || !password}
              className="w-full py-3.5 rounded-xl text-sm font-bold transition-all mt-2"
              style={{
                backgroundColor: '#FFBA00',
                color: '#0C3B2E',
                fontFamily: 'Poppins, sans-serif',
                opacity: isLoading || !email || !password ? 0.6 : 1,
              }}
            >
              {isLoading ? 'Signing in...' : 'Sign In →'}
            </button>
          </div>
        </div>

        <p
          className="text-center text-xs mt-6"
          style={{ color: '#6D9773', fontFamily: 'Lora, serif' }}
        >
          SchoolPilot Admin Console · Restricted Access
        </p>
      </div>
    </div>
  )
}
