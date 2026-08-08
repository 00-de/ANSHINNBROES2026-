import { useCallback, useEffect, useRef, useState } from 'react'
import { useSettings } from '../context/SettingsContext'
import type { ViewState } from '../types'

function toUrl(input: string): string {
  const t = input.trim()
  if (!t) return ''
  if (/^https?:\/\//i.test(t)) return t
  if (/^[\w-]+(\.[\w-]+)+(\/.*)?$/.test(t)) return `https://${t}`
  return `https://www.google.com/search?q=${encodeURIComponent(t)}&hl=ja`
}

/**
 * 内蔵ブラウザ。
 * ページ本体は Electron 側の WebContentsView が描く。
 * ここでは「どこに置くか」の座標を送り、操作ボタンだけを持つ。
 */
export default function BrowserScreen({ initialUrl }: { initialUrl?: string }) {
  const { settings, speak } = useSettings()
  const start = initialUrl || settings.homeUrl || 'https://www.yahoo.co.jp/'
  const slot = useRef<HTMLDivElement | null>(null)
  const [address, setAddress] = useState(start)
  const [state, setState] = useState<ViewState>({ attached: false })
  const [zoom, setZoom] = useState(1.1)
  const [failed, setFailed] = useState('')

  const api = typeof window !== 'undefined' ? window.desktop : undefined

  // 置き場所の座標を Electron 側へ送る
  const sync = useCallback((url?: string) => {
    const el = slot.current
    if (!el || !api) return
    const r = el.getBoundingClientRect()
    api.viewShow({ x: r.left, y: r.top, width: r.width, height: r.height }, url)
  }, [api])

  useEffect(() => {
    if (!api) return
    sync(start)

    const off = api.onViewState((s) => {
      setState(s)
      if (s.event === 'fail') {
        setFailed(`${s.errorDescription || '読み込みに失敗しました'}（コード ${s.errorCode}）`)
      } else if (s.event === 'start') {
        setFailed('')
      }
      if (s.url && s.url !== 'about:blank') setAddress(s.url)
    })

    // 画面の大きさが変わったら追従する
    const ro = new ResizeObserver(() => sync())
    if (slot.current) ro.observe(slot.current)
    const onResize = () => sync()
    window.addEventListener('resize', onResize)
    // お知らせ画面が閉じたときに置き直す
    const onRefresh = () => sync()
    window.addEventListener('aisb:view-refresh', onRefresh)

    return () => {
      if (off) off()
      ro.disconnect()
      window.removeEventListener('resize', onResize)
      window.removeEventListener('aisb:view-refresh', onRefresh)
      api.viewHide()   // 別の画面へ移るときは隠す
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { api?.viewZoom(zoom) }, [api, zoom])

  const go = useCallback((raw: string) => {
    const url = toUrl(raw)
    if (!url) return
    setFailed('')
    setAddress(url)
    api?.viewNavigate(url)
  }, [api])

  const readPage = useCallback(async () => {
    const text = (await api?.viewReadText()) || ''
    speak(text || 'このページには読み上げる文字が見つかりませんでした。')
  }, [api, speak])

  if (!api) {
    return (
      <div className="p-8">
        <div className="card mx-auto max-w-2xl">
          <p aria-hidden className="text-5xl">🖥️</p>
          <h2 className="mt-3 text-2xl font-bold">ブラウザはアプリ版でお使いください</h2>
        </div>
      </div>
    )
  }

  const secure = !state.url || state.url.startsWith('https://')

  return (
    <div className="flex h-full min-h-0 flex-col" style={{ background: 'var(--c-base)' }}>
      <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3"
        style={{ background: 'var(--c-panel)', borderColor: 'var(--c-line)' }}>
        <button type="button" className="btn px-4" aria-label="前のページにもどる"
          disabled={!state.canGoBack}
          style={{ opacity: state.canGoBack ? 1 : 0.45 }}
          onClick={() => api.viewCommand('back')}>◀ もどる</button>
        <button type="button" className="btn px-4 pro-only" aria-label="次のページにすすむ"
          disabled={!state.canGoForward}
          style={{ opacity: state.canGoForward ? 1 : 0.45 }}
          onClick={() => api.viewCommand('forward')}>すすむ ▶</button>
        <button type="button" className="btn px-4" aria-label="読み込み直す"
          onClick={() => api.viewCommand(state.loading ? 'stop' : 'reload')}>
          {state.loading ? '■ 中止' : '↻ 更新'}
        </button>
        <button type="button" className="btn px-4" onClick={() => go(settings.homeUrl)}>🏠 最初のページ</button>

        <label className="ml-2 flex min-w-[16rem] flex-1 items-center gap-2 rounded-2xl border px-4 py-2"
          style={{ borderColor: 'var(--c-line)', background: 'var(--c-base)' }}>
          <span aria-hidden title={secure ? '安全な通信です' : '暗号化されていません'}
            style={{ color: secure ? 'var(--c-go)' : 'var(--c-danger)' }}>{secure ? '🔒' : '⚠️'}</span>
          <input
            className="w-full bg-transparent text-lg outline-none"
            style={{ color: 'var(--c-ink)' }}
            aria-label="ホームページのアドレス、または調べたい言葉"
            placeholder="調べたい言葉、またはアドレスを入れて Enter"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') go(address) }}
          />
        </label>

        <button type="button" className="btn btn-primary px-5" onClick={() => go(address)}>ひらく</button>
        <button type="button" className="btn px-4" onClick={readPage}>🔊 読み上げ</button>
        <button type="button" className="btn px-4"
          onClick={() => api.openExternal(toUrl(address))}>↗ 別のブラウザで開く</button>
        <div className="flex items-center gap-1 pro-only">
          <button type="button" className="btn px-3" aria-label="文字を小さく"
            onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.1).toFixed(2)))}>ー</button>
          <span className="w-16 text-center text-base" style={{ color: 'var(--c-subink)' }}>{Math.round(zoom * 100)}%</span>
          <button type="button" className="btn px-3" aria-label="文字を大きく"
            onClick={() => setZoom((z) => Math.min(3, +(z + 0.1).toFixed(2)))}>＋</button>
        </div>
      </div>

      {!secure && (
        <p role="alert" className="px-6 py-3 text-lg font-bold"
          style={{ background: 'var(--c-danger)', color: '#fff' }}>
          このページは暗号化されていません。パスワードやカード番号は入力しないでください。
        </p>
      )}

      {failed && (
        <div role="alert" className="px-6 py-4" style={{ background: 'var(--c-ai-dim)' }}>
          <p className="text-lg font-bold">ページをひらけませんでした</p>
          <p className="text-base" style={{ color: 'var(--c-subink)' }}>
            {failed} ／ インターネットにつながっているか確かめて「↻ 更新」を押してください。
          </p>
          <button type="button" className="btn mt-3"
            onClick={() => api.openExternal(toUrl(address))}>↗ 別のブラウザで開く</button>
        </div>
      )}

      {/* ここがページの置き場所。中身は Electron 側が描くので空のままにする */}
      <div ref={slot} className="min-h-0 flex-1" style={{ background: 'var(--c-panel)' }} />
    </div>
  )
}
