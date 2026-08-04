import type { ReactNode } from 'react'

interface Props {
  icon: string
  title: string
  hint: string
  children: ReactNode
  onHome?: () => void
}

/** すべての画面に共通の見出し。ここに必ず「ホームにもどる」を置く。 */
export default function ScreenFrame({ icon, title, hint, children, onHome }: Props) {
  return (
    <section className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-4 border-b px-8 py-5"
        style={{ borderColor: 'var(--c-line)', background: 'var(--c-panel)' }}>
        <div className="flex items-center gap-4">
          <span aria-hidden className="text-4xl">{icon}</span>
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-base" style={{ color: 'var(--c-subink)' }}>{hint}</p>
          </div>
        </div>
        {onHome && (
          <button type="button" className="btn" onClick={onHome}>
            <span aria-hidden>🏠</span> ホームにもどる
          </button>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-8">{children}</div>
    </section>
  )
}
