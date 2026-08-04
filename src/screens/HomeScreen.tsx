import { NAV_ITEMS } from '../data/navItems'
import { useSettings } from '../context/SettingsContext'
import type { ScreenId } from '../types'

const WEEK = ['日', '月', '火', '水', '木', '金', '土']

export default function HomeScreen({ onSelect }: { onSelect: (id: ScreenId) => void }) {
  const { settings, speak } = useSettings()
  const now = new Date()
  const dateText = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日（${WEEK[now.getDay()]}）`
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
