import { useEffect, useState } from 'react'
import { applyDocumentPlatformAttributes, isMacOsDesktopApp } from '@/lib/platform'
import { useIsMobileLayout } from '@/hooks/useMediaQuery'

/** macOS Electron with inset traffic lights (not mobile layout). */
export function useMacElectronChrome(): boolean {
  const isMobile = useIsMobileLayout()
  const [macChrome, setMacChrome] = useState(() => isMacOsDesktopApp() && !isMobile)

  useEffect(() => {
    applyDocumentPlatformAttributes()
    setMacChrome(isMacOsDesktopApp() && !isMobile)
  }, [isMobile])

  return macChrome
}
