import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Wallet, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { PageLayout } from '../../components/layout/PageLayout'
import { useAuthStore } from '../../store/authStore'
import { getChildById } from '../../services/parent.service'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '@schoolpilot/shared-utils'

interface FeeItem {
  id: string
  name: string
  amount: number
  term: { name: string; is_current: boolean } | null
}

interface Payment {
  id: string
  amount: number
  status: string
  paid_at: string | null
  fee_item: FeeItem | null
}

interface FeeStatus {
  feeItem: FeeItem
  payment: Payment | null
  isPaid: boolean
}

interface ChildInfo {
  id: string
  first_name: string
  last_name: string
  school_id: string
}

export const ParentFeeBalance = () => {
  const { childId } = useParams<{ childId: string }>()
  const navigate = useNavigate()
  const { parent } = useAuthStore()
  const [child, setChild] = useState<ChildInfo | null>(null)
  const [feeStatuses, setFeeStatuses] = useState<FeeStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [totalOwed, setTotalOwed] = useState(0)
  const [totalPaid, setTotalPaid] = useState(0)

  useEffect(() => {
    const load = async () => {
      if (!parent?.id || !childId) {
        setError('Missing student reference')
        setIsLoading(false)
        return
      }
      setIsLoading(true)
      setError('')
      try {
        const childData = await getChildById(parent.id, childId)
        setChild(childData)

        const { data: feeData, error: feeError } = await supabase
          .from('fee_items')
          .select('*, term:terms(name, is_current)')
          .eq('school_id', childData.school_id)

        if (feeError) throw feeError

        const { data: paymentData, error: paymentError } = await supabase
          .from('payments')
          .select('*, fee_item:fee_items(id, name, amount, term:terms(name, is_current))')
          .eq('student_id', childId)
          .eq('status', 'success')

        if (paymentError) throw paymentError

        const payments = (paymentData ?? []).map((p: any) => ({
          ...p,
          fee_item: Array.isArray(p.fee_item) ? p.fee_item[0] ?? null : p.fee_item,
        }))

        const fees = (feeData ?? []).map((f: any) => ({
          ...f,
          term: Array.isArray(f.term) ? f.term[0] ?? null : f.term,
        }))

        const statuses: FeeStatus[] = fees.map((fee: any) => {
          const payment = payments.find((p: any) => p.fee_item_id === fee.id) ?? null
          return { feeItem: fee, payment, isPaid: !!payment }
        })

        const owed = statuses.filter((s) => !s.isPaid).reduce((sum, s) => sum + s.feeItem.amount, 0)
        const paid = statuses.filter((s) => s.isPaid).reduce((sum, s) => sum + s.feeItem.amount, 0)

        setFeeStatuses(statuses)
        setTotalOwed(owed)
        setTotalPaid(paid)
      } catch (err: any) {
        setError(err.message || 'Failed to load fee information')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [parent?.id, childId])

  const currentFees = feeStatuses.filter((s) => s.feeItem.term?.is_current)
  const pendingFees = currentFees.filter((s) => !s.isPaid)
  const paidFees = currentFees.filter((s) => s.isPaid)

  return (
    <PageLayout title={child ? `${child.first_name}'s Fees` : 'Fee Balance'} showBack hideNav>
      <div className="px-5 py-4">

        {error && (
          <div
            className="mb-4 px-4 py-3 rounded-xl text-sm flex items-center justify-between gap-3"
            style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}
          >
            <span>{error}</span>
            <button onClick={() => navigate('/dashboard')} className="text-xs font-semibold underline shrink-0">
              Back to dashboard
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ backgroundColor: '#e5e7eb' }} />
            ))}
          </div>
        ) : error ? null : (
          <>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="rounded-2xl p-4" style={{ backgroundColor: '#0C3B2E' }}>
                <p className="text-xs mb-1" style={{ color: '#6D9773', fontFamily: 'Poppins, sans-serif' }}>
                  Outstanding
                </p>
                <p className="text-lg font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {formatCurrency(totalOwed)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <AlertCircle size={10} style={{ color: '#FFBA00' }} />
                  <p className="text-xs" style={{ color: '#FFBA00', fontFamily: 'Poppins, sans-serif' }}>
                    {pendingFees.length} pending
                  </p>
                </div>
              </div>

              <div className="rounded-2xl p-4" style={{ backgroundColor: '#f0f7f0' }}>
                <p className="text-xs mb-1" style={{ color: '#6D9773', fontFamily: 'Poppins, sans-serif' }}>
                  Total Paid
                </p>
                <p className="text-lg font-bold" style={{ color: '#0C3B2E', fontFamily: 'Poppins, sans-serif' }}>
                  {formatCurrency(totalPaid)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <CheckCircle size={10} style={{ color: '#16a34a' }} />
                  <p className="text-xs" style={{ color: '#16a34a', fontFamily: 'Poppins, sans-serif' }}>
                    {paidFees.length} cleared
                  </p>
                </div>
              </div>
            </div>

            {pendingFees.length > 0 && (
              <div className="mb-4">
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-3"
                  style={{ color: '#9ca3af', fontFamily: 'Poppins, sans-serif' }}
                >
                  Pending Payment
                </p>
                <div className="space-y-3">
                  {pendingFees.map((status) => (
                    <div
                      key={status.feeItem.id}
                      className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm"
                      style={{ border: '1px solid #fde68a' }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: '#fffbeb' }}
                      >
                        <Clock size={18} style={{ color: '#b08800' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {status.feeItem.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5" style={{ fontFamily: 'Lora, serif' }}>
                          {status.feeItem.term?.name}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold" style={{ color: '#0C3B2E', fontFamily: 'Poppins, sans-serif' }}>
                          {formatCurrency(status.feeItem.amount)}
                        </p>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ backgroundColor: '#fef9c3', color: '#b08800', fontFamily: 'Poppins, sans-serif' }}
                        >
                          Unpaid
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  className="mt-4 rounded-2xl p-4 flex items-center justify-between"
                  style={{ backgroundColor: '#0C3B2E' }}
                >
                  <div>
                    <p className="text-sm font-semibold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Ready to pay?
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#6D9773', fontFamily: 'Lora, serif' }}>
                      Payment integration coming soon
                    </p>
                  </div>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: '#FFBA00' }}
                  >
                    <Wallet size={18} style={{ color: '#0C3B2E' }} />
                  </div>
                </div>
              </div>
            )}

            {paidFees.length > 0 && (
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-3"
                  style={{ color: '#9ca3af', fontFamily: 'Poppins, sans-serif' }}
                >
                  Payment History
                </p>
                <div className="space-y-3">
                  {paidFees.map((status) => (
                    <div key={status.feeItem.id} className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: '#dcfce7' }}
                      >
                        <CheckCircle size={18} style={{ color: '#16a34a' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {status.feeItem.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5" style={{ fontFamily: 'Lora, serif' }}>
                          {status.payment?.paid_at
                            ? new Date(status.payment.paid_at).toLocaleDateString('en-NG', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })
                            : status.feeItem.term?.name}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold" style={{ color: '#0C3B2E', fontFamily: 'Poppins, sans-serif' }}>
                          {formatCurrency(status.feeItem.amount)}
                        </p>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ backgroundColor: '#dcfce7', color: '#16a34a', fontFamily: 'Poppins, sans-serif' }}
                        >
                          Paid
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {feeStatuses.length === 0 && (
              <div className="text-center py-16">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: '#fdf3e8' }}
                >
                  <Wallet size={28} style={{ color: '#BB8A52' }} />
                </div>
                <p className="font-semibold text-gray-900 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  No fees yet
                </p>
                <p className="text-sm text-gray-400" style={{ fontFamily: 'Lora, serif' }}>
                  Fee items will appear here once set up by the school
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </PageLayout>
  )
}