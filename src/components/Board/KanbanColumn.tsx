import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { TaskCard } from '@/components/Task/TaskCard'
import type { Task, TaskStatus } from '@/types/task'

interface KanbanColumnProps {
  status: TaskStatus
  tasks: Task[]
  onEditTask: (task: Task) => void
}

export function KanbanColumn({ status, tasks, onEditTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div
      ref={setNodeRef}
      className={`flex min-w-[280px] flex-1 flex-col rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-3 transition-colors ${isOver ? 'ring-2 ring-[var(--accent)]' : ''}`}
    >
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
        {status}
        <span className="ml-2 rounded-full bg-[var(--bg-tertiary)] px-2 py-0.5 text-xs">
          {tasks.length}
        </span>
      </h2>
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
