import { useState } from 'react'
import { useCollection } from '../lib/db'
import FormDialog, { Field, TextArea, TextInput } from '../components/FormDialog'
import EmptyState, { DeleteButton } from '../components/EmptyState'

interface Contact {
  id: string
  name: string
  relation: string
  phone: string
  email: string
  note: string
}

const EMERGENCY = [
  { label: '救急・消防', number: '119', hint: 'きゅうきゅう・かじ' },
  { label: '警察', number: '110', hint: 'じけん・じこ' },
  { label: '救急相談 #7119', number: '#7119', hint: 'まよったとき（地域による）' },
]

export default function ConsultScreen() {
  const { items, add, update, remove } = useCollection<Contact>('contacts')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Contact | null>(null)
  const [form, setForm] = useState({ name: '', relation: '', phone: '', email: '', note: '' })

  const start = (c?: Contact) => {
    setEditing(c ?? null)
    setForm(c ? { name: c.name, relation: c.relation, phone: c.phone, email: c.email, note: c.note }
              : { name: '', relation: '', phone: '', email: '', note: '' })
    setOpen(true)
  }

  const save = () => {
    const data = { ...form, name: form.name.trim() }
    if (editing) update(editing.id, data)
    else add(data)
    setOpen(false)
  }

  const call = (num: string) => window.desktop?.openExternal(`tel:${num.replace(/[^\d#*+]/g, '')}`)
  const mail = (addr: string) => window.desktop?.openExternal(`mailto:${addr}`)

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* 緊急連絡先はいつでも見える場所に置く */}
      <section className="card mb-8" style={{ borderColor: 'var(--c-danger)' }}>
        <h2 className="text-2xl font-bold" style={{ color: 'var(--c-danger)' }}>きんきゅうのとき</h2>
        <p className="mt-1 text-base" style={{ color: 'var(--c-subink)' }}>
          命にかかわるときは、ためらわずに電話してください。
        </p>
        <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {EMERGENCY.map((e) => (
            <li key={e.number}>
              <div className="rounded-2xl border px-5 py-4 text-center" style={{ borderColor: 'var(--c-line)' }}>
                <p className="text-4xl font-bold" style={{ color: 'var(--c-danger)' }}>{e.number}</p>
                <p className="text-lg font-bold">{e.label}</p>
                <p className="text-base" style={{ color: 'var(--c-subink)' }}>{e.hint}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <button type="button" className="btn btn-primary mb-6 text-xl" onClick={() => start()}>
        ＋ 連絡さきをふやす
      </button>

      {items.length === 0 ? (
        <EmptyState icon="💬" text="家族や支援してくれる方の連絡さきを入れておくと、こまったときにすぐ連絡できます。"
          actionLabel="最初の連絡さきを入れる" onAction={() => start()} />
      ) : (
        <ul className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {items.map((c) => (
            <li key={c.id} className="card">
              <p className="text-2xl font-bold">{c.name}</p>
              {c.relation && <p className="text-lg" style={{ color: 'var(--c-subink)' }}>{c.relation}</p>}
              {c.note && <p className="mt-2 whitespace-pre-wrap text-base">{c.note}</p>}

              <div className="mt-5 flex flex-col gap-3">
                {c.phone && (
                  <button type="button" className="btn btn-primary w-full text-xl" onClick={() => call(c.phone)}>
                    📞 電話をかける（{c.phone}）
                  </button>
                )}
                {c.email && (
                  <button type="button" className="btn w-full text-lg" onClick={() => mail(c.email)}>
                    ✉️ メールを書く
                  </button>
                )}
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button type="button" className="btn px-4 py-2 text-base" onClick={() => start(c)}>✏️ なおす</button>
                <DeleteButton confirmText={`「${c.name}」を消しますか？`} onConfirm={() => remove(c.id)} />
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-8 text-base" style={{ color: 'var(--c-subink)' }}>
        電話やメールは、このパソコンに入っているアプリが開きます。
      </p>

      <FormDialog open={open} title={editing ? '連絡さきをなおす' : '連絡さきをふやす'}
        onClose={() => setOpen(false)} onSubmit={save} canSubmit={!!form.name.trim()}>
        <Field label="名前">
          <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="例：田中 太郎" />
        </Field>
        <Field label="つづきがら" hint="書かなくてもかまいません">
          <TextInput value={form.relation} onChange={(e) => setForm({ ...form, relation: e.target.value })} placeholder="例：長男 / ケアマネジャー" />
        </Field>
        <Field label="電話ばんごう">
          <TextInput type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="例：090-1234-5678" />
        </Field>
        <Field label="メールアドレス" hint="書かなくてもかまいません">
          <TextInput type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </Field>
        <Field label="メモ" hint="連絡していい時間帯など">
          <TextArea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} rows={3} />
        </Field>
      </FormDialog>
    </div>
  )
}
