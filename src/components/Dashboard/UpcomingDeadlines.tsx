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
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--text-secondary)]">
        <Calendar className="h-4 w-4" />
        Upcoming deadlines
      </h3>
      <ul className="space-y-2">
        {withDue.length === 0 ? (
          <li className="text-sm text-[var(--text-muted)]">No upcoming deadlines</li>
        ) : (
          withDue.map((task) => (
            <li
              key={task.id}
              className={`flex items-center justify-between rounded-lg px-2 py-1.5 text-sm ${
                isOverdue(task.dueDate!) ? 'bg-[var(--error)]/10 text-[var(--error)]' : ''
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
