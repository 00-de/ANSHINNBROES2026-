import type { ScreenId } from '../types'

export interface NavItem {
  id: ScreenId
  label: string
  reading: string      // ふりがな
  icon: string         // 絵記号（フォント依存を避けるため絵文字を使用）
  hint: string         // 何ができるかを一言で
  easy: boolean        // かんたんモードでも表示する
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'home',      label: 'ホーム',     reading: 'ほーむ',       icon: '🏠', hint: 'さいしょの画面にもどります', easy: true },
  { id: 'ai',        label: 'AIにきく',   reading: 'えーあいにきく', icon: '🤖', hint: '知りたいことをAIにたずねます', easy: true },
  { id: 'browser',   label: 'ブラウザ',   reading: 'ぶらうざ',     icon: '🌐', hint: 'ホームページを見ます', easy: true },
  { id: 'search',    label: 'けんさく',   reading: 'けんさく',     icon: '🔍', hint: '調べたい言葉でさがします', easy: true },
  { id: 'mail',      label: 'メール',     reading: 'めーる',       icon: '✉️', hint: 'メールを読む・送ります', easy: true },
  { id: 'youtube',   label: 'どうが',     reading: 'どうが',       icon: '📺', hint: '動画を見ます', easy: true },
  { id: 'hospital',  label: '病院',       reading: 'びょういん',   icon: '🏥', hint: '通院の予定とメモ', easy: true },
  { id: 'medicine',  label: 'くすり',     reading: 'くすり',       icon: '💊', hint: 'お薬の時間としゅるい', easy: true },
  { id: 'calendar',  label: 'カレンダー', reading: 'かれんだー',   icon: '📅', hint: '今日と今月の予定', easy: true },
  { id: 'memo',      label: 'メモ',       reading: 'めも',         icon: '📝', hint: '忘れたくないことを書きます', easy: true },
  { id: 'consult',   label: 'そうだん',   reading: 'そうだん',     icon: '💬', hint: '困ったときの相談さき', easy: true },
  { id: 'bookmarks', label: 'お気に入り', reading: 'おきにいり',   icon: '⭐', hint: 'よく見るページを保存します', easy: false },
  { id: 'history',   label: 'りれき',     reading: 'りれき',       icon: '🕘', hint: '前に見たページ', easy: false },
  { id: 'downloads', label: '保存ファイル', reading: 'ほぞんふぁいる', icon: '📥', hint: 'ダウンロードしたもの', easy: false },
  { id: 'settings',  label: '設定',       reading: 'せってい',     icon: '⚙️', hint: '文字の大きさや色をかえます', easy: true },
  { id: 'help',      label: 'ヘルプ',     reading: 'へるぷ',       icon: '❓', hint: '使い方をたしかめます', easy: true },
]
