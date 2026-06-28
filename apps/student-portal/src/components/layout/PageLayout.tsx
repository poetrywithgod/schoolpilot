import { useNavigate } from 'react-router-dom'
import { Header } from './Header'
import { BottomNav } from './BottomNav'

interface PageLayoutProps {
  title: string
  children: React.ReactNode
  showBack?: boolean
  hideNav?: boolean
}

export const PageLayout = ({ title, children, showBack, hideNav }: PageLayoutProps) => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F5F5F0' }}>
      <Header title={title} showBack={showBack} onBack={() => navigate(-1)} />
      <main className="flex-1 overflow-y-auto" style={{ paddingBottom: hideNav ? '16px' : '80px' }}>
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  )
}