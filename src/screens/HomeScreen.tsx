import { NAV_ITEMS } from '../data/navItems'
import { useSettings } from '../context/SettingsContext'
import { useCollection, useFlags } from '../lib/db'
import { todayISO } from '../lib/date'
import type { ScreenId } from '../types'

interface TodayPlan { id: string; title: string; date: string; time: string }
interface TodayHospital { id: string; name: string; date: string; time: string }
interface TodayMed { id: string; name: string; timings: string[] }

const WEEK = ['日', '月', '火', '水', '木', '金', '土']

export default function HomeScreen({ onSelect }: { onSelect: (id: ScreenId) => void }) {
  const { settings, speak } = useSettings()
  const now = new Date()
  const dateText = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日（${WEEK[now.getDay()]}）`
  const iso = todayISO()
  const { items: plans } = useCollection<TodayPlan>('events')
  const { items: hospitals } = useCollection<TodayHospital>('hospitals')
  const { items: meds } = useCollection<TodayMed>('medicines')
  const { isOn } = useFlags('medicineLog')

  const todayPlans = [
    ...hospitals.filter((h) => h.date === iso).map((h) => ({ id: h.id, icon: '🏥', text: h.name, time: h.time })),
    ...plans.filter((p) => p.date === iso).map((p) => ({ id: p.id, icon: '🔵', text: p.title, time: p.time })),
  ].sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'))

  const medTotal = meds.reduce((n, m) => n + m.timings.length, 0)
  const medLeft = meds.reduce((n, m) => n + m.timings.filter((t) => !isOn(`${iso}:${m.id}:${t}`)).length, 0)

  const items = (settings.easyMode ? NAV_ITEMS.filter((i) => i.easy) : NAV_ITEMS).filter((i) => i.id !== 'home')

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="card mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label">きょうは</p>
          <p className="text-4xl font-bold">{dateText}</p>
        </div>
        <p className="text-xl" style={{ color: 'var(--c-subink)' }}>
          やりたいことを、下から選んでください。
        </p>
      </div>

      {(todayPlans.length > 0 || medLeft > 0) && (
        <div className="card mb-8">
          <h2 className="text-xl font-bold">きょうのこと</h2>
          <ul className="mt-4 flex flex-col gap-3">
            {todayPlans.map((p) => (
              <li key={p.id} className="flex items-center gap-4 text-xl">
                <span aria-hidden className="text-2xl">{p.icon}</span>
                <span className="font-bold">{p.text}</span>
                <span className="text-lg" style={{ color: 'var(--c-subink)' }}>{p.time || ''}</span>
              </li>
            ))}
            {medLeft > 0 && (
              <li className="flex items-center gap-4 text-xl">
                <span aria-hidden className="text-2xl">💊</span>
                <span className="font-bold">お薬があと {medLeft} 回のこっています</span>
                <span className="text-lg" style={{ color: 'var(--c-subink)' }}>（ぜんぶで {medTotal} 回）</span>
              </li>
            )}
          </ul>
        </div>
      )}

      <ul className="grid grid-cols-2 gap-5 md:grid-cols-3">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onSelect(item.id)}
              onMouseEnter={() => settings.speakOnHover && speak(item.label)}
              className="card flex h-full w-full flex-col items-start gap-2 text-left transition hover:-translate-y-0.5"
              style={{ minHeight: '9.5rem' }}
            >
              <span aria-hidden className="text-5xl leading-none">{item.icon}</span>
              <span className="text-2xl font-bold">
                {settings.furigana ? <ruby>{item.label}<rt>{item.reading}</rt></ruby> : item.label}
              </span>
              <span className="text-base" style={{ color: 'var(--c-subink)' }}>{item.hint}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
