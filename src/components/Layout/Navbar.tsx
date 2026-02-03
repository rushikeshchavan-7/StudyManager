import { useState, useRef, useEffect } from 'react'
import {
  Search,
  Plus,
  Sun,
  Moon,
  LayoutGrid,
  List,
  Calendar,
  LogIn,
  LogOut,
  MoreHorizontal,
  WifiOff,
  Cloud,
} from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Button } from '@/components/Common/Button'
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
  const { loadTasks, clearTasksForSignOut } = useGoogleSheets()
  const [signingIn, setSigningIn] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (searchFocused && searchRef.current) searchRef.current.focus()
  }, [searchFocused])

  const handleSignOut = async () => {
    try {
      await signOutGoogle()
      clearTasksForSignOut()
      setGoogleSignedIn(false)
      toast.success('Signed out')
    } catch {
      clearTasksForSignOut()
      setGoogleSignedIn(false)
    }
  }

  const handleSignIn = async () => {
    if (!GOOGLE_CLIENT_ID) {
      toast.error('Add Google env vars to .env and restart.')
      return
    }
    setSigningIn(true)
    try {
      await signInGoogle()
      setGoogleSignedIn(true)
      if (SHEET_ID) await loadTasks()
      toast.success('Signed in – tasks sync to Sheets')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Sign in failed')
    } finally {
      setSigningIn(false)
    }
  }

  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-3 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]/80 px-4 backdrop-blur-xl"
      style={{ paddingTop: 'calc(var(--safe-top) + 10px)', paddingBottom: '10px' }}
      role="banner"
    >
      <div className="flex min-h-[40px] flex-1 items-center gap-2">
        <div className="relative w-full max-w-[200px] sm:max-w-[240px]">
          <span
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            aria-hidden
          >
            <Search className="h-[20px] w-[20px]" strokeWidth={2} />
          </span>
          <input
            ref={searchRef}
            type="search"
            placeholder="Search tasks"
            value={filter.searchQuery}
            onChange={(e) => setFilter({ searchQuery: e.target.value })}
            onBlur={() => setSearchFocused(false)}
            aria-label="Search tasks"
            className="w-full rounded-[var(--radius-full)] border border-[var(--border)] bg-[var(--search-bg)] py-2.5 pl-9 pr-3 text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-colors focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-muted)]"
          />
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <ViewModeButtons viewMode={viewMode} setViewMode={setViewMode} className="hidden sm:flex" />
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="h-5 w-5" />}
          onClick={() => setFullCreateModalOpen(true)}
          aria-label="New task"
          className="min-h-[40px] min-w-[40px] sm:min-w-0"
        >
          <span className="hidden sm:inline">New</span>
        </Button>
        <div className="hidden items-center gap-1 sm:flex">
          <Button
            variant="ghost"
            size="sm"
            aria-label={darkMode ? 'Light mode' : 'Dark mode'}
            onClick={toggleDarkMode}
            className="min-h-[40px] min-w-[40px] rounded-full p-0"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          {googleSignedIn ? (
            <Button variant="ghost" size="sm" aria-label="Sign out" onClick={handleSignOut} className="min-h-[40px]">
              <LogOut className="h-5 w-5" />
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<LogIn className="h-5 w-5" />}
              aria-label="Sign in with Google"
              isLoading={signingIn}
              onClick={handleSignIn}
              className="min-h-[40px]"
            >
              Sign in
            </Button>
          )}
        </div>

        <DropdownMenu.Root open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] sm:hidden"
              aria-label="Menu"
            >
              <MoreHorizontal className="h-6 w-6" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="min-w-[200px] rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-1 shadow-[var(--shadow-lg)]"
              sideOffset={8}
              align="end"
            >
              <ViewModeMenuItems viewMode={viewMode} setViewMode={setViewMode} onSelect={() => setMenuOpen(false)} />
              <DropdownMenu.Separator className="my-1 h-px bg-[var(--border-subtle)]" />
              <DropdownMenu.Item
                className="flex cursor-pointer items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-[var(--text-primary)] outline-none hover:bg-[var(--bg-tertiary)]"
                onSelect={() => {
                  toggleDarkMode()
                  setMenuOpen(false)
                }}
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                {darkMode ? 'Light mode' : 'Dark mode'}
              </DropdownMenu.Item>
              {googleSignedIn ? (
                <DropdownMenu.Item
                  className="flex cursor-pointer items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-[var(--text-primary)] outline-none hover:bg-[var(--bg-tertiary)]"
                  onSelect={() => {
                    handleSignOut()
                    setMenuOpen(false)
                  }}
                >
                  <LogOut className="h-5 w-5" /> Sign out
                </DropdownMenu.Item>
              ) : (
                <DropdownMenu.Item
                  className="flex cursor-pointer items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-[var(--text-primary)] outline-none hover:bg-[var(--bg-tertiary)]"
                  onSelect={() => {
                    handleSignIn()
                    setMenuOpen(false)
                  }}
                  disabled={signingIn}
                >
                  <LogIn className="h-5 w-5" /> Sign in with Google
                </DropdownMenu.Item>
              )}
              {(isOffline || lastSync) && (
                <>
                  <DropdownMenu.Separator className="my-1 h-px bg-[var(--border-subtle)]" />
                  <div className="px-3 py-2 text-xs text-[var(--text-muted)]">
                    {isOffline ? (
                      <span className="flex items-center gap-2">
                        <WifiOff className="h-4 w-4" /> Offline
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Cloud className="h-4 w-4" /> Synced
                      </span>
                    )}
                  </div>
                </>
              )}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  )
}

