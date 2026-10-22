import type { MoodValue } from '../types'
import { moodEmoji, moodLabel } from '../utils/stats'

const moods: MoodValue[] = ['senang','baik','biasa','kurang','berat']
export function MoodSelector({ value, onChange, compact = false }: { value?: MoodValue; onChange: (value: MoodValue) => void; compact?: boolean }) {
  return <div className="flex flex-wrap gap-2" role="group" aria-label="Pilih mood">{moods.map(m => <button key={m} type="button" onClick={() => onChange(m)} aria-pressed={value === m} className={`rounded-2xl border px-3 py-2 transition ${value === m ? 'border-[var(--primary)] bg-[var(--primary-soft)]' : 'border-ui bg-surface hover:bg-slate-50'}`}><span className="text-xl" aria-hidden="true">{moodEmoji[m]}</span>{!compact && <span className="ml-2 text-xs font-medium">{moodLabel[m]}</span>}</button>)}</div>
}
