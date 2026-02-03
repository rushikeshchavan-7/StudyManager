import { useState, useEffect } from 'react'
import { Modal } from '@/components/Common/Modal'
import { ConfirmDialog } from '@/components/Common/ConfirmDialog'
import { Button } from '@/components/Common/Button'
import { Input } from '@/components/Common/Input'
import { Select } from '@/components/Common/Select'
import type { Task, TaskStatus, TaskPriority } from '@/types/task'
import { TASK_STATUSES, TASK_PRIORITIES } from '@/utils/constants'
import toast from 'react-hot-toast'

interface TaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task | null
  onSave: (id: string, data: Partial<Task>) => Promise<unknown>
  onCreate?: (data: Partial<Task>) => Promise<Task | null>
  onDelete?: (id: string) => Promise<boolean>
}

export function TaskModal({ open, onOpenChange, task, onSave, onCreate, onDelete }: TaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<TaskStatus>('To Do')
  const [priority, setPriority] = useState<TaskPriority>('Medium')
  const [dueDate, setDueDate] = useState('')
  const [tagsStr, setTagsStr] = useState('')
  const [estimatedHours, setEstimatedHours] = useState('')
  const [actualHours, setActualHours] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  const isCreate = task === null

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description ?? '')
      setStatus(task.status)
      setPriority(task.priority)
      setDueDate(task.dueDate ?? '')
      setTagsStr(task.tags?.join(', ') ?? '')
      setEstimatedHours(String(task.estimatedHours ?? ''))
      setActualHours(String(task.actualHours ?? ''))
    } else {
      setTitle('')
      setDescription('')
      setStatus('To Do')
      setPriority('Medium')
      setDueDate('')
      setTagsStr('')
      setEstimatedHours('')
      setActualHours('')
    }
  }, [task, open])

  // Reset delete confirm when task modal closes
  useEffect(() => {
    if (!open) setDeleteConfirmOpen(false)
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      toast.error('Title is required')
      return
    }
    setSaving(true)
    try {
      if (isCreate && onCreate) {
        await onCreate({
          title: trimmedTitle,
          description: description.trim(),
          status,
          priority,
          dueDate: dueDate || '',
          tags: tagsStr ? tagsStr.split(',').map((t) => t.trim()).filter(Boolean) : [],
          estimatedHours: parseFloat(estimatedHours) || 0,
          actualHours: parseFloat(actualHours) || 0,
        })
        toast.success('Task created')
      } else if (task) {
        await onSave(task.id, {
          title: trimmedTitle,
          description: description.trim(),
          status,
          priority,
          dueDate: dueDate || '',
          tags: tagsStr ? tagsStr.split(',').map((t) => t.trim()).filter(Boolean) : [],
          estimatedHours: parseFloat(estimatedHours) || 0,
          actualHours: parseFloat(actualHours) || 0,
        })
        toast.success('Task updated')
      }
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteClick = () => {
    if (task && onDelete) setDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!task || !onDelete) return
    setDeleting(true)
    try {
      await onDelete(task.id)
      toast.success('Task deleted')
      setDeleteConfirmOpen(false)
      onOpenChange(false)
    } catch {
      toast.error('Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  const statusOptions = TASK_STATUSES.map((s) => ({ value: s, label: s }))
  const priorityOptions = TASK_PRIORITIES.map((p) => ({ value: p, label: p }))

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isCreate ? 'New Task' : 'Edit Task'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Task title"
        />
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--text-secondary)]">
            Description (Markdown supported)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="min-h-[88px] w-full rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-2.5 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-muted)]"
            placeholder="Optional description"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Status"
            value={status}
            onValueChange={(v) => setStatus(v as TaskStatus)}
            options={statusOptions}
            aria-label="Task status"
          />
          <Select
            label="Priority"
            value={priority}
            onValueChange={(v) => setPriority(v as TaskPriority)}
            options={priorityOptions}
            aria-label="Task priority"
          />
        </div>
        <Input
          label="Due date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <Input
          label="Tags (comma-separated)"
          value={tagsStr}
          onChange={(e) => setTagsStr(e.target.value)}
          placeholder="e.g. coding, reading"
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Estimated hours"
            type="number"
            min={0}
            step={0.5}
            value={estimatedHours}
            onChange={(e) => setEstimatedHours(e.target.value)}
          />
          <Input
            label="Actual hours"
            type="number"
            min={0}
            step={0.5}
            value={actualHours}
            onChange={(e) => setActualHours(e.target.value)}
          />
        </div>
        <div className="flex justify-between gap-2 pt-2">
          <div>
            {!isCreate && onDelete && (
              <Button variant="danger" type="button" onClick={handleDeleteClick} isLoading={deleting}>
                Delete
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={saving}>
              {isCreate ? 'Create' : 'Save'}
            </Button>
          </div>
        </div>
      </form>
      {!isCreate && onDelete && (
        <ConfirmDialog
          open={deleteConfirmOpen}
          onOpenChange={setDeleteConfirmOpen}
          title="Delete task?"
          message="This task will be permanently deleted. This cannot be undone."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          variant="danger"
          onConfirm={handleDeleteConfirm}
          isLoading={deleting}
        />
      )}
    </Modal>
  )
}
