import { useState } from 'react'
import { useCollection } from '../lib/db'
import FormDialog, { Field, TextArea, TextInput } from '../components/FormDialog'
import EmptyState, { DeleteButton } from '../components/EmptyState'

interface Memo {
  id: string
  title: string
  body: string
  pinned: boolean
  updatedAt: string
}

export default function MemoScreen() {
  const { items, add, update, remove } = useCollection<Memo>('memos')
  const [editing, setEditing] = useState<Memo | null>(null)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [keyword, setKeyword] = useState('')

  const start = (memo?: Memo) => {
    setEditing(memo ?? null)
    setTitle(memo?.title ?? '')
    setBody(memo?.body ?? '')
    setOpen(true)
  }

  const save = () => {
    const now = new Date().toLocaleString('ja-JP')
    if (editing) update(editing.id, { title: title.trim(), body, updatedAt: now })
    else add({ title: title.trim() || '（題名なし）', body, pinned: false, updatedAt: now })
    setOpen(false)
  }

  const shown = items
    .filter((m) => !keyword || (m.title + m.body).includes(keyword))
    .sort((a, b) => Number(b.pinned) - Number(a.pinned))

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button type="button" className="btn btn-primary text-xl" onClick={() => start()}>
          ＋ 新しいメモ
        </button>
        {items.length > 2 && (
          <input
            className="min-w-[14rem] flex-1 rounded-2xl border px-4 py-3 text-lg"
            style={{ borderColor: 'var(--c-line)', background: 'var(--c-panel)', color: 'var(--c-ink)' }}
            placeholder="メモをさがす"
            aria-label="メモをさがす"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        )}
      </div>

      {shown.length === 0 ? (
        <EmptyState icon="📝" text={keyword ? '見つかりませんでした。' : 'メモはまだありません。忘れたくないことを書いておきましょう。'}
          actionLabel={keyword ? undefined : '最初のメモを書く'} onAction={keyword ? undefined : () => start()} />
      ) : (
        <ul className="flex flex-col gap-4">
          {shown.map((m) => (
            <li key={m.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="text-xl font-bold">{m.pinned && <span aria-label="よく見るメモ">📌 </span>}{m.title}</h2>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="btn px-4 py-2 text-base"
                    onClick={() => update(m.id, { pinned: !m.pinned })}>
                    {m.pinned ? '上に固定をやめる' : '上に固定する'}
                  </button>
                  <button type="button" className="btn px-4 py-2 text-base" onClick={() => start(m)}>✏️ なおす</button>
                  <DeleteButton confirmText={`「${m.title}」を消しますか？`} onConfirm={() => remove(m.id)} />
                </div>
              </div>
              {m.body && <p className="mt-3 whitespace-pre-wrap text-lg">{m.body}</p>}
              <p className="mt-3 text-sm" style={{ color: 'var(--c-subink)' }}>さいごに書いた日：{m.updatedAt}</p>
            </li>
          ))}
        </ul>
      )}

      <FormDialog open={open} title={editing ? 'メモをなおす' : '新しいメモ'}
        onClose={() => setOpen(false)} onSubmit={save}>
        <Field label="題名" hint="あとで見つけやすい名前をつけます">
          <TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例：買いものリスト" />
        </Field>
        <Field label="内容">
          <TextArea value={body} onChange={(e) => setBody(e.target.value)} rows={8} placeholder="ここに書きます" />
        </Field>
      </FormDialog>
    </div>
  )
}
