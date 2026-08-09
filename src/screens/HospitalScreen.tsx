import { useState } from 'react'
import { useCollection } from '../lib/db'
import { todayISO, formatJP, relativeLabel, daysFromToday } from '../lib/date'
import FormDialog, { Field, TextArea, TextInput } from '../components/FormDialog'
import EmptyState, { DeleteButton } from '../components/EmptyState'

export interface Hospital {
  id: string
  name: string
  date: string    // 2026-08-20
  time: string    // 10:30
  dept: string
  bring: string
  note: string
}

export default function HospitalScreen() {
  const { items, add, update, remove } = useCollection<Hospital>('hospitals')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Hospital | null>(null)
  const [form, setForm] = useState({ name: '', date: todayISO(), time: '', dept: '', bring: '', note: '' })

  const start = (h?: Hospital) => {
    setEditing(h ?? null)
    setForm(h ? { name: h.name, date: h.date, time: h.time, dept: h.dept, bring: h.bring, note: h.note }
             : { name: '', date: todayISO(), time: '', dept: '', bring: '', note: '' })
    setOpen(true)
  }

  const save = () => {
    const data = { ...form, name: form.name.trim() }
    if (editing) update(editing.id, data)
    else add(data)
    setOpen(false)
  }

  const sorted = [...items].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
  const upcoming = sorted.filter((h) => daysFromToday(h.date) >= 0)
  const past = sorted.filter((h) => daysFromToday(h.date) < 0).reverse()

  const card = (h: Hospital, dim = false) => {
    const n = daysFromToday(h.date)
    const soon = n >= 0 && n <= 3
    return (
      <li key={h.id} className="card" style={{ opacity: dim ? 0.65 : 1, borderColor: soon ? 'var(--c-warn)' : 'var(--c-line)' }}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-lg font-bold" style={{ color: soon ? 'var(--c-warn)' : 'var(--c-subink)' }}>
              {relativeLabel(h.date)} ・ {formatJP(h.date)}{h.time ? ` ${h.time}` : ''}
            </p>
            <h2 className="mt-1 text-2xl font-bold">{h.name}</h2>
            {h.dept && <p className="text-lg" style={{ color: 'var(--c-subink)' }}>{h.dept}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn px-4 py-2 text-base" onClick={() => start(h)}>✏️ なおす</button>
            <DeleteButton confirmText={`「${h.name}」の予定を消しますか？`} onConfirm={() => remove(h.id)} />
          </div>
        </div>
        {h.bring && (
          <p className="mt-4 rounded-2xl px-4 py-3 text-lg" style={{ background: 'var(--c-ai-dim)' }}>
            <strong>持っていくもの：</strong>{h.bring}
          </p>
        )}
        {h.note && <p className="mt-3 whitespace-pre-wrap text-lg">{h.note}</p>}
      </li>
    )
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <button type="button" className="btn btn-primary mb-6 text-xl" onClick={() => start()}>
        ＋ 通院の予定をふやす
      </button>

      {items.length === 0 ? (
        <EmptyState icon="🏥" text="通院の予定はまだありません。"
          actionLabel="最初の予定を入れる" onAction={() => start()} />
      ) : (
        <>
          <h2 className="mb-4 text-xl font-bold">これからの通院</h2>
          {upcoming.length === 0
            ? <p className="mb-8 text-lg" style={{ color: 'var(--c-subink)' }}>これからの予定はありません。</p>
            : <ul className="mb-10 flex flex-col gap-4">{upcoming.map((h) => card(h))}</ul>}

          {past.length > 0 && (
            <div className="pro-only">
              <h2 className="mb-4 text-xl font-bold">おわった通院</h2>
              <ul className="flex flex-col gap-4">{past.map((h) => card(h, true))}</ul>
            </div>
          )}
        </>
      )}

      <FormDialog open={open} title={editing ? '通院の予定をなおす' : '通院の予定をふやす'}
        onClose={() => setOpen(false)} onSubmit={save} canSubmit={!!form.name.trim()}>
        <Field label="病院の名前">
          <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="例：〇〇内科クリニック" />
        </Field>
        <Field label="日にち">
          <TextInput type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </Field>
        <Field label="時間" hint="書かなくてもかまいません">
          <TextInput type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
        </Field>
        <Field label="なに科" hint="書かなくてもかまいません">
          <TextInput value={form.dept} onChange={(e) => setForm({ ...form, dept: e.target.value })} placeholder="例：内科" />
        </Field>
        <Field label="持っていくもの">
          <TextInput value={form.bring} onChange={(e) => setForm({ ...form, bring: e.target.value })} placeholder="例：保険証、お薬手帳" />
        </Field>
        <Field label="メモ" hint="先生に聞きたいことなど">
          <TextArea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} rows={4} />
        </Field>
      </FormDialog>
    </div>
  )
}
