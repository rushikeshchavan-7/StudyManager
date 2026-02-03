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
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
      {label && (
        <p className="mb-2 text-sm font-medium text-[var(--text-secondary)]">{label}</p>
      )}
      <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--bg-tertiary)]">
        <div
          className="h-full rounded-full bg-[var(--success)] transition-all duration-500"
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
