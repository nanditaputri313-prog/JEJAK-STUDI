import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { X } from 'lucide-react'

export function Button({ children, className = '', variant = 'primary', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost' }) {
  const styles = {
    primary: 'bg-[var(--primary)] text-white hover:opacity-90',
    secondary: 'bg-[var(--primary-soft)] text-[var(--primary)] hover:opacity-90',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100',
    ghost: 'bg-transparent text-main hover:bg-black/5',
  }
  return <button {...props} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}>{children}</button>
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`card ${className}`}>{children}</section>
}

export function Input({ label, error, className = '', ...props }: InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }) {
  return <label className="block text-sm font-medium text-main">{label && <span className="mb-2 block">{label}</span>}<input {...props} className={`w-full rounded-2xl border border-ui bg-surface px-4 py-3 text-main placeholder:text-slate-400 ${className}`} />{error && <span className="mt-1.5 block text-xs text-red-600">{error}</span>}</label>
}

export function Textarea({ label, error, className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }) {
  return <label className="block text-sm font-medium text-main">{label && <span className="mb-2 block">{label}</span>}<textarea {...props} className={`min-h-28 w-full resize-y rounded-2xl border border-ui bg-surface px-4 py-3 text-main placeholder:text-slate-400 ${className}`} />{error && <span className="mt-1.5 block text-xs text-red-600">{error}</span>}</label>
}

export function Select({ label, children, className = '', ...props }: SelectHTMLAttributes<HTMLSelectElement> & { label?: string; children: ReactNode }) {
  return <label className="block text-sm font-medium text-main">{label && <span className="mb-2 block">{label}</span>}<select {...props} className={`w-full rounded-2xl border border-ui bg-surface px-4 py-3 text-main ${className}`}>{children}</select></label>
}

export function Modal({ open, onClose, title, children, size = 'md' }: { open: boolean; onClose: () => void; title: string; children: ReactNode; size?: 'sm'|'md'|'lg'|'xl' }) {
  if (!open) return null
  const widths = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-5xl' }
  return <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/45 p-3 sm:items-center" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
    <div className={`animate-pop max-h-[90vh] w-full overflow-y-auto rounded-[28px] bg-surface p-5 shadow-2xl sm:p-6 ${widths[size]}`}>
      <div className="mb-5 flex items-center justify-between gap-4"><h2 className="text-xl font-bold text-main">{title}</h2><button onClick={onClose} className="rounded-xl p-2 hover:bg-black/5" aria-label="Tutup modal"><X size={20}/></button></div>
      {children}
    </div>
  </div>
}

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const safe = Math.max(0, Math.min(100, value || 0))
  return <div>{label && <div className="mb-2 flex justify-between text-xs font-medium"><span>{label}</span><span>{Math.round(safe)}%</span></div>}<div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[var(--primary)] transition-all" style={{ width: `${safe}%` }} /></div></div>
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="rounded-[24px] border border-dashed border-ui px-6 py-10 text-center"><h3 className="font-bold text-main">{title}</h3><p className="mx-auto mt-2 max-w-md text-sm muted">{description}</p>{action && <div className="mt-5">{action}</div>}</div>
}

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>{description && <p className="mt-1 muted">{description}</p>}</div>{action}</div>
}

export function Badge({ children, tone = 'blue' }: { children: ReactNode; tone?: 'blue'|'yellow'|'green'|'orange'|'red'|'purple'|'gray' }) {
  const toneClass = { blue:'bg-blue-50 text-blue-700', yellow:'bg-yellow-50 text-yellow-700', green:'bg-emerald-50 text-emerald-700', orange:'bg-orange-50 text-orange-700', red:'bg-red-50 text-red-700', purple:'bg-purple-50 text-purple-700', gray:'bg-slate-100 text-slate-600' }[tone]
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${toneClass}`}>{children}</span>
}
