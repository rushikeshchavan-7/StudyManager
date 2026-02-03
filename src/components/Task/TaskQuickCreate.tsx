import { useState, useCallback } from 'react'
import { Modal } from '@/components/Common/Modal'
import { Button } from '@/components/Common/Button'
import { Input } from '@/components/Common/Input'
import { parseTaskInput } from '@/lib/taskParser'
import { useTasks } from '@/hooks/useTasks'
import { useUIStore } from '@/store/uiStore'
import { TASK_TEMPLATES } from '@/utils/constants'
import toast from 'react-hot-toast'

export function TaskQuickCreate() {
  const { quickCreateOpen, setQuickCreateOpen } = useUIStore()
  const { createTask } = useTasks()
  const [input, setInput] = useState('')
  const [creating, setCreating] = useState(false)

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const trimmed = input.trim()
      if (!trimmed) return
      setCreating(true)
      try {
        const parsed = parseTaskInput(trimmed)
        await createTask({
          title: parsed.title,
          tags: parsed.tags,
          priority: parsed.priority ?? 'Medium',
          dueDate: parsed.dueDate ?? '',
          estimatedHours: parsed.estimatedHours,
        })
        toast.success('Task created')
        setInput('')
        setQuickCreateOpen(false)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to create task')
      } finally {
        setCreating(false)
      }
    },
    [input, createTask, setQuickCreateOpen]
  )

  const applyTemplate = (template: (typeof TASK_TEMPLATES)[number]) => {
    setInput(template.template)
  }

  return (
    <Modal
      open={quickCreateOpen}
      onOpenChange={setQuickCreateOpen}
      title="Quick create task"
      description='Type a task. Use #tag !priority @tomorrow 2h'
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder='e.g. Study React #coding !high @tomorrow 2h'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-label="Task input with optional #tags !priority @date time"
          autoFocus
        />
        <div>
          <p className="mb-2 text-sm text-[var(--text-muted)]">Templates</p>
          <div className="flex flex-wrap gap-2">
            {TASK_TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                className="min-h-[40px] rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-4 py-2 text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                onClick={() => applyTemplate(t)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" type="button" onClick={() => setQuickCreateOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={!input.trim()} isLoading={creating}>
            Create
          </Button>
        </div>
      </form>
    </Modal>
  )
}
