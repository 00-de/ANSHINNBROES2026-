'use strict'
const { app, BrowserWindow, ipcMain, shell, session } = require('electron')
const path = require('path')

const isDev = process.env.NODE_ENV === 'development'
let mainWindow = null

// 単一起動（二重起動を防ぐ）
const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 680,
    show: false,
    frame: false,
    backgroundColor: '#0f1622',
    title: 'AIサポートブラウザ Pro',
    icon: path.join(__dirname, '..', 'public', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webviewTag: true, // 内蔵ブラウザ用
      spellcheck: false,
    },
  })

  mainWindow.once('ready-to-show', () => mainWindow.show())

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }

  // 外部リンクは既定ブラウザで開く（アプリ画面の乗っ取り防止）
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://') || url.startsWith('http://')) shell.openExternal(url)
    return { action: 'deny' }
  })

  mainWindow.on('maximize', () => mainWindow.webContents.send('window:state', true))
  mainWindow.on('unmaximize', () => mainWindow.webContents.send('window:state', false))
  mainWindow.on('closed', () => { mainWindow = null })
}

app.whenReady().then(() => {
  // webview の権限は最小限に（位置情報・カメラ等は既定で拒否）
  session.defaultSession.setPermissionRequestHandler((_wc, permission, callback) => {
    const allowed = ['fullscreen', 'clipboard-read', 'clipboard-sanitized-write']
    callback(allowed.includes(permission))
  })

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

/* ---------- IPC ---------- */
ipcMain.handle('window:minimize', () => mainWindow && mainWindow.minimize())
ipcMain.handle('window:toggleMaximize', () => {
  if (!mainWindow) return false
  if (mainWindow.isMaximized()) mainWindow.unmaximize()
  else mainWindow.maximize()
  return mainWindow.isMaximized()
})
ipcMain.handle('window:close', () => mainWindow && mainWindow.close())
ipcMain.handle('app:version', () => app.getVersion())
ipcMain.handle('app:openExternal', (_e, url) => {
  if (typeof url === 'string' && /^https?:\/\//.test(url)) return shell.openExternal(url)
  return false
})
