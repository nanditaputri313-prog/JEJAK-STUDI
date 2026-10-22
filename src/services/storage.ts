import type { Account, AppData, Settings, Subscription, StreakState } from '../types'

const PREFIX = 'jejakstudi'
const ACCOUNTS = `${PREFIX}:accounts`
const SESSION = `${PREFIX}:session`

const safeParse = <T,>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback
  try { return JSON.parse(raw) as T } catch { return fallback }
}

export const defaultSettings: Settings = {
  theme: 'bright',
  deadlineReminder: true,
  studyReminder: true,
}

export const defaultSubscription: Subscription = { plan: 'FREE' }
export const defaultStreak: StreakState = { current: 0, longest: 0 }

export const emptyAppData = (): AppData => ({
  tasks: [], studySessions: [], focusSessions: [], journals: [], moods: [], goals: [], calendarEvents: [], resources: [], achievements: [], notifications: [], weeklyReviews: [],
  subscription: defaultSubscription,
  settings: defaultSettings,
  streak: defaultStreak,
})

export const getAccounts = () => safeParse<Account[]>(localStorage.getItem(ACCOUNTS), [])
export const saveAccounts = (accounts: Account[]) => localStorage.setItem(ACCOUNTS, JSON.stringify(accounts))
export const getSession = () => localStorage.getItem(SESSION)
export const setSession = (id: string) => localStorage.setItem(SESSION, id)
export const clearSession = () => localStorage.removeItem(SESSION)

const key = (userId: string, slice: keyof AppData) => `${PREFIX}:${userId}:${slice}`

export function loadUserData(userId: string): AppData {
  const base = emptyAppData()
  ;(Object.keys(base) as (keyof AppData)[]).forEach((slice) => {
    const raw = localStorage.getItem(key(userId, slice))
    if (raw) (base as any)[slice] = safeParse(raw, (base as any)[slice])
  })
  return base
}

export function saveSlice<K extends keyof AppData>(userId: string, slice: K, value: AppData[K]) {
  try {
    localStorage.setItem(key(userId, slice), JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function clearUserData(userId: string) {
  const base = emptyAppData()
  ;(Object.keys(base) as (keyof AppData)[]).forEach((slice) => localStorage.removeItem(key(userId, slice)))
}

export function exportUserData(userId: string, account: Account) {
  return { exportedAt: new Date().toISOString(), account: { ...account, passwordHash: undefined }, data: loadUserData(userId) }
}
