import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { localDateKey } from '../utils/date'
import { Button, Input, Modal, Select, Textarea } from './UI'

export function QuickCapture() {
  const { addTask, addOrUpdateJournal, addResource } = useApp(); const navigate = useNavigate()
  const [open, setOpen] = useState(false); const [type, setType] = useState<'Task'|'Note'|'Resource'>('Task'); const [text, setText] = useState(''); const [url, setUrl] = useState(''); const [error, setError] = useState('')
  const save = () => {
    if (!text.trim()) { setError('Isi quick capture wajib diisi.'); return }
    if (type === 'Resource') {
      try { new URL(url) } catch { setError('Masukkan URL yang valid.'); return }
      addResource({ title:text.trim(), url, category:'Learning', description:'' }); navigate('/app/resources')
    } else if (type === 'Note') {
      addOrUpdateJournal({ date: localDateKey(), mood:'biasa', text:`Catatan cepat: ${text.trim()}` }); navigate('/app/journal')
    } else {
      addTask({ title:text.trim(), description:'Ditambahkan melalui Quick Capture', category:'Study', priority:'Medium', deadline:localDateKey(), status:'To Do' }); navigate('/app/tasks')
    }
    setOpen(false); setText(''); setUrl(''); setError('')
  }
  return <><button onClick={() => setOpen(true)} className="fixed bottom-20 right-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-[var(--primary)] text-white shadow-xl transition hover:scale-105 md:bottom-6 md:right-6" aria-label="Quick Capture"><Plus size={26}/></button><Modal open={open} onClose={() => setOpen(false)} title="Quick Capture" size="sm"><div className="space-y-4"><Select label="Simpan sebagai" value={type} onChange={e => setType(e.target.value as any)}><option>Task</option><option>Note</option><option>Resource</option></Select><Textarea label={type === 'Resource' ? 'Judul resource' : 'Apa yang ingin kamu catat?'} value={text} onChange={e => { setText(e.target.value); setError('') }} placeholder="Cari 3 jurnal untuk tugas penelitian." error={error}/>{type === 'Resource' && <Input label="URL" type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..."/>}<Button className="w-full" onClick={save}>Simpan</Button><p className="text-xs muted">Task dari Quick Capture memakai deadline hari ini dan bisa kamu edit di halaman Tasks. Note disimpan ke Journal.</p></div></Modal></>
}
