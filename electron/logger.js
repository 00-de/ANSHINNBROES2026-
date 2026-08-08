'use strict'
const { app, shell } = require('electron')
const fs = require('fs')
const path = require('path')

// 不具合の記録をファイルに残す。開発ツールが開けないときでも原因が追える。
let file = null

function init() {
  try {
    file = path.join(app.getPath('userData'), 'アプリの記録.txt')
    fs.writeFileSync(file, `=== AIサポートブラウザ Pro 起動 ${new Date().toLocaleString('ja-JP')} ===\n`)
  } catch { file = null }
}

function log(...parts) {
  const line = `${new Date().toLocaleTimeString('ja-JP')} ${parts.join(' ')}\n`
  console.log(line.trim())
  if (!file) return
  try { fs.appendFileSync(file, line) } catch { /* 書けなくても動作は続ける */ }
}

function openLog() {
  if (file) shell.openPath(file)
  return !!file
}

module.exports = { init, log, openLog }
