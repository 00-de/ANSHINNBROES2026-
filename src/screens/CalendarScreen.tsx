import { useMemo, useState } from 'react'
import { useCollection } from '../lib/db'
import { monthGrid, todayISO, formatJP, WEEK, parseISO } from '../lib/date'
import FormDialog, { Field, TextArea, TextInput } from '../components/FormDialog'
import { DeleteButton } from '../components/EmptyState'
import type { Hospital } from './HospitalScreen'

interface Plan { id: string; title: string; date: string; time: string; note: string }

export default function CalendarScreen() {
  const { items: plans, add, update, remove } = useCollection<Plan>('events')
  const { items: hospitals } = useCollection<Hospital>('hospitals')

  const today = todayISO()
  const [cursor, setCursor] = useState(() => { const d = parseISO(today); return { y: d.getFullYear(), m: d.getMonth() } })
  const [selected, setSelected] = useState(today)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Plan | null>(null)
  const [form, setForm] = useState({ title: '', date: today, time: '', note: '' })

  const cells = useMemo(() => monthGrid(cursor.y, cursor.m), [cursor])

  // その日にあるものを、予定と通院の両方から集める
  const itemsOn = (iso: string) => [
    ...plans.filter((p) => p.date === iso).map((p) => ({ kind: 'plan' as const, id: p.id, title: p.title, time: p.time, note: p.note, raw: p })),
    ...hospitals.filter((h) => h.date === iso).map((h) => ({ kind: 'hospital' as const, id: h.id, title: h.name, time: h.time, note: h.note, raw: h })),
  ].sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'))

  const move = (diff: number) => {
    const d = new Date(cursor.y, cursor.m + diff, 1)
    setCursor({ y: d.getFullYear(), m: d.getMonth() })
  }

  const start = (plan?: Plan) => {
    setEditing(plan ?? null)
    setForm(plan ? { title: plan.title, date: plan.date, time: plan.time, note: plan.note }
                 : { title: '', date: selected, time: '', note: '' })
    setOpen(true)
  }

  const save = () => {
    const data = { ...form, title: form.title.trim() }
    if (editing) update(editing.id, data)
    else add(data)
    setOpen(false)
  }

  const dayItems = itemsOn(selected)

  return (
    <div className="mx-auto w-full max-w-5xl">
      {/* 月の切り替え */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <button type="button" className="btn px-5" onClick={() => move(-1)}>◀ 前の月</button>
        <p className="text-2xl font-bold">{cursor.y}年 {cursor.m + 1}月</p>
        <button type="button" className="btn px-5" onClick={() => move(1)}>次の月 ▶</button>
      </div>

      {/* カレンダー */}
      <div className="card mb-6 p-3">
        <div className="grid grid-cols-7">
          {WEEK.map((w, i) => (
            <div key={w} className="pb-2 text-center text-base font-bold"
              style={{ color: i === 0 ? 'var(--c-danger)' : i === 6 ? 'var(--c-ai)' : 'var(--c-subink)' }}>{w}</div>
          ))}
          {cells.map((iso, i) => {
            if (!iso) return <div key={`e${i}`} />
            const d = parseISO(iso)
            const list = itemsOn(iso)
            const isToday = iso === today
            const isSel = iso === selected
            return (
              <button key={iso} type="button" onClick={() => setSelected(iso)}
                className="m-0.5 flex min-h-[4.5rem] flex-col items-center rounded-xl border p-1 transition"
                style={{
                  borderColor: isSel ? 'var(--c-ai)' : 'transparent',
                  borderWidth: isSel ? 3 : 1,
                  background: isToday ? 'var(--c-ai-dim)' : 'transparent',
                }}>
                <span className="text-lg font-bold"
                  style={{ color: d.getDay() === 0 ? 'var(--c-danger)' : d.getDay() === 6 ? 'var(--c-ai)' : 'var(--c-ink)' }}>
                  {d.getDate()}
                </span>
                <span className="mt-1 flex flex-wrap justify-center gap-0.5">
                  {list.slice(0, 3).map((it) => (
                    <span key={it.id} aria-hidden className="text-xs">{it.kind === 'hospital' ? '🏥' : '🔵'}</span>
                  ))}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 選んだ日の予定 */}
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-bold">
            {formatJP(selected, true)}{selected === today && <span className="ml-2 text-lg" style={{ color: 'var(--c-go)' }}>（きょう）</span>}
          </h2>
          <button type="button" className="btn btn-primary" onClick={() => start()}>＋ 予定をふやす</button>
        </div>

        {dayItems.length === 0 ? (
          <p className="mt-5 text-xl" style={{ color: 'var(--c-subink)' }}>この日の予定はありません。</p>
        ) : (
          <ul className="mt-5 flex flex-col gap-3">
            {dayItems.map((it) => (
              <li key={it.id} className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border px-5 py-4"
                style={{ borderColor: 'var(--c-line)' }}>
                <div className="flex items-start gap-4">
                  <span aria-hidden className="text-3xl">{it.kind === 'hospital' ? '🏥' : '🔵'}</span>
                  <div>
                    <p className="text-xl font-bold">{it.title}</p>
                    <p className="text-base" style={{ color: 'var(--c-subink)' }}>
                      {it.time || '時間はきめていません'}{it.kind === 'hospital' ? ' ・ 通院の予定' : ''}
                    </p>
                    {it.note && <p className="mt-1 whitespace-pre-wrap text-lg">{it.note}</p>}
                  </div>
                </div>
                {it.kind === 'plan' && (
                  <div className="flex gap-2">
                    <button type="button" className="btn px-4 py-2 text-base" onClick={() => start(it.raw as Plan)}>✏️ なおす</button>
                    <DeleteButton confirmText={`「${it.title}」を消しますか？`} onConfirm={() => remove(it.id)} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
        <p className="mt-5 text-base" style={{ color: 'var(--c-subink)' }}>
          🏥 の予定は「病院」の画面でなおせます。
        </p>
      </div>

      <FormDialog open={open} title={editing ? '予定をなおす' : '予定をふやす'}
        onClose={() => setOpen(false)} onSubmit={save} canSubmit={!!form.title.trim()}>
        <Field label="なんの予定">
          <TextInput value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="例：孫がくる" />
        </Field>
        <Field label="日にち">
          <TextInput type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </Field>
        <Field label="時間" hint="書かなくてもかまいません">
          <TextInput type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
        </Field>
        <Field label="メモ" hint="書かなくてもかまいません">
          <TextArea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} rows={3} />
        </Field>
      </FormDialog>
    </div>
  )
}
