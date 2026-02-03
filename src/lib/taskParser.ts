/**
 * Smart task input parser for quick create.
 * Example: "Study React #coding !high @tomorrow 2h"
 * → title, tags, priority, due date, estimated hours
 */

import { getTomorrowDate, getDateInDays } from '@/lib/dateUtils'
import type { TaskPriority } from '@/types/task'

const PRIORITY_MAP: Record<string, TaskPriority> = {
  '!low': 'Low',
  '!medium': 'Medium',
  '!high': 'High',
  '!urgent': 'Urgent',
}

/** Match #tag (word characters and hyphens) */
const TAG_REGEX = /#(\w[\w-]*)/g
/** Match !priority (low, medium, high, urgent) */
const PRIORITY_REGEX = /!(low|medium|high|urgent)\b/gi
/** Match @tomorrow, @today, @YYYY-MM-DD, @+N (in N days) */
const DUE_REGEX = /@(tomorrow|today|(\d{4}-\d{2}-\d{2})|(\+\d+))/gi
/** Match 2h, 1.5h, 30m, 2hr, 90min at end or before other tokens */
const TIME_REGEX = /(\d+(?:\.\d+)?)\s*(?:h|hr|hours?|m|min|minutes?)\b/gi

export interface ParsedTaskInput {
  title: string
  tags: string[]
  priority: TaskPriority | null
  dueDate: string | null
  estimatedHours: number
}

/**
 * Parse natural task input into structured fields.
 * Removes matched tokens from the title and trims.
 */
export function parseTaskInput(input: string): ParsedTaskInput {
  let title = input.trim()
  const tags: string[] = []
  let priority: TaskPriority | null = null
  let dueDate: string | null = null
  let estimatedHours = 0

  // Extract tags
  title = title.replace(TAG_REGEX, (_, tag) => {
    tags.push(tag)
    return ''
  })

  // Extract priority (first match wins)
  title = title.replace(PRIORITY_REGEX, (_, p) => {
    if (!priority) priority = PRIORITY_MAP['!' + p.toLowerCase()]
    return ''
  })

  // Extract due date
  title = title.replace(DUE_REGEX, (_, key, iso, plusDays) => {
    if (dueDate) return ''
    const k = (key || '').toLowerCase()
    if (k === 'tomorrow') dueDate = getTomorrowDate()
    else if (k === 'today') dueDate = getDateInDays(0)
    else if (iso) dueDate = iso
    else if (plusDays) dueDate = getDateInDays(parseInt(plusDays, 10))
    return ''
  })

  // Extract time estimate (first match; hours preferred)
  title = title.replace(TIME_REGEX, (full, num) => {
    if (estimatedHours > 0) return ''
    const n = parseFloat(num)
    const u = full.toLowerCase()
    if (u.includes('m') && !u.includes('min')) estimatedHours = n / 60
    else if (u.startsWith('m') || u.includes('min')) estimatedHours = n / 60
    else estimatedHours = n
    return ''
  })

  // Clean title: collapse spaces, trim
  title = title.replace(/\s+/g, ' ').trim()

  return {
    title: title || 'Untitled Task',
    tags,
    priority,
    dueDate,
    estimatedHours,
  }
}
