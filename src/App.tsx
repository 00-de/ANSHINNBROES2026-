import { useEffect, useState } from 'react'
import TitleBar from './components/TitleBar'
import Sidebar from './components/Sidebar'
import ScreenFrame from './components/ScreenFrame'
import BreakReminder from './components/BreakReminder'
import ErrorBoundary from './components/ErrorBoundary'
import UpdateNotice from './components/UpdateNotice'
import HomeScreen from './screens/HomeScreen'
import BrowserScreen from './screens/BrowserScreen'
import AIScreen from './screens/AIScreen'
import SettingsScreen from './screens/SettingsScreen'
import HelpScreen from './screens/HelpScreen'
import PlaceholderScreen from './screens/PlaceholderScreen'
import MemoScreen from './screens/MemoScreen'
import MedicineScreen from './screens/MedicineScreen'
import HospitalScreen from './screens/HospitalScreen'
import CalendarScreen from './screens/CalendarScreen'
import ConsultScreen from './screens/ConsultScreen'
import { NAV_ITEMS } from './data/navItems'
import { useSettings } from './context/SettingsContext'
import type { ScreenId } from './types'

const PLANS: Partial<Record<ScreenId, string[]>> = {
  mail: ['メールを大きな文字で読む', 'AIに返事の下書きを作ってもらう', '知らない差出人に注意マークを出す'],
  youtube: ['見たい動画をさがす', '危ない広告をふせぐ', '音量と字幕を大きなボタンで操作する'],
  hospital: ['通院の予定を登録する', '病院ごとのメモを残す', '家族と予定を共有する'],
  medicine: ['お薬の時間をお知らせする', '飲んだかどうかを記録する', 'お薬の写真を保存する'],
  calendar: ['今日と今月の予定を大きく表示する', '予定を声で入力する', '前の日にお知らせする'],
  memo: ['文字と写真でメモを残す', '声でメモを取る', 'AIにメモをまとめてもらう'],
  consult: ['家族や支援者の連絡先を大きく並べる', 'ワンタッチで電話・メールをひらく', '困りごとをAIに相談する'],
  bookmarks: ['よく見るページを写真つきで保存する', 'フォルダで分ける', '並べ替える'],
  history: ['前に見たページを日付ごとに見る', '消したい履歴だけ選んで消す'],
  downloads: ['保存したファイルを一覧で見る', '種類ごとに分けて表示する', '危険なファイルに警告を出す'],
  search: ['ひとつの入力欄で検索とAIを切り替える', '検索結果を大きな文字で見る'],
}

export default function App() {
  const [screen, setScreen] = useState<ScreenId>('home')
  const { settings } = useSettings()
  const meta = NAV_ITEMS.find((n) => n.id === screen) ?? NAV_ITEMS[0]

  // Alt + H でいつでもホームへ
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'h' || e.key === 'H')) { e.preventDefault(); setScreen('home') }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const body = () => {
    switch (screen) {
      case 'home': return <HomeScreen onSelect={setScreen} />
      case 'browser': return <BrowserScreen />
      case 'search': return <BrowserScreen initialUrl="https://www.google.co.jp/" />
      case 'youtube': return <BrowserScreen initialUrl="https://www.youtube.com/" />
      case 'ai': return <AIScreen />
      case 'settings': return <SettingsScreen />
      case 'help': return <HelpScreen />
      case 'memo': return <MemoScreen />
      case 'medicine': return <MedicineScreen />
      case 'hospital': return <HospitalScreen />
      case 'calendar': return <CalendarScreen />
      case 'consult': return <ConsultScreen />
      default:
        return <PlaceholderScreen icon={meta.icon} title={meta.label} plan={PLANS[screen] ?? []} />
    }
  }

  // ブラウザ系は画面いっぱいに使うため、共通ヘッダーの余白を外す
  const fullBleed = screen === 'browser' || screen === 'search' || screen === 'youtube' || screen === 'ai'

  return (
    <div className="flex h-full flex-col">
      <TitleBar title={meta.label} />
      <div className="flex min-h-0 flex-1">
        <Sidebar current={screen} onSelect={setScreen} />
        <main className="min-w-0 flex-1" style={{ background: 'var(--c-base)' }}>
          {fullBleed ? (
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between gap-4 border-b px-6 py-3"
                style={{ borderColor: 'var(--c-line)', background: 'var(--c-panel)' }}>
                <p className="text-lg font-bold">{meta.icon} {meta.label}</p>
                <button type="button" className="btn py-2" onClick={() => setScreen('home')}>
                  🏠 ホームにもどる
                </button>
              </div>
              <div className="min-h-0 flex-1">
                <ErrorBoundary key={screen}>{body()}</ErrorBoundary>
              </div>
            </div>
          ) : (
            <ScreenFrame
              icon={meta.icon}
              title={meta.label}
              hint={meta.hint}
              onHome={screen === 'home' ? undefined : () => setScreen('home')}
            >
              <ErrorBoundary key={screen}>{body()}</ErrorBoundary>
            </ScreenFrame>
          )}
        </main>
      </div>
      <UpdateNotice />
      {settings.breakMinutes > 0 && <BreakReminder />}
    </div>
  )
}
