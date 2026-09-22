import { app, BrowserWindow, shell, dialog, ipcMain } from 'electron'
import { join, dirname } from 'path'
import { readFile, writeFile } from 'fs/promises'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const isDev = !app.isPackaged

// AppImages mount under /tmp and cannot use Chromium's setuid chrome-sandbox (mode 4755).
if (process.platform === 'linux') {
  app.commandLine.appendSwitch('no-sandbox')
  app.commandLine.appendSwitch('disable-setuid-sandbox')
}

const MARKDOWN_FILTERS = [
  { name: 'Markdown', extensions: ['md', 'markdown', 'txt'] },
]

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#0a0a0a',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    trafficLightPosition: { x: 16, y: 14 },
    show: false,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  win.once('ready-to-show', () => win.show())

  if (isDev) {
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    win.loadFile(join(__dirname, '../dist/index.html'))
  }

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('blob:') || url === 'about:blank') {
      return { action: 'allow' }
    }
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

ipcMain.handle('dialog:openFile', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    filters: MARKDOWN_FILTERS,
    properties: ['openFile'],
  })
  if (canceled || !filePaths[0]) return null
  const path = filePaths[0]
  const content = await readFile(path, 'utf-8')
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

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
