import { Calendar } from 'lucide-react'
import type { Task } from '@/types/task'
import { formatRelativeDate, isOverdue } from '@/lib/dateUtils'

interface UpcomingDeadlinesProps {
  tasks: Task[]
  limit?: number
}

export function UpcomingDeadlines({ tasks, limit = 5 }: UpcomingDeadlinesProps) {
  const withDue = tasks
    .filter((t) => t.dueDate && t.status !== 'Done')
    .sort((a, b) => (a.dueDate! > b.dueDate! ? 1 : -1))
    .slice(0, limit)

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-5 shadow-[var(--shadow-sm)]">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[var(--text-secondary)]">
        <Calendar className="h-4 w-4" />
        Upcoming deadlines
      </h3>
      <ul className="space-y-1">
        {withDue.length === 0 ? (
          <li className="py-2 text-[var(--text-muted)]">No upcoming deadlines</li>
        ) : (
          withDue.map((task) => (
            <li
              key={task.id}
              className={`flex min-h-[44px] items-center justify-between rounded-[var(--radius-sm)] px-3 py-2 text-[var(--text-primary)] ${
                isOverdue(task.dueDate!) ? 'bg-[var(--error)]/10 text-[var(--error)]' : 'hover:bg-[var(--bg-tertiary)]'
              }`}
            >
              <span className="truncate text-[var(--text-primary)]">{task.title}</span>
              <span className="ml-2 shrink-0 text-[var(--text-muted)]">
                {formatRelativeDate(task.dueDate!)}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
