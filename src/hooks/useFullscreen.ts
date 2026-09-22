import { useEffect, useState } from 'react'

function readDocumentFullscreen(): boolean {
  const doc = document as Document & { webkitFullscreenElement?: Element | null }
  return !!(doc.fullscreenElement || doc.webkitFullscreenElement)
}

function setFullscreenDocumentClass(full: boolean) {
  document.documentElement.classList.toggle('markora-fullscreen', full)
}

/** Window fullscreen (browser API + Electron macOS native fullscreen). */
export function useFullscreen(): boolean {
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    const update = (full: boolean) => {
      setFullscreen(full)
      setFullscreenDocumentClass(full)
    }

    const readDom = () => update(readDocumentFullscreen())

    readDom()
    document.addEventListener('fullscreenchange', readDom)
    document.addEventListener('webkitfullscreenchange', readDom)

    let unsubscribe: (() => void) | undefined

    void window.markora?.isFullscreen?.().then((full) => {
      if (typeof full === 'boolean') update(full)
    })

    if (window.markora?.onFullscreenChanged) {
      unsubscribe = window.markora.onFullscreenChanged(update)
    }

    return () => {
      document.removeEventListener('fullscreenchange', readDom)
      document.removeEventListener('webkitfullscreenchange', readDom)
      unsubscribe?.()
      setFullscreenDocumentClass(false)
    }
  }, [])

  return fullscreen
}
