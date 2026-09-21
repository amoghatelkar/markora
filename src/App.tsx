import { useEffect } from 'react'
import { AppShell } from '@/components/shell/AppShell'
import { useAppStore } from '@/store/useAppStore'

function isMacPlatform(): boolean {
  const platform = window.markora?.platform ?? navigator.platform
  return platform === 'darwin' || /Mac|iPhone|iPad|iPod/i.test(platform)
}

if (typeof document !== 'undefined' && isMacPlatform()) {
  document.documentElement.setAttribute('data-platform', 'darwin')
}

export function App() {
  const setTheme = useAppStore((s) => s.setTheme)
  const theme = useAppStore((s) => s.theme)

  useEffect(() => {
    setTheme(theme)
    if (isMacPlatform()) {
      document.documentElement.setAttribute('data-platform', 'darwin')
    }
  }, [setTheme, theme])

  return <AppShell />
}
