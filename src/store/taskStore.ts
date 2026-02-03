/**
 * Zustand store for tasks: in-memory list + sync with IndexedDB and Google Sheets.
 */

import { create } from 'zustand'
import type { Task, TaskStatus } from '@/types/task'
import { db, type CachedTask } from '@/lib/db'
import { taskCreateSchema } from '@/lib/taskSchema'

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

interface TaskState {
  tasks: Task[]
  taskIdToRowIndex: Record<string, number>
  isLoading: boolean
  error: string | null
  lastSync: string | null
  isOffline: boolean
  syncQueueLength: number
  googleSignedIn: boolean
  setGoogleSignedIn: (v: boolean) => void

  setTasks: (tasks: Task[]) => void
  setRowIndices: (indices: Record<string, number>) => void
  addTask: (input: Partial<Task>) => Promise<Task>
  updateTask: (id: string, input: Partial<Task>) => Promise<Task | null>
  deleteTask: (id: string) => Promise<boolean>
  moveTaskStatus: (id: string, newStatus: TaskStatus) => Promise<void>
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setLastSync: (iso: string | null) => void
  setOffline: (offline: boolean) => void
  setSyncQueueLength: (n: number) => void
  loadFromCache: () => Promise<void>
  persistToCache: (tasks: Task[]) => Promise<void>
  getTaskById: (id: string) => Task | undefined
  getRowIndexByTaskId: (id: string) => number
  setRowIndexForTask: (id: string, rowIndex: number) => void
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  taskIdToRowIndex: {},
  isLoading: false,
  error: null,
  lastSync: null,
  isOffline: !navigator.onLine,
  syncQueueLength: 0,
  googleSignedIn: false,
  setGoogleSignedIn: (v) => set({ googleSignedIn: v }),

  setTasks: (tasks) => set({ tasks }),
  setRowIndices: (indices) => set({ taskIdToRowIndex: indices }),

  addTask: async (input) => {
    const parsed = taskCreateSchema.safeParse({
      title: input.title ?? '',
      description: input.description ?? '',
      status: input.status ?? 'To Do',
      priority: input.priority ?? 'Medium',
      dueDate: input.dueDate ?? null,
      tags: input.tags ?? [],
      estimatedHours: input.estimatedHours ?? 0,
      actualHours: input.actualHours ?? 0,
    })
    if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Validation failed')
    const now = new Date().toISOString()
    const task: Task = {
      id: input.id ?? generateId(),
      title: parsed.data.title,
      description: parsed.data.description ?? '',
      status: parsed.data.status,
      priority: parsed.data.priority,
      dueDate: parsed.data.dueDate ?? '',
      tags: parsed.data.tags ?? [],
      estimatedHours: parsed.data.estimatedHours,
      actualHours: parsed.data.actualHours,
      createdAt: now,
      updatedAt: now,
      completedAt: parsed.data.status === 'Done' ? now : null,
    }
    set((s) => ({ tasks: [...s.tasks, task] }))
    await get().persistToCache(get().tasks)
    return task
  },

  updateTask: async (id, input) => {
    const task = get().tasks.find((t) => t.id === id)
    if (!task) return null
    const updated: Task = {
      ...task,
      ...input,
      id: task.id,
      updatedAt: new Date().toISOString(),
      completedAt:
        input.status === 'Done'
          ? new Date().toISOString()
          : input.status !== undefined
            ? null
            : task.completedAt,
    }
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? updated : t)) }))
    await get().persistToCache(get().tasks)
    return updated
  },

  deleteTask: async (id) => {
    const exists = get().tasks.some((t) => t.id === id)
    if (!exists) return false
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }))
    await get().persistToCache(get().tasks)
    return true
  },

  moveTaskStatus: async (id, newStatus) => {
    await get().updateTask(id, { status: newStatus })
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setLastSync: (iso) => set({ lastSync: iso }),
  setOffline: (offline) => set({ isOffline: offline }),
  setSyncQueueLength: (n) => set({ syncQueueLength: n }),

  loadFromCache: async () => {
    try {
      const cached = await db.tasks.toArray()
      const tasks: Task[] = cached.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate,
        tags: t.tags,
        estimatedHours: t.estimatedHours,
        actualHours: t.actualHours,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        completedAt: t.completedAt,
      }))
      set({ tasks })
    } catch {
      set({ tasks: [] })
    }
  },

  persistToCache: async (tasks) => {
    const withMeta: CachedTask[] = tasks.map((t) => ({ ...t, _dirty: false }))
    await db.tasks.clear()
    if (withMeta.length) await db.tasks.bulkAdd(withMeta)
  },

  getTaskById: (id) => get().tasks.find((t) => t.id === id),
  getRowIndexByTaskId: (id) => get().taskIdToRowIndex[id] ?? 0,
  setRowIndexForTask: (id, rowIndex) =>
    set((s) => ({ taskIdToRowIndex: { ...s.taskIdToRowIndex, [id]: rowIndex } })),
}))
