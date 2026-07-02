import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link2, CheckCircle } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { linkChildToParent } from '../../services/parent.service'

export const LinkChild = () => {
  const navigate = useNavigate()
  const { parent } = useAuthStore()
  const [regNumber, setRegNumber] = useState('')
  const [linkingCode, setLinkingCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [linked, setLinked] = useState<any>(null)

  const handleLink = async () => {
    if (!parent?.id) return
    if (!regNumber || !linkingCode) {
      setError('Please fill in both fields')
      return
    }
    setIsLoading(true)
    setError('')
    try {
      const student = await linkChildToParent(parent.id, regNumber, linkingCode)
      setLinked(student)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (linked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ backgroundColor: '#F5F5F0' }}>
        <div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center shadow-sm">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: '#dcfce7' }}
          >
            <CheckCircle size={32} style={{ color: '#16a34a' }} />
          </div>
          <h2
            className="text-xl font-bold text-gray-900 mb-2"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Child Linked! 🎉
          </h2>
          <p
            className="text-sm text-gray-500 mb-1"
            style={{ fontFamily: 'Lora, serif' }}
          >
            Successfully linked to
          </p>
          <p
            className="text-lg font-bold mb-1"
            style={{ color: '#0C3B2E', fontFamily: 'Poppins, sans-serif' }}
          >
            {linked.first_name} {linked.last_name}
          </p>
          <p
            className="text-sm text-gray-400 mb-6"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            {linked.reg_number}
          </p>

          <div className="space-y-3">
            <button
              onClick={() => {
                setLinked(null)
                setRegNumber('')
                setLinkingCode('')
              }}
              className="w-full py-3 rounded-2xl text-sm font-semibold border-2"
              style={{
                borderColor: '#0C3B2E',
                color: '#0C3B2E',
                fontFamily: 'Poppins, sans-serif',
              }}
            >
              Link Another Child
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-3 rounded-2xl text-sm font-bold"
              style={{
                backgroundColor: '#FFBA00',
                color: '#0C3B2E',
                fontFamily: 'Poppins, sans-serif',
              }}
            >
              Go to Dashboard →
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F5F5F0' }}>
      <div className="px-6 pt-16 pb-10" style={{ backgroundColor: '#0C3B2E' }}>
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
          style={{ backgroundColor: '#FFBA00' }}
        >
          <Link2 size={22} style={{ color: '#0C3B2E' }} />
        </div>
        <h1
          className="text-3xl font-bold text-white mb-2"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          Link Your Child 🔗
        </h1>
        <p
          className="text-sm"
          style={{ color: '#6D9773', fontFamily: 'Lora, serif' }}
        >
          Enter your child's reg number and the linking code from their login slip
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
            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: '#0C3B2E', fontFamily: 'Poppins, sans-serif' }}
              >
                Child's Reg Number
              </label>
              <input
                type="text"
                placeholder="e.g. DA/2026/0001"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value.toUpperCase())}
                className="w-full rounded-2xl border-2 px-4 py-3.5 text-sm outline-none"
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
                Parent Linking Code
              </label>
              <input
                type="text"
                placeholder="4-digit code from login slip"
                value={linkingCode}
                onChange={(e) => setLinkingCode(e.target.value)}
                maxLength={6}
                className="w-full rounded-2xl border-2 px-4 py-3.5 text-sm outline-none tracking-widest text-center font-bold"
                style={{
                  borderColor: '#e5e7eb',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '20px',
                  color: '#0C3B2E',
                }}
                onFocus={(e) => e.target.style.borderColor = '#0C3B2E'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
              <p
                className="text-xs text-gray-400 text-center"
                style={{ fontFamily: 'Lora, serif' }}
              >
                Find this code on your child's login slip
              </p>
            </div>

            <button
              onClick={handleLink}
              disabled={isLoading || !regNumber || !linkingCode}
              className="w-full py-4 rounded-2xl text-sm font-bold transition-all mt-2"
              style={{
                backgroundColor: '#FFBA00',
                color: '#0C3B2E',
                fontFamily: 'Poppins, sans-serif',
                opacity: isLoading || !regNumber || !linkingCode ? 0.6 : 1,
              }}
            >
              {isLoading ? 'Linking...' : 'Link Child →'}
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-3 text-sm font-medium"
              style={{ color: '#9ca3af', fontFamily: 'Poppins, sans-serif' }}
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}