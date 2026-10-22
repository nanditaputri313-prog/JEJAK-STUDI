import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Account, Achievement, AppData, CalendarEvent, FocusSession, Goal, JournalEntry, MoodEntry, NotificationItem, ResourceItem, Settings, StudySession, Subscription, Task, WeeklyReview } from '../types'
import { clearSession, clearUserData, emptyAppData, exportUserData, getAccounts, getSession, loadUserData, saveAccounts, saveSlice, setSession } from '../services/storage'
import { hashPassword } from '../utils/auth'
import { addMonthsLocal, dayDiff, localDateKey } from '../utils/date'
import { calculateStreak, completedTasks, totalStudyMinutes } from '../utils/stats'
import { uid } from '../utils/id'

interface AppContextValue {
  account: Account | null
  data: AppData
  loading: boolean
  toast: string | null
  latestAchievement: Achievement | null
  upgradeModal: boolean
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => void
  completeOnboarding: (focusAreas: string[], semesterGoal: string, studyHabitDays: number) => void
  updateProfile: (name: string, email: string) => { ok: boolean; error?: string }
  changePassword: (password: string) => Promise<void>
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'status'> & { status?: Task['status'] }) => boolean
  updateTask: (id: string, patch: Partial<Task>) => void
  deleteTask: (id: string) => void
  addStudySession: (session: Omit<StudySession, 'id' | 'completedAt'>) => boolean
  completeStudySession: (id: string) => void
  deleteStudySession: (id: string) => void
  addFocusSession: (minutes: number) => void
  addOrUpdateJournal: (entry: { id?: string; date: string; mood: JournalEntry['mood']; text: string }) => boolean
  deleteJournal: (id: string) => void
  setMoodToday: (mood: MoodEntry['mood']) => void
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'status'>) => boolean
  updateGoal: (id: string, patch: Partial<Goal>) => void
  deleteGoal: (id: string) => void
  addEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt'>) => void
  updateEvent: (id: string, patch: Partial<CalendarEvent>) => void
  deleteEvent: (id: string) => void
  addResource: (item: Omit<ResourceItem, 'id' | 'dateAdded'>) => void
  updateResource: (id: string, patch: Partial<ResourceItem>) => void
  deleteResource: (id: string) => void
  saveWeeklyReview: (review: Omit<WeeklyReview, 'id' | 'updatedAt'>) => void
  updateSettings: (settings: Partial<Settings>) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  subscribe: (months: 3 | 6 | 12, price: number) => void
  clearAllData: () => void
  downloadExport: () => void
  requestUpgrade: () => void
  closeUpgrade: () => void
  clearLatestAchievement: () => void
  pushToast: (message: string) => void
}

const Ctx = createContext<AppContextValue | null>(null)

const achievementCatalog = [
  { key: 'first-step', title: 'First Step', description: 'Menyelesaikan study session pertama.', check: (d: AppData) => d.studySessions.some(s => s.status === 'completed') || d.focusSessions.length > 0 },
  { key: 'streak-3', title: '3-Day Starter', description: 'Menjaga streak selama 3 hari.', check: (d: AppData) => d.streak.current >= 3 },
  { key: 'streak-7', title: 'Consistency Builder', description: 'Menjaga streak selama 7 hari.', check: (d: AppData) => d.streak.current >= 7 },
  { key: 'streak-14', title: '14-Day Streak', description: 'Menjaga streak selama 14 hari.', check: (d: AppData) => d.streak.current >= 14 },
  { key: 'streak-30', title: '30-Day Consistency', description: 'Menjaga streak selama 30 hari.', check: (d: AppData) => d.streak.current >= 30 },
  { key: 'goal-getter', title: 'Goal Getter', description: 'Menyelesaikan goal pertama.', check: (d: AppData) => d.goals.some(g => g.status === 'Completed') },
  { key: 'task-master', title: 'Task Master', description: 'Menyelesaikan 20 tugas.', check: (d: AppData) => completedTasks(d).length >= 20 },
  { key: 'study-explorer', title: 'Study Explorer', description: 'Menyelesaikan 20 sesi belajar.', check: (d: AppData) => d.studySessions.filter(s => s.status === 'completed').length + d.focusSessions.length >= 20 },
]

