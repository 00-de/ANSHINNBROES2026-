'use strict'
const { contextBridge, ipcRenderer } = require('electron')

// レンダラーへ公開する安全なAPIのみをここに定義する
contextBridge.exposeInMainWorld('desktop', {
  minimize: () => ipcRenderer.invoke('window:minimize'),
  toggleMaximize: () => ipcRenderer.invoke('window:toggleMaximize'),
  close: () => ipcRenderer.invoke('window:close'),
  getVersion: () => ipcRenderer.invoke('app:version'),
  openExternal: (url) => ipcRenderer.invoke('app:openExternal', url),
  openLog: () => ipcRenderer.invoke('app:openLog'),

  // 自動更新
  checkUpdate: () => ipcRenderer.invoke('update:check'),
  installUpdate: () => ipcRenderer.invoke('update:install'),
  onUpdateStatus: (cb) => {
    const handler = (_e, payload) => cb(payload)
    ipcRenderer.on('update:status', handler)
    return () => ipcRenderer.removeListener('update:status', handler)
  },

  // 内蔵ブラウザ
  viewShow: (bounds, url) => ipcRenderer.invoke('view:show', bounds, url),
  viewHide: () => ipcRenderer.invoke('view:hide'),
  viewNavigate: (url) => ipcRenderer.invoke('view:navigate', url),
  viewCommand: (name) => ipcRenderer.invoke('view:command', name),
  viewZoom: (factor) => ipcRenderer.invoke('view:zoom', factor),
  viewReadText: () => ipcRenderer.invoke('view:readText'),
  onViewState: (cb) => {
    const handler = (_e, payload) => cb(payload)
    ipcRenderer.on('view:state', handler)
    return () => ipcRenderer.removeListener('view:state', handler)
  },

  onWindowState: (cb) => {
    const handler = (_e, maximized) => cb(maximized)
    ipcRenderer.on('window:state', handler)
    return () => ipcRenderer.removeListener('window:state', handler)
  },
})
