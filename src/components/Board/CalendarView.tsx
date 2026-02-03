import { useState } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  addDays,
} from 'date-fns'
import type { Task } from '@/types/task'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CalendarViewProps {
  tasks: Task[]
  onEditTask: (task: Task) => void
}

export function CalendarView({ tasks, onEditTask }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)

  const days: Date[] = []
  let day = calendarStart
  while (day <= calendarEnd) {
    days.push(day)
    day = addDays(day, 1)
  }

  const tasksByDueDate = new Map<string, Task[]>()
  for (const task of tasks) {
    if (!task.dueDate) continue
    const key = task.dueDate
    if (!tasksByDueDate.has(key)) tasksByDueDate.set(key, [])
    tasksByDueDate.get(key)!.push(task)
  }

  const getTasksForDay = (date: Date) => {
    const key = format(date, 'yyyy-MM-dd')
    return tasksByDueDate.get(key) ?? []
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="flex flex-1 flex-col rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentMonth(new Date())}
            className="rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
          >
            Today
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-[var(--radius)] border border-[var(--border-subtle)] bg-[var(--border-subtle)]">
        {weekDays.map((d) => (
          <div
            key={d}
            className="bg-[var(--bg-tertiary)] px-2 py-2 text-center text-xs font-medium text-[var(--text-muted)]"
          >
            {d}
          </div>
        ))}
        {days.map((date) => {
          const dayTasks = getTasksForDay(date)
          const isCurrentMonth = isSameMonth(date, currentMonth)
          const isToday = isSameDay(date, new Date())

          return (
            <div
              key={date.toISOString()}
              className={`min-h-[100px] bg-[var(--bg-primary)] p-2 ${!isCurrentMonth ? 'opacity-50' : ''}`}
            >
              <div
                className={`mb-1 text-sm ${isToday ? 'font-bold text-[var(--accent)]' : 'text-[var(--text-secondary)]'}`}
              >
                {format(date, 'd')}
              </div>
              <div className="space-y-1">
                {dayTasks.slice(0, 3).map((task) => (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => onEditTask(task)}
                    className="block w-full truncate rounded px-2 py-1 text-left text-xs text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                    title={task.title}
                  >
                    {task.title}
                  </button>
                ))}
                {dayTasks.length > 3 && (
                  <span className="px-2 text-xs text-[var(--text-muted)]">
                    +{dayTasks.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
