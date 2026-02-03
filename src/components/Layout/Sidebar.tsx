import { LayoutDashboard, Target, Timer, Settings } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { path: '/', label: 'Board', icon: LayoutDashboard },
  { path: '/dashboard', label: 'Dashboard', icon: Target },
  { path: '/timer', label: 'Pomodoro', icon: Timer },
  { path: '/settings', label: 'Settings', icon: Settings },
] as const

export function Sidebar() {
  const { sidebarOpen } = useUIStore()
  const location = useLocation()

  return (
    <aside
      className={`hidden shrink-0 flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4 ${sidebarOpen ? 'lg:flex' : ''} w-56`}
      aria-label="Main navigation"
    >
      <nav className="flex flex-col gap-1">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path
          return (
            <Link
              key={path}
              to={path}
              className={`flex min-h-[44px] items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[var(--accent-muted)] text-[var(--accent)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
