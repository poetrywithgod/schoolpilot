import { PageWrapper } from '../../components/layout/PageWrapper'

export const AdminDashboard = () => {
  return (
    <PageWrapper title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Students', value: '0', color: 'bg-blue-50 text-blue-600' },
          { label: 'Total Staff', value: '0', color: 'bg-green-50 text-green-600' },
          { label: 'Fee Collection', value: '₦0', color: 'bg-yellow-50 text-yellow-600' },
          { label: 'Pending Results', value: '0', color: 'bg-purple-50 text-purple-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className={`inline-flex px-3 py-1 rounded-lg text-sm font-medium mb-3 ${stat.color}`}>
              {stat.label}
            </div>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>
    </PageWrapper>
  )
}