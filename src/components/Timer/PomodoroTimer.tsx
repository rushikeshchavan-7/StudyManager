import { useState, useEffect, useCallback } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'
import { Button } from '@/components/Common/Button'

const WORK_MINUTES = 25
const BREAK_MINUTES = 5

export function PomodoroTimer() {
  const [secondsLeft, setSecondsLeft] = useState(WORK_MINUTES * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)

  const total = (isBreak ? BREAK_MINUTES : WORK_MINUTES) * 60
  const progressPct = total > 0 ? ((total - secondsLeft) / total) * 100 : 0

  const reset = useCallback(() => {
    setIsRunning(false)
    setSecondsLeft((isBreak ? BREAK_MINUTES : WORK_MINUTES) * 60)
  }, [isBreak])

  useEffect(() => {
    if (!isRunning) return
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setIsRunning(false)
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            new Notification(isBreak ? 'Break over!' : 'Pomodoro complete!', {
              body: isBreak ? 'Time for another focus session.' : 'Take a short break.',
            })
          }
          setIsBreak((b) => !b)
          return (isBreak ? WORK_MINUTES : BREAK_MINUTES) * 60
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [isRunning, isBreak])

  const m = Math.floor(secondsLeft / 60)
  const s = secondsLeft % 60

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
      <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
        {isBreak ? 'Break' : 'Focus'}
      </h2>
      <div className="mx-auto flex max-w-xs flex-col items-center">
        <div
          className="flex h-48 w-48 items-center justify-center rounded-full border-4 border-[var(--border)] bg-[var(--bg-tertiary)] text-4xl font-mono text-[var(--text-primary)]"
          role="timer"
          aria-live="polite"
          aria-valuenow={secondsLeft}
        >
          {`${m}:${s.toString().padStart(2, '0')}`}
        </div>
        <div className="mt-2 h-2 w-full max-w-[12rem] overflow-hidden rounded-full bg-[var(--border)]">
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-all duration-1000"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="mt-4 flex gap-2">
          <Button
            variant="primary"
            size="lg"
            leftIcon={isRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            onClick={() => setIsRunning((r) => !r)}
          >
            {isRunning ? 'Pause' : 'Start'}
          </Button>
          <Button variant="secondary" size="lg" leftIcon={<RotateCcw className="h-5 w-5" />} onClick={reset}>
            Reset
          </Button>
        </div>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          {isBreak ? `${BREAK_MINUTES} min break` : `${WORK_MINUTES} min focus`}
        </p>
      </div>
    </div>
  )
}
