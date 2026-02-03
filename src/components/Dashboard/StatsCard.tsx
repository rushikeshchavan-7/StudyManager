import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  subtitle?: string
}

export function StatsCard({ title, value, icon: Icon, subtitle }: StatsCardProps) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-5 shadow-[var(--shadow-sm)]">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--text-muted)]">{title}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-[var(--text-primary)]">{value}</p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">{subtitle}</p>
          )}
        </div>
        <div className="shrink-0 rounded-[var(--radius)] bg-[var(--accent-muted)] p-3">
          <Icon className="h-6 w-6 text-[var(--accent)]" />
        </div>
      </div>
    </div>
  )
}
