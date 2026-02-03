import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  subtitle?: string
}

export function StatsCard({ title, value, icon: Icon, subtitle }: StatsCardProps) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--text-muted)]">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">{value}</p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">{subtitle}</p>
          )}
        </div>
        <div className="rounded-lg bg-[var(--bg-tertiary)] p-3">
          <Icon className="h-6 w-6 text-[var(--accent)]" />
        </div>
      </div>
    </div>
  )
}
