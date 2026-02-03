/**
 * App-wide constants: statuses, priorities, sheet column mapping, storage keys.
 */

import type { TaskPriority, TaskStatus } from '@/types/task'

export const TASK_STATUSES: TaskStatus[] = ['To Do', 'In Progress', 'In Review', 'Done']

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

/** Default sheet header row */
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
