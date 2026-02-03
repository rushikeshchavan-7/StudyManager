import { useState } from 'react'
import { useRef, useEffect } from 'react'
import { Search, Plus, Sun, Moon, LayoutGrid, List, Calendar, LogIn, LogOut } from 'lucide-react'
import { Button } from '@/components/Common/Button'
import { Input } from '@/components/Common/Input'
import { useUIStore } from '@/store/uiStore'
import { useTaskStore } from '@/store/taskStore'
import { useFilterStore } from '@/store/filterStore'
import { useGoogleSheets } from '@/hooks/useGoogleSheets'
import { signInGoogle, signOutGoogle } from '@/lib/googleSheetsClient'
import type { ViewMode } from '@/types/filter'
import toast from 'react-hot-toast'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID

export function Navbar() {
  const {
    darkMode,
    toggleDarkMode,
    viewMode,
    setViewMode,
    setFullCreateModalOpen,
    setSearchFocused,
    searchFocused,
  } = useUIStore()
  const { filter, setFilter } = useFilterStore()
  const { lastSync, isOffline, googleSignedIn, setGoogleSignedIn } = useTaskStore()
  const { loadTasks } = useGoogleSheets()
  const [signingIn, setSigningIn] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (searchFocused && searchRef.current) {
      searchRef.current.focus()
    }
  }, [searchFocused])

  return (
    <header
      className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-[var(--border)] bg-[var(--bg-primary)] px-4"
      role="banner"
    >
      <div className="flex flex-1 items-center gap-2">
        <Input
          ref={searchRef}
          placeholder="Search tasks… (/)"
          leftIcon={<Search className="h-4 w-4" />}
          className="max-w-xs"
          value={filter.searchQuery}
          onChange={(e) => setFilter({ searchQuery: e.target.value })}
          onBlur={() => setSearchFocused(false)}
          aria-label="Search tasks"
        />
      </div>

      <div className="flex items-center gap-2">
        <ViewModeButtons viewMode={viewMode} setViewMode={setViewMode} />
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setFullCreateModalOpen(true)}
          aria-label="New task"
        >
          New
        </Button>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Toggle dark mode"
          onClick={toggleDarkMode}
        >
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        {googleSignedIn ? (
          <Button
            variant="ghost"
            size="sm"
            aria-label="Sign out of Google"
            onClick={async () => {
              try {
                await signOutGoogle()
                setGoogleSignedIn(false)
                toast.success('Signed out')
              } catch {
                setGoogleSignedIn(false)
              }
            }}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<LogIn className="h-4 w-4" />}
            aria-label="Sign in with Google to sync to Sheets"
            isLoading={signingIn}
            onClick={async () => {
              if (!GOOGLE_CLIENT_ID) {
                toast.error(
                  'Add VITE_GOOGLE_CLIENT_ID, VITE_GOOGLE_API_KEY, and VITE_GOOGLE_SHEET_ID to .env and restart the dev server.'
                )
                return
              }
              setSigningIn(true)
              try {
                await signInGoogle()
                setGoogleSignedIn(true)
                if (SHEET_ID) await loadTasks()
                toast.success('Signed in – tasks will sync to Google Sheets')
              } catch (e) {
                toast.error(e instanceof Error ? e.message : 'Sign in failed')
              } finally {
                setSigningIn(false)
              }
            }}
          >
            Sign in
          </Button>
        )}
      </div>

      {isOffline && (
        <span className="text-xs text-[var(--warning)]" title="Offline mode">
          Offline
        </span>
      )}
      {lastSync && !isOffline && (
        <span className="text-xs text-[var(--text-muted)]" title={`Last synced: ${lastSync}`}>
          Synced
        </span>
      )}
    </header>
  )
}

function ViewModeButtons({
  viewMode,
  setViewMode,
}: {
  viewMode: ViewMode
  setViewMode: (v: ViewMode) => void
}) {
  const modes: { mode: ViewMode; icon: React.ReactNode; label: string }[] = [
    { mode: 'kanban', icon: <LayoutGrid className="h-4 w-4" />, label: 'Kanban' },
    { mode: 'list', icon: <List className="h-4 w-4" />, label: 'List' },
    { mode: 'calendar', icon: <Calendar className="h-4 w-4" />, label: 'Calendar' },
  ]
  return (
    <div className="flex rounded-lg border border-[var(--border)] p-0.5" role="tablist" aria-label="View mode">
      {modes.map(({ mode, icon, label }) => (
        <button
          key={mode}
          type="button"
          role="tab"
          aria-selected={viewMode === mode}
          aria-label={label}
          className={`rounded-md p-2 ${viewMode === mode ? 'bg-[var(--bg-tertiary)] text-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
          onClick={() => setViewMode(mode)}
        >
          {icon}
        </button>
      ))}
    </div>
  )
}
