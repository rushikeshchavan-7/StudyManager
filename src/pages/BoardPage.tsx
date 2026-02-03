import { useState } from 'react'
import { KanbanBoard } from '@/components/Board/KanbanBoard'
import { ListView } from '@/components/Board/ListView'
import { CalendarView } from '@/components/Board/CalendarView'
import { TaskModal } from '@/components/Task/TaskModal'
import { useTasks } from '@/hooks/useTasks'
import { useFilteredTasks } from '@/hooks/useFilters'
import { useFilterStore } from '@/store/filterStore'
import { useUIStore } from '@/store/uiStore'
import type { Task } from '@/types/task'

export function BoardPage() {
  const { tasks, createTask, editTask, removeTask } = useTasks()
  const { filter } = useFilterStore()
  const { viewMode, hideCompleted, showHighPriorityOnly, fullCreateModalOpen, setFullCreateModalOpen } = useUIStore()
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)

  let filtered = useFilteredTasks(tasks, filter)
  if (hideCompleted) filtered = filtered.filter((t) => t.status !== 'Done')
  if (showHighPriorityOnly) filtered = filtered.filter((t) => t.priority === 'High' || t.priority === 'Urgent')

  const handleEdit = (task: Task) => {
    setSelectedTask(task)
    setEditModalOpen(true)
  }

  const handleSave = async (id: string, data: Partial<Task>) => {
    await editTask(id, data)
    setSelectedTask((prev) => (prev?.id === id ? { ...prev, ...data } : prev))
  }

  const handleCreate = async (data: Partial<Task>) => {
    const created = await createTask(data)
    setFullCreateModalOpen(false)
    return created
  }

  const taskModalOpen = fullCreateModalOpen || editModalOpen
  const taskModalTask = fullCreateModalOpen ? null : selectedTask

  const handleModalOpenChange = (open: boolean) => {
    if (!open) {
      setFullCreateModalOpen(false)
      setEditModalOpen(false)
      setSelectedTask(null)
    }
  }

  return (
    <div className="flex flex-1 flex-col p-4">
      {viewMode === 'kanban' && <KanbanBoard tasks={filtered} onEditTask={handleEdit} />}
      {viewMode === 'list' && <ListView tasks={filtered} onEditTask={handleEdit} />}
      {viewMode === 'calendar' && <CalendarView tasks={filtered} onEditTask={handleEdit} />}
      <TaskModal
        open={taskModalOpen}
        onOpenChange={handleModalOpenChange}
        task={taskModalTask}
        onSave={handleSave}
        onCreate={handleCreate}
        onDelete={removeTask}
      />
    </div>
  )
}
