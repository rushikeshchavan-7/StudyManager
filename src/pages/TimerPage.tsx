import { useState } from 'react'
import { PomodoroTimer } from '@/components/Timer/PomodoroTimer'
import { TimeTracker } from '@/components/Timer/TimeTracker'
import { Select } from '@/components/Common/Select'
import { useTaskStore } from '@/store/taskStore'

export function TimerPage() {
  const tasks = useTaskStore((s) => s.tasks)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const selectedTask = selectedTaskId
    ? tasks.find((t) => t.id === selectedTaskId) ?? null
    : null

  const taskOptions = tasks.map((t) => ({ value: t.id, label: t.title || 'Untitled' }))

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-5 sm:px-6 sm:py-6">
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">Timer</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <PomodoroTimer />
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-5">
          <h3 className="mb-3 text-[var(--text-secondary)] font-medium">
            Select a task to track time
          </h3>
          {taskOptions.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">
              No tasks yet. Create a task from the Board to track time.
            </p>
          ) : (
            <>
              <Select
                value={selectedTaskId ?? ''}
                onValueChange={(id) => setSelectedTaskId(id || null)}
                options={taskOptions}
                placeholder="Choose a task…"
                aria-label="Select a task to track time"
                className="mb-4"
              />
              {selectedTask && <TimeTracker task={selectedTask} />}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
