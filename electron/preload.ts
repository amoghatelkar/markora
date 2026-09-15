import { contextBridge } from 'electron'

contextBridge.exposeInMainWorld('markora', {
  platform: process.platform,
})
