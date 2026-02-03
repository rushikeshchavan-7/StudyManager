import { Calendar, Clock, Tag } from 'lucide-react'
import type { Task } from '@/types/task'
import { formatDisplayDate } from '@/lib/dateUtils'

interface ListViewProps {
  tasks: Task[]
  onEditTask: (task: Task) => void
}

export function ListView({ tasks, onEditTask }: ListViewProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
      <table className="w-full text-left text-sm" role="table">
        <thead>
          <tr className="border-b border-[var(--border)] bg-[var(--bg-secondary)]">
            <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Title</th>
            <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Status</th>
            <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Priority</th>
            <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Due</th>
            <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Est.</th>
            <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Tags</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr
              key={task.id}
              className="cursor-pointer border-b border-[var(--border)] hover:bg-[var(--bg-secondary)]"
              onClick={() => onEditTask(task)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onEditTask(task)
                }
              }}
              tabIndex={0}
              role="button"
            >
              <td className="px-4 py-3">
                <span className="font-medium text-[var(--text-primary)]">{task.title}</span>
                {task.description && (
                  <p className="truncate max-w-xs text-[var(--text-muted)]">{task.description}</p>
                )}
              </td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{task.status}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{task.priority}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">
                {task.dueDate ? (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDisplayDate(task.dueDate, true)}
                  </span>
                ) : (
                  '—'
                )}
              </td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">
                {task.estimatedHours > 0 ? (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {task.estimatedHours}h
                  </span>
                ) : (
                  '—'
                )}
              </td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">
                {task.tags.length > 0 ? (
                  <span className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {task.tags.join(', ')}
                  </span>
                ) : (
                  '—'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {tasks.length === 0 && (
        <div className="py-12 text-center text-[var(--text-muted)]">
          No tasks match your filters.
        </div>
      )}
    </div>
  )
}
