/// <reference types="vite/client" />

declare const __MARKORA_VERSION__: string

interface MarkoraOpenResult {
  path: string
  content: string
}

interface MarkoraAPI {
  platform: string
  openFile?: () => Promise<MarkoraOpenResult | null>
  saveFile?: (path: string, content: string) => Promise<{ path: string }>
  saveFileAs?: (defaultPath: string, content: string) => Promise<{ path: string } | null>
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
