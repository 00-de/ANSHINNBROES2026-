export const WEEK = ['日', '月', '火', '水', '木', '金', '土']

/** 2026-08-09 の形にする */
export function toISO(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayISO(): string {
  return toISO(new Date())
}

export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

/** 8月9日（日） の形にする */
export function formatJP(iso: string, withYear = false): string {
  const d = parseISO(iso)
  const head = withYear ? `${d.getFullYear()}年` : ''
  return `${head}${d.getMonth() + 1}月${d.getDate()}日（${WEEK[d.getDay()]}）`
}

/** あと何日か。0なら今日、1なら明日 */
export function daysFromToday(iso: string): number {
  const a = parseISO(todayISO()).getTime()
  const b = parseISO(iso).getTime()
  return Math.round((b - a) / 86400000)
}

export function relativeLabel(iso: string): string {
  const n = daysFromToday(iso)
  if (n === 0) return 'きょう'
  if (n === 1) return 'あした'
  if (n === 2) return 'あさって'
  if (n > 0) return `${n}日後`
  if (n === -1) return 'きのう'
  return `${-n}日前`
}

/** その月のマス目（日曜はじまり、前後の月の空白込み） */
export function monthGrid(year: number, month: number): (string | null)[] {
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const cells: (string | null)[] = []
  for (let i = 0; i < first.getDay(); i++) cells.push(null)
  for (let d = 1; d <= last.getDate(); d++) cells.push(toISO(new Date(year, month, d)))
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}
