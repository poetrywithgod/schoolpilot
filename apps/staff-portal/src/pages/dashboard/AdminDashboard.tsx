import { useState, useEffect } from 'react'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { useAuthStore } from '../../store/authStore'
import { supabase } from '../../lib/supabase'

export const AdminDashboard = () => {
  const { user } = useAuthStore()
  const [stats, setStats] = useState({
    students: 0,
    staff: 0,
    feeCollection: 0,
    pendingResults: 0,
  })

  useEffect(() => {
    const loadStats = async () => {
      if (!user?.schoolId) return
      try {
        const [
          { count: studentCount },
          { count: staffCount },
          { data: payments },
        ] = await Promise.all([
          supabase
            .from('students')
            .select('*', { count: 'exact', head: true })
            .eq('school_id', user.schoolId)
            .eq('is_active', true),
          supabase
            .from('staff')
            .select('*', { count: 'exact', head: true })
            .eq('school_id', user.schoolId)
            .eq('is_active', true),
          supabase
            .from('payments')
            .select('amount')
            .eq('school_id', user.schoolId)
            .eq('status', 'success'),
        ])

        const totalFees = payments?.reduce((sum, p) => sum + p.amount, 0) ?? 0

        setStats({
          students: studentCount ?? 0,
          staff: staffCount ?? 0,
          feeCollection: totalFees,
          pendingResults: 0,
        })
      } catch (err) {
        console.error(err)
      }
    }
    loadStats()
  }, [user?.schoolId])

  return (
    <PageWrapper title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: 'Total Students',
            value: stats.students.toString(),
            color: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
            icon: '🎓',
          },
          {
            label: 'Total Staff',
            value: stats.staff.toString(),
            color: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400',
            icon: '👨‍🏫',
          },
          {
            label: 'Fee Collection',
            value: `₦${stats.feeCollection.toLocaleString()}`,
            color: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
            icon: '💰',
          },
          {
            label: 'Pending Results',
            value: stats.pendingResults.toString(),
            color: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
            icon: '📊',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-medium ${stat.color}`}>
                {stat.label}
              </span>
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </PageWrapper>
  )
}