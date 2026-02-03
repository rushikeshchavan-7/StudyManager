/**
 * Toast container: uses react-hot-toast. Wrap app with Toaster.
 */

import { Toaster as HotToaster } from 'react-hot-toast'

export function Toast() {
  return (
    <HotToaster
      position="bottom-center"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
        },
        success: { iconTheme: { primary: 'var(--success)', secondary: 'transparent' } },
        error: { iconTheme: { primary: 'var(--error)', secondary: 'transparent' } },
      }}
    />
  )
}
