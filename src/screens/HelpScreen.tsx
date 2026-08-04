const STEPS = [
  { t: '左のメニューから選ぶ', d: '画面の左に並んだ大きなボタンが、そのままメニューです。押すと画面が変わります。' },
  { t: '迷ったら「ホームにもどる」', d: 'どの画面にも、右上に「ホームにもどる」があります。押せば最初の画面に戻ります。' },
  { t: '文字が小さいときは設定へ', d: '「設定」で文字の大きさを175％まで大きくできます。画面の色も変えられます。' },
  { t: '読み上げてほしいとき', d: 'ブラウザの画面で「🔊 読み上げ」を押すと、ページの文章を声で読みます。' },
  { t: '鍵マークを見る', d: 'アドレスの左に🔒があれば安全な通信です。⚠️のときはパスワードを入力しないでください。' },
]

export default function HelpScreen() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <ol className="flex flex-col gap-4">
        {STEPS.map((s, i) => (
          <li key={s.t} className="card flex gap-5">
            <span aria-hidden className="text-3xl font-bold" style={{ color: 'var(--c-ai)' }}>{i + 1}</span>
            <div>
              <h2 className="text-xl font-bold">{s.t}</h2>
              <p className="mt-1 text-lg" style={{ color: 'var(--c-subink)' }}>{s.d}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="card mt-8">
        <h2 className="text-xl font-bold">キーボードでの操作</h2>
        <ul className="mt-3 text-lg" style={{ color: 'var(--c-subink)' }}>
          <li>Tab キー … 次のボタンへ移る（オレンジの枠が今の場所です）</li>
          <li>Enter キー … 選んでいるボタンを押す</li>
          <li>Alt + H … いつでもホームにもどる</li>
        </ul>
      </div>
    </div>
  )
}
