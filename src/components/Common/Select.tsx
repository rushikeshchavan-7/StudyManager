import * as SelectPrimitive from '@radix-ui/react-select'
import { ChevronDown } from 'lucide-react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  label?: string
  disabled?: boolean
  className?: string
  'aria-label'?: string
}

export function Select({
  value,
  onValueChange,
  options,
  placeholder = 'Select…',
  label,
  disabled,
  className = '',
  'aria-label': ariaLabel,
}: SelectProps) {
  return (
    <div className={className}>
      {label && (
        <label className="mb-1 block text-sm font-medium text-[var(--text-secondary)]">{label}</label>
      )}
      <SelectPrimitive.Root value={value ?? ''} onValueChange={onValueChange} disabled={disabled}>
        <SelectPrimitive.Trigger
          aria-label={ariaLabel ?? label}
          className="inline-flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] data-[placeholder]:text-[var(--text-muted)] disabled:opacity-50"
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon>
            <ChevronDown className="h-4 w-4" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            className="z-[100] overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] shadow-lg"
            position="popper"
            sideOffset={4}
          >
            <SelectPrimitive.Viewport className="p-1">
              {options.map((opt) => (
                <SelectPrimitive.Item
                  key={opt.value}
                  value={opt.value}
                  className="relative flex cursor-pointer select-none items-center rounded-md py-2 pl-8 pr-2 text-sm outline-none data-[highlighted]:bg-[var(--bg-tertiary)]"
                >
                  <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator className="absolute left-2">
                    ✓
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </div>
  )
}
