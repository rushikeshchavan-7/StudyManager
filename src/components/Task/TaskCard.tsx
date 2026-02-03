import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, Clock, Tag, GripVertical } from 'lucide-react'
import type { Task } from '@/types/task'
import { formatRelativeDate } from '@/lib/dateUtils'
import { STATUS_COLORS_LIGHT, STATUS_COLORS_DARK } from '@/utils/constants'
import { useUIStore } from '@/store/uiStore'

interface TaskCardProps {
  task: Task
  onEdit?: (task: Task) => void
  isSortable?: boolean
}

const priorityColors: Record<Task['priority'], string> = {
  Low: 'bg-slate-500',
  Medium: 'bg-blue-500',
  High: 'bg-amber-500',
  Urgent: 'bg-red-500',
}

export function TaskCard({ task, onEdit, isSortable = true }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    disabled: !isSortable,
  })

  const darkMode = useUIStore((s) => s.darkMode)
  const statusBorder = (darkMode ? STATUS_COLORS_DARK : STATUS_COLORS_LIGHT)[task.status].border
  const style = transform
    ? { transform: CSS.Transform.toString(transform), transition }
    : {}

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        borderLeft: `3px solid ${statusBorder}`,
      }}
      className={`
        group rounded-[var(--radius)] border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-3.5 shadow-[var(--shadow-sm)]
        hover:border-[var(--border)] hover:shadow-[var(--shadow)]
        ${isDragging ? 'opacity-60 shadow-[var(--shadow-lg)]' : ''}
      `}
      role="button"
      tabIndex={0}
      onClick={() => onEdit?.(task)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onEdit?.(task)
        }
      }}
      aria-label={`Task: ${task.title}`}
    >
      <div className="flex items-start gap-2">
        {isSortable && (
          <button
            type="button"
            className="touch-none cursor-grab rounded-[var(--radius-sm)] p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] active:cursor-grabbing"
            aria-label="Drag to reorder"
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${priorityColors[task.priority]}`}
              aria-hidden
            />
            <h3 className="truncate font-medium text-[var(--text-primary)]">{task.title}</h3>
          </div>
          {task.description && (
            <p className="mt-1 line-clamp-2 text-sm text-[var(--text-secondary)]">
              {task.description}
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)]">
            {task.dueDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatRelativeDate(task.dueDate)}
              </span>
            )}
            {(task.estimatedHours > 0 || task.actualHours > 0) && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {task.actualHours > 0 ? `${task.actualHours}h` : ''}
                {task.actualHours > 0 && task.estimatedHours > 0 ? ' / ' : ''}
                {task.estimatedHours > 0 ? `${task.estimatedHours}h` : ''}
              </span>
            )}
            {task.tags.length > 0 && (
              <span className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {task.tags.slice(0, 3).join(', ')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
