export type Category = 'Study' | 'Assignment' | 'Research' | 'Competition' | 'Organization' | 'Career' | 'Personal'
export type Priority = 'High' | 'Medium' | 'Low'
export type TaskStatus = 'To Do' | 'In Progress' | 'Completed'
export type MoodValue = 'senang' | 'baik' | 'biasa' | 'kurang' | 'berat'
export type Plan = 'FREE' | 'PLUS'

export interface Account {
  id: string
  name: string
  email: string
  passwordHash: string
  createdAt: string
  onboardingCompleted: boolean
  focusAreas: string[]
  semesterGoal: string
  studyHabitDays: number
}

export interface UserProfile {
  id: string
  name: string
  email: string
  avatar?: string
}

export interface Task {
  id: string
  title: string
  description: string
  category: Category
  deadline: string
  priority: Priority
  status: TaskStatus
  createdAt: string
  completedAt?: string
}

export interface StudySession {
  id: string
  activity: string
  category: Category
  duration: number
  date: string
  status: 'planned' | 'completed'
  completedAt?: string
}

export interface FocusSession {
  id: string
  duration: number
  completedAt: string
  date: string
}

export interface JournalEntry {
  id: string
  date: string
  mood: MoodValue
  text: string
  createdAt: string
  updatedAt: string
}

export interface MoodEntry {
  id: string
  date: string
  mood: MoodValue
  createdAt: string
}

export interface Goal {
  id: string
  title: string
  category: Category
  target: number
  current: number
  deadline: string
  status: 'Active' | 'Completed'
  createdAt: string
  completedAt?: string
}

export interface CalendarEvent {
  id: string
  title: string
  date: string
  time: string
  category: Category
  notes: string
  createdAt: string
}

export interface ResourceItem {
  id: string
  title: string
  url: string
  category: 'Research' | 'Assignment' | 'Thesis' | 'Competition' | 'Learning' | 'Career'
  description: string
  dateAdded: string
}

export interface Achievement {
  id: string
  key: string
  title: string
  description: string
  unlockedAt: string
}

export interface NotificationItem {
  id: string
  title: string
  message: string
  type: 'deadline' | 'streak' | 'goal' | 'achievement' | 'general'
  createdAt: string
  read: boolean
}

export interface Subscription {
  plan: Plan
  durationMonths?: 3 | 6 | 12
  price?: number
  startDate?: string
  expiryDate?: string
}

export interface WeeklyReview {
  id: string
  weekStart: string
  success: string
  improvement: string
  updatedAt: string
}

export interface Settings {
  theme: 'bright' | 'ocean' | 'sunset' | 'dark'
  deadlineReminder: boolean
  studyReminder: boolean
}

export interface StreakState {
  current: number
  longest: number
  lastActivityDate?: string
}

export interface AppData {
  tasks: Task[]
  studySessions: StudySession[]
  focusSessions: FocusSession[]
  journals: JournalEntry[]
  moods: MoodEntry[]
  goals: Goal[]
  calendarEvents: CalendarEvent[]
  resources: ResourceItem[]
  achievements: Achievement[]
  notifications: NotificationItem[]
  subscription: Subscription
  weeklyReviews: WeeklyReview[]
  settings: Settings
  streak: StreakState
}
