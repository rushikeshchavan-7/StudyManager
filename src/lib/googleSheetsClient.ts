/**
 * Google Sheets API v4 client for tasks.
 * Uses gapi (loaded via script). OAuth 2.0 + batch operations.
 * Declare gapi on window for TypeScript.
 */

import { SHEET_COLUMNS, SHEET_NAME } from '@/utils/constants'
import type { Task } from '@/types/task'

declare global {
  interface Window {
    gapi?: {
      load: (name: string, callback: () => void) => void
      client: {
        init: (config: {
          apiKey: string
          clientId: string
          discoveryDocs: string[]
          scope: string
        }) => Promise<void>
        getToken: () => unknown
        setToken: (token: { access_token: string }) => void
        sheets: {
          spreadsheets: {
            values: {
              get: (params: {
                spreadsheetId: string
                range: string
              }) => Promise<{ result: { values?: string[][] } }>
              append: (params: {
                spreadsheetId: string
                range: string
                valueInputOption: string
                resource: { values: string[][] }
              }) => Promise<unknown>
              update: (params: {
                spreadsheetId: string
                range: string
                valueInputOption: string
                resource: { values: string[][] }
              }) => Promise<unknown>
              batchUpdate: (params: {
                spreadsheetId: string
                resource: {
                  valueInputOption: string
                  data: Array<{ range: string; values: string[][] }>
                }
              }) => Promise<unknown>
              clear: (params: { spreadsheetId: string; range: string }) => Promise<unknown>
            }
          }
        }
      }
      auth2: {
        getAuthInstance: () => {
          isSignedIn: { get: () => boolean }
          signIn: () => Promise<unknown>
          signOut: () => Promise<void>
          currentUser: { get: () => { getAuthResponse: () => { access_token: string } } }
        }
      }
    }
  }
}

const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4'
const SCOPE = 'https://www.googleapis.com/auth/spreadsheets'

function getEnv(key: string): string {
  const v = import.meta.env[key]
  if (typeof v !== 'string' || !v) throw new Error(`Missing env: ${key}`)
  return v
}

/** Convert Task to sheet row (array of 12 strings) */
export function taskToRow(task: Task): string[] {
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

/** Initialize Google API client (call once after script load) */
export async function initGoogleAPI(): Promise<void> {
  const apiKey = getEnv('VITE_GOOGLE_API_KEY')
  const clientId = getEnv('VITE_GOOGLE_CLIENT_ID')
  if (!window.gapi) throw new Error('Google API script not loaded')
  return new Promise((resolve, reject) => {
    window.gapi!.load('client:auth2', () => {
      window
        .gapi!.client.init({
          apiKey,
          clientId,
          discoveryDocs: [DISCOVERY_DOC],
          scope: SCOPE,
        })
        .then(resolve)
        .catch(reject)
    })
  })
}

/** Get current access token (assumes signed in) */
function getAccessToken(): string {
  const auth = window.gapi?.auth2?.getAuthInstance()
  if (!auth?.isSignedIn?.get()) throw new Error('Not signed in')
  return auth.currentUser.get().getAuthResponse().access_token
}

/** Sign in with Google */
export async function signInGoogle(): Promise<boolean> {
  if (!window.gapi?.auth2) throw new Error('Google API not initialized')
  const auth = window.gapi.auth2.getAuthInstance()
  await auth.signIn()
  return auth.isSignedIn.get()
}

/** Sign out */
export async function signOutGoogle(): Promise<void> {
  if (!window.gapi?.auth2) return
  await window.gapi.auth2.getAuthInstance().signOut()
}

/** Check if user is signed in */
export function isSignedIn(): boolean {
  return window.gapi?.auth2?.getAuthInstance()?.isSignedIn?.get() ?? false
}

/** Get spreadsheet ID from env */
export function getSpreadsheetId(): string {
  return getEnv('VITE_GOOGLE_SHEET_ID')
}

/** Fetch all tasks from sheet (range Tasks!A2:L, skip header) */
export async function fetchTasksFromSheet(): Promise<Task[]> {
  const gapi = window.gapi
  if (!gapi?.client?.sheets) throw new Error('Sheets API not ready')
  getAccessToken()
  const sheetId = getSpreadsheetId()
  const response = await gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${SHEET_NAME}!A2:L`,
  })
  const values = response.result.values as string[][] | undefined
  if (!values?.length) return []
  return values.map((row) => rowToTask(row))
}

/** Append one task row to sheet */
export async function appendTaskToSheet(task: Task): Promise<void> {
  const gapi = window.gapi
  if (!gapi?.client?.sheets) throw new Error('Sheets API not ready')
  getAccessToken()
  const sheetId = getSpreadsheetId()
  await gapi.client.sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: `${SHEET_NAME}!A2:L`,
    valueInputOption: 'USER_ENTERED',
    resource: { values: [taskToRow(task)] },
  })
}

/** Update a single task by row index (1-based, row 2 = first data row) */
export async function updateTaskRowInSheet(rowIndex: number, task: Task): Promise<void> {
  const gapi = window.gapi
  if (!gapi?.client?.sheets) throw new Error('Sheets API not ready')
  getAccessToken()
  const sheetId = getSpreadsheetId()
  const range = `${SHEET_NAME}!A${rowIndex}:L${rowIndex}`
  await gapi.client.sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    resource: { values: [taskToRow(task)] },
  })
}

/** Batch update multiple rows (minimize API calls). data: array of { rowIndex, task } */
export async function batchUpdateTasksInSheet(
  data: Array<{ rowIndex: number; task: Task }>
): Promise<void> {
  if (!data.length) return
  const gapi = window.gapi
  if (!gapi?.client?.sheets) throw new Error('Sheets API not ready')
  getAccessToken()
  const sheetId = getSpreadsheetId()
  await gapi.client.sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: sheetId,
    resource: {
      valueInputOption: 'USER_ENTERED',
      data: data.map(({ rowIndex, task }) => ({
        range: `${SHEET_NAME}!A${rowIndex}:L${rowIndex}`,
        values: [taskToRow(task)],
      })),
    },
  })
}

/** Delete a row by clearing it (optional; or mark status Deleted in your schema) */
export async function clearRowInSheet(rowIndex: number): Promise<void> {
  const gapi = window.gapi
  if (!gapi?.client?.sheets) throw new Error('Sheets API not ready')
  getAccessToken()
  const sheetId = getSpreadsheetId()
  await gapi.client.sheets.spreadsheets.values.clear({
    spreadsheetId: sheetId,
    range: `${SHEET_NAME}!A${rowIndex}:L${rowIndex}`,
  })
}
