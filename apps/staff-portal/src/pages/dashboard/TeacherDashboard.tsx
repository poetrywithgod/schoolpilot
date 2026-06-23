import { PageWrapper } from '../../components/layout/PageWrapper'

export const TeacherDashboard = () => {
  return (
    <PageWrapper title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'My Classes', value: '0', color: 'bg-blue-50 text-blue-600' },
          { label: 'Pending Scores', value: '0', color: 'bg-yellow-50 text-yellow-600' },
          { label: 'Published Results', value: '0', color: 'bg-green-50 text-green-600' },
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