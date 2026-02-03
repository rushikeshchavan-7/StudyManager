/**
 * Simple completion rate bar and optional text summary.
 */

interface ProgressChartProps {
  completed: number
  total: number
  label?: string
}

export function ProgressChart({ completed, total, label }: ProgressChartProps) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-5 shadow-[var(--shadow-sm)]">
      {label && (
        <p className="mb-3 text-sm font-medium text-[var(--text-secondary)]">{label}</p>
      )}
      <div className="h-2.5 w-full overflow-hidden rounded-[var(--radius-full)] bg-[var(--bg-tertiary)]">
        <div
          className="h-full rounded-[var(--radius-full)] bg-[var(--success)] transition-all duration-500"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <p className="mt-2 text-sm text-[var(--text-muted)]">
        {completed} / {total} tasks ({pct}%)
      </p>
    </div>
  )
}
