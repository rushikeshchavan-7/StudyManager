/**
 * Task-related type definitions for the Study Management App.
 * Aligns with Google Sheets columns: A–L.
 */

export type TaskStatus = 'To Do' | 'In Progress' | 'In Review' | 'Done'

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent'

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  dueDate: string // YYYY-MM-DD
  tags: string[]
  estimatedHours: number
  actualHours: number
  createdAt: string // ISO timestamp
  updatedAt: string // ISO timestamp
  completedAt: string | null // ISO timestamp, set when status → Done
}

/** Input for creating a new task (id, timestamps optional) */
export interface TaskCreateInput {
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  dueDate?: string
  tags?: string[]
  estimatedHours?: number
  actualHours?: number
}

/** Partial task for updates */
export type TaskUpdateInput = Partial<Omit<Task, 'id' | 'createdAt'>>

/** Row format as returned from Google Sheets (array of strings) */
export type TaskRow = [
  string, // A: id
  string, // B: title
  string, // C: description
  string, // D: status
  string, // E: priority
  string, // F: dueDate
  string, // G: tags (comma-separated)
  string, // H: estimatedHours
  string, // I: actualHours
  string, // J: createdAt
  string, // K: updatedAt
  string, // L: completedAt
]
