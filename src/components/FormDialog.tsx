import { useEffect, useRef, type ReactNode } from 'react'

interface Props {
  title: string
  open: boolean
  onClose: () => void
  onSubmit: () => void
  submitLabel?: string
  children: ReactNode
  canSubmit?: boolean
}

/** 大きな文字の入力画面。Escキーで閉じられる。 */
export default function FormDialog({ title, open, onClose, onSubmit, submitLabel = '保存する', children, canSubmit = true }: Props) {
  const boxRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    boxRef.current?.querySelector<HTMLElement>('input,textarea,select,button')?.focus()
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div role="dialog" aria-modal="true" aria-label={title}
      className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto p-6"
      style={{ background: 'rgba(0,0,0,0.55)' }}>
      <div ref={boxRef} className="card my-8 w-full max-w-2xl">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="mt-6 flex flex-col gap-5">{children}</div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row-reverse">
          <button type="button" className="btn btn-primary flex-1 text-xl"
            disabled={!canSubmit} style={{ opacity: canSubmit ? 1 : 0.5 }}
            onClick={() => canSubmit && onSubmit()}>
            {submitLabel}
          </button>
          <button type="button" className="btn flex-1 text-lg" onClick={onClose}>やめる</button>
        </div>
      </div>
    </div>
  )
}

/** 入力欄のひとかたまり */
export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-lg font-bold">{label}</span>
      {hint && <span className="mb-2 block text-base" style={{ color: 'var(--c-subink)' }}>{hint}</span>}
      <span className="mt-1 block">{children}</span>
    </label>
  )
}

const inputStyle = {
  borderColor: 'var(--c-line)',
  background: 'var(--c-base)',
  color: 'var(--c-ink)',
} as const

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="w-full rounded-2xl border px-4 py-3 text-lg" style={inputStyle} />
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} rows={props.rows ?? 5} className="w-full rounded-2xl border px-4 py-3 text-lg" style={inputStyle} />
}
