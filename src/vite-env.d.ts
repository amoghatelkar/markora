/// <reference types="vite/client" />

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

interface Window {
  markora?: MarkoraAPI
  showOpenFilePicker?: (options?: OpenFilePickerOptions) => Promise<FileSystemFileHandle[]>
  showSaveFilePicker?: (options?: SaveFilePickerOptions) => Promise<FileSystemFileHandle>
}
