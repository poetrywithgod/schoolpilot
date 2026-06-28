import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export const ChangePin = () => {
  const navigate = useNavigate()
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = async () => {
    if (newPin !== confirmPin) {
      setError('PINs do not match')
      return
    }
    if (newPin.length < 4) {
      setError('PIN must be at least 4 characters')
      return
    }
    setIsLoading(true)
    setError('')
    try {
      const { error } = await supabase.auth.updateUser({ password: newPin })
      if (error) throw error
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F5F5F0' }}>
      <div className="px-6 pt-16 pb-10" style={{ backgroundColor: '#0C3B2E' }}>
        <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Change Your PIN 🔐
        </h1>
        <p className="text-sm" style={{ color: '#6D9773', fontFamily: 'Lora, serif' }}>
          This is your first login. Please set a new PIN to secure your account.
        </p>
      </div>

      <div className="flex-1 px-6 -mt-4">
        <div className="bg-white rounded-3xl shadow-sm p-6">

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}>
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#0C3B2E', fontFamily: 'Poppins, sans-serif' }}>
                New PIN
              </label>
              <input
                type="password"
                placeholder="Enter new PIN"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                className="w-full rounded-2xl border-2 px-4 py-3.5 text-sm outline-none"
                style={{ borderColor: '#e5e7eb', fontFamily: 'Poppins, sans-serif' }}
                onFocus={(e) => e.target.style.borderColor = '#0C3B2E'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#0C3B2E', fontFamily: 'Poppins, sans-serif' }}>
                Confirm PIN
              </label>
              <input
                type="password"
                placeholder="Confirm new PIN"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                className="w-full rounded-2xl border-2 px-4 py-3.5 text-sm outline-none"
                style={{ borderColor: '#e5e7eb', fontFamily: 'Poppins, sans-serif' }}
                onFocus={(e) => e.target.style.borderColor = '#0C3B2E'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <button
              onClick={handleChange}
              disabled={isLoading || !newPin || !confirmPin}
              className="w-full py-4 rounded-2xl text-sm font-bold transition-all mt-2"
              style={{
                backgroundColor: '#FFBA00',
                color: '#0C3B2E',
                fontFamily: 'Poppins, sans-serif',
                opacity: isLoading || !newPin || !confirmPin ? 0.6 : 1,
              }}
            >
              {isLoading ? 'Saving...' : 'Set New PIN →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}