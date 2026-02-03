/**
 * Google Sheets API v4 via REST + Google Identity Services (GIS) OAuth2.
 * Uses the token model (initTokenClient / requestAccessToken) instead of deprecated gapi.auth2.
 * @see https://developers.google.com/identity/oauth2/web/guides/use-token-model
 * @see https://developers.google.com/identity/gsi/web/guides/gis-migration
 */

import { SHEET_COLUMNS, SHEET_NAME } from '@/utils/constants'
import type { Task } from '@/types/task'

const SCOPE =
  'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.email'
const SHEETS_BASE = 'https://sheets.googleapis.com/v4/spreadsheets'
const USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo'

/** GIS token client callback response */
interface TokenResponse {
  access_token: string
  expires_in: number
  scope?: string
  error?: string
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string
            scope: string
            callback: (response: TokenResponse) => void
          }) => { requestAccessToken: (options?: { prompt?: string }) => void }
        }
      }
    }
  }
}

function getEnv(key: string): string {
  const v = import.meta.env[key]
  if (typeof v !== 'string' || !v) throw new Error(`Missing env: ${key}`)
  return v
}

/** In-memory and sessionStorage token (GIS does not provide refresh in token model; user re-signs when expired) */
let accessToken: string | null = null
const TOKEN_KEY = 'study_manager_google_token'
const USER_EMAIL_KEY = 'study_manager_google_user_email'

let currentUserEmail: string | null = null

function persistToken(token: string | null): void {
  accessToken = token
  if (typeof sessionStorage !== 'undefined') {
    if (token) sessionStorage.setItem(TOKEN_KEY, token)
    else sessionStorage.removeItem(TOKEN_KEY)
  }
}

function persistUserEmail(email: string | null): void {
  currentUserEmail = email
  if (typeof sessionStorage !== 'undefined') {
    if (email) sessionStorage.setItem(USER_EMAIL_KEY, email)
    else sessionStorage.removeItem(USER_EMAIL_KEY)
  }
}

function loadStoredToken(): void {
  if (typeof sessionStorage !== 'undefined') {
    const stored = sessionStorage.getItem(TOKEN_KEY)
    if (stored) accessToken = stored
    const emailStored = sessionStorage.getItem(USER_EMAIL_KEY)
    if (emailStored) currentUserEmail = emailStored
  }
}

/** Column index for Owner (user email) in sheet - column M */
const OWNER_COLUMN_INDEX = 12

/** Fetch current user email from Google userinfo (uses access token). */
async function fetchUserInfo(): Promise<{ email: string }> {
  const token = getAccessToken()
  const res = await fetch(USERINFO_URL, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to load user info')
  const data = (await res.json()) as { email?: string }
  if (!data.email) throw new Error('User email not available')
  return { email: data.email }
}

/** Get current user email (cached after sign-in; fetches once if we have token but no email). */
export async function getCurrentUserEmail(): Promise<string | null> {
  if (!accessToken) return null
  if (currentUserEmail) return currentUserEmail
  try {
    const { email } = await fetchUserInfo()
    persistUserEmail(email)
    return email
  } catch {
    return null
  }
}

/** Convert Task to sheet row (array of 13 strings: 12 task columns + Owner). */
export function taskToRow(task: Task, ownerEmail: string): string[] {
  return [
    task.id,
    task.title,
    task.description ?? '',
    task.status,
    task.priority,
    task.dueDate ?? '',
    (task.tags ?? []).join(', '),
    String(task.estimatedHours ?? 0),
    String(task.actualHours ?? 0),
    task.createdAt,
    task.updatedAt,
    task.completedAt ?? '',
    ownerEmail,
  ]
}

/** Convert sheet row to Task */
export function rowToTask(row: string[]): Task {
  const get = (i: number) => (row[i] ?? '').trim()
  const tags = get(SHEET_COLUMNS.TAGS) ? get(SHEET_COLUMNS.TAGS).split(',').map((t) => t.trim()).filter(Boolean) : []
  return {
    id: get(SHEET_COLUMNS.ID),
    title: get(SHEET_COLUMNS.TITLE),
    description: get(SHEET_COLUMNS.DESCRIPTION),
    status: (get(SHEET_COLUMNS.STATUS) || 'To Do') as Task['status'],
    priority: (get(SHEET_COLUMNS.PRIORITY) || 'Medium') as Task['priority'],
    dueDate: get(SHEET_COLUMNS.DUE_DATE) || '',
    tags,
    estimatedHours: parseFloat(get(SHEET_COLUMNS.ESTIMATED_HOURS)) || 0,
    actualHours: parseFloat(get(SHEET_COLUMNS.ACTUAL_HOURS)) || 0,
    createdAt: get(SHEET_COLUMNS.CREATED_AT),
    updatedAt: get(SHEET_COLUMNS.UPDATED_AT),
    completedAt: get(SHEET_COLUMNS.COMPLETED_AT) || null,
  }
}

/** Ensure GIS script is loaded and restore token from session if any */
export function initGoogleAPI(): Promise<void> {
  loadStoredToken()
  try {
    if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) return Promise.resolve()
  } catch {
    return Promise.resolve()
  }
  return new Promise((resolve) => {
    if (window.google?.accounts?.oauth2) {
      resolve()
      return
    }
    const check = setInterval(() => {
      if (window.google?.accounts?.oauth2) {
        clearInterval(check)
        resolve()
      }
    }, 100)
    setTimeout(() => {
      clearInterval(check)
      resolve()
    }, 10000)
  })
}

/** Get current access token (throws if not signed in) */
function getAccessToken(): string {
  const t = accessToken
  if (!t) throw new Error('Not signed in')
  return t
}

