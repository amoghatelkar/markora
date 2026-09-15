import { useEffect } from 'react'
import { AppShell } from '@/components/shell/AppShell'
import { useAppStore } from '@/store/useAppStore'

export function App() {
  const setTheme = useAppStore((s) => s.setTheme)
  const theme = useAppStore((s) => s.theme)

  useEffect(() => {
    setTheme(theme)
    const platform = window.markora?.platform ?? navigator.platform.toLowerCase()
    if (platform.includes('mac')) {
      document.documentElement.setAttribute('data-platform', 'darwin')
    }
  }, [setTheme, theme])

  return <AppShell />
}
