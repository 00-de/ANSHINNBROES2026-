import { useEffect, useState } from 'react'

export default function TitleBar({ title }: { title: string }) {
  const [maximized, setMaximized] = useState(false)
  const [version, setVersion] = useState('')

  useEffect(() => {
    window.desktop?.getVersion().then(setVersion).catch(() => setVersion(''))
    const off = window.desktop?.onWindowState(setMaximized)
    return () => { if (off) off() }
  }, [])

  return (
    <header
      className="flex h-14 shrink-0 items-center justify-between border-b pl-5 pr-0"
      style={{ background: 'var(--c-ai)', borderColor: 'var(--c-line)', WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      <div className="flex items-baseline gap-4 text-panel" style={{ color: 'var(--c-panel)' }}>
        <span className="text-lg font-bold">AIサポートブラウザ Pro</span>
        <span className="text-sm opacity-80">いま：{title}</span>
      </div>

      <div className="flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        {version && <span className="mr-2 text-sm opacity-70" style={{ color: 'var(--c-panel)' }}>Ver. {version}</span>}
        <WinButton label="小さくする" onClick={() => window.desktop?.minimize()}>─</WinButton>
        <WinButton label={maximized ? '元のおおきさ' : '画面いっぱい'} onClick={() => window.desktop?.toggleMaximize()}>
          {maximized ? '❐' : '☐'}
        </WinButton>
        <WinButton label="とじる" danger onClick={() => window.desktop?.close()}>✕</WinButton>
      </div>
    </header>
  )
}

function WinButton({ children, label, onClick, danger }: {
  children: React.ReactNode; label: string; onClick: () => void; danger?: boolean
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="h-14 w-14 text-lg transition"
      style={{ color: 'var(--c-panel)' }}
      onMouseEnter={(e) => { e.currentTarget.style.background = danger ? 'var(--c-danger)' : 'rgba(255,255,255,0.18)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
    >
      {children}
    </button>
  )
}
