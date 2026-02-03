import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { TaskCard } from '@/components/Task/TaskCard'
import { STATUS_COLORS_LIGHT, STATUS_COLORS_DARK } from '@/utils/constants'
import { useUIStore } from '@/store/uiStore'
import type { Task, TaskStatus } from '@/types/task'

interface KanbanColumnProps {
  status: TaskStatus
  tasks: Task[]
  onEditTask: (task: Task) => void
}

export function KanbanColumn({ status, tasks, onEditTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  const darkMode = useUIStore((s) => s.darkMode)
  const colors = (darkMode ? STATUS_COLORS_DARK : STATUS_COLORS_LIGHT)[status]

  return (
    <div
      ref={setNodeRef}
      style={{ background: colors.tint }}
      className={`flex min-w-[260px] flex-1 flex-col rounded-[var(--radius-lg)] border border-[var(--border-subtle)] p-3.5 transition-colors sm:min-w-[280px] ${isOver ? 'ring-2 ring-[var(--accent)] ring-offset-2' : ''}`}
    >
      <div
        style={{ background: colors.gradient }}
        className="mb-3 flex items-center justify-between rounded-[var(--radius)] px-3 py-2 shadow-[var(--shadow-sm)]"
      >
        <h2 className="text-sm font-semibold tracking-wide text-[var(--text-primary)]">
          {status}
        </h2>
        <span
          className={`rounded-[var(--radius-full)] px-2 py-0.5 text-xs font-medium ${darkMode ? 'bg-white/15 text-white/95' : 'bg-black/8 text-[var(--text-secondary)]'}`}
        >
          {tasks.length}
        </span>
      </div>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={onEditTask} />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}
