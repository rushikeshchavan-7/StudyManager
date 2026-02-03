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
  getDay,
} from 'date-fns'
import type { Task } from '@/types/task'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'

/** Priority accent for calendar task pills (works in light and dark) */
const PRIORITY_BORDER: Record<Task['priority'], string> = {
  Low: 'border-l-slate-400 dark:border-l-slate-500',
  Medium: 'border-l-blue-500 dark:border-l-blue-400',
  High: 'border-l-amber-500 dark:border-l-amber-400',
  Urgent: 'border-l-red-500 dark:border-l-red-400',
}

interface CalendarViewProps {
  tasks: Task[]
  onEditTask: (task: Task) => void
}

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

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

  const isWeekend = (date: Date) => {
    const d = getDay(date)
    return d === 0 || d === 6
  }

  const maxVisibleTasks = 4

  return (
    <div className="flex flex-1 flex-col rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] shadow-[var(--shadow-sm)] overflow-hidden">
      {/* Header: responsive for mobile and desktop */}
      <div className="flex flex-col gap-3 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
        <h2 className="text-base font-semibold text-[var(--text-primary)] sm:text-lg md:text-xl">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="flex min-h-[var(--tap)] min-w-[var(--tap)] items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] active:bg-[var(--border-subtle)]"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5 sm:h-5 sm:w-5" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="flex min-h-[var(--tap)] min-w-[var(--tap)] items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] active:bg-[var(--border-subtle)]"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5 sm:h-5 sm:w-5" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentMonth(new Date())}
            className="ml-1 flex min-h-[var(--tap)] items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--accent-muted)] px-3 py-2 text-sm font-medium text-[var(--accent)] transition-colors hover:bg-[var(--accent)] hover:text-white active:opacity-90 sm:px-4"
          >
            <CalendarIcon className="h-4 w-4 shrink-0" aria-hidden />
            <span>Today</span>
          </button>
        </div>
      </div>

      {/* Calendar grid: scroll horizontally on very small screens */}
      <div className="overflow-x-auto">
        <div
          className="grid min-w-[320px] grid-cols-7 gap-px border-b border-[var(--border-subtle)] bg-[var(--border-subtle)]"
          style={{ width: 'max(100%, 320px)' }}
        >
          {/* Weekday headers */}
          {WEEK_DAYS.map((d) => (
            <div
              key={d}
              className="sticky top-0 z-10 bg-[var(--bg-tertiary)] px-1 py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] sm:px-2 sm:py-2.5 sm:text-xs"
            >
              {d}
            </div>
          ))}
          {/* Day cells */}
          {days.map((date) => {
            const dayTasks = getTasksForDay(date)
            const isCurrentMonth = isSameMonth(date, currentMonth)
            const isToday = isSameDay(date, new Date())
            const weekend = isWeekend(date)

            return (
              <div
                key={date.toISOString()}
                className={`
                  min-h-[72px] bg-[var(--bg-primary)] p-1.5 sm:min-h-[96px] sm:p-2
                  lg:min-h-[120px] lg:p-2.5
                  ${!isCurrentMonth ? 'opacity-45' : ''}
                  ${weekend && isCurrentMonth ? 'bg-[var(--bg-secondary)]' : ''}
                `}
              >
                {/* Date number */}
                <div
                  className={`
                    mb-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium sm:h-7 sm:w-7 sm:text-sm
                    ${isToday
                      ? 'bg-[var(--accent)] font-bold text-white shadow-[var(--shadow-sm)]'
                      : 'text-[var(--text-secondary)]'}
                    ${!isCurrentMonth ? 'text-[var(--text-muted)]' : ''}
                  `}
                >
                  {format(date, 'd')}
                </div>
                {/* Task list */}
                <div className="space-y-1 overflow-hidden">
                  {dayTasks.slice(0, maxVisibleTasks).map((task) => (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => onEditTask(task)}
                      className={`
                        block w-full truncate rounded-r px-2 py-1.5 text-left text-[10px] font-medium text-[var(--text-primary)]
                        border-l-2 bg-[var(--bg-tertiary)] transition-colors
                        hover:bg-[var(--border-subtle)] active:bg-[var(--border)]
                        sm:text-xs
                        ${PRIORITY_BORDER[task.priority]}
                      `}
                      title={task.title}
                    >
                      {task.title}
                    </button>
                  ))}
                  {dayTasks.length > maxVisibleTasks && (
                    <span className="block px-2 py-0.5 text-[10px] text-[var(--text-muted)] sm:text-xs">
                      +{dayTasks.length - maxVisibleTasks} more
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
