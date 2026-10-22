import { Bell, Pause, Play, RotateCcw, TimerReset } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import { Card, PageHeader, Button, Input } from '../components/UI'
import { localDateKey } from '../utils/date'

export default function FocusPage() {
  const { data, addFocusSession } = useApp()
  const [preset, setPreset] = useState(25)
  const [custom, setCustom] = useState(30)
  const [running, setRunning] = useState(false)
  const [remaining, setRemaining] = useState(25 * 60)
  const [endAt, setEndAt] = useState<number | null>(null)
  const [startDuration, setStartDuration] = useState(25)
  const [alarmDismissed, setAlarmDismissed] = useState(true)
  const interval = useRef<number | null>(null)
  const finishRef = useRef(false)
  const alarmAudio = useRef<HTMLAudioElement | null>(null)

  const stopAlarm = () => {
    const audio = alarmAudio.current
    if (audio) {
      audio.pause()
      audio.currentTime = 0
    }
    setAlarmDismissed(true)
  }

  const playAlarm = () => {
    const audio = alarmAudio.current
    if (!audio) return
    audio.currentTime = 0
    audio.loop = true
    void audio.play().catch(() => {
      // Browser may block audio if playback is not permitted.
    })
  }

  const durationMinutes = preset === 0 ? Math.min(180, Math.max(1, custom)) : preset

  useEffect(() => {
    if (!running || !endAt) return
    const tick = () => {
      const sec = Math.max(0, Math.ceil((endAt - Date.now()) / 1000))
      setRemaining(sec)
      if (sec <= 0 && !finishRef.current) {
        finishRef.current = true
        setRunning(false)
        setEndAt(null)
        setAlarmDismissed(false)
        playAlarm()
        addFocusSession(startDuration)
      }
    }
    tick()
    interval.current = window.setInterval(tick, 500)
    return () => {
      if (interval.current !== null) window.clearInterval(interval.current)
    }
  }, [running, endAt, addFocusSession, startDuration])

  useEffect(() => {
    if (!running) setRemaining(durationMinutes * 60)
  }, [durationMinutes, running])

  const start = () => {
    finishRef.current = false
    setAlarmDismissed(true)
    setStartDuration(durationMinutes)
    setEndAt(Date.now() + remaining * 1000)
    setRunning(true)
  }
  const pause = () => {
    if (endAt) setRemaining(Math.max(0, Math.ceil((endAt - Date.now()) / 1000)))
    setRunning(false)
    setEndAt(null)
  }
  const reset = () => {
    stopAlarm()
    setRunning(false)
    setEndAt(null)
    finishRef.current = false
    setAlarmDismissed(true)
    setRemaining(durationMinutes * 60)
  }

  const mm = Math.floor(remaining / 60)
  const ss = remaining % 60
  const today = data.focusSessions.filter(s => s.date === localDateKey()).reduce((a, s) => a + s.duration, 0)
  const recent = useMemo(
    () => [...data.focusSessions].sort((a, b) => b.completedAt.localeCompare(a.completedAt)).slice(0, 8),
    [data.focusSessions]
  )

  return <>
    <PageHeader title="Focus Mode" description="Satu sesi. Satu hal. Sisanya nanti." />
    <audio ref={alarmAudio} src="/dering.mp3" preload="auto" />
    <div className="grid gap-5 lg:grid-cols-[1fr_.7fr]">
      <Card className="p-6 text-center sm:p-10">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-[var(--primary-soft)] text-[var(--primary)]"><TimerReset size={30} /></div>
        <p className="mt-5 text-sm font-semibold muted">FOCUS TIMER</p>
        <div className="mt-2 font-mono text-6xl font-extrabold tracking-tight sm:text-7xl" aria-live="polite">{String(mm).padStart(2, '0')}:{String(ss).padStart(2, '0')}</div>
        {!alarmDismissed && <div role="status" className="mx-auto mt-5 flex max-w-md items-center justify-center gap-2 rounded-2xl bg-[var(--primary-soft)] p-4 text-sm font-semibold text-[var(--primary)]"><Bell size={19} /> Sesi fokus selesai. Bagus, kamu sudah meluangkan waktu untuk belajar! <button className="ml-1 rounded-lg bg-[var(--primary)] px-3 py-1.5 text-white underline" onClick={stopAlarm}>Selesai / Hentikan Alarm</button></div>}
        <div className="mt-7 flex flex-wrap justify-center gap-2">
          {[25, 45, 60].map(x => <button key={x} disabled={running} onClick={() => setPreset(x)} className={`rounded-xl px-4 py-2 text-sm font-semibold ${preset === x ? 'bg-[var(--primary)] text-white' : 'bg-slate-100 text-slate-600'}`}>{x} min</button>)}
          <button disabled={running} onClick={() => setPreset(0)} className={`rounded-xl px-4 py-2 text-sm font-semibold ${preset === 0 ? 'bg-[var(--primary)] text-white' : 'bg-slate-100 text-slate-600'}`}>Custom</button>
        </div>
        {preset === 0 && <div className="mx-auto mt-4 max-w-[180px]"><Input type="number" min={1} max={180} value={custom} disabled={running} onChange={e => setCustom(Math.min(180, Math.max(1, Number(e.target.value) || 1)))} aria-label="Custom minutes" /></div>}
        <div className="mt-7 flex justify-center gap-3">
          {running ? <Button onClick={pause}><Pause size={18} />PAUSE</Button> : <Button onClick={start}><Play size={18} />START</Button>}
          <Button variant="secondary" onClick={reset}><RotateCcw size={18} />RESET</Button>
        </div>
        <p className="mt-5 text-xs muted">Saat timer selesai, nada alarm akan berulang sampai kamu menekan Selesai / Hentikan Alarm. Sesi fokus disimpan otomatis. Pastikan volume perangkat aktif.</p>
      </Card>
      <div className="space-y-5">
        <Card className="p-5"><p className="text-sm muted">Today's Focus Time</p><p className="mt-2 text-4xl font-extrabold">{Math.floor(today / 60)}h {today % 60}m</p></Card>
        <Card className="p-5">
          <h2 className="font-bold">Riwayat focus</h2>
          <div className="mt-4 space-y-2">{recent.length === 0 ? <p className="text-sm muted">Belum ada focus session selesai.</p> : recent.map(s => <div key={s.id} className="flex justify-between rounded-2xl bg-slate-50 p-3 text-sm"><span>{new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(s.completedAt))}</span><b>{s.duration} min</b></div>)}</div>
        </Card>
      </div>
    </div>
  </>
}
