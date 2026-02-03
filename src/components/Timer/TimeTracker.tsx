/**
 * Placeholder for per-task time tracking. Can be extended to log time to tasks.
 */

import type { Task } from '@/types/task'

interface TimeTrackerProps {
  task: Task | null
  onUpdateActualHours?: (taskId: string, hours: number) => void
}

export function TimeTracker({ task }: TimeTrackerProps) {
  if (!task) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 text-[var(--text-muted)]">
        Select a task to track time
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
      <h3 className="text-sm font-semibold text-[var(--text-primary)]">{task.title}</h3>
      <p className="mt-1 text-sm text-[var(--text-muted)]">
        Estimated: {task.estimatedHours}h · Actual: {task.actualHours}h
      </p>
    </div>
  )
}
