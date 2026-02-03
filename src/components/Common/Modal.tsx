import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: React.ReactNode
  description?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Modal({ open, onOpenChange, title, description, children, size = 'md' }: ModalProps) {
  const sizeClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  }[size]

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={`fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-h-[85dvh] ${sizeClass} -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-6 shadow-[var(--shadow-lg)] focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 sm:w-full`}
          aria-describedby={description ? undefined : undefined}
          onEscapeKeyDown={() => onOpenChange(false)}
        >
          <div className="flex items-center justify-between gap-4">
            <Dialog.Title className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
              {title}
            </Dialog.Title>
            <Dialog.Close
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>
          {description && (
            <Dialog.Description className="mt-1 text-[var(--text-secondary)]">
              {description}
            </Dialog.Description>
          )}
          <div className="mt-5">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
