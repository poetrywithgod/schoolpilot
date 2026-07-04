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
      Building this now...
    </p>
  </div>
)

export const Dashboard = () => <ComingSoon title="Dashboard" />
