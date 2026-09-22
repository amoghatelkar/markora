import { app, BrowserWindow, shell, dialog, ipcMain } from 'electron'
import { join, dirname, extname } from 'path'
import { readFile, writeFile } from 'fs/promises'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const isDev = !app.isPackaged

const TEXT_EXTENSIONS = new Set(['.md', '.markdown', '.txt'])

// AppImages mount under /tmp and cannot use Chromium's setuid chrome-sandbox (mode 4755).
if (process.platform === 'linux') {
  app.commandLine.appendSwitch('no-sandbox')
  app.commandLine.appendSwitch('disable-setuid-sandbox')
}

const MARKDOWN_FILTERS = [
  { name: 'Markdown', extensions: ['md', 'markdown', 'txt'] },
]

let pendingOpenPath: string | null = null

function isTextDocumentPath(filePath: string) {
  const ext = extname(filePath).toLowerCase()
  if (!TEXT_EXTENSIONS.has(ext)) return false
  const lower = filePath.toLowerCase()
  // Ignore accidental opens of files inside the app bundle (e.g. dist/index.html, icons).
  if (lower.includes('.app/contents/') || lower.includes('app.asar')) return false
  return true
}

function textDocumentPathFromArgv(argv: string[]) {
  return argv.find((arg) => !arg.startsWith('-') && isTextDocumentPath(arg)) ?? null
}

async function readTextFile(path: string): Promise<string | null> {
  if (!isTextDocumentPath(path)) return null
  const buf = await readFile(path)
  if (buf.includes(0)) return null
  return buf.toString('utf-8')
}

function notifyFullscreen(win: BrowserWindow) {
  win.webContents.send('markora:fullscreen-changed', win.isFullScreen())
}

async function openPathInWindow(win: BrowserWindow, filePath: string) {
  try {
    const content = await readTextFile(filePath)
    if (content === null) return
    win.webContents.send('markora:open-document', { path: filePath, content })
  } catch {
    /* ignore unreadable files */
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#0a0a0a',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    trafficLightPosition: { x: 18, y: 15 },
    show: false,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  win.once('ready-to-show', () => win.show())

  const onFullscreenMaybeChanged = () => notifyFullscreen(win)
  win.on('enter-full-screen', onFullscreenMaybeChanged)
  win.on('leave-full-screen', onFullscreenMaybeChanged)
  win.on('resize', onFullscreenMaybeChanged)
  win.on('maximize', onFullscreenMaybeChanged)
  win.on('unmaximize', onFullscreenMaybeChanged)

  win.webContents.on('will-navigate', (event, url) => {
    const current = win.webContents.getURL()
    if (url !== current) event.preventDefault()
  })

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('blob:') || url === 'about:blank') {
      return { action: 'allow' }
    }
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (isDev) {
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    const indexHtml = join(app.getAppPath(), 'dist', 'index.html')
    void win.loadFile(indexHtml)
  }

  win.webContents.on('did-finish-load', () => {
    onFullscreenMaybeChanged()
    if (pendingOpenPath) {
      void openPathInWindow(win, pendingOpenPath)
      pendingOpenPath = null
    }
  })

  return win
}

app.on('will-finish-launching', () => {
  app.on('open-file', (event, filePath) => {
    event.preventDefault()
    if (!isTextDocumentPath(filePath)) return
    pendingOpenPath = filePath
    const win = BrowserWindow.getAllWindows()[0]
    if (win) void openPathInWindow(win, filePath)
  })
})

ipcMain.handle('markora:isFullscreen', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  return win?.isFullScreen() ?? false
})

ipcMain.handle('dialog:openFile', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    filters: MARKDOWN_FILTERS,
    properties: ['openFile'],
  })
  if (canceled || !filePaths[0]) return null
  const path = filePaths[0]
  const content = await readTextFile(path)
  if (content === null) return null
  return { path, content }
})

ipcMain.handle('dialog:saveFile', async (_event, payload: { path: string; content: string }) => {
  await writeFile(payload.path, payload.content, 'utf-8')
  return { path: payload.path }
})

ipcMain.handle(
  'dialog:saveFileAs',
  async (_event, payload: { defaultPath: string; content: string }) => {
    const { canceled, filePath } = await dialog.showSaveDialog({
      defaultPath: payload.defaultPath,
      filters: MARKDOWN_FILTERS,
    })
    if (canceled || !filePath) return null
    await writeFile(filePath, payload.content, 'utf-8')
    return { path: filePath }
  }
)

app.whenReady().then(() => {
  const fromArgv = textDocumentPathFromArgv(process.argv.slice(1))
  if (fromArgv) pendingOpenPath = fromArgv
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
