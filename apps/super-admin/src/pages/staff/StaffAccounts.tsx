// Temporary placeholder component used while each page is being built.
// Replace each export with the real page component as we build them out.

const ComingSoon = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-96 text-center">
    <div
      className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4"
      style={{ backgroundColor: 'rgba(255,186,0,0.1)' }}
    >
      🚧
    </div>
    <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {title}
    </h2>
    <p className="text-sm" style={{ color: '#6D9773', fontFamily: 'Lora, serif' }}>
      This page is being built
    </p>
  </div>
)

export const Schools = () => <ComingSoon title="Schools" />
export const SchoolDetail = () => <ComingSoon title="School Detail" />
export const Subscriptions = () => <ComingSoon title="Subscriptions" />
export const SupportTickets = () => <ComingSoon title="Support Tickets" />
export const TicketDetail = () => <ComingSoon title="Ticket Detail" />
export const OnboardingPipeline = () => <ComingSoon title="Onboarding Pipeline" />
export const StaffAccounts = () => <ComingSoon title="Staff Accounts" />
export const Broadcasts = () => <ComingSoon title="Broadcasts" />
export const AuditLogs = () => <ComingSoon title="Audit Logs" />
export const Settings = () => <ComingSoon title="Settings" />
