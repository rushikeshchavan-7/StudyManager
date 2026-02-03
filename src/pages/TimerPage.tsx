import { PomodoroTimer } from '@/components/Timer/PomodoroTimer'
import { TimeTracker } from '@/components/Timer/TimeTracker'

export function TimerPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <h1 className="text-xl font-semibold text-[var(--text-primary)]">Pomodoro Timer</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <PomodoroTimer />
        <TimeTracker task={null} />
      </div>
    </div>
  )
}
