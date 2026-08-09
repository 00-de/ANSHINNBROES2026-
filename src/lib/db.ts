import { useCallback, useEffect, useState } from 'react'

/**
 * 小さなデータ置き場。
 * 今はパソコンの中（localStorage）に保存する。
 * Phase 3 で Firebase 同期に差し替えられるよう、出入り口をここ1か所にまとめている。
 */

const PREFIX = 'aisb.'

export interface Entity { id: string }

export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function readRaw<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function writeRaw<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
    return true
  } catch {
    return false // 保存できなくても画面は動き続ける
  }
}

/** 一覧データ（メモ・くすり・予定など）を扱う */
export function useCollection<T extends Entity>(key: string) {
  const [items, setItems] = useState<T[]>(() => readRaw<T[]>(key, []))
  const [saveFailed, setSaveFailed] = useState(false)

  useEffect(() => {
    setSaveFailed(!writeRaw(key, items))
  }, [key, items])

  const add = useCallback((item: Omit<T, 'id'>) => {
    const created = { ...item, id: newId() } as T
    setItems((list) => [created, ...list])
    return created
  }, [])

  const update = useCallback((id: string, patch: Partial<T>) => {
    setItems((list) => list.map((i) => (i.id === id ? { ...i, ...patch } : i)))
  }, [])

  const remove = useCallback((id: string) => {
    setItems((list) => list.filter((i) => i.id !== id))
  }, [])

  const replaceAll = useCallback((list: T[]) => setItems(list), [])

  return { items, add, update, remove, replaceAll, saveFailed }
}

/** 「飲んだ」などの○×記録を扱う（日付ごと） */
export function useFlags(key: string) {
  const [flags, setFlags] = useState<Record<string, boolean>>(() => readRaw(key, {}))

  useEffect(() => { writeRaw(key, flags) }, [key, flags])

  const toggle = useCallback((flagKey: string) => {
    setFlags((f) => ({ ...f, [flagKey]: !f[flagKey] }))
  }, [])

  const isOn = useCallback((flagKey: string) => !!flags[flagKey], [flags])

  return { flags, toggle, isOn, setFlags }
}

/** すべてのデータを1つのファイルにまとめる／読み込む（バックアップ用） */
export const BACKUP_KEYS = ['memos', 'medicines', 'medicineLog', 'hospitals', 'events', 'contacts', 'settings.v1']

export function exportAll(): string {
  const bag: Record<string, unknown> = { _app: 'AIサポートブラウザPro', _date: new Date().toISOString() }
  for (const k of BACKUP_KEYS) {
    try {
      const raw = localStorage.getItem(PREFIX + k)
      if (raw) bag[k] = JSON.parse(raw)
    } catch { /* 壊れているものは飛ばす */ }
  }
  return JSON.stringify(bag, null, 2)
}

export function importAll(text: string): { ok: boolean; message: string } {
  try {
    const bag = JSON.parse(text) as Record<string, unknown>
    if (!bag || bag._app !== 'AIサポートブラウザPro') {
      return { ok: false, message: 'このアプリのバックアップファイルではないようです。' }
    }
    let count = 0
    for (const k of BACKUP_KEYS) {
      if (k in bag) { writeRaw(k, bag[k]); count++ }
    }
    return { ok: true, message: `${count}件のデータを読み込みました。画面を開き直してください。` }
  } catch {
    return { ok: false, message: 'ファイルを読み取れませんでした。' }
  }
}
