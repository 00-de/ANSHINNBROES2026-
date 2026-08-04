import { NAV_ITEMS } from '../data/navItems'
import { useSettings } from '../context/SettingsContext'
import type { ScreenId } from '../types'

interface Props {
  current: ScreenId
  onSelect: (id: ScreenId) => void
}

export default function Sidebar({ current, onSelect }: Props) {
  const { settings, speak } = useSettings()
  const items = settings.easyMode ? NAV_ITEMS.filter((i) => i.easy) : NAV_ITEMS

  return (
    <nav
      aria-label="メインメニュー"
      className="flex w-[15rem] shrink-0 flex-col gap-2 overflow-y-auto border-r p-3"
      style={{ background: 'var(--c-panel)', borderColor: 'var(--c-line)' }}
    >
      {items.map((item) => {
        const active = item.id === current
        return (
          <button
            key={item.id}
            type="button"
            aria-current={active ? 'page' : undefined}
            onClick={() => onSelect(item.id)}
            onMouseEnter={() => settings.speakOnHover && speak(item.label)}
            className="flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition"
            style={{
              background: active ? 'var(--c-ai)' : 'transparent',
              borderColor: active ? 'var(--c-ai)' : 'var(--c-line)',
              color: active ? 'var(--c-panel)' : 'var(--c-ink)',
            }}
          >
            <span aria-hidden className="text-2xl leading-none">{item.icon}</span>
            <span className="text-lg font-bold">
              {settings.furigana ? <ruby>{item.label}<rt>{item.reading}</rt></ruby> : item.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
