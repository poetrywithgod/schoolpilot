import { ClipboardCheck, BarChart3, GraduationCap, Megaphone } from 'lucide-react'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { useAuthStore } from '../../store/authStore'
import { StatCard } from '../../components/ui/StatCard'
import { QuickLinks } from '../../components/ui/QuickLinks'

export const TeacherDashboard = () => {
  const { user } = useAuthStore()

  return (
    <PageWrapper title="Dashboard">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-forest dark:text-white">
          Welcome back{user?.firstName ? `, ${user.firstName}` : ''}
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Your classes at a glance.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard hero label="My Classes" value="0" sub="Assigned this term" />
        <StatCard label="Pending Scores" value="0" sub="Awaiting entry" accent="#BB8A52" />
        <StatCard label="Published Results" value="0" sub="Visible to parents" />
      </div>

      <QuickLinks
        links={[
          { label: 'Mark attendance', description: "Record today's register", to: '/attendance', icon: ClipboardCheck },
          { label: 'Enter scores', description: 'Record term assessments', to: '/results', icon: BarChart3 },
          { label: 'Students', description: 'Browse your students', to: '/students', icon: GraduationCap },
          { label: 'Announcements', description: 'Read school notices', to: '/announcements', icon: Megaphone },
        ]}
      />
    </PageWrapper>
  )
}
