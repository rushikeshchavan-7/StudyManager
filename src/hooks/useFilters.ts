/**
 * Filtering and searching tasks. Fuzzy search, multi-select filters, presets.
 */

import { useMemo } from 'react'
import type { Task } from '@/types/task'
import type { FilterState } from '@/types/filter'

/** Simple fuzzy match: query chars appear in order in str (case-insensitive) */
function fuzzyMatch(str: string, query: string): boolean {
  const s = str.toLowerCase()
  const q = query.toLowerCase().trim()
  if (!q) return true
  let j = 0
  for (let i = 0; i < s.length && j < q.length; i++) {
    if (s[i] === q[j]) j++
  }
  return j === q.length
}

export function useFilteredTasks(tasks: Task[], filter: FilterState): Task[] {
  return useMemo(() => {
    let result = tasks

    if (filter.searchQuery.trim()) {
      const q = filter.searchQuery.trim()
      result = result.filter(
        (t) =>
          fuzzyMatch(t.title, q) ||
          fuzzyMatch(t.description, q) ||
          t.tags.some((tag) => fuzzyMatch(tag, q))
      )
    }

    if (filter.statuses.length > 0) {
      result = result.filter((t) => filter.statuses.includes(t.status))
    }
    if (filter.priorities.length > 0) {
      result = result.filter((t) => filter.priorities.includes(t.priority))
    }
    if (filter.tags.length > 0) {
      result = result.filter((t) => t.tags.some((tag) => filter.tags.includes(tag)))
    }

    if (filter.dueDateFrom) {
      result = result.filter((t) => t.dueDate && t.dueDate >= filter.dueDateFrom!)
    }
    if (filter.dueDateTo) {
      result = result.filter((t) => t.dueDate && t.dueDate <= filter.dueDateTo!)
    }
    if (filter.createdFrom) {
      result = result.filter((t) => t.createdAt >= filter.createdFrom!)
    }
    if (filter.createdTo) {
      result = result.filter((t) => t.createdAt <= filter.createdTo!)
    }

    return result
  }, [tasks, filter])
}
