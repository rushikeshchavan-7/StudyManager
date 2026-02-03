/**
 * Filter state and presets for task list.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FilterState, FilterPreset } from '@/types/filter'

const defaultFilter: FilterState = {
  searchQuery: '',
  statuses: [],
  priorities: [],
  tags: [],
  dueDateFrom: null,
  dueDateTo: null,
  createdFrom: null,
  createdTo: null,
}

interface FilterStoreState {
  filter: FilterState
  presets: FilterPreset[]
  setFilter: (f: Partial<FilterState>) => void
  resetFilter: () => void
  addPreset: (name: string) => void
  removePreset: (id: string) => void
  applyPreset: (id: string) => void
}

export const useFilterStore = create<FilterStoreState>()(
  persist(
    (set, get) => ({
      filter: defaultFilter,
      presets: [],

      setFilter: (partial) =>
        set((s) => ({ filter: { ...s.filter, ...partial } })),

      resetFilter: () => set({ filter: { ...defaultFilter } }),

      addPreset: (name) => {
        const id = `preset-${Date.now()}`
        set((s) => ({
          presets: [
            ...s.presets,
            { id, name, filter: { ...s.filter }, createdAt: new Date().toISOString() },
          ],
        }))
      },

      removePreset: (id) =>
        set((s) => ({ presets: s.presets.filter((p) => p.id !== id) })),

      applyPreset: (id) => {
        const preset = get().presets.find((p) => p.id === id)
        if (preset) set({ filter: { ...preset.filter } })
      },
    }),
    { name: 'study-manager-filter' }
  )
)
