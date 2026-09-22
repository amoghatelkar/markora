/** macOS (desktop app, browser, or Electron). */
export function isMacPlatform(): boolean {
  if (typeof navigator === 'undefined') return false
  const platform = navigator.platform?.toLowerCase() ?? ''
  const ua = navigator.userAgent
  return platform.includes('mac') || /Macintosh|Mac OS X/i.test(ua)
}

/** @deprecated Use isMacPlatform() for layout; kept for callers that meant desktop Electron. */
export function isMacOsDesktopApp(): boolean {
  return isMacPlatform()
}

/** Apply macOS layout attributes before first paint (title bar traffic-light gutter). */
export function ensureMacDocumentAttributes(): void {
  if (!isMacPlatform()) return
  const root = document.documentElement
  root.setAttribute('data-platform', 'darwin')
  root.classList.add('markora-macos')
}

/** @deprecated Alias for ensureMacDocumentAttributes */
export const ensureMacElectronDocumentClass = ensureMacDocumentAttributes

export function applyDocumentPlatformAttributes(): void {
  ensureMacDocumentAttributes()

  const root = document.documentElement
  const electronPlatform = window.markora?.platform

  if (!electronPlatform) {
    if (root.getAttribute('data-runtime') === 'electron') {
      root.removeAttribute('data-runtime')
    }
    if (!isMacPlatform()) {
      root.removeAttribute('data-platform')
      root.classList.remove('markora-macos')
    }
    return
  }

  root.setAttribute('data-runtime', 'electron')
  root.setAttribute('data-platform', electronPlatform)
  if (electronPlatform === 'darwin') {
    root.classList.add('markora-macos')
  }
}
