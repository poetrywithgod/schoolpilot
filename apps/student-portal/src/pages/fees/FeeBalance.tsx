import { PageLayout } from '../../components/layout/PageLayout'

export const FeeBalance = () => {
  return (
    <PageLayout title="Fee Balance">
      <div className="px-5 py-4">
        <p style={{ fontFamily: 'Lora, serif', color: '#6b7280' }}>Loading fees...</p>
      </div>
    </PageLayout>
  )
}