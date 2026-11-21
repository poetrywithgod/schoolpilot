interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  /** Hero cards are solid forest with a gold value, like the super-admin KPIs */
  hero?: boolean
  /** Colour of the sub-text, defaults to sage */
  accent?: string
}

export const StatCard = ({ label, value, sub, hero, accent }: StatCardProps) => (
  <div
    className={`flex flex-col gap-3 rounded-2xl border p-5 transition-colors ${
      hero
        ? 'border-sage/15 bg-forest'
        : 'border-gray-200 bg-white dark:border-sage/15 dark:bg-forest-light/20'
    }`}
  >
    <p className="text-xs font-semibold uppercase tracking-wider text-sage">{label}</p>
    <p
      className={`font-heading text-3xl font-black count-up ${
        hero ? 'text-gold' : 'text-forest dark:text-white'
      }`}
    >
      {value}
    </p>
    {sub && (
      <p className="text-xs" style={{ color: accent ?? '#6D9773' }}>
        {sub}
      </p>
    )}
  </div>
)
