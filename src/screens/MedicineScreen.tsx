import { useState } from 'react'
import { useCollection, useFlags } from '../lib/db'
import { todayISO, formatJP } from '../lib/date'
import FormDialog, { Field, TextArea, TextInput } from '../components/FormDialog'
import EmptyState, { DeleteButton } from '../components/EmptyState'

const TIMINGS = ['朝', '昼', '夕', '寝る前'] as const
type Timing = typeof TIMINGS[number]

interface Medicine {
  id: string
  name: string
  timings: Timing[]
  amount: string
  note: string
}

export default function MedicineScreen() {
  const { items, add, update, remove } = useCollection<Medicine>('medicines')
  const { isOn, toggle } = useFlags('medicineLog')
  const today = todayISO()

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Medicine | null>(null)
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [timings, setTimings] = useState<Timing[]>(['朝'])

  const start = (med?: Medicine) => {
    setEditing(med ?? null)
    setName(med?.name ?? '')
    setAmount(med?.amount ?? '')
    setNote(med?.note ?? '')
    setTimings(med?.timings ?? ['朝'])
    setOpen(true)
  }

  const save = () => {
    const data = { name: name.trim(), amount: amount.trim(), note, timings }
    if (editing) update(editing.id, data)
    else add(data)
    setOpen(false)
  }

  const flagKey = (medId: string, t: Timing) => `${today}:${medId}:${t}`

  const todayTotal = items.reduce((n, m) => n + m.timings.length, 0)
  const todayDone = items.reduce((n, m) => n + m.timings.filter((t) => isOn(flagKey(m.id, t))).length, 0)

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="card mb-6">
        <p className="label">{formatJP(today, true)}</p>
        {todayTotal === 0 ? (
          <p className="mt-1 text-xl">お薬を登録すると、飲んだかどうかを記録できます。</p>
        ) : (
          <>
            <p className="mt-1 text-3xl font-bold">
              きょうは {todayTotal} 回のうち {todayDone} 回のみました
            </p>
            <div className="mt-4 h-4 overflow-hidden rounded-full" style={{ background: 'var(--c-line)' }}>
              <div className="h-full transition-all"
                style={{ width: `${todayTotal ? (todayDone / todayTotal) * 100 : 0}%`, background: 'var(--c-go)' }} />
            </div>
          </>
        )}
      </div>

      <button type="button" className="btn btn-primary mb-6 text-xl" onClick={() => start()}>
        ＋ お薬をふやす
      </button>

      {items.length === 0 ? (
        <EmptyState icon="💊" text="お薬はまだ登録されていません。"
          actionLabel="最初のお薬を登録する" onAction={() => start()} />
      ) : (
        <div className="flex flex-col gap-6">
          {TIMINGS.map((t) => {
            const list = items.filter((m) => m.timings.includes(t))
            if (list.length === 0) return null
            return (
              <section key={t} className="card">
                <h2 className="text-2xl font-bold">{t}ののみ薬</h2>
                <ul className="mt-4 flex flex-col gap-3">
                  {list.map((m) => {
                    const done = isOn(flagKey(m.id, t))
                    return (
                      <li key={m.id}>
                        <button
                          type="button"
                          aria-pressed={done}
                          onClick={() => toggle(flagKey(m.id, t))}
                          className="flex w-full items-center gap-4 rounded-2xl border px-5 py-4 text-left transition"
                          style={{
                            borderColor: done ? 'var(--c-go)' : 'var(--c-line)',
                            background: done ? 'var(--c-ai-dim)' : 'transparent',
                          }}
                        >
                          <span aria-hidden className="text-4xl">{done ? '✅' : '⬜'}</span>
                          <span className="flex-1">
                            <span className="block text-xl font-bold">{m.name}</span>
                            {m.amount && <span className="block text-base" style={{ color: 'var(--c-subink)' }}>{m.amount}</span>}
                          </span>
                          <span className="text-lg font-bold" style={{ color: done ? 'var(--c-go)' : 'var(--c-subink)' }}>
                            {done ? 'のみました' : 'まだです'}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </section>
            )
          })}

          <section className="card pro-only">
            <h2 className="text-xl font-bold">登録しているお薬</h2>
            <ul className="mt-4 flex flex-col gap-3">
              {items.map((m) => (
                <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 border-b pb-3"
                  style={{ borderColor: 'var(--c-line)' }}>
                  <span>
                    <span className="text-lg font-bold">{m.name}</span>
                    <span className="ml-3 text-base" style={{ color: 'var(--c-subink)' }}>
                      {m.timings.join('・')}{m.amount ? ` / ${m.amount}` : ''}
                    </span>
                    {m.note && <span className="block text-base" style={{ color: 'var(--c-subink)' }}>{m.note}</span>}
                  </span>
                  <span className="flex gap-2">
                    <button type="button" className="btn px-4 py-2 text-base" onClick={() => start(m)}>✏️ なおす</button>
                    <DeleteButton confirmText={`「${m.name}」を消しますか？`} onConfirm={() => remove(m.id)} />
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}

      <FormDialog open={open} title={editing ? 'お薬をなおす' : 'お薬をふやす'}
        onClose={() => setOpen(false)} onSubmit={save} canSubmit={!!name.trim() && timings.length > 0}>
        <Field label="お薬の名前">
          <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="例：血圧のくすり" />
        </Field>
        <Field label="いつのむか" hint="あてはまるものを全部えらんでください">
          <span className="flex flex-wrap gap-3">
            {TIMINGS.map((t) => {
              const on = timings.includes(t)
              return (
                <button key={t} type="button" className="btn" aria-pressed={on}
                  style={on ? { background: 'var(--c-ai)', borderColor: 'var(--c-ai)', color: 'var(--c-panel)' } : undefined}
                  onClick={() => setTimings((list) => on ? list.filter((x) => x !== t) : [...list, t])}>
                  {t}
                </button>
              )
            })}
          </span>
        </Field>
        <Field label="のむ量" hint="書かなくてもかまいません">
          <TextInput value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="例：1錠" />
        </Field>
        <Field label="メモ" hint="書かなくてもかまいません">
          <TextArea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="例：食後にのむ" />
        </Field>
      </FormDialog>
    </div>
  )
}
