import { useState } from 'react'
import BrowserScreen from './BrowserScreen'

interface Service { id: string; name: string; reading: string; url: string; note: string; icon: string }

const SERVICES: Service[] = [
  { id: 'chatgpt', name: 'ChatGPT', reading: 'ちゃっとじーぴーてぃー', url: 'https://chatgpt.com/', icon: '💬', note: '文章づくりや相談が得意です' },
  { id: 'claude',  name: 'Claude',  reading: 'くろーど',           url: 'https://claude.ai/',   icon: '📗', note: '長い文章の要約が得意です' },
  { id: 'gemini',  name: 'Gemini',  reading: 'じぇみに',           url: 'https://gemini.google.com/', icon: '🔷', note: '調べものと画像が得意です' },
  { id: 'genspark',name: 'Genspark',reading: 'じぇんすぱーく',     url: 'https://www.genspark.ai/', icon: '✨', note: '資料づくりが得意です' },
]

export default function AIScreen() {
  const [active, setActive] = useState<Service | null>(null)

  if (active) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-3 border-b px-4 py-3"
          style={{ background: 'var(--c-panel)', borderColor: 'var(--c-line)' }}>
          <button type="button" className="btn px-4" onClick={() => setActive(null)}>◀ AIをえらび直す</button>
          <p className="text-lg font-bold">{active.icon} {active.name} をひらいています</p>
        </div>
        <div className="min-h-0 flex-1">
          <BrowserScreen key={active.id} initialUrl={active.url} />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl p-8">
      <p className="mb-6 text-xl">使いたいAIを選んでください。どれも無料で始められます。</p>
      <ul className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {SERVICES.map((s) => (
          <li key={s.id}>
            <button type="button" className="card flex w-full items-center gap-5 text-left" onClick={() => setActive(s)}>
              <span aria-hidden className="text-5xl">{s.icon}</span>
              <span>
                <span className="block text-2xl font-bold">{s.name}</span>
                <span className="block text-base" style={{ color: 'var(--c-subink)' }}>{s.note}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-base" style={{ color: 'var(--c-subink)' }}>
        はじめて使うときは、それぞれのサービスでログインが必要です。ログイン情報はこのパソコンの中だけに保存されます。
      </p>
    </div>
  )
}
