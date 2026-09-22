import { useEffect, useState } from 'react'

function readDocumentFullscreen(): boolean {
  const doc = document as Document & { webkitFullscreenElement?: Element | null }
  return !!(doc.fullscreenElement || doc.webkitFullscreenElement)
}

function setFullscreenDocumentClass(full: boolean) {
  document.documentElement.classList.toggle('markora-fullscreen', full)
}

async function readElectronFullscreen(): Promise<boolean> {
  try {
    return (await window.markora?.isFullscreen?.()) === true
  } catch {
    return false
  }
}

/** Window fullscreen (browser API + Electron macOS native fullscreen). */
export function useFullscreen(): boolean {
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    let cancelled = false

    const update = (full: boolean) => {
      if (cancelled) return
      setFullscreen(full)
      setFullscreenDocumentClass(full)
    }

    const sync = async () => {
      const full = readDocumentFullscreen() || (await readElectronFullscreen())
      update(full)
    }

    void sync()

    document.addEventListener('fullscreenchange', () => void sync())
    document.addEventListener('webkitfullscreenchange', () => void sync())
    window.addEventListener('resize', () => void sync())

    let unsubscribe: (() => void) | undefined
    if (window.markora?.onFullscreenChanged) {
      unsubscribe = window.markora.onFullscreenChanged((full) => update(full))
    }

    return () => {
      cancelled = true
      unsubscribe?.()
      setFullscreenDocumentClass(false)
    }
  }, [])

  return fullscreen
}
