/**
 * Date utilities using date-fns. Formatting, parsing, and relative dates.
 */

import {
  format,
  parseISO,
  addDays,
  startOfDay,
  isToday,
  isTomorrow,
  isPast,
  isThisWeek,
  isThisMonth,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isValid,
  differenceInCalendarDays,
} from 'date-fns'

const DATE_FORMAT = 'yyyy-MM-dd'
const DISPLAY_DATE_FORMAT = 'MMM d, yyyy'
const DISPLAY_SHORT = 'MMM d'

/**
 * Format ISO date string to YYYY-MM-DD for storage/API.
 */
export function toStorageDate(date: Date): string {
  return format(date, DATE_FORMAT)
}

/**
 * Parse YYYY-MM-DD or ISO string to Date.
 */
export function parseDate(input: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return parseISO(input + 'T00:00:00.000Z')
  }
  const d = parseISO(input)
  if (!isValid(d)) throw new Error(`Invalid date: ${input}`)
  return d
}

/**
 * Format for display (e.g. "Mar 15, 2024" or "Mar 15").
 */
export function formatDisplayDate(isoDate: string, short = false): string {
  const d = parseDate(isoDate)
  return format(d, short ? DISPLAY_SHORT : DISPLAY_DATE_FORMAT)
}

/**
 * Human-friendly relative date: "Today", "Tomorrow", "Mar 15", or "Mar 15, 2024".
 */
export function formatRelativeDate(isoDate: string): string {
  const d = parseDate(isoDate)
  if (isToday(d)) return 'Today'
  if (isTomorrow(d)) return 'Tomorrow'
  const days = differenceInCalendarDays(d, new Date())
  if (days < 0 && days >= -7) return `${Math.abs(days)} days ago`
  if (days > 0 && days <= 7) return `In ${days} days`
  return format(d, DISPLAY_SHORT)
}

/**
 * Get tomorrow's date as YYYY-MM-DD.
 */
export function getTomorrowDate(): string {
  return toStorageDate(addDays(startOfDay(new Date()), 1))
}

/**
 * Get date N days from today as YYYY-MM-DD.
 */
export function getDateInDays(days: number): string {
  return toStorageDate(addDays(startOfDay(new Date()), days))
}

/**
 * Check if date string is in the past (excluding today).
 */
export function isOverdue(isoDate: string): boolean {
  const d = parseDate(isoDate)
  return isPast(d) && !isToday(d)
}

/**
 * Get start/end of current week (for dashboard stats).
 */
export function getWeekRange(): { start: Date; end: Date } {
  const now = new Date()
  return { start: startOfWeek(now), end: endOfWeek(now) }
}

/**
 * Get start/end of current month.
 */
export function getMonthRange(): { start: Date; end: Date } {
  const now = new Date()
  return { start: startOfMonth(now), end: endOfMonth(now) }
}

/**
 * Check if a Date falls within a range (inclusive).
 */
export function isDateInRange(date: Date, range: { start: Date; end: Date }): boolean {
  const t = date.getTime()
  return t >= range.start.getTime() && t <= range.end.getTime()
}

/**
 * Check if task's due date is today.
 */
export function isDueToday(isoDate: string): boolean {
  return isToday(parseDate(isoDate))
}

/**
 * Check if task's due date is this week.
 */
export function isDueThisWeek(isoDate: string): boolean {
  return isThisWeek(parseDate(isoDate))
}

/**
 * Check if task's due date is this month.
 */
export function isDueThisMonth(isoDate: string): boolean {
  return isThisMonth(parseDate(isoDate))
}
