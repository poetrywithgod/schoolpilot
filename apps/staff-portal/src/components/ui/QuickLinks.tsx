import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { SectionTitle } from './SectionTitle'

export interface QuickLink {
  label: string
  description: string
  to: string
  icon: LucideIcon
}

export const QuickLinks = ({ title = 'Quick actions', links }: { title?: string; links: QuickLink[] }) => (
  <section className="mt-8">
    <SectionTitle>{title}</SectionTitle>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {links.map(({ label, description, to, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          className="group flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-4 transition-colors hover:border-sage/50 dark:border-sage/15 dark:bg-forest-light/20 dark:hover:border-sage/40"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest text-gold">
            <Icon size={18} />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-forest dark:text-white">{label}</span>
            <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">{description}</span>
          </span>
        </Link>
      ))}
    </div>
  </section>
)