export function AppProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null)
  const [data, setData] = useState<AppData>(emptyAppData())
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<string | null>(null)
  const [latestAchievement, setLatestAchievement] = useState<Achievement | null>(null)
  const [upgradeModal, setUpgradeModal] = useState(false)

  const pushToast = useCallback((message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(null), 2600)
  }, [])

  useEffect(() => {
    const session = getSession()
    if (session) {
      const found = getAccounts().find(a => a.id === session) || null
      if (found) {
        setAccount(found)
        setData(loadUserData(found.id))
      } else clearSession()
    }
    setLoading(false)
  }, [])

  const persist = useCallback(<K extends keyof AppData>(slice: K, value: AppData[K]) => {
    if (!account) return
    if (!saveSlice(account.id, slice, value)) pushToast('Data belum tersimpan. Penyimpanan browser mungkin penuh.')
  }, [account, pushToast])

  const setSlice = useCallback(<K extends keyof AppData>(slice: K, updater: AppData[K] | ((prev: AppData[K]) => AppData[K])) => {
    setData(prev => {
      const oldValue = prev[slice]
      const nextValue = typeof updater === 'function' ? (updater as (p: AppData[K]) => AppData[K])(oldValue) : updater
      persist(slice, nextValue)
      return { ...prev, [slice]: nextValue }
    })
  }, [persist])

  useEffect(() => {
    if (!account) return
    const computed = calculateStreak(data)
    if (computed.current !== data.streak.current || computed.longest !== data.streak.longest || computed.lastActivityDate !== data.streak.lastActivityDate) {
      setData(prev => ({ ...prev, streak: computed }))
      persist('streak', computed)
    }
  }, [account, data.studySessions, data.focusSessions, data.streak, persist])

  useEffect(() => {
    if (!account || data.subscription.plan !== 'PLUS' || !data.subscription.expiryDate) return
    if (dayDiff(data.subscription.expiryDate) < 0) {
      const next: Subscription = { plan: 'FREE' }
      setData(prev => ({ ...prev, subscription: next }))
      persist('subscription', next)
      pushToast('Masa JEJAK STUDI PLUS telah berakhir. Akun kembali ke FREE.')
    }
  }, [account, data.subscription, persist, pushToast])

  useEffect(() => {
    if (!account) return
    const today = localDateKey()
    const oldRead = new Map(data.notifications.map(n => [n.id, n.read]))
    const auto: NotificationItem[] = []
    if (data.settings.deadlineReminder) {
      data.tasks.filter(t => t.status !== 'Completed').forEach(t => {
        const diff = dayDiff(t.deadline)
        if (diff >= 0 && diff <= 2) auto.push({
          id: `deadline_${t.id}_${today}`, title: 'Deadline approaching', message: `${t.title} ${diff === 0 ? 'jatuh tempo hari ini.' : `jatuh tempo dalam ${diff} hari.`}`, type: 'deadline', createdAt: new Date().toISOString(), read: oldRead.get(`deadline_${t.id}_${today}`) ?? false,
        })
      })
    }
    if (data.settings.studyReminder && !new Set([...data.studySessions.filter(s => s.status === 'completed').map(s => s.date), ...data.focusSessions.map(s => s.date)]).has(today)) {
      auto.push({ id: `streak_${today}`, title: 'Streak reminder', message: 'Selesaikan satu aktivitas belajar hari ini untuk melanjutkan jejakmu.', type: 'streak', createdAt: new Date().toISOString(), read: oldRead.get(`streak_${today}`) ?? false })
    }
    data.goals.filter(g => g.status !== 'Completed' && g.target > 0 && g.current / g.target >= .8).forEach(g => {
      const pct = Math.min(99, Math.round(g.current / g.target * 100))
      auto.push({ id: `goal_${g.id}_${today}`, title: 'Goal progress', message: `Kamu sudah ${pct}% menuju goal “${g.title}”.`, type: 'goal', createdAt: new Date().toISOString(), read: oldRead.get(`goal_${g.id}_${today}`) ?? false })
    })
    const preserved = data.notifications.filter(n => n.type === 'achievement' || n.type === 'general')
    const next = [...auto, ...preserved].slice(0, 50)
    const same = JSON.stringify(next.map(n => [n.id, n.read, n.message])) === JSON.stringify(data.notifications.map(n => [n.id, n.read, n.message]))
    if (!same) {
      setData(prev => ({ ...prev, notifications: next }))
      persist('notifications', next)
    }
  }, [account, data.tasks, data.goals, data.studySessions, data.focusSessions, data.settings, data.notifications, persist])

  useEffect(() => {
    if (!account) return
    const unlocked = new Set(data.achievements.map(a => a.key))
    const candidate = achievementCatalog.find(a => !unlocked.has(a.key) && a.check(data))
    if (!candidate) return
    const ach: Achievement = { id: uid('ach'), key: candidate.key, title: candidate.title, description: candidate.description, unlockedAt: new Date().toISOString() }
    const nextAchievements = [...data.achievements, ach]
    const note: NotificationItem = { id: uid('note'), title: 'Achievement unlocked!', message: `${ach.title} — ${ach.description}`, type: 'achievement', createdAt: new Date().toISOString(), read: false }
    setData(prev => ({ ...prev, achievements: nextAchievements, notifications: [note, ...prev.notifications].slice(0, 50) }))
    persist('achievements', nextAchievements)
    persist('notifications', [note, ...data.notifications].slice(0, 50))
    setLatestAchievement(ach)
    pushToast(`🎉 Achievement unlocked: ${ach.title}`)
  }, [account, data, persist, pushToast])

  useEffect(() => {
    if (typeof document !== 'undefined') document.documentElement.dataset.theme = data.settings.theme === 'bright' ? '' : data.settings.theme
  }, [data.settings.theme])

  const register = async (name: string, email: string, password: string) => {
    const accounts = getAccounts()
    const normalized = email.trim().toLowerCase()
    if (accounts.some(a => a.email === normalized)) return { ok: false, error: 'Email sudah terdaftar.' }
    const next: Account = { id: uid('usr'), name: name.trim(), email: normalized, passwordHash: await hashPassword(password), createdAt: new Date().toISOString(), onboardingCompleted: false, focusAreas: [], semesterGoal: '', studyHabitDays: 5 }
    saveAccounts([...accounts, next])
    setSession(next.id)
    setAccount(next)
    setData(emptyAppData())
    return { ok: true }
  }

  const login = async (email: string, password: string) => {
    const normalized = email.trim().toLowerCase()
    const pass = await hashPassword(password)
    const found = getAccounts().find(a => a.email === normalized && a.passwordHash === pass)
    if (!found) return { ok: false, error: 'Email atau password tidak sesuai.' }
    setSession(found.id)
    setAccount(found)
    setData(loadUserData(found.id))
    return { ok: true }
  }

  const logout = () => { clearSession(); setAccount(null); setData(emptyAppData()) }

  const updateAccount = (patch: Partial<Account>) => {
    if (!account) return
    const next = { ...account, ...patch }
    saveAccounts(getAccounts().map(a => a.id === account.id ? next : a))
    setAccount(next)
  }

  const completeOnboarding = (focusAreas: string[], semesterGoal: string, studyHabitDays: number) => updateAccount({ focusAreas, semesterGoal, studyHabitDays, onboardingCompleted: true })

  const updateProfile = (name: string, email: string) => {
    if (!account) return { ok: false, error: 'Sesi tidak ditemukan.' }
    const normalized = email.trim().toLowerCase()
    if (getAccounts().some(a => a.id !== account.id && a.email === normalized)) return { ok: false, error: 'Email sudah digunakan akun lain.' }
    updateAccount({ name: name.trim(), email: normalized })
    pushToast('✓ Profil berhasil diperbarui.')
    return { ok: true }
  }

  const changePassword = async (password: string) => { updateAccount({ passwordHash: await hashPassword(password) }); pushToast('✓ Password berhasil diperbarui.') }

  const addTask: AppContextValue['addTask'] = (task) => {
    if (data.subscription.plan === 'FREE' && data.tasks.filter(t => t.status !== 'Completed').length >= 30) { setUpgradeModal(true); pushToast('Batas 30 active tasks untuk paket FREE tercapai.'); return false }
    const item: Task = { ...task, id: uid('task'), createdAt: new Date().toISOString(), status: task.status ?? 'To Do' }
    setSlice('tasks', prev => [...prev, item]); pushToast('✓ Task berhasil ditambahkan.'); return true
  }
  const updateTask = (id: string, patch: Partial<Task>) => {
    setSlice('tasks', prev => prev.map(t => {
      if (t.id !== id) return t
      const status = patch.status ?? t.status
      return { ...t, ...patch, completedAt: status === 'Completed' ? (t.completedAt ?? new Date().toISOString()) : undefined }
    })); pushToast(patch.status === 'Completed' ? '✓ Task selesai. Sedikit demi sedikit, tetap jalan.' : '✓ Task berhasil diperbarui.')
  }
  const deleteTask = (id: string) => { setSlice('tasks', prev => prev.filter(t => t.id !== id)); pushToast('✓ Task berhasil dihapus.') }

  const addStudySession: AppContextValue['addStudySession'] = (session) => { const item: StudySession = { ...session, id: uid('study'), completedAt: session.status === 'completed' ? new Date().toISOString() : undefined }; setSlice('studySessions', prev => [...prev, item]); pushToast(session.status === 'completed' ? '🎉 Study session completed!' : '✓ Study session ditambahkan.'); return true }
  const completeStudySession = (id: string) => { setSlice('studySessions', prev => prev.map(s => s.id === id ? { ...s, status: 'completed', completedAt: new Date().toISOString() } : s)); pushToast('🎉 Study session completed!') }
  const deleteStudySession = (id: string) => { setSlice('studySessions', prev => prev.filter(s => s.id !== id)); pushToast('✓ Study session dihapus.') }
  const addFocusSession = (minutes: number) => { const item: FocusSession = { id: uid('focus'), duration: minutes, completedAt: new Date().toISOString(), date: localDateKey() }; setSlice('focusSessions', prev => [...prev, item]); pushToast('🎉 Focus session completed!') }

  const addOrUpdateJournal: AppContextValue['addOrUpdateJournal'] = (entry) => {
    if (!entry.id && data.subscription.plan === 'FREE') {
      const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const oldCount = data.journals.filter(j => new Date(`${j.date}T12:00:00`) < thirtyDaysAgo).length
      if (oldCount > 0) setSlice('journals', prev => prev.filter(j => new Date(`${j.date}T12:00:00`) >= thirtyDaysAgo))
    }
    const now = new Date().toISOString()
    if (entry.id) setSlice('journals', prev => prev.map(j => j.id === entry.id ? { ...j, ...entry, updatedAt: now } : j))
    else setSlice('journals', prev => [{ id: uid('journal'), ...entry, createdAt: now, updatedAt: now }, ...prev])
    setMoodToday(entry.mood)
    pushToast('✓ Journal berhasil disimpan.'); return true
  }
  const deleteJournal = (id: string) => { setSlice('journals', prev => prev.filter(j => j.id !== id)); pushToast('✓ Journal berhasil dihapus.') }
  const setMoodToday = (mood: MoodEntry['mood']) => { const date = localDateKey(); setSlice('moods', prev => [{ id: uid('mood'), date, mood, createdAt: new Date().toISOString() }, ...prev.filter(m => m.date !== date)]) }

  const addGoal: AppContextValue['addGoal'] = (goal) => {
    if (data.subscription.plan === 'FREE' && data.goals.filter(g => g.status === 'Active').length >= 3) { setUpgradeModal(true); pushToast('Batas 3 active goals untuk paket FREE tercapai.'); return false }
    const status = goal.current >= goal.target ? 'Completed' : 'Active'
    const item: Goal = { ...goal, id: uid('goal'), createdAt: new Date().toISOString(), status, completedAt: status === 'Completed' ? new Date().toISOString() : undefined }
    setSlice('goals', prev => [...prev, item]); pushToast(status === 'Completed' ? '🎯 Goal Completed!' : '✓ Goal berhasil ditambahkan.'); return true
  }
  const updateGoal = (id: string, patch: Partial<Goal>) => {
    setSlice('goals', prev => prev.map(g => {
      if (g.id !== id) return g
      const merged = { ...g, ...patch }
      const status: Goal['status'] = merged.current >= merged.target ? 'Completed' : 'Active'
      return { ...merged, status, completedAt: status === 'Completed' ? (g.completedAt ?? new Date().toISOString()) : undefined }
    })); pushToast('✓ Goal berhasil diperbarui.')
  }
  const deleteGoal = (id: string) => { setSlice('goals', prev => prev.filter(g => g.id !== id)); pushToast('✓ Goal berhasil dihapus.') }

  const addEvent: AppContextValue['addEvent'] = (event) => { setSlice('calendarEvents', prev => [...prev, { ...event, id: uid('evt'), createdAt: new Date().toISOString() }]); pushToast('✓ Event berhasil ditambahkan.') }
  const updateEvent = (id: string, patch: Partial<CalendarEvent>) => { setSlice('calendarEvents', prev => prev.map(e => e.id === id ? { ...e, ...patch } : e)); pushToast('✓ Event berhasil diperbarui.') }
  const deleteEvent = (id: string) => { setSlice('calendarEvents', prev => prev.filter(e => e.id !== id)); pushToast('✓ Event berhasil dihapus.') }

  const addResource: AppContextValue['addResource'] = (item) => { setSlice('resources', prev => [{ ...item, id: uid('res'), dateAdded: localDateKey() }, ...prev]); pushToast('✓ Resource berhasil ditambahkan.') }
  const updateResource = (id: string, patch: Partial<ResourceItem>) => { setSlice('resources', prev => prev.map(r => r.id === id ? { ...r, ...patch } : r)); pushToast('✓ Resource berhasil diperbarui.') }
  const deleteResource = (id: string) => { setSlice('resources', prev => prev.filter(r => r.id !== id)); pushToast('✓ Resource berhasil dihapus.') }

  const saveWeeklyReview: AppContextValue['saveWeeklyReview'] = (review) => { setSlice('weeklyReviews', prev => [{ ...review, id: prev.find(r => r.weekStart === review.weekStart)?.id ?? uid('review'), updatedAt: new Date().toISOString() }, ...prev.filter(r => r.weekStart !== review.weekStart)]); pushToast('✓ Weekly review berhasil disimpan.') }
  const updateSettings = (patch: Partial<Settings>) => { if (patch.theme === 'dark' && data.subscription.plan !== 'PLUS') { setUpgradeModal(true); return } setSlice('settings', prev => ({ ...prev, ...patch })); pushToast('✓ Pengaturan disimpan.') }
  const markNotificationRead = (id: string) => setSlice('notifications', prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  const markAllNotificationsRead = () => setSlice('notifications', prev => prev.map(n => ({ ...n, read: true })))

  const subscribe = (months: 3 | 6 | 12, price: number) => {
    const start = new Date(); const expiry = addMonthsLocal(start, months)
    const sub: Subscription = { plan: 'PLUS', durationMonths: months, price, startDate: localDateKey(start), expiryDate: localDateKey(expiry) }
    setSlice('subscription', sub); setUpgradeModal(false); pushToast('🎉 Pembayaran berhasil! Akunmu sekarang JEJAK STUDI PLUS.')
  }

  const clearAllData = () => { if (!account) return; clearUserData(account.id); const next = emptyAppData(); setData(next); pushToast('Semua data aktivitas berhasil dihapus.') }
  const downloadExport = () => {
    if (!account) return
    const blob = new Blob([JSON.stringify(exportUserData(account.id, account), null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `jejak-studi-${localDateKey()}.json`; a.click(); URL.revokeObjectURL(url); pushToast('✓ Data berhasil diekspor.')
  }

  const value = useMemo<AppContextValue>(() => ({
    account, data, loading, toast, latestAchievement, upgradeModal,
    register, login, logout, completeOnboarding, updateProfile, changePassword,
    addTask, updateTask, deleteTask, addStudySession, completeStudySession, deleteStudySession, addFocusSession,
    addOrUpdateJournal, deleteJournal, setMoodToday, addGoal, updateGoal, deleteGoal,
    addEvent, updateEvent, deleteEvent, addResource, updateResource, deleteResource, saveWeeklyReview,
    updateSettings, markNotificationRead, markAllNotificationsRead, subscribe, clearAllData, downloadExport,
    requestUpgrade: () => setUpgradeModal(true), closeUpgrade: () => setUpgradeModal(false), clearLatestAchievement: () => setLatestAchievement(null), pushToast,
  }), [account, data, loading, toast, latestAchievement, upgradeModal])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useApp() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