function ViewModeButtons({
  viewMode,
  setViewMode,
  className = '',
}: {
  viewMode: ViewMode
  setViewMode: (v: ViewMode) => void
  className?: string
}) {
  const modes: { mode: ViewMode; icon: React.ReactNode; label: string }[] = [
    { mode: 'kanban', icon: <LayoutGrid className="h-4 w-4" />, label: 'Kanban' },
    { mode: 'list', icon: <List className="h-4 w-4" />, label: 'List' },
    { mode: 'calendar', icon: <Calendar className="h-4 w-4" />, label: 'Calendar' },
  ]
  return (
    <div
      className={`flex rounded-[var(--radius-sm)] border border-[var(--border-subtle)] p-0.5 ${className}`}
      role="tablist"
      aria-label="View mode"
    >
      {modes.map(({ mode, icon, label }) => (
        <button
          key={mode}
          type="button"
          role="tab"
          aria-selected={viewMode === mode}
          aria-label={label}
          className={`rounded-md p-2 transition-colors ${viewMode === mode ? 'bg-[var(--accent-muted)] text-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
          onClick={() => setViewMode(mode)}
        >
          {icon}
        </button>
      ))}
    </div>
  )
}

function ViewModeMenuItems({
  viewMode,
  setViewMode,
  onSelect,
}: {
  viewMode: ViewMode
  setViewMode: (v: ViewMode) => void
  onSelect: () => void
}) {
  const modes: { mode: ViewMode; icon: React.ReactNode; label: string }[] = [
    { mode: 'kanban', icon: <LayoutGrid className="h-5 w-5" />, label: 'Kanban' },
    { mode: 'list', icon: <List className="h-5 w-5" />, label: 'List' },
    { mode: 'calendar', icon: <Calendar className="h-5 w-5" />, label: 'Calendar' },
  ]
  return (
    <>
      {modes.map(({ mode, icon, label }) => (
        <DropdownMenu.Item
          key={mode}
          className="flex cursor-pointer items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-[var(--text-primary)] outline-none hover:bg-[var(--bg-tertiary)]"
          onSelect={() => {
            setViewMode(mode)
            onSelect()
          }}
        >
          {icon}
          {label}
          {viewMode === mode && <span className="ml-auto text-[var(--accent)]">✓</span>}
        </DropdownMenu.Item>
      ))}
    </>
  )
}
