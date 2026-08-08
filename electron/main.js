'use strict'
const { app, BrowserWindow, ipcMain, shell, session, globalShortcut } = require('electron')
const path = require('path')
const { setupUpdater } = require('./updater')
const pageView = require('./browserView')
const logger = require('./logger')

const isDev = process.env.NODE_ENV === 'development'
let mainWindow = null

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
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      spellcheck: false,
    },
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    setupUpdater(mainWindow, isDev)
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }

  // F12 で開発ツールを開く（不具合の確認用）
  mainWindow.webContents.on('before-input-event', (_e, input) => {
    if (input.type !== 'keyDown') return
    const i = input.key ? input.key.toLowerCase() : ''
    if (input.key === 'F12' || (input.control && input.shift && i === 'i')) {
      mainWindow.webContents.toggleDevTools()
    }
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//.test(url)) shell.openExternal(url)
    return { action: 'deny' }
  })

  mainWindow.on('maximize', () => mainWindow.webContents.send('window:state', true))
  mainWindow.on('unmaximize', () => mainWindow.webContents.send('window:state', false))
  mainWindow.on('closed', () => { mainWindow = null })
}

app.whenReady().then(() => {
  logger.init()
  logger.log('アプリ起動', app.getVersion())

  // どんな状態からでも抜け出せる非常口（ページ部品に隠れていても効く）
  globalShortcut.register('Control+Alt+X', () => {
    logger.log('非常口: ページを隠しました')
    pageView.hide()
    if (mainWindow) mainWindow.webContents.focus()
  })
  globalShortcut.register('Control+Alt+D', () => {
    logger.log('非常口: 開発ツールを開きました')
    pageView.hide()
    if (mainWindow) {
      mainWindow.webContents.focus()
      mainWindow.webContents.openDevTools({ mode: 'bottom' })
    }
  })
  globalShortcut.register('Control+Alt+L', () => logger.openLog())

  session.defaultSession.setPermissionRequestHandler((_wc, permission, callback) => {
    const allowed = ['fullscreen', 'clipboard-read', 'clipboard-sanitized-write']
    callback(allowed.includes(permission))
  })

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('will-quit', () => globalShortcut.unregisterAll())

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

/* ---------- ウィンドウ操作 ---------- */
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

/* ---------- ページ表示（内蔵ブラウザ） ---------- */
ipcMain.handle('view:show', (_e, bounds, url) => {
  if (!mainWindow) return null
  return pageView.show(mainWindow, bounds || {}, url)
})
ipcMain.handle('view:hide', () => pageView.hide())
ipcMain.handle('view:navigate', (_e, url) => pageView.navigate(url))
ipcMain.handle('view:command', (_e, name) => pageView.command(name))
ipcMain.handle('view:zoom', (_e, factor) => pageView.setZoom(factor))
ipcMain.handle('view:readText', () => pageView.readText())
ipcMain.handle('view:state', () => pageView.state())
ipcMain.handle('app:openLog', () => logger.openLog())
