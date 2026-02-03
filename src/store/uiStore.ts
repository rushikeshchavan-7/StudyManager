/**
 * UI state: dark mode, view mode, modals, focus mode, goals.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ViewMode } from '@/types/filter'
interface Goals {
  daily: number
  weekly: number
}

interface UIState {
  darkMode: boolean
  viewMode: ViewMode
  quickCreateOpen: boolean
  fullCreateModalOpen: boolean
  searchFocused: boolean
  focusMode: boolean
  hideCompleted: boolean
  showHighPriorityOnly: boolean
  goals: Goals
  sidebarOpen: boolean

  setDarkMode: (v: boolean) => void
  toggleDarkMode: () => void
  setViewMode: (v: ViewMode) => void
  setQuickCreateOpen: (v: boolean) => void
  setFullCreateModalOpen: (v: boolean) => void
  setSearchFocused: (v: boolean) => void
  setFocusMode: (v: boolean) => void
  setHideCompleted: (v: boolean) => void
  setShowHighPriorityOnly: (v: boolean) => void
  setGoals: (g: Partial<Goals>) => void
  setSidebarOpen: (v: boolean) => void
  toggleSidebar: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      darkMode: false,
      viewMode: 'kanban',
      quickCreateOpen: false,
      fullCreateModalOpen: false,
      searchFocused: false,
      focusMode: false,
      hideCompleted: false,
      showHighPriorityOnly: false,
      goals: { daily: 5, weekly: 20 },
      sidebarOpen: true,

      setDarkMode: (v) => set({ darkMode: v }),
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
      setViewMode: (v) => set({ viewMode: v }),
      setQuickCreateOpen: (v) => set({ quickCreateOpen: v }),
      setFullCreateModalOpen: (v) => set({ fullCreateModalOpen: v }),
      setSearchFocused: (v) => set({ searchFocused: v }),
      setFocusMode: (v) => set({ focusMode: v }),
      setHideCompleted: (v) => set({ hideCompleted: v }),
      setShowHighPriorityOnly: (v) => set({ showHighPriorityOnly: v }),
      setGoals: (g) => set((s) => ({ goals: { ...s.goals, ...g } })),
      setSidebarOpen: (v) => set({ sidebarOpen: v }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    }),
    {
      name: 'study-manager-ui',
      partialize: (s) => ({
        darkMode: s.darkMode,
        viewMode: s.viewMode,
        goals: s.goals,
        sidebarOpen: s.sidebarOpen,
      }),
    }
  )
)
