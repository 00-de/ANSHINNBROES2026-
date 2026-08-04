import { useSettings } from '../context/SettingsContext'
import type { FontScale, ThemeName } from '../types'

const THEMES: { id: ThemeName; label: string; note: string }[] = [
  { id: 'light', label: 'あかるい画面', note: '昼間に見やすい' },
  { id: 'dark', label: 'くらい画面', note: '夜に目がつかれにくい' },
  { id: 'contrast', label: 'はっきり画面', note: '黒地に黄色。文字が読みやすい' },
]

const SCALES: FontScale[] = [100, 125, 150, 175]

export default function SettingsScreen() {
  const { settings, update, reset } = useSettings()

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <Row title="文字の大きさ" hint="読みにくいときは大きくしてください">
        <div className="flex flex-wrap gap-3">
          {SCALES.map((s) => (
            <Choice key={s} active={settings.fontScale === s} onClick={() => update('fontScale', s)}>
              {s}％
            </Choice>
          ))}
        </div>
      </Row>

      <Row title="画面の色" hint="目が疲れにくい色を選べます">
        <div className="flex flex-wrap gap-3">
          {THEMES.map((t) => (
            <Choice key={t.id} active={settings.theme === t.id} onClick={() => update('theme', t.id)}>
              {t.label}
              <span className="ml-2 text-sm font-normal opacity-80">{t.note}</span>
            </Choice>
          ))}
        </div>
      </Row>

      <Row title="かんたんモード" hint="よく使うものだけを表示して、迷いにくくします">
        <Toggle on={settings.easyMode} onChange={(v) => update('easyMode', v)} />
      </Row>

      <Row title="ふりがな" hint="漢字の上に読みかたを出します">
        <Toggle on={settings.furigana} onChange={(v) => update('furigana', v)} />
      </Row>

      <Row title="指したところを読み上げる" hint="マウスを重ねたボタンの名前を声で伝えます">
        <Toggle on={settings.speakOnHover} onChange={(v) => update('speakOnHover', v)} />
      </Row>

      <Row title="休憩のおしらせ" hint="長く使いすぎないようにお知らせします">
        <div className="flex flex-wrap gap-3">
          {[0, 20, 30, 60].map((m) => (
            <Choice key={m} active={settings.breakMinutes === m} onClick={() => update('breakMinutes', m)}>
              {m === 0 ? 'おしらせしない' : `${m}分ごと`}
            </Choice>
          ))}
        </div>
      </Row>

      <Row title="最初にひらくページ" hint="ブラウザの「最初のページ」ボタンで開きます">
        <input
          className="w-full rounded-2xl border px-4 py-3 text-lg"
          style={{ borderColor: 'var(--c-line)', background: 'var(--c-base)', color: 'var(--c-ink)' }}
          value={settings.homeUrl}
          aria-label="最初にひらくページのアドレス"
          onChange={(e) => update('homeUrl', e.target.value)}
        />
      </Row>

      <div className="card">
        <h2 className="text-xl font-bold">設定を最初の状態にもどす</h2>
        <p className="mt-1 text-base" style={{ color: 'var(--c-subink)' }}>
          文字の大きさや色が元にもどります。メモやお気に入りは消えません。
        </p>
        <button
          type="button"
          className="btn mt-4"
          style={{ borderColor: 'var(--c-danger)', color: 'var(--c-danger)' }}
          onClick={() => { if (confirm('設定を最初の状態にもどしますか？')) reset() }}
        >
          最初の状態にもどす
        </button>
      </div>
    </div>
  )
}

function Row({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="card">
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="mb-4 mt-1 text-base" style={{ color: 'var(--c-subink)' }}>{hint}</p>
      {children}
    </div>
  )
}

function Choice({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="btn"
      style={active
        ? { background: 'var(--c-ai)', borderColor: 'var(--c-ai)', color: 'var(--c-panel)' }
        : undefined}
    >
      {children}
    </button>
  )
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex gap-3">
      <Choice active={on} onClick={() => onChange(true)}>つかう</Choice>
      <Choice active={!on} onClick={() => onChange(false)}>つかわない</Choice>
    </div>
  )
}
