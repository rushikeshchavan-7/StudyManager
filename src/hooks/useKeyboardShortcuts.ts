/**
 * Global keyboard shortcuts: Ctrl+K (quick create), / (search), Ctrl+D (dark), Escape.
 */

import { useEffect } from 'react'
import { useUIStore } from '@/store/uiStore'

export function useKeyboardShortcuts() {
  const {
    setQuickCreateOpen,
    setSearchFocused,
    toggleDarkMode,
  } = useUIStore()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC')
      const mod = isMac ? e.metaKey : e.ctrlKey

      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setQuickCreateOpen(true)
        return
      }
      if (e.key === '/' && !isInputField(e.target)) {
        e.preventDefault()
        setSearchFocused(true)
        return
      }
      if (mod && e.key.toLowerCase() === 'd') {
        e.preventDefault()
        toggleDarkMode()
        return
      }
      if (e.key === 'Escape') {
        setQuickCreateOpen(false)
        setSearchFocused(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [setQuickCreateOpen, setSearchFocused, toggleDarkMode])
}

function isInputField(el: EventTarget | null): boolean {
  if (!el || !(el instanceof HTMLElement)) return false
  const tag = el.tagName.toLowerCase()
  const role = el.getAttribute('role')
  const isContentEditable = el.getAttribute('contenteditable') === 'true'
  return (
    tag === 'input' ||
    tag === 'textarea' ||
    tag === 'select' ||
    role === 'textbox' ||
    role === 'searchbox' ||
    isContentEditable
  )
}
