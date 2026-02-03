/**
 * Filter and view state types for tasks.
 */

import type { TaskStatus, TaskPriority } from './task'

export interface FilterState {
  searchQuery: string
  statuses: TaskStatus[]
  priorities: TaskPriority[]
  tags: string[]
  dueDateFrom: string | null // YYYY-MM-DD
  dueDateTo: string | null
  createdFrom: string | null
  createdTo: string | null
}

export interface FilterPreset {
  id: string
  name: string
  filter: FilterState
  createdAt: string
}

export type ViewMode = 'kanban' | 'list' | 'calendar'
