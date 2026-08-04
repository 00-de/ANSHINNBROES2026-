interface Props { icon: string; title: string; plan: string[] }

/** 未実装の画面。何ができないかを正直に伝え、次に何が来るかを示す。 */
export default function PlaceholderScreen({ icon, title, plan }: Props) {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="card text-center">
        <p aria-hidden className="text-6xl">{icon}</p>
        <h2 className="mt-4 text-2xl font-bold">{title}は、まだ使えません</h2>
        <p className="mt-2 text-lg" style={{ color: 'var(--c-subink)' }}>
          次の更新で追加します。今は左のメニューから、ほかの画面をお使いください。
        </p>
      </div>
      <div className="card mt-6">
        <h3 className="text-lg font-bold">この画面でできるようになること</h3>
        <ul className="mt-3 list-disc pl-6 text-lg" style={{ color: 'var(--c-subink)' }}>
          {plan.map((p) => <li key={p}>{p}</li>)}
        </ul>
      </div>
    </div>
  )
}
