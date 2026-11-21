import { Wallet, Megaphone, LifeBuoy } from 'lucide-react'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { useAuthStore } from '../../store/authStore'
import { StatCard } from '../../components/ui/StatCard'
import { QuickLinks } from '../../components/ui/QuickLinks'

export const BursarDashboard = () => {
  const { user } = useAuthStore()

  return (
    <PageWrapper title="Dashboard">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-forest dark:text-white">
          Welcome back{user?.firstName ? `, ${user.firstName}` : ''}
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Fee collection overview.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard hero label="Total Collected" value="₦0" sub="Successful payments" />
        <StatCard label="Outstanding" value="₦0" sub="Unpaid balances" accent="#ef4444" />
        <StatCard label="Transactions Today" value="0" sub="Payments received today" />
      </div>

      <QuickLinks
        links={[
          { label: 'Payments', description: 'Review and record payments', to: '/payments', icon: Wallet },
          { label: 'Announcements', description: 'Read school notices', to: '/announcements', icon: Megaphone },
          { label: 'Support', description: 'Contact SchoolPilot support', to: '/support', icon: LifeBuoy },
        ]}
      />
    </PageWrapper>
  )
}
