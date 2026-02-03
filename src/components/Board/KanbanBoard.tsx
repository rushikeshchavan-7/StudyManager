import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { useState } from 'react'
import { KanbanColumn } from './KanbanColumn'
import { TaskCard } from '@/components/Task/TaskCard'
import type { Task, TaskStatus } from '@/types/task'
import { TASK_STATUSES } from '@/utils/constants'
import { useTasks } from '@/hooks/useTasks'

interface KanbanBoardProps {
  tasks: Task[]
  onEditTask: (task: Task) => void
}

export function KanbanBoard({ tasks, onEditTask }: KanbanBoardProps) {
  const { moveTask, getTaskById } = useTasks()
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const tasksByStatus = (status: TaskStatus) =>
    tasks.filter((t) => t.status === status)

  const handleDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id))
  const handleDragEnd = (e: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = e
    if (!over) return
    const taskId = String(active.id)
    const overId = String(over.id)
    const task = getTaskById(taskId)
    if (!task) return
    if (TASK_STATUSES.includes(overId as TaskStatus)) {
      if (task.status !== overId) moveTask(taskId, overId as TaskStatus)
    } else {
      const overTask = getTaskById(overId)
      if (overTask && overTask.status !== task.status) {
        moveTask(taskId, overTask.status)
      }
    }
  }

  const activeTask = activeId ? getTaskById(activeId) : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        {TASK_STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasksByStatus(status)}
            onEditTask={onEditTask}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="cursor-grabbing opacity-90">
            <TaskCard task={activeTask} isSortable={false} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
