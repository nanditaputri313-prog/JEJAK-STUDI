const pad = (n: number) => String(n).padStart(2, '0')

export const localDateKey = (date = new Date()) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

export const parseLocalDate = (value: string) => {
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1, 12, 0, 0, 0)
}

export const formatDate = (value: string, options?: Intl.DateTimeFormatOptions) => {
  if (!value) return '-'
  return new Intl.DateTimeFormat('id-ID', options ?? { day: 'numeric', month: 'short', year: 'numeric' }).format(parseLocalDate(value))
}

export const formatDateTime = (iso: string) => new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(iso))

export const dayDiff = (target: string, from = localDateKey()) => {
  const a = parseLocalDate(from)
  const b = parseLocalDate(target)
  return Math.round((b.getTime() - a.getTime()) / 86400000)
}

export const deadlineLabel = (target: string) => {
  const diff = dayDiff(target)
  if (diff < 0) return 'Overdue'
  if (diff === 0) return 'Due today'
  if (diff === 1) return '1 day left'
  return `${diff} days left`
}

export const startOfWeekKey = (date = new Date()) => {
  const d = new Date(date)
  const day = d.getDay() || 7
  d.setDate(d.getDate() - day + 1)
  return localDateKey(d)
}

export const getWeekKeys = (date = new Date()) => {
  const start = parseLocalDate(startOfWeekKey(date))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return localDateKey(d)
  })
}

export const addMonthsLocal = (date: Date, months: number) => {
  const d = new Date(date)
  const originalDay = d.getDate()
  d.setDate(1)
  d.setMonth(d.getMonth() + months)
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
  d.setDate(Math.min(originalDay, last))
  return d
}

export const monthMatrix = (year: number, month: number) => {
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const mondayOffset = (first.getDay() + 6) % 7
  const total = Math.ceil((mondayOffset + last.getDate()) / 7) * 7
  return Array.from({ length: total }, (_, i) => {
    const d = new Date(year, month, i - mondayOffset + 1)
    return { date: d, key: localDateKey(d), currentMonth: d.getMonth() === month }
  })
}
