import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Award, BookOpen, CalendarDays, CheckSquare, CircleUserRound, Clock3, Crown, FileText, Gauge, LayoutDashboard, Menu, Settings, Target, TimerReset, TrendingUp, X, LogOut, ClipboardCheck, Archive, Instagram, Mail } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { NotificationBell } from '../components/NotificationBell'
import { GlobalSearch } from '../components/GlobalSearch'
import { QuickCapture } from '../components/QuickCapture'
import { Toast } from '../components/Toast'
import { UpgradeModal } from '../components/UpgradeModal'
import { AchievementModal } from '../components/AchievementModal'
import logo from '../assets/jejak-studi-logo.png'

const nav = [
  ['/app/dashboard','Dashboard',LayoutDashboard], ['/app/study','Study Track',Clock3], ['/app/tasks','Tasks',CheckSquare], ['/app/calendar','Calendar',CalendarDays], ['/app/journal','Journal',FileText], ['/app/goals','Goals',Target], ['/app/focus','Focus Mode',TimerReset], ['/app/review','Weekly Review',ClipboardCheck], ['/app/progress','Progress',TrendingUp], ['/app/achievements','Achievements',Award], ['/app/resources','Resource Vault',BookOpen], ['/app/wrapped','Semester Wrapped',Gauge], ['/app/archive','Archive',Archive],
] as const
const bottom = [['/app/settings','Settings',Settings], ['/app/pricing','Upgrade to PLUS',Crown], ['/app/profile','Profile',CircleUserRound]] as const
const mobile = [['/app/dashboard','Home',LayoutDashboard], ['/app/tasks','Tasks',CheckSquare], ['/app/focus','Focus',TimerReset], ['/app/calendar','Calendar',CalendarDays], ['/app/journal','Journal',FileText]] as const

export default function AppLayout() {
  const { account, data, logout } = useApp(); const navigate = useNavigate(); const [drawer, setDrawer] = useState(false)
  const linkClass = ({ isActive }: { isActive:boolean }) => `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-[var(--primary-soft)] text-[var(--primary)]' : 'muted hover:bg-black/5 hover:text-main'}`
  const SidebarContent = () => <><div className="px-3 pb-5"><button onClick={() => navigate('/app/dashboard')} className="text-left"><img src={logo} alt="JEJAK STUDI" className="h-auto w-36 object-contain"/><p className="mt-1 text-[10px] font-medium muted">Setiap langkah punya jejak.</p></button></div><nav className="space-y-1">{nav.map(([to,label,Icon]) => <NavLink key={to} to={to} className={linkClass} onClick={() => setDrawer(false)}><Icon size={18}/>{label}</NavLink>)}</nav><div className="my-4 border-t border-ui"/><nav className="space-y-1">{bottom.map(([to,label,Icon]) => <NavLink key={to} to={to} className={linkClass} onClick={() => setDrawer(false)}><Icon size={18}/>{label}{label === 'Upgrade to PLUS' && data.subscription.plan === 'PLUS' && <span className="ml-auto rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-bold text-yellow-700">ACTIVE</span>}</NavLink>)}<button onClick={() => { logout(); navigate('/') }} className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50"><LogOut size={18}/>Logout</button></nav><div className="mt-5 rounded-2xl bg-slate-50 p-3"><p className="text-[10px] font-bold uppercase tracking-wider muted">Hubungi JEJAK STUDI</p><div className="mt-2 space-y-1.5 text-xs"><a href="https://instagram.com/jejakstudi.id" target="_blank" rel="noreferrer" className="flex items-center gap-2 font-medium text-slate-600 hover:text-[var(--primary)]"><Instagram size={14}/>@jejakstudi.id</a><a href="mailto:jejakstudi.id@gmail.com" className="flex items-center gap-2 font-medium text-slate-600 hover:text-[var(--primary)]"><Mail size={14}/>jejakstudi.id@gmail.com</a></div></div></>
  return <div className="min-h-screen bg-app">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 overflow-y-auto border-r border-ui bg-surface p-4 lg:block"><SidebarContent/></aside>
    {drawer && <div className="fixed inset-0 z-50 lg:hidden"><button className="absolute inset-0 bg-slate-950/40" onClick={() => setDrawer(false)} aria-label="Tutup menu"/><aside className="absolute inset-y-0 left-0 w-[290px] overflow-y-auto bg-surface p-4 shadow-2xl"><div className="mb-2 flex justify-end"><button className="rounded-xl p-2" onClick={() => setDrawer(false)}><X/></button></div><SidebarContent/></aside></div>}
    <div className="lg:pl-64">
      <header className="sticky top-0 z-20 border-b border-ui bg-[color:var(--bg)]/90 px-4 py-3 backdrop-blur md:px-6"><div className="mx-auto flex max-w-7xl items-center justify-between gap-3"><div className="flex items-center gap-3"><button className="grid h-11 w-11 place-items-center rounded-2xl border border-ui bg-surface lg:hidden" onClick={() => setDrawer(true)} aria-label="Buka menu"><Menu size={19}/></button><div className="hidden sm:block"><p className="text-xs muted">Halo,</p><p className="max-w-[260px] truncate text-sm font-bold">{account?.name}</p></div></div><div className="flex items-center gap-2"><GlobalSearch/><NotificationBell/><button onClick={() => navigate('/app/profile')} className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--primary-soft)] text-sm font-bold text-[var(--primary)]" aria-label="Buka profil">{account?.name?.slice(0,1).toUpperCase()}</button></div></div></header>
      <main className="mx-auto max-w-7xl px-4 pb-28 pt-6 md:px-6 lg:pb-10"><Outlet/></main>
    </div>
    <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-ui bg-surface px-2 py-2 lg:hidden">{mobile.map(([to,label,Icon]) => <NavLink key={to} to={to} className={({isActive}) => `flex flex-col items-center gap-1 rounded-xl py-1 text-[10px] font-medium ${isActive ? 'text-[var(--primary)]' : 'muted'}`}><Icon size={19}/><span>{label}</span></NavLink>)}</nav>
    <QuickCapture/><Toast/><UpgradeModal/><AchievementModal/>
  </div>
}
