import { useEffect } from 'react'
import { AppShell } from '@/components/shell/AppShell'
import { useAppStore } from '@/store/useAppStore'
import { applyDocumentPlatformAttributes } from '@/lib/platform'

if (typeof document !== 'undefined') {
  applyDocumentPlatformAttributes()
}

export function App() {
  const setTheme = useAppStore((s) => s.setTheme)
  const theme = useAppStore((s) => s.theme)

  const openDocumentFromElectron = useAppStore((s) => s.openDocumentFromElectron)

  useEffect(() => {
    setTheme(theme)
    applyDocumentPlatformAttributes()
  }, [setTheme, theme])

  useEffect(() => {
    const unsubscribe = window.markora?.onOpenDocument?.((file) => {
      openDocumentFromElectron(file)
    })
    return () => unsubscribe?.()
  }, [openDocumentFromElectron])

  return <AppShell />
}
