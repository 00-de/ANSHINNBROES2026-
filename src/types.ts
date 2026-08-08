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

export type UpdateState = 'checking' | 'available' | 'downloading' | 'ready' | 'latest' | 'error'

export interface UpdateStatus {
  state: UpdateState
  version?: string
  percent?: number
  message?: string
}

export interface ViewState {
  attached: boolean
  url?: string
  loading?: boolean
  canGoBack?: boolean
  canGoForward?: boolean
  title?: string
  event?: string
  errorCode?: number
  errorDescription?: string
  failedUrl?: string
}

export interface Bounds { x: number; y: number; width: number; height: number }

export interface DesktopApi {
  minimize: () => Promise<void>
  toggleMaximize: () => Promise<boolean>
  close: () => Promise<void>
  getVersion: () => Promise<string>
  openExternal: (url: string) => Promise<boolean>
  openLog: () => Promise<boolean>
  onWindowState: (cb: (maximized: boolean) => void) => () => void
  checkUpdate: () => Promise<boolean>
  installUpdate: () => Promise<boolean>
  onUpdateStatus: (cb: (status: UpdateStatus) => void) => () => void
  viewShow: (bounds: Bounds, url?: string) => Promise<Bounds | null>
  viewHide: () => Promise<boolean>
  viewNavigate: (url: string) => Promise<boolean>
  viewCommand: (name: 'back' | 'forward' | 'reload' | 'stop') => Promise<boolean>
  viewZoom: (factor: number) => Promise<boolean>
  viewReadText: () => Promise<string>
  onViewState: (cb: (state: ViewState) => void) => () => void
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
