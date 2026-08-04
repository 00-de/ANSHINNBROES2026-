import { useCallback, useEffect, useRef, useState } from 'react'
import { useSettings } from '../context/SettingsContext'

type WebviewEl = HTMLElement & {
  src: string
  canGoBack: () => boolean
  canGoForward: () => boolean
  goBack: () => void
  goForward: () => void
  reload: () => void
  stop: () => void
  getURL: () => string
  setZoomFactor: (f: number) => void
  executeJavaScript: (code: string) => Promise<unknown>
}

function toUrl(input: string): string {
  const t = input.trim()
  if (!t) return ''
  if (/^https?:\/\//i.test(t)) return t
  if (/^[\w-]+(\.[\w-]+)+(\/.*)?$/.test(t)) return `https://${t}`
  return `https://www.google.com/search?q=${encodeURIComponent(t)}&hl=ja`
}

export default function BrowserScreen({ initialUrl }: { initialUrl?: string }) {
  const { settings, speak } = useSettings()
  const ref = useRef<WebviewEl | null>(null)
  const [address, setAddress] = useState(initialUrl || settings.homeUrl)
  const [current, setCurrent] = useState(initialUrl || settings.homeUrl)
  const [loading, setLoading] = useState(false)
  const [secure, setSecure] = useState(true)
  const [zoom, setZoom] = useState(1.1)

  useEffect(() => {
    const wv = ref.current
    if (!wv) return
    const onStart = () => setLoading(true)
    const onStop = () => {
      setLoading(false)
      try {
        const url = wv.getURL()
        setCurrent(url)
        setAddress(url)
        setSecure(url.startsWith('https://'))
      } catch { /* 読み込み直後は取得できないことがある */ }
    }
    wv.addEventListener('did-start-loading', onStart)
    wv.addEventListener('did-stop-loading', onStop)
    return () => {
      wv.removeEventListener('did-start-loading', onStart)
      wv.removeEventListener('did-stop-loading', onStop)
    }
  }, [])

  useEffect(() => { ref.current?.setZoomFactor(zoom) }, [zoom, loading])

  const go = useCallback((raw: string) => {
    const url = toUrl(raw)
    if (!url) return
    setCurrent(url)
    setAddress(url)
    if (ref.current) ref.current.src = url
  }, [])

  const readPage = useCallback(async () => {
    try {
      const text = (await ref.current?.executeJavaScript(
        'document.body ? document.body.innerText.slice(0, 1200) : ""',
      )) as string
      speak(text || 'このページには読み上げる文字が見つかりませんでした。')
    } catch {
      speak('このページは読み上げできませんでした。')
    }
  }, [speak])

  return (
    <div className="flex h-full flex-col">
      {/* 操作バー */}
      <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3"
        style={{ background: 'var(--c-panel)', borderColor: 'var(--c-line)' }}>
        <button type="button" className="btn px-4" aria-label="前のページにもどる"
          onClick={() => ref.current?.canGoBack() && ref.current.goBack()}>◀ もどる</button>
        <button type="button" className="btn px-4 pro-only" aria-label="次のページにすすむ"
          onClick={() => ref.current?.canGoForward() && ref.current.goForward()}>すすむ ▶</button>
        <button type="button" className="btn px-4" aria-label="読み込み直す"
          onClick={() => (loading ? ref.current?.stop() : ref.current?.reload())}>{loading ? '■ 中止' : '↻ 更新'}</button>
        <button type="button" className="btn px-4" onClick={() => go(settings.homeUrl)}>🏠 最初のページ</button>

        <label className="ml-2 flex min-w-[18rem] flex-1 items-center gap-2 rounded-2xl border px-4 py-2"
          style={{ borderColor: 'var(--c-line)', background: 'var(--c-base)' }}>
          <span aria-hidden title={secure ? '安全な通信です' : '暗号化されていません'}
            style={{ color: secure ? 'var(--c-go)' : 'var(--c-danger)' }}>{secure ? '🔒' : '⚠️'}</span>
          <input
            className="w-full bg-transparent text-lg outline-none"
            aria-label="ホームページのアドレス、または調べたい言葉"
            placeholder="調べたい言葉、またはアドレスを入れて Enter"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') go(address) }}
          />
        </label>

        <button type="button" className="btn btn-primary px-5" onClick={() => go(address)}>ひらく</button>
        <button type="button" className="btn px-4" onClick={readPage}>🔊 読み上げ</button>
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

      <div className="min-h-0 flex-1" style={{ background: 'var(--c-panel)' }}>
        <webview
          ref={ref as unknown as React.Ref<HTMLWebViewElement>}
          src={current}
          partition="persist:aisb"
          className="h-full w-full"
          style={{ display: 'flex', height: '100%' }}
        />
      </div>
    </div>
  )
}
