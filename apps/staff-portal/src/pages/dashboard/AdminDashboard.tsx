import { useState, useEffect } from 'react'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { useAuthStore } from '../../store/authStore'
import { supabase } from '../../lib/supabase'
import { StatCard } from '../../components/ui/StatCard'
import { QuickLinks } from '../../components/ui/QuickLinks'
import { UserPlus, ClipboardCheck, BarChart3, Wallet } from 'lucide-react'

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
      <div className="mb-6">
        <h2 className="text-xl font-bold text-forest dark:text-white">
          Welcome back{user?.firstName ? `, ${user.firstName}` : ''}
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Here is how your school is doing today.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard hero label="Total Students" value={stats.students.toLocaleString()} sub="Active enrolments" />
        <StatCard label="Total Staff" value={stats.staff.toLocaleString()} sub="Active staff accounts" />
        <StatCard
          label="Fee Collection"
          value={`₦${stats.feeCollection.toLocaleString()}`}
          sub="Successful payments"
          accent="#BB8A52"
        />
        <StatCard label="Pending Results" value={stats.pendingResults.toLocaleString()} sub="Awaiting score entry" />
      </div>

      <QuickLinks
        links={[
          { label: 'Add a student', description: 'Enrol a new student', to: '/students/create', icon: UserPlus },
          { label: 'Mark attendance', description: 'Record today\'s register', to: '/attendance', icon: ClipboardCheck },
          { label: 'Enter scores', description: 'Record term assessments', to: '/results', icon: BarChart3 },
          { label: 'Fee tracker', description: 'Review payments', to: '/payments', icon: Wallet },
        ]}
      />
    </PageWrapper>
  )
}
