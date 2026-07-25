import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { BroadcastBanner } from './BroadcastBanner'

interface PageWrapperProps {
  title: string
  children: React.ReactNode
}

export const PageWrapper = ({ title, children }: PageWrapperProps) => {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar title={title} />
        <BroadcastBanner />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
