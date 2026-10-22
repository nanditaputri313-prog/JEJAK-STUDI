import { Bell, CheckCheck } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { formatDateTime } from '../utils/date'
import { Button, EmptyState } from './UI'

export function NotificationBell() {
  const { data, markNotificationRead, markAllNotificationsRead } = useApp()
  const [open, setOpen] = useState(false)
  const unread = data.notifications.filter(n => !n.read).length
  return <div className="relative">
    <button onClick={() => setOpen(v => !v)} className="relative grid h-11 w-11 place-items-center rounded-2xl border border-ui bg-surface" aria-label="Notification center"><Bell size={19}/>{unread > 0 && <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-500 px-1 text-center text-[10px] font-bold leading-5 text-white">{Math.min(unread, 9)}{unread > 9 ? '+' : ''}</span>}</button>
    {open && <><button className="fixed inset-0 z-30 cursor-default" onClick={() => setOpen(false)} aria-label="Tutup notifikasi"/><div className="absolute right-0 z-40 mt-2 w-[min(92vw,390px)] overflow-hidden rounded-3xl border border-ui bg-surface shadow-2xl">
      <div className="flex items-center justify-between border-b border-ui p-4"><div><p className="font-bold">Notifikasi</p><p className="text-xs muted">{unread} belum dibaca</p></div><Button variant="ghost" className="min-h-9 px-3 text-xs" onClick={markAllNotificationsRead}><CheckCheck size={15}/> Tandai dibaca</Button></div>
      <div className="max-h-[430px] overflow-y-auto p-2">{data.notifications.length === 0 ? <EmptyState title="Belum ada notifikasi" description="Pengingat deadline, streak, dan goal akan muncul di sini."/> : data.notifications.map(n => <button key={n.id} onClick={() => markNotificationRead(n.id)} className={`mb-1 w-full rounded-2xl p-3 text-left transition hover:bg-slate-50 ${n.read ? '' : 'bg-[var(--primary-soft)]'}`}><div className="flex items-start gap-3"><span className={`mt-1 h-2 w-2 rounded-full ${n.read ? 'bg-slate-300' : 'bg-[var(--primary)]'}`}/><div><p className="text-sm font-semibold">{n.title}</p><p className="mt-1 text-xs muted">{n.message}</p><p className="mt-2 text-[10px] muted">{formatDateTime(n.createdAt)}</p></div></div></button>)}</div>
    </div></>}
  </div>
}
