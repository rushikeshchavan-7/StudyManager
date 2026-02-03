/**
 * IndexedDB via Dexie for offline task cache and sync queue.
 */

import Dexie, { type Table } from 'dexie'
import type { Task } from '@/types/task'

export interface CachedTask extends Task {
  _rowIndex?: number // 1-based row in sheet for updates
  _dirty?: boolean
}

export interface SyncQueueItem {
  id: string
  type: 'create' | 'update' | 'delete'
  payload: Task | { id: string }
  timestamp: string
}

class StudyManagerDB extends Dexie {
  tasks!: Table<CachedTask, string>
  syncQueue!: Table<SyncQueueItem, string>

  constructor() {
    super('StudyManagerDB')
    this.version(1).stores({
      tasks: 'id, status, dueDate, createdAt, updatedAt',
      syncQueue: 'id, timestamp',
    })
  }
}

export const db = new StudyManagerDB()
