import { CalendarDays, FileText, Search, Target, BookOpen, CheckSquare } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Modal, Input, EmptyState } from './UI'

export function GlobalSearch({ buttonClass = '' }: { buttonClass?: string }) {
  const { data } = useApp(); const navigate = useNavigate(); const [open, setOpen] = useState(false); const [q, setQ] = useState('')
  const results = useMemo(() => {
    const x = q.trim().toLowerCase(); if (!x) return []
    const rows: { id:string; title:string; subtitle:string; route:string; icon:typeof Search }[] = []
    data.tasks.filter(t => `${t.title} ${t.description}`.toLowerCase().includes(x)).forEach(t => rows.push({ id:`task-${t.id}`, title:t.title, subtitle:`Task · ${t.category}`, route:'/app/tasks', icon:CheckSquare }))
    data.journals.filter(j => j.text.toLowerCase().includes(x)).forEach(j => rows.push({ id:`journal-${j.id}`, title:j.text.slice(0,70), subtitle:`Journal · ${j.date}`, route:'/app/journal', icon:FileText }))
    data.goals.filter(g => g.title.toLowerCase().includes(x)).forEach(g => rows.push({ id:`goal-${g.id}`, title:g.title, subtitle:`Goal · ${g.category}`, route:'/app/goals', icon:Target }))
    data.resources.filter(r => `${r.title} ${r.description}`.toLowerCase().includes(x)).forEach(r => rows.push({ id:`res-${r.id}`, title:r.title, subtitle:`Resource · ${r.category}`, route:'/app/resources', icon:BookOpen }))
    data.calendarEvents.filter(e => `${e.title} ${e.notes}`.toLowerCase().includes(x)).forEach(e => rows.push({ id:`event-${e.id}`, title:e.title, subtitle:`Calendar · ${e.date}`, route:'/app/calendar', icon:CalendarDays }))
    return rows.slice(0, 30)
  }, [data, q])
  return <><button onClick={() => setOpen(true)} className={`grid h-11 w-11 place-items-center rounded-2xl border border-ui bg-surface ${buttonClass}`} aria-label="Cari semua data"><Search size={19}/></button><Modal open={open} onClose={() => setOpen(false)} title="Cari jejakmu" size="lg"><Input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Cari task, journal, goal, resource, atau event..." aria-label="Kata pencarian"/><div className="mt-4 space-y-2">{q && results.length === 0 ? <EmptyState title="Tidak ditemukan" description="Coba kata kunci lain."/> : results.map(r => { const Icon = r.icon; return <button key={r.id} onClick={() => { navigate(r.route); setOpen(false); setQ('') }} className="flex w-full items-center gap-3 rounded-2xl border border-ui p-3 text-left hover:bg-slate-50"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]"><Icon size={18}/></div><div><p className="text-sm font-semibold">{r.title}</p><p className="text-xs muted">{r.subtitle}</p></div></button> })}</div></Modal></>
}
