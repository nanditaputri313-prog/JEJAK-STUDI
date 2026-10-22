import { useApp } from '../context/AppContext'
export function Toast() { const { toast } = useApp(); if (!toast) return null; return <div className="fixed bottom-24 left-1/2 z-[100] -translate-x-1/2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-2xl md:bottom-6">{toast}</div> }
