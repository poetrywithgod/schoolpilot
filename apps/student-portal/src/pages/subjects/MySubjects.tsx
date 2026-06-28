import { PageLayout } from '../../components/layout/PageLayout'

export const MySubjects = () => {
  return (
    <PageLayout title="My Subjects">
      <div className="px-5 py-4">
        <p style={{ fontFamily: 'Lora, serif', color: '#6b7280' }}>Loading subjects...</p>
      </div>
    </PageLayout>
  )
}