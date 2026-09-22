/** True only in the packaged/desktop Electron app on macOS (traffic-light inset). */
export function isMacOsDesktopApp(): boolean {
  return window.markora?.platform === 'darwin'
}

export function applyDocumentPlatformAttributes(): void {
  const root = document.documentElement
  const electronPlatform = window.markora?.platform

  if (!electronPlatform) {
    // Preload may have set these before React loads; do not strip on Electron.
    if (root.getAttribute('data-runtime') !== 'electron') {
      root.removeAttribute('data-runtime')
      root.removeAttribute('data-platform')
    }
    return
  }

  root.setAttribute('data-runtime', 'electron')
  root.setAttribute('data-platform', electronPlatform)
}
