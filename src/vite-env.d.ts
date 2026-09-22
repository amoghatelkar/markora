/// <reference types="vite/client" />

declare const __MARKORA_VERSION__: string

interface MarkoraOpenResult {
  path: string
  content: string
}

interface MarkoraAPI {
  platform: string
  isFullscreen?: () => Promise<boolean>
  onFullscreenChanged?: (callback: (full: boolean) => void) => () => void
  openFile?: () => Promise<MarkoraOpenResult | null>
  saveFile?: (path: string, content: string) => Promise<{ path: string }>
  saveFileAs?: (defaultPath: string, content: string) => Promise<{ path: string } | null>
  onOpenDocument?: (callback: (file: { path: string; content: string }) => void) => () => void
}

interface FileSystemHandlePermissionDescriptor {
  mode?: 'read' | 'readwrite'
}

interface FileSystemFileHandleWithPermissions extends FileSystemFileHandle {
  queryPermission?(descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>
  requestPermission?(descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>
}

interface Window {
  markora?: MarkoraAPI
  showOpenFilePicker?: (options?: OpenFilePickerOptions) => Promise<FileSystemFileHandleWithPermissions[]>
  showSaveFilePicker?: (options?: SaveFilePickerOptions) => Promise<FileSystemFileHandleWithPermissions>
}
