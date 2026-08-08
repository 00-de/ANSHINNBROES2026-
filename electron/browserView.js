'use strict'
const { WebContentsView, shell } = require('electron')
const { log } = require('./logger')

/**
 * ページ表示用のビュー（WebContentsView）を1つだけ作って使い回す。
 * <webview> タグは環境によって動かないことがあるため、
 * Electron が推奨する WebContentsView を使う。
 * 画面上の置き場所は、React 側から座標をもらって合わせる。
 */
let view = null
let host = null
let currentUrl = ''

function state() {
  if (!view) return { attached: false }
  const wc = view.webContents
  return {
    attached: true,
    url: wc.getURL(),
    loading: wc.isLoading(),
    canGoBack: wc.navigationHistory ? wc.navigationHistory.canGoBack() : wc.canGoBack(),
    canGoForward: wc.navigationHistory ? wc.navigationHistory.canGoForward() : wc.canGoForward(),
  }
}

function push(extra) {
  if (host && !host.isDestroyed()) {
    host.webContents.send('view:state', Object.assign(state(), extra || {}))
  }
}

function ensure(win) {
  host = win
  if (view) return view

  view = new WebContentsView({
    webPreferences: {
      partition: 'persist:aisb',
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false,
    },
  })

  win.contentView.addChildView(view)
  view.setBounds({ x: 0, y: 0, width: 0, height: 0 })

  const wc = view.webContents

  wc.on('did-start-loading', () => push({ event: 'start' }))
  wc.on('did-stop-loading', () => push({ event: 'stop' }))
  wc.on('did-navigate', (_e, url) => { currentUrl = url; push({ event: 'navigate' }) })
  wc.on('did-navigate-in-page', () => push({ event: 'inpage' }))
  wc.on('page-title-updated', (_e, title) => push({ title }))
  wc.on('did-fail-load', (_e, code, desc, url, isMainFrame) => {
    if (!isMainFrame || code === -3) return
    log('[view] 読み込み失敗', code, desc, url)
    push({ event: 'fail', errorCode: code, errorDescription: desc, failedUrl: url })
  })
  wc.on('render-process-gone', (_e, d) => log('[view] 表示部品が停止', JSON.stringify(d)))

  // 新しいウィンドウを開こうとしたら、同じビューの中で開く
  wc.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//.test(url)) { wc.loadURL(url); return { action: 'deny' } }
    if (/^mailto:|^tel:/.test(url)) { shell.openExternal(url); return { action: 'deny' } }
    return { action: 'deny' }
  })

  return view
}

function show(win, bounds, url) {
  const v = ensure(win)
  const size = win.getContentBounds()
  let b = {
    x: Math.round(bounds.x || 0),
    y: Math.round(bounds.y || 0),
    width: Math.max(0, Math.round(bounds.width || 0)),
    height: Math.max(0, Math.round(bounds.height || 0)),
  }
  // 窓全体を覆ってしまうと操作できなくなるので、必ず余白を残す
  const covers = b.x <= 2 && b.y <= 2 && b.width >= size.width - 2 && b.height >= size.height - 2
  if (covers || b.width < 40 || b.height < 40) {
    log('[view] 置き場所がおかしいので表示しません', JSON.stringify(b), '窓', JSON.stringify(size))
    v.setBounds({ x: 0, y: 0, width: 0, height: 0 })
    v.setVisible(false)
    return null
  }
  log('[view] 表示', JSON.stringify(b), url || '(URLそのまま)')
  v.setBounds(b)
  v.setVisible(true)
  if (url && url !== currentUrl) {
    currentUrl = url
    v.webContents.loadURL(url).catch(() => { /* 失敗は did-fail-load で通知される */ })
  }
  return b
}

function hide() {
  if (!view) return false
  log('[view] 隠す')
  view.setBounds({ x: 0, y: 0, width: 0, height: 0 })
  view.setVisible(false)
  return true
}

function navigate(url) {
  if (!view || !/^https?:\/\//.test(url)) return false
  currentUrl = url
  view.webContents.loadURL(url).catch(() => { /* 失敗は通知される */ })
  return true
}

function command(name) {
  if (!view) return false
  const wc = view.webContents
  const h = wc.navigationHistory
  if (name === 'back') { h && h.canGoBack() ? h.goBack() : wc.goBack && wc.goBack() }
  if (name === 'forward') { h && h.canGoForward() ? h.goForward() : wc.goForward && wc.goForward() }
  if (name === 'reload') wc.reload()
  if (name === 'stop') wc.stop()
  return true
}

function setZoom(factor) {
  if (!view) return false
  view.webContents.setZoomFactor(factor)
  return true
}

async function readText() {
  if (!view) return ''
  try {
    return await view.webContents.executeJavaScript(
      'document.body ? document.body.innerText.slice(0, 1200) : ""', true)
  } catch { return '' }
}

module.exports = { show, hide, navigate, command, setZoom, readText, state }
