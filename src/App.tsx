import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Navbar } from '@/components/Layout/Navbar'
import { Sidebar } from '@/components/Layout/Sidebar'
import { Toast } from '@/components/Common/Toast'
import { TaskQuickCreate } from '@/components/Task/TaskQuickCreate'
import { BoardPage } from '@/pages/BoardPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { TimerPage } from '@/pages/TimerPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { useUIStore } from '@/store/uiStore'
import { useTaskStore } from '@/store/taskStore'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useGoogleSheets } from '@/hooks/useGoogleSheets'

function AppLayout() {
  const darkMode = useUIStore((s) => s.darkMode)
  const loadFromCache = useTaskStore((s) => s.loadFromCache)

  useKeyboardShortcuts()
  useGoogleSheets()

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [darkMode])

  useEffect(() => {
    loadFromCache()
  }, [loadFromCache])

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg-primary)]">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<BoardPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/timer" element={<TimerPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
      <TaskQuickCreate />
      <Toast />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}

export default App
