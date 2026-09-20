import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('markora', {
  platform: process.platform,
  openFile: () => ipcRenderer.invoke('dialog:openFile') as Promise<{ path: string; content: string } | null>,
  saveFile: (path: string, content: string) =>
    ipcRenderer.invoke('dialog:saveFile', { path, content }) as Promise<{ path: string }>,
  saveFileAs: (defaultPath: string, content: string) =>
    ipcRenderer.invoke('dialog:saveFileAs', { defaultPath, content }) as Promise<{ path: string } | null>,
})
