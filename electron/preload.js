'use strict'
const { contextBridge, ipcRenderer } = require('electron')

// レンダラーへ公開する安全なAPIのみをここに定義する
contextBridge.exposeInMainWorld('desktop', {
  minimize: () => ipcRenderer.invoke('window:minimize'),
  toggleMaximize: () => ipcRenderer.invoke('window:toggleMaximize'),
  close: () => ipcRenderer.invoke('window:close'),
  getVersion: () => ipcRenderer.invoke('app:version'),
  openExternal: (url) => ipcRenderer.invoke('app:openExternal', url),
  onWindowState: (cb) => {
    const handler = (_e, maximized) => cb(maximized)
    ipcRenderer.on('window:state', handler)
    return () => ipcRenderer.removeListener('window:state', handler)
  },
})
