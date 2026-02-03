/**
 * High-level task operations: create, update, delete, move. Wraps taskStore and syncs to Google Sheets.
 */

import { useCallback } from 'react'
import { useTaskStore } from '@/store/taskStore'
import { useGoogleSheets } from '@/hooks/useGoogleSheets'
import type { Task, TaskStatus } from '@/types/task'

export function useTasks() {
  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    moveTaskStatus,
    getTaskById,
    isLoading,
    error,
  } = useTaskStore()

  const { syncTaskToSheet } = useGoogleSheets()

  const createTask = useCallback(
    async (input: Partial<Task>) => {
      const task = await addTask(input)
      try {
        await syncTaskToSheet(task.id, task)
      } catch {
        // Task is saved in cache; sync will retry when online/signed in
      }
      return task
    },
    [addTask, syncTaskToSheet]
  )

  const editTask = useCallback(
    async (id: string, input: Partial<Task>) => {
      const updated = await updateTask(id, input)
      if (updated) {
        try {
          await syncTaskToSheet(id, updated)
        } catch {
          // Task is saved in cache
        }
      }
      return updated
    },
    [updateTask, syncTaskToSheet]
  )

  const removeTask = useCallback(
    async (id: string) => {
      return deleteTask(id)
    },
    [deleteTask]
  )

  const moveTask = useCallback(
    async (id: string, newStatus: TaskStatus) => {
      await moveTaskStatus(id, newStatus)
      const task = getTaskById(id)
      if (task) {
        try {
          await syncTaskToSheet(id, task)
        } catch {
          // Saved in cache
        }
      }
    },
    [moveTaskStatus, getTaskById, syncTaskToSheet]
  )

  return {
    tasks,
    createTask,
    editTask,
    removeTask,
    moveTask,
    getTaskById,
    isLoading,
    error,
  }
}
