import { PageLayout } from '../../components/layout/PageLayout'

export const ResultList = () => {
  return (
    <PageLayout title="My Results">
      <div className="px-5 py-4">
        <p style={{ fontFamily: 'Lora, serif', color: '#6b7280' }}>Loading results...</p>
      </div>
    </PageLayout>
  )
}