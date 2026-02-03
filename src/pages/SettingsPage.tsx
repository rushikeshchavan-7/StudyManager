import { useUIStore } from '@/store/uiStore'
import { Input } from '@/components/Common/Input'
import * as Switch from '@radix-ui/react-switch'

export function SettingsPage() {
  const {
    darkMode,
    setDarkMode,
    goals,
    setGoals,
    hideCompleted,
    setHideCompleted,
    showHighPriorityOnly,
    setShowHighPriorityOnly,
  } = useUIStore()

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-5 sm:px-6 sm:py-6">
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">Settings</h1>

      <section className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-5">
        <h2 className="mb-4 text-sm font-semibold text-[var(--text-secondary)]">Appearance</h2>
        <div className="flex min-h-[44px] items-center justify-between gap-4">
          <label htmlFor="dark-mode" className="text-[var(--text-primary)]">
            Dark mode
          </label>
          <Switch.Root
            id="dark-mode"
            checked={darkMode}
            onCheckedChange={setDarkMode}
            className="relative h-6 w-11 rounded-full bg-[var(--border)] data-[state=checked]:bg-[var(--accent)]"
          >
            <Switch.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white transition-transform data-[state=checked]:translate-x-[22px]" />
          </Switch.Root>
        </div>
      </section>

      <section className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-5">
        <h2 className="mb-4 text-sm font-semibold text-[var(--text-secondary)]">Study goals</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Daily task goal"
            type="number"
            min={1}
            value={String(goals.daily)}
            onChange={(e) => setGoals({ daily: parseInt(e.target.value, 10) || 0 })}
          />
          <Input
            label="Weekly task goal"
            type="number"
            min={1}
            value={String(goals.weekly)}
            onChange={(e) => setGoals({ weekly: parseInt(e.target.value, 10) || 0 })}
          />
        </div>
      </section>

      <section className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-5">
        <h2 className="mb-4 text-sm font-semibold text-[var(--text-secondary)]">Focus mode</h2>
        <div className="space-y-1">
          <div className="flex min-h-[44px] items-center justify-between gap-4">
            <label htmlFor="hide-done" className="text-[var(--text-primary)]">
              Hide completed tasks
            </label>
            <Switch.Root
              id="hide-done"
              checked={hideCompleted}
              onCheckedChange={setHideCompleted}
              className="relative h-6 w-11 rounded-full bg-[var(--border)] data-[state=checked]:bg-[var(--accent)]"
            >
              <Switch.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white transition-transform data-[state=checked]:translate-x-[22px]" />
            </Switch.Root>
          </div>
          <div className="flex min-h-[44px] items-center justify-between gap-4">
            <label htmlFor="high-only" className="text-[var(--text-primary)]">
              Show only high priority
            </label>
            <Switch.Root
              id="high-only"
              checked={showHighPriorityOnly}
              onCheckedChange={setShowHighPriorityOnly}
              className="relative h-6 w-11 rounded-full bg-[var(--border)] data-[state=checked]:bg-[var(--accent)]"
            >
              <Switch.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white transition-transform data-[state=checked]:translate-x-[22px]" />
            </Switch.Root>
          </div>
        </div>
      </section>
    </div>
  )
}
