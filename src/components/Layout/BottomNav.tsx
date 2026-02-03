import { LayoutDashboard, Target, Timer, Settings } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { path: '/', label: 'Board', icon: LayoutDashboard },
  { path: '/dashboard', label: 'Dashboard', icon: Target },
  { path: '/timer', label: 'Timer', icon: Timer },
  { path: '/settings', label: 'Settings', icon: Settings },
] as const

export function BottomNav() {
  const location = useLocation()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-[var(--border-subtle)] bg-[var(--bg-elevated)] pt-2 lg:hidden"
      style={{ paddingBottom: 'calc(8px + var(--safe-bottom))' }}
      aria-label="Main navigation"
    >
      {navItems.map(({ path, label, icon: Icon }) => {
        const isActive = location.pathname === path
        return (
          <Link
            key={path}
            to={path}
            className="flex min-h-[var(--tap)] flex-col items-center justify-center gap-0.5 px-4 py-2 text-[var(--text-muted)] transition-colors active:opacity-80"
            style={{ minWidth: 'var(--tap)' }}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon
              className={`h-6 w-6 shrink-0 ${isActive ? 'text-[var(--accent)]' : ''}`}
              strokeWidth={isActive ? 2.25 : 1.75}
              aria-hidden
            />
            <span
              className={`text-[11px] font-medium ${isActive ? 'text-[var(--accent)]' : ''}`}
            >
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
