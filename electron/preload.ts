import { contextBridge, ipcRenderer } from 'electron'

function applyElectronDocumentAttributes() {
  const root = document.documentElement
  root.setAttribute('data-runtime', 'electron')
  root.setAttribute('data-platform', process.platform)
  if (process.platform === 'darwin') {
    root.classList.add('markora-macos')
    root.setAttribute('data-platform', 'darwin')
  }
}

function runWhenDocumentReady(fn: () => void) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn, { once: true })
  } else {
    fn()
  }
}

applyElectronDocumentAttributes()
runWhenDocumentReady(applyElectronDocumentAttributes)

contextBridge.exposeInMainWorld('markora', {
  platform: process.platform,
  isFullscreen: () => ipcRenderer.invoke('markora:isFullscreen') as Promise<boolean>,
  onFullscreenChanged: (callback: (full: boolean) => void) => {
    const listener = (_event: unknown, full: boolean) => callback(full)
    ipcRenderer.on('markora:fullscreen-changed', listener)
    return () => {
      ipcRenderer.removeListener('markora:fullscreen-changed', listener)
    }
  },
  openFile: () => ipcRenderer.invoke('dialog:openFile') as Promise<{ path: string; content: string } | null>,
  saveFile: (path: string, content: string) =>
    ipcRenderer.invoke('dialog:saveFile', { path, content }) as Promise<{ path: string }>,
  saveFileAs: (defaultPath: string, content: string) =>
    ipcRenderer.invoke('dialog:saveFileAs', { defaultPath, content }) as Promise<{ path: string } | null>,
})
