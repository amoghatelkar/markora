export interface OpenedFile {
  name: string
  path: string
  content: string
}

const fileHandles = new Map<string, FileSystemFileHandle>()

export function setDocumentFileHandle(documentId: string, handle: FileSystemFileHandle | null) {
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
  (OpenedFile & { handle?: FileSystemFileHandle }) | null
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

async function writeWithHandle(handle: FileSystemFileHandle, content: string) {
  const writable = await handle.createWritable()
  await writable.write(content)
  await writable.close()
}

export async function saveToPath(
  documentId: string,
  path: string,
  content: string,
  fileName: string
): Promise<string> {
  if (window.markora?.saveFile) {
    const saved = await window.markora.saveFile(path, content)
    return saved.path
  }

  const handle = getDocumentFileHandle(documentId)
  if (handle) {
    await writeWithHandle(handle, content)
    return path
  }

  downloadFallback(fileName, content)
  return path
}

export async function saveFileAs(
  _documentId: string,
  suggestedName: string,
  content: string
): Promise<{ path: string; handle?: FileSystemFileHandle } | null> {
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
      await writeWithHandle(handle, content)
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
