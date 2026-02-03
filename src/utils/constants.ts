/**
 * App-wide constants: statuses, priorities, sheet column mapping, storage keys.
 */

import type { TaskPriority, TaskStatus } from '@/types/task'

export const TASK_STATUSES: TaskStatus[] = ['To Do', 'In Progress', 'In Review', 'Done']

/** Apple-style soft gradients and tints (light mode) */
export const STATUS_COLORS_LIGHT: Record<
  TaskStatus,
  { gradient: string; tint: string; border: string }
> = {
  'To Do': {
    gradient: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
    tint: 'rgba(248, 250, 252, 0.85)',
    border: '#cbd5e1',
  },
  'In Progress': {
    gradient: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
    tint: 'rgba(239, 246, 255, 0.9)',
    border: '#93c5fd',
  },
  'In Review': {
    gradient: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    tint: 'rgba(255, 251, 235, 0.9)',
    border: '#fcd34d',
  },
  Done: {
    gradient: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
    tint: 'rgba(236, 253, 245, 0.9)',
    border: '#6ee7b7',
  },
}

/** Dark mode: subtle tints and softer borders */
export const STATUS_COLORS_DARK: Record<
  TaskStatus,
  { gradient: string; tint: string; border: string }
> = {
  'To Do': {
    gradient: 'linear-gradient(135deg, #334155 0%, #475569 100%)',
    tint: 'rgba(51, 65, 85, 0.4)',
    border: '#64748b',
  },
  'In Progress': {
    gradient: 'linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%)',
    tint: 'rgba(30, 58, 138, 0.35)',
    border: '#60a5fa',
  },
  'In Review': {
    gradient: 'linear-gradient(135deg, #422006 0%, #78350f 100%)',
    tint: 'rgba(120, 53, 15, 0.3)',
    border: '#fbbf24',
  },
  Done: {
    gradient: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
    tint: 'rgba(6, 78, 59, 0.35)',
    border: '#34d399',
  },
}

/** Status colors (use with darkMode to pick LIGHT or DARK) */
export const STATUS_COLORS = STATUS_COLORS_LIGHT

export const TASK_PRIORITIES: TaskPriority[] = ['Low', 'Medium', 'High', 'Urgent']

/** Google Sheet column indices (0-based for array access) */
export const SHEET_COLUMNS = {
  ID: 0,
  TITLE: 1,
  DESCRIPTION: 2,
  STATUS: 3,
  PRIORITY: 4,
  DUE_DATE: 5,
  TAGS: 6,
  ESTIMATED_HOURS: 7,
  ACTUAL_HOURS: 8,
  CREATED_AT: 9,
  UPDATED_AT: 10,
  COMPLETED_AT: 11,
} as const

/** Sheet name for the tasks table */
export const SHEET_NAME = 'Tasks'

/** localStorage / IndexedDB keys */
export const STORAGE_KEYS = {
  TASKS_CACHE: 'study_manager_tasks_cache',
  SYNC_QUEUE: 'study_manager_sync_queue',
  LAST_SYNC: 'study_manager_last_sync',
  DARK_MODE: 'study_manager_dark_mode',
  FILTER_PRESETS: 'study_manager_filter_presets',
  VIEW_MODE: 'study_manager_view_mode',
  GOALS: 'study_manager_goals',
  POMODORO_SETTINGS: 'study_manager_pomodoro_settings',
} as const

/** Default sheet header row (column M = Owner for per-user tasks) */
export const SHEET_HEADER_ROW: string[] = [
  'Task ID',
  'Title',
  'Description',
  'Status',
  'Priority',
  'Due Date',
  'Tags',
  'Estimated Hours',
  'Actual Hours',
  'Created At',
  'Updated At',
  'Completed At',
  'Owner',
]

/** Task templates for quick create */
export const TASK_TEMPLATES = [
  {
    id: 'reading',
    label: '📚 Reading',
    template: 'Reading: [Book/Article name]',
    priority: 'Medium' as TaskPriority,
    estimatedHours: 1.5,
  },
  {
    id: 'coding',
    label: '💻 Coding Practice',
    template: 'Coding Practice: [Topic]',
    priority: 'High' as TaskPriority,
    estimatedHours: 2.5,
  },
  {
    id: 'notes',
    label: '📝 Notes Review',
    template: 'Notes Review: [Subject]',
    priority: 'Low' as TaskPriority,
    estimatedHours: 0.5,
  },
  {
    id: 'lab',
    label: '🧪 Lab Work',
    template: 'Lab Work: [Experiment]',
    priority: 'Urgent' as TaskPriority,
    estimatedHours: 3.5,
  },
  {
    id: 'assignment',
    label: '✍️ Assignment',
    template: 'Assignment: [Name]',
    priority: 'High' as TaskPriority,
    estimatedHours: 2,
    dueDays: 3,
  },
] as const
