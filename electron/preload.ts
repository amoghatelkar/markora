import { contextBridge, ipcRenderer } from 'electron'

function applyElectronDocumentAttributes() {
  const root = document.documentElement
  root.setAttribute('data-runtime', 'electron')
  root.setAttribute('data-platform', process.platform)
  if (process.platform === 'darwin') {
    root.classList.add('markora-macos-desktop')
  }
}

function runWhenDocumentReady(fn: () => void) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn, { once: true })
  } else {
    fn()
  }
}

runWhenDocumentReady(applyElectronDocumentAttributes)

contextBridge.exposeInMainWorld('markora', {
  platform: process.platform,
  openFile: () => ipcRenderer.invoke('dialog:openFile') as Promise<{ path: string; content: string } | null>,
  saveFile: (path: string, content: string) =>
    ipcRenderer.invoke('dialog:saveFile', { path, content }) as Promise<{ path: string }>,
  saveFileAs: (defaultPath: string, content: string) =>
    ipcRenderer.invoke('dialog:saveFileAs', { defaultPath, content }) as Promise<{ path: string } | null>,
})
