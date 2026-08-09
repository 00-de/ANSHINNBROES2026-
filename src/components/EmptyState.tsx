export default function EmptyState({ icon, text, actionLabel, onAction }: {
  icon: string; text: string; actionLabel?: string; onAction?: () => void
}) {
  return (
    <div className="card text-center">
      <p aria-hidden className="text-6xl">{icon}</p>
      <p className="mt-4 text-xl" style={{ color: 'var(--c-subink)' }}>{text}</p>
      {actionLabel && onAction && (
        <button type="button" className="btn btn-primary mt-6 text-xl" onClick={onAction}>{actionLabel}</button>
      )}
    </div>
  )
}

/** 消すときは必ず1回確認する */
export function DeleteButton({ onConfirm, label = 'けす', confirmText }: {
  onConfirm: () => void; label?: string; confirmText: string
}) {
  return (
    <button type="button" className="btn px-4 py-2 text-base"
      style={{ borderColor: 'var(--c-danger)', color: 'var(--c-danger)' }}
      onClick={() => { if (confirm(confirmText)) onConfirm() }}>
      🗑 {label}
    </button>
  )
}
