export type ThemeName = 'light' | 'dark' | 'contrast'
export type FontScale = 100 | 125 | 150 | 175

export interface Settings {
  theme: ThemeName
  fontScale: FontScale
  easyMode: boolean      // かんたんモード
  furigana: boolean      // ふりがな表示
  speakOnHover: boolean  // 指したところを読み上げる
  breakMinutes: number   // 休憩のおしらせ間隔（0で停止）
  homeUrl: string
}

export interface DesktopApi {
  minimize: () => Promise<void>
  toggleMaximize: () => Promise<boolean>
  close: () => Promise<void>
  getVersion: () => Promise<string>
  openExternal: (url: string) => Promise<boolean>
  onWindowState: (cb: (maximized: boolean) => void) => () => void
}

declare global {
  interface Window {
    desktop?: DesktopApi
  }
}

export type ScreenId =
  | 'home' | 'ai' | 'browser' | 'search' | 'mail' | 'youtube'
  | 'hospital' | 'medicine' | 'calendar' | 'memo'
  | 'bookmarks' | 'history' | 'downloads' | 'consult'
  | 'settings' | 'help'
