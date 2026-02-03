/**
 * Hook: load/sync tasks with Google Sheets, offline cache, and sync queue.
 */

import { useCallback, useEffect } from 'react'
import {
  initGoogleAPI,
  fetchTasksFromSheet,
  appendTaskToSheet,
  updateTaskRowInSheet,
  clearRowInSheet,
  isSignedIn,
} from '@/lib/googleSheetsClient'
import { useTaskStore } from '@/store/taskStore'
import { db } from '@/lib/db'

const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID

export function useGoogleSheets() {
  const {
    setTasks,
    setRowIndices,
    setLoading,
    setError,
    setLastSync,
    setOffline,
    setGoogleSignedIn,
    loadFromCache,
    getRowIndexByTaskId,
  } = useTaskStore()

  const loadTasks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (!SHEET_ID) {
        await loadFromCache()
        setLastSync(null)
        setLoading(false)
        return
      }
      if (!isSignedIn()) {
        await loadFromCache()
        setLoading(false)
        return
      }
      const { tasks: sheetTasks, rowIndices } = await fetchTasksFromSheet()
      setTasks(sheetTasks)
      setRowIndices(rowIndices)
      await db.tasks.clear()
      if (sheetTasks.length) {
        const withRowIndex = sheetTasks.map((t) => ({ ...t, _rowIndex: rowIndices[t.id] ?? 0 }))
        await db.tasks.bulkAdd(withRowIndex)
      }
      setLastSync(new Date().toISOString())
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load tasks'
      setError(message)
      await loadFromCache()
    } finally {
      setLoading(false)
    }
  }, [setTasks, setRowIndices, setLoading, setError, setLastSync, loadFromCache])

  const syncTaskToSheet = useCallback(
    async (taskId: string, task: import('@/types/task').Task) => {
      if (!SHEET_ID || !isSignedIn()) return
      try {
        const rowIndex = getRowIndexByTaskId(taskId)
        if (rowIndex >= 2) {
          await updateTaskRowInSheet(rowIndex, task)
        } else {
          await appendTaskToSheet(task)
          await loadTasks()
        }
      } catch (err) {
        console.error('Google Sheets sync failed:', err)
        throw err
      }
    },
    [getRowIndexByTaskId, loadTasks]
  )

  const deleteTaskFromSheet = useCallback(
    async (taskId: string) => {
      if (!SHEET_ID || !isSignedIn()) return
      const rowIndex = getRowIndexByTaskId(taskId)
      if (rowIndex >= 2) {
        await clearRowInSheet(rowIndex)
      }
    },
    [getRowIndexByTaskId]
  )

  useEffect(() => {
    if (!SHEET_ID) return
    initGoogleAPI()
      .then(() => {
        setGoogleSignedIn(isSignedIn())
        return loadTasks()
      })
      .catch(() => loadFromCache())
  }, [setGoogleSignedIn])

  useEffect(() => {
    const handleOnline = () => setOffline(false)
    const handleOffline = () => setOffline(true)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [setOffline])

  const clearTasksForSignOut = useCallback(() => {
    setTasks([])
    setRowIndices({})
    db.tasks.clear().catch(() => {})
  }, [setTasks, setRowIndices])

  return {
    loadTasks,
    syncTaskToSheet,
    deleteTaskFromSheet,
    clearTasksForSignOut,
    isReady: !!SHEET_ID,
  }
}
