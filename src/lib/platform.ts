/** Electron renderer on macOS (works without preload / markora bridge). */
export function isElectronMacRenderer(): boolean {
  if (typeof navigator === 'undefined') return false
  if (!/Electron/i.test(navigator.userAgent)) return false
  const platform = navigator.platform?.toLowerCase() ?? ''
  const ua = navigator.userAgent.toLowerCase()
  return platform.includes('mac') || ua.includes('macintosh')
}

/** True only in the packaged/desktop Electron app on macOS (traffic-light inset). */
export function isMacOsDesktopApp(): boolean {
  if (isElectronMacRenderer()) return true

  if (typeof document !== 'undefined') {
    const root = document.documentElement
    if (root.classList.contains('markora-macos-desktop')) return true
    if (
      root.getAttribute('data-runtime') === 'electron' &&
      root.getAttribute('data-platform') === 'darwin'
    ) {
      return true
    }
  }

  return window.markora?.platform === 'darwin'
}

/** Call before React mounts so macOS inset CSS applies on first paint. */
export function ensureMacElectronDocumentClass(): void {
  if (!isElectronMacRenderer()) return
  const root = document.documentElement
  root.classList.add('markora-macos-desktop')
  root.setAttribute('data-runtime', 'electron')
  root.setAttribute('data-platform', 'darwin')
}

export function applyDocumentPlatformAttributes(): void {
  ensureMacElectronDocumentClass()

  const root = document.documentElement
  const electronPlatform = window.markora?.platform

  if (!electronPlatform) {
    if (root.getAttribute('data-runtime') !== 'electron') {
      root.removeAttribute('data-runtime')
      root.removeAttribute('data-platform')
      root.classList.remove('markora-macos-desktop')
    }
    return
  }

  root.setAttribute('data-runtime', 'electron')
  root.setAttribute('data-platform', electronPlatform)
  if (electronPlatform === 'darwin') {
    root.classList.add('markora-macos-desktop')
  } else {
    root.classList.remove('markora-macos-desktop')
  }
}
