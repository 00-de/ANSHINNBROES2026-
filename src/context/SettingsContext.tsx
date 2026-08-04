import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Settings } from '../types'

const STORAGE_KEY = 'aisb.settings.v1'

export const DEFAULT_SETTINGS: Settings = {
  theme: 'light',
  fontScale: 125,
  easyMode: true,
  furigana: true,
  speakOnHover: false,
  breakMinutes: 30,
  homeUrl: 'https://www.yahoo.co.jp/',
}

interface Ctx {
  settings: Settings
  update: <K extends keyof Settings>(key: K, value: Settings[K]) => void
  reset: () => void
  speak: (text: string) => void
}

const SettingsContext = createContext<Ctx | null>(null)

function load(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(load)

  // 設定を保存し、画面全体へ反映する
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)) } catch { /* 保存できなくても動作は続ける */ }
    const html = document.documentElement
    html.dataset.theme = settings.theme
    html.dataset.easy = settings.easyMode ? 'on' : 'off'
    html.dataset.furigana = settings.furigana ? 'on' : 'off'
    html.style.fontSize = `${(16 * settings.fontScale) / 100}px`
  }, [settings])

  const value = useMemo<Ctx>(() => ({
    settings,
    update: (key, val) => setSettings((s) => ({ ...s, [key]: val })),
    reset: () => setSettings(DEFAULT_SETTINGS),
    speak: (text: string) => {
      if (!('speechSynthesis' in window)) return
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(text)
      u.lang = 'ja-JP'
      u.rate = 0.95
      window.speechSynthesis.speak(u)
    },
  }), [settings])

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings(): Ctx {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('SettingsProvider の中で使ってください')
  return ctx
}