/** Sign in with Google using GIS Token Client */
export function signInGoogle(): Promise<boolean> {
  const clientId = getEnv('VITE_GOOGLE_CLIENT_ID')
  if (!window.google?.accounts?.oauth2) {
    return Promise.reject(new Error('Google Identity Services script not loaded. Refresh the page.'))
  }
  return new Promise((resolve, reject) => {
    const client = window.google!.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPE,
      callback: (response: TokenResponse) => {
        if (response.error) {
          reject(new Error(response.error))
          return
        }
        if (response.access_token) {
          persistToken(response.access_token)
          fetchUserInfo()
            .then(({ email }) => persistUserEmail(email))
            .catch(() => {})
          resolve(true)
        } else {
          resolve(false)
        }
      },
    })
    client.requestAccessToken()
  })
}

/** Sign out (clear token and user email) */
export function signOutGoogle(): Promise<void> {
  persistToken(null)
  persistUserEmail(null)
  return Promise.resolve()
}

/** Check if user is signed in (we have a token) */
export function isSignedIn(): boolean {
  return !!accessToken
}

/** Get spreadsheet ID from env */
export function getSpreadsheetId(): string {
  return getEnv('VITE_GOOGLE_SHEET_ID')
}

/** Call Sheets API with Bearer token */
async function sheetsFetch(
  path: string,
  options: RequestInit & { method?: 'GET' | 'POST' | 'PUT' } = {}
): Promise<Response> {
  const token = getAccessToken()
  const url = `${SHEETS_BASE}/${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  return res
}

/** Fetch tasks from sheet for the current user only (range Tasks!A2:M). Owner in column M. */
export async function fetchTasksFromSheet(): Promise<{
  tasks: Task[]
  rowIndices: Record<string, number>
}> {
  const ownerEmail = await getCurrentUserEmail()
  if (!ownerEmail?.trim()) return { tasks: [], rowIndices: {} }

  const sheetId = getSpreadsheetId()
  const range = encodeURIComponent(`${SHEET_NAME}!A2:M`)
  const res = await sheetsFetch(`${sheetId}/values/${range}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: { message?: string } }).error?.message ?? `Sheets API ${res.status}`)
  }
  const data = (await res.json()) as { values?: string[][] }
  const values = data.values
  if (!values?.length) return { tasks: [], rowIndices: {} }
  const ownerTrimmed = ownerEmail.trim()
  const withIndices = values
    .map((row, i) => ({ task: rowToTask(row), rowIndex: i + 2, row }))
    .filter(
      ({ task, row }) =>
        (task.id ?? '').trim() !== '' &&
        (row[OWNER_COLUMN_INDEX] ?? '').trim() === ownerTrimmed
    )
  const tasks = withIndices.map((r) => r.task)
  const rowIndices: Record<string, number> = {}
  withIndices.forEach(({ task, rowIndex }) => {
    rowIndices[task.id] = rowIndex
  })
  return { tasks, rowIndices }
}

/** Append one task row to sheet (with current user as owner in column M) */
export async function appendTaskToSheet(task: Task): Promise<void> {
  const ownerEmail = await getCurrentUserEmail()
  if (!ownerEmail?.trim()) throw new Error('Not signed in or user email not available')
  const sheetId = getSpreadsheetId()
  const range = encodeURIComponent(`${SHEET_NAME}!A2:M`)
  const res = await sheetsFetch(`${sheetId}/values/${range}:append?valueInputOption=USER_ENTERED`, {
    method: 'POST',
    body: JSON.stringify({ values: [taskToRow(task, ownerEmail.trim())] }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: { message?: string } }).error?.message ?? `Sheets API ${res.status}`)
  }
}

/** Update a single task by row index (1-based, row 2 = first data row). Keeps owner in column M. */
export async function updateTaskRowInSheet(rowIndex: number, task: Task): Promise<void> {
  const ownerEmail = await getCurrentUserEmail()
  if (!ownerEmail?.trim()) throw new Error('Not signed in or user email not available')
  const sheetId = getSpreadsheetId()
  const range = encodeURIComponent(`${SHEET_NAME}!A${rowIndex}:M${rowIndex}`)
  const res = await sheetsFetch(`${sheetId}/values/${range}?valueInputOption=USER_ENTERED`, {
    method: 'PUT',
    body: JSON.stringify({ values: [taskToRow(task, ownerEmail.trim())] }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: { message?: string } }).error?.message ?? `Sheets API ${res.status}`)
  }
}

/** Batch update multiple rows (owner in column M) */
export async function batchUpdateTasksInSheet(
  data: Array<{ rowIndex: number; task: Task }>
): Promise<void> {
  if (!data.length) return
  const ownerEmail = await getCurrentUserEmail()
  if (!ownerEmail?.trim()) throw new Error('Not signed in or user email not available')
  const sheetId = getSpreadsheetId()
  const body = {
    valueInputOption: 'USER_ENTERED',
    data: data.map(({ rowIndex, task }) => ({
      range: `${SHEET_NAME}!A${rowIndex}:M${rowIndex}`,
      values: [taskToRow(task, ownerEmail.trim())],
    })),
  }
  const res = await sheetsFetch(`${sheetId}/values:batchUpdate`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: { message?: string } }).error?.message ?? `Sheets API ${res.status}`)
  }
}

/** Clear a row in the sheet (range A:M) */
export async function clearRowInSheet(rowIndex: number): Promise<void> {
  const sheetId = getSpreadsheetId()
  const range = encodeURIComponent(`${SHEET_NAME}!A${rowIndex}:M${rowIndex}`)
  const res = await sheetsFetch(`${sheetId}/values/${range}:clear`, { method: 'POST' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: { message?: string } }).error?.message ?? `Sheets API ${res.status}`)
  }
}
