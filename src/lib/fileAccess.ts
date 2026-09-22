import { confirmAction } from '@/store/usePromptStore'

export interface OpenedFile {
  name: string
  path: string
  content: string
}

export type FileWriteOptions = {
  /** When false, skip in-app confirm and never call requestPermission (for auto-save). */
  interactive?: boolean
}

type WritableFileHandle = FileSystemFileHandle & {
  queryPermission?: (descriptor?: { mode?: 'read' | 'readwrite' }) => Promise<PermissionState>
  requestPermission?: (descriptor?: { mode?: 'read' | 'readwrite' }) => Promise<PermissionState>
}

const fileHandles = new Map<string, WritableFileHandle>()

export function setDocumentFileHandle(documentId: string, handle: WritableFileHandle | null) {
  if (handle) fileHandles.set(documentId, handle)
  else fileHandles.delete(documentId)
}

export function getDocumentFileHandle(documentId: string) {
  return fileHandles.get(documentId)
}

function fileNameFromPath(path: string) {
  const parts = path.split(/[/\\]/)
  return parts[parts.length - 1] || path
}

function titleFromFileName(name: string) {
  return name.replace(/\.(md|markdown|txt)$/i, '') || name
}

export function titleFromOpenedFile(file: OpenedFile) {
  return titleFromFileName(file.name)
}

export async function openFileFromSystem(): Promise<
  (OpenedFile & { handle?: WritableFileHandle }) | null
> {
  if (window.markora?.openFile) {
    const result = await window.markora.openFile()
    if (!result) return null
    return {
      name: fileNameFromPath(result.path),
      path: result.path,
      content: result.content,
    }
  }

  if (typeof window.showOpenFilePicker === 'function') {
    try {
      const [handle] = await window.showOpenFilePicker({
        multiple: false,
        types: [
          {
            description: 'Markdown',
            accept: {
              'text/markdown': ['.md', '.markdown'],
              'text/plain': ['.txt'],
            },
          },
        ],
      })
      await requestWritePermissionIfPossible(handle)
      const file = await handle.getFile()
      const content = await file.text()
      return { name: file.name, path: file.name, content, handle }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return null
      throw err
    }
  }

  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.md,.markdown,.txt,text/markdown,text/plain'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) {
        resolve(null)
        return
      }
      resolve({
        name: file.name,
        path: file.name,
        content: await file.text(),
      })
    }
    input.click()
  })
}

async function queryWritePermission(handle: WritableFileHandle) {
  if (typeof handle.queryPermission !== 'function') return 'granted' as PermissionState
  return handle.queryPermission({ mode: 'readwrite' })
}

/** Request permission while the open/save picker user gesture may still be active. */
async function requestWritePermissionIfPossible(handle: WritableFileHandle) {
  if (typeof handle.requestPermission !== 'function') return
  const current = await queryWritePermission(handle)
  if (current === 'granted') return
  try {
    await handle.requestPermission({ mode: 'readwrite' })
  } catch {
    /* ignore — interactive save will prompt in-app */
  }
}

export async function ensureWritePermission(
  handle: WritableFileHandle,
  fileName: string,
  options: FileWriteOptions = {}
): Promise<boolean> {
  const interactive = options.interactive ?? true
  const current = await queryWritePermission(handle)
  if (current === 'granted') return true
  if (current === 'denied') return false
  if (!interactive) return false

  const ok = await confirmAction({
    title: `Save changes to ${fileName}?`,
    message: 'Markora will update this file on your device when you save or auto-save.',
    confirmLabel: 'Save changes',
    cancelLabel: 'Cancel',
  })
  if (!ok) return false

  if (typeof handle.requestPermission !== 'function') return true

  const result = await handle.requestPermission({ mode: 'readwrite' })
  return result === 'granted'
}

async function writeWithHandle(
  handle: WritableFileHandle,
  content: string,
  fileName: string,
  options?: FileWriteOptions
) {
  if (!(await ensureWritePermission(handle, fileName, options))) {
    throw new Error('Write permission not granted')
  }
  const writable = await handle.createWritable()
  await writable.write(content)
  await writable.close()
}

export async function saveToPath(
  documentId: string,
  path: string,
  content: string,
  fileName: string,
  options?: FileWriteOptions
): Promise<string> {
  if (window.markora?.saveFile) {
    const saved = await window.markora.saveFile(path, content)
    return saved.path
  }

  const handle = getDocumentFileHandle(documentId)
  if (handle) {
    await writeWithHandle(handle, content, fileNameFromPath(fileName), options)
    return path
  }

  downloadFallback(fileName, content)
  return path
}

export async function saveFileAs(
  _documentId: string,
  suggestedName: string,
  content: string
): Promise<{ path: string; handle?: WritableFileHandle } | null> {
  if (window.markora?.saveFileAs) {
    const result = await window.markora.saveFileAs(suggestedName, content)
    if (!result) return null
    return { path: result.path }
  }

  if (typeof window.showSaveFilePicker === 'function') {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName,
        types: [
          {
            description: 'Markdown',
            accept: { 'text/markdown': ['.md'] },
          },
        ],
      })
      await requestWritePermissionIfPossible(handle)
      await writeWithHandle(handle, content, suggestedName, { interactive: true })
      const file = await handle.getFile()
      return { path: file.name, handle }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return null
      throw err
    }
  }

  downloadFallback(suggestedName, content)
  return { path: suggestedName }
}

function downloadFallback(fileName: string, content: string) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName.endsWith('.md') ? fileName : `${fileName}.md`
  a.click()
  URL.revokeObjectURL(url)
}

export function defaultSaveFileName(title: string) {
  const base = title.trim() || 'Untitled'
  return base.endsWith('.md') ? base : `${base}.md`
}
