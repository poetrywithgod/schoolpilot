import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { BroadcastBanner } from './BroadcastBanner'

interface PageWrapperProps {
  title: string
  children: React.ReactNode
}

export const PageWrapper = ({ title, children }: PageWrapperProps) => {
  return (
    <div className="flex min-h-screen bg-offwhite transition-colors dark:bg-forest-dark">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={title} />
        <BroadcastBanner />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
