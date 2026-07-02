import { useNavigate } from 'react-router-dom'
import { Header } from './Header'
import { BottomNav } from './BottomNav'

interface PageLayoutProps {
  title: string
  children: React.ReactNode
  showBack?: boolean
  hideNav?: boolean
  onBack?: () => void // Added optional custom back handler
}

export const PageLayout = ({ 
  title, 
  children, 
  showBack = false, // Default to false for better DX
  hideNav = false,  // Default to false
  onBack 
}: PageLayoutProps) => {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate(-1)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F5F5F0' }}>
      <Header 
        title={title} 
        showBack={showBack} 
        onBack={handleBack} 
      />
      <main 
        className="flex-1 overflow-y-auto px-4 py-4" // Added padding for better spacing
        style={{ 
          paddingBottom: hideNav ? '16px' : '80px',
          // Ensure content doesn't overlap with header
          paddingTop: '16px',
        }}
      >
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  )
}