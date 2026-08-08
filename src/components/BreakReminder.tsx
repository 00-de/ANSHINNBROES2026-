import { useEffect, useState } from 'react'
import { useSettings } from '../context/SettingsContext'

/** 一定時間ごとに休憩をおすすめする。閉じるまで消えない大きめのお知らせ。 */
export default function BreakReminder() {
  const { settings, speak } = useSettings()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!settings.breakMinutes) return
    const ms = settings.breakMinutes * 60 * 1000
    const timer = window.setInterval(() => setShow(true), ms)
    return () => window.clearInterval(timer)
  }, [settings.breakMinutes])

  useEffect(() => {
    if (show) window.desktop?.viewHide()
    else window.dispatchEvent(new Event('aisb:view-refresh'))
  }, [show])

  useEffect(() => {
    if (show) speak('少し休みましょう。目を閉じて、水を飲んでください。')
  }, [show, speak])

  if (!show) return null

  return (
    <div role="alertdialog" aria-labelledby="break-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-8"
      style={{ background: 'rgba(0,0,0,0.55)' }}>
      <div className="card w-full max-w-xl text-center">
        <p aria-hidden className="text-6xl">🍵</p>
        <h2 id="break-title" className="mt-4 text-3xl font-bold">少し休みましょう</h2>
        <p className="mt-3 text-xl" style={{ color: 'var(--c-subink)' }}>
          {settings.breakMinutes}分たちました。目を休めて、水を飲んでください。
        </p>
        <button type="button" className="btn btn-primary mt-6 w-full text-xl" onClick={() => setShow(false)}>
          わかりました
        </button>
      </div>
    </div>
  )
}
