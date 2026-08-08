import { useEffect, useState } from 'react'
import type { UpdateStatus } from '../types'

/**
 * 更新のお知らせ。画面の下に細い帯で出る。
 * 準備が終わったときだけ、大きな確認画面を出して本人に選んでもらう。
 */
export default function UpdateNotice() {
  const [status, setStatus] = useState<UpdateStatus | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const off = window.desktop?.onUpdateStatus((s) => {
      setStatus(s)
      if (s.state === 'available' || s.state === 'ready') setDismissed(false)
    })
    return () => { if (off) off() }
  }, [])

  const blocking = !!status && status.state === 'ready' && !dismissed
  useEffect(() => {
    if (blocking) window.desktop?.viewHide()
    else window.dispatchEvent(new Event('aisb:view-refresh'))
  }, [blocking])

  if (!status || dismissed) return null
  if (status.state === 'checking' || status.state === 'latest') return null
  if (status.state === 'error') return null // 更新できなくても利用のじゃまをしない

  // ダウンロードが終わった：大きく聞く
  if (status.state === 'ready') {
    return (
      <div role="alertdialog" aria-labelledby="update-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-8"
        style={{ background: 'rgba(0,0,0,0.55)' }}>
        <div className="card w-full max-w-xl text-center">
          <p aria-hidden className="text-6xl">🎁</p>
          <h2 id="update-title" className="mt-4 text-3xl font-bold">新しいバージョンの準備ができました</h2>
          <p className="mt-3 text-xl" style={{ color: 'var(--c-subink)' }}>
            {status.version ? `Ver. ${status.version} ` : ''}更新すると、アプリがいったん閉じて自動で開き直します。
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <button type="button" className="btn btn-primary w-full text-xl"
              onClick={() => window.desktop?.installUpdate()}>
              いま更新する
            </button>
            <button type="button" className="btn w-full text-lg" onClick={() => setDismissed(true)}>
              あとにする（次にアプリを閉じたときに更新します）
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 見つかった／ダウンロード中：下の細い帯で静かに知らせる
  return (
    <div role="status"
      className="flex shrink-0 items-center justify-between gap-4 border-t px-6 py-3"
      style={{ background: 'var(--c-ai-dim)', borderColor: 'var(--c-line)' }}>
      <p className="text-lg">
        {status.state === 'available' && <>新しいバージョン{status.version ? `（Ver. ${status.version}）` : ''}を見つけました。準備しています…</>}
        {status.state === 'downloading' && <>新しいバージョンを準備しています… {status.percent ?? 0}％</>}
      </p>
      {status.state === 'downloading' && (
        <div className="h-3 w-48 overflow-hidden rounded-full" style={{ background: 'var(--c-line)' }}>
          <div className="h-full transition-all"
            style={{ width: `${status.percent ?? 0}%`, background: 'var(--c-ai)' }} />
        </div>
      )}
    </div>
  )
}
