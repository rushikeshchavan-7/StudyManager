import { useMemo } from 'react'
import { CheckCircle, Target, Clock } from 'lucide-react'
import { StatsCard } from '@/components/Dashboard/StatsCard'
import { ProgressChart } from '@/components/Dashboard/ProgressChart'
import { UpcomingDeadlines } from '@/components/Dashboard/UpcomingDeadlines'
import { useTasks } from '@/hooks/useTasks'
import { useUIStore } from '@/store/uiStore'
import { getWeekRange, getMonthRange, isDateInRange, parseDate } from '@/lib/dateUtils'

export function DashboardPage() {
  const { tasks } = useTasks()
  const { goals } = useUIStore()

  const stats = useMemo(() => {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const week = getWeekRange()
    const month = getMonthRange()

    const completedToday = tasks.filter(
      (t) => t.status === 'Done' && t.completedAt && new Date(t.completedAt).getTime() >= todayStart
    ).length
    const completedThisWeek = tasks.filter(
      (t) =>
        t.status === 'Done' &&
        t.completedAt &&
        isDateInRange(parseDate(t.completedAt), week)
    ).length
    const completedThisMonth = tasks.filter(
      (t) =>
        t.status === 'Done' &&
        t.completedAt &&
        isDateInRange(parseDate(t.completedAt), month)
    ).length
    const totalDone = tasks.filter((t) => t.status === 'Done').length
    const totalHours = tasks.reduce((acc, t) => acc + (t.actualHours || 0), 0)

    return {
      completedToday,
      completedThisWeek,
      completedThisMonth,
      totalDone,
      totalHours,
      total: tasks.length,
    }
  }, [tasks])

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <h1 className="text-xl font-semibold text-[var(--text-primary)]">Progress Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Completed today" value={stats.completedToday} icon={CheckCircle} />
        <StatsCard title="This week" value={stats.completedThisWeek} icon={Target} />
        <StatsCard title="Total time (hours)" value={stats.totalHours.toFixed(1)} icon={Clock} />
        <StatsCard title="Total completed" value={stats.totalDone} icon={CheckCircle} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <ProgressChart
          completed={stats.completedToday}
          total={goals.daily}
          label="Daily goal"
        />
        <ProgressChart
          completed={stats.completedThisWeek}
          total={goals.weekly}
          label="Weekly goal"
        />
      </div>
      <UpcomingDeadlines tasks={tasks} limit={8} />
    </div>
  )
}
