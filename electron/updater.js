'use strict'
const { autoUpdater } = require('electron-updater')
const { ipcMain } = require('electron')

/**
 * 自動更新。
 * - 起動から10秒後に一度確認し、そのあとは6時間ごとに確認する。
 * - 見つかったら背景で静かにダウンロードする。
 * - ダウンロードが終わったら、画面に大きなお知らせを出して本人に選んでもらう。
 *   （勝手に再起動しない。作業中に画面が消えると不安になるため）
 */
function setupUpdater(win, isDev) {
  if (isDev) return // 開発中は更新確認をしない

  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true
  autoUpdater.allowPrerelease = false
  autoUpdater.logger = null

  const send = (channel, payload) => {
    if (win && !win.isDestroyed()) win.webContents.send(channel, payload)
  }

  autoUpdater.on('checking-for-update', () => send('update:status', { state: 'checking' }))

  autoUpdater.on('update-available', (info) => {
    send('update:status', { state: 'available', version: info.version })
  })

  autoUpdater.on('update-not-available', () => send('update:status', { state: 'latest' }))

  autoUpdater.on('download-progress', (p) => {
    send('update:status', { state: 'downloading', percent: Math.round(p.percent) })
  })

  autoUpdater.on('update-downloaded', (info) => {
    send('update:status', { state: 'ready', version: info.version })
  })

  autoUpdater.on('error', (err) => {
    // 更新できなくても、アプリはそのまま使える状態を保つ
    send('update:status', { state: 'error', message: String(err && err.message ? err.message : err) })
  })

  const check = () => { autoUpdater.checkForUpdates().catch(() => { /* 通信できないときは何もしない */ }) }

  setTimeout(check, 10 * 1000)
  setInterval(check, 6 * 60 * 60 * 1000)

  ipcMain.handle('update:check', () => { check(); return true })
  ipcMain.handle('update:install', () => {
    setImmediate(() => autoUpdater.quitAndInstall(false, true))
    return true
  })
}

module.exports = { setupUpdater }
