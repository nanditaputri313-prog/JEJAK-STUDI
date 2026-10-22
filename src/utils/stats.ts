import type { AppData, MoodValue } from '../types'
import { getWeekKeys, localDateKey, parseLocalDate } from './date'

export const completedTasks = (data: AppData) => data.tasks.filter(t => t.status === 'Completed')
export const taskCompletionRate = (data: AppData) => data.tasks.length ? Math.round(completedTasks(data).length / data.tasks.length * 100) : 0
export const totalStudyMinutes = (data: AppData) => data.studySessions.filter(s => s.status === 'completed').reduce((a, s) => a + s.duration, 0) + data.focusSessions.reduce((a, s) => a + s.duration, 0)
export const goalProgressAverage = (data: AppData) => data.goals.length ? Math.round(data.goals.reduce((a, g) => a + Math.min(100, g.target ? g.current / g.target * 100 : 0), 0) / data.goals.length) : 0

export const activityDateSet = (data: AppData) => new Set([
  ...data.studySessions.filter(s => s.status === 'completed').map(s => s.date),
  ...data.focusSessions.map(s => s.date),
])

export function calculateStreak(data: AppData) {
  const dates = activityDateSet(data)
  const today = parseLocalDate(localDateKey())
  let anchor = new Date(today)
  if (!dates.has(localDateKey(anchor))) anchor.setDate(anchor.getDate() - 1)
  let current = 0
  while (dates.has(localDateKey(anchor))) {
    current++
    anchor.setDate(anchor.getDate() - 1)
  }
  const sorted = Array.from(dates).sort()
  let longest = 0, run = 0, prev: Date | null = null
  sorted.forEach(key => {
    const d = parseLocalDate(key)
    if (prev && Math.round((d.getTime() - prev.getTime()) / 86400000) === 1) run++
    else run = 1
    longest = Math.max(longest, run)
    prev = d
  })
  return { current, longest, lastActivityDate: sorted.at(-1) }
}

export function weeklyChart(data: AppData) {
  const keys = getWeekKeys()
  const labels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
  return keys.map((date, i) => ({
    name: labels[i],
    date,
    menit: data.studySessions.filter(s => s.status === 'completed' && s.date === date).reduce((a, s) => a + s.duration, 0) + data.focusSessions.filter(s => s.date === date).reduce((a, s) => a + s.duration, 0),
    tugas: data.tasks.filter(t => t.status === 'Completed' && t.completedAt?.slice(0,10) === date).length,
  }))
}

export function weeklyMood(data: AppData) {
  const keys = getWeekKeys()
  const latest = new Map<string, MoodValue>()
  data.moods.forEach(m => { if (keys.includes(m.date)) latest.set(m.date, m.mood) })
  data.journals.forEach(j => { if (keys.includes(j.date)) latest.set(j.date, j.mood) })
  return keys.map(k => latest.get(k)).filter(Boolean) as MoodValue[]
}

export const moodEmoji: Record<MoodValue, string> = { senang: '😊', baik: '🙂', biasa: '😐', kurang: '😕', berat: '😣' }
export const moodLabel: Record<MoodValue, string> = { senang: 'Senang', baik: 'Baik', biasa: 'Biasa', kurang: 'Kurang baik', berat: 'Berat' }
