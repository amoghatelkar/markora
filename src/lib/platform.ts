/** True only in the packaged/desktop Electron app on macOS (traffic-light inset). */
export function isMacOsDesktopApp(): boolean {
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
  if (electronPlatform === 'darwin') {
    root.classList.add('markora-macos-desktop')
  } else {
    root.classList.remove('markora-macos-desktop')
  }
}
