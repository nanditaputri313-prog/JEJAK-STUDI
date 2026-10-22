import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import {
  Archive,
  CalendarDays,
  Download,
  Edit3,
  Eye,
  FileImage,
  FileText,
  Filter,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react'

type ArchiveType = 'Sertifikat' | 'Prestasi' | 'Organisasi' | 'Seminar' | 'Lomba' | 'Lainnya'

type ArchiveRecord = {
  id: string
  title: string
  type: ArchiveType
  date: string
  organizer: string
  tags: string
  description: string
  fileName: string
  mimeType: string
  fileSize: number
  createdAt: string
  updatedAt: string
}

type ArchiveWithFile = ArchiveRecord & { file?: Blob }

const DB_NAME = 'jejak-studi-archive'
const DB_VERSION = 1
const STORE_NAME = 'archives'

const archiveTypes: ArchiveType[] = ['Sertifikat', 'Prestasi', 'Organisasi', 'Seminar', 'Lomba', 'Lainnya']

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('date', 'date', { unique: false })
        store.createIndex('type', 'type', { unique: false })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function getArchives(): Promise<ArchiveWithFile[]> {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const request = transaction.objectStore(STORE_NAME).getAll()
    request.onsuccess = () => resolve((request.result || []) as ArchiveWithFile[])
    request.onerror = () => reject(request.error)
  })
}

async function putArchive(record: ArchiveWithFile): Promise<void> {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    transaction.objectStore(STORE_NAME).put(record)
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}

async function deleteArchive(id: string): Promise<void> {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    transaction.objectStore(STORE_NAME).delete(id)
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}

function formatDate(value: string) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

function formatSize(bytes: number) {
  if (!bytes) return '0 KB'
  const mb = bytes / 1024 / 1024
  if (mb >= 1) return `${mb.toFixed(1)} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

function makeId() {
  return `archive-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function isImage(mimeType: string) {
  return mimeType.startsWith('image/')
}

function isPdf(mimeType: string, fileName: string) {
  return mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')
}

const emptyForm = {
  title: '',
  type: 'Sertifikat' as ArchiveType,
  date: new Date().toISOString().slice(0, 10),
  organizer: '',
  tags: '',
  description: '',
}

export default function ArchivePage() {
  const [archives, setArchives] = useState<ArchiveWithFile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'Semua' | ArchiveType>('Semua')
  const [sort, setSort] = useState<'newest' | 'oldest' | 'name'>('newest')
  const [modalOpen, setModalOpen] = useState(false)
  const [viewing, setViewing] = useState<ArchiveWithFile | null>(null)
  const [editing, setEditing] = useState<ArchiveWithFile | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    getArchives()
      .then((items) => setArchives(items))
      .catch(() => setMessage('Arsip belum dapat dimuat. Silakan coba lagi.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!message) return
    const timer = window.setTimeout(() => setMessage(''), 3500)
    return () => window.clearTimeout(timer)
  }, [message])

  const filteredArchives = useMemo(() => {
    const query = search.trim().toLowerCase()
    const result = archives.filter((item) => {
      const searchable = `${item.title} ${item.organizer} ${item.tags} ${item.description} ${item.fileName}`.toLowerCase()
      const matchesSearch = !query || searchable.includes(query)
      const matchesType = typeFilter === 'Semua' || item.type === typeFilter
      return matchesSearch && matchesType
    })

    return result.sort((a, b) => {
      if (sort === 'name') return a.title.localeCompare(b.title, 'id')
      const comparison = new Date(`${a.date}T00:00:00`).getTime() - new Date(`${b.date}T00:00:00`).getTime()
      return sort === 'newest' ? -comparison : comparison
    })
  }, [archives, search, typeFilter, sort])

  const stats = useMemo(() => ({
    total: archives.length,
    certificates: archives.filter((item) => item.type === 'Sertifikat').length,
    achievements: archives.filter((item) => item.type === 'Prestasi' || item.type === 'Lomba').length,
    organizations: archives.filter((item) => item.type === 'Organisasi').length,
  }), [archives])

  function openCreate() {
    setEditing(null)
    setForm({ ...emptyForm, date: new Date().toISOString().slice(0, 10) })
    setSelectedFile(null)
    setModalOpen(true)
  }

  function openEdit(item: ArchiveWithFile) {
    setEditing(item)
    setForm({
      title: item.title,
      type: item.type,
      date: item.date,
      organizer: item.organizer,
      tags: item.tags,
      description: item.description,
    })
    setSelectedFile(null)
    setModalOpen(true)
  }

  function closeModal() {
    if (saving) return
    setModalOpen(false)
    setEditing(null)
    setSelectedFile(null)
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) {
      setMessage('Format file harus PDF, JPG, PNG, atau WEBP.')
      event.target.value = ''
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage('Ukuran file maksimal 10 MB.')
      event.target.value = ''
      return
    }

    setSelectedFile(file)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!form.title.trim()) {
      setMessage('Nama arsip wajib diisi.')
      return
    }

    if (!editing && !selectedFile) {
      setMessage('Silakan pilih file sertifikat atau dokumen terlebih dahulu.')
      return
    }

    setSaving(true)
    try {
      const now = new Date().toISOString()
      const record: ArchiveWithFile = {
        id: editing?.id || makeId(),
        title: form.title.trim(),
        type: form.type,
        date: form.date,
        organizer: form.organizer.trim(),
        tags: form.tags.trim(),
        description: form.description.trim(),
        fileName: selectedFile?.name || editing?.fileName || 'Dokumen',
        mimeType: selectedFile?.type || editing?.mimeType || 'application/octet-stream',
        fileSize: selectedFile?.size || editing?.fileSize || 0,
        createdAt: editing?.createdAt || now,
        updatedAt: now,
        file: selectedFile || editing?.file,
      }

      await putArchive(record)
      const updated = await getArchives()
      setArchives(updated)
      setMessage(editing ? 'Arsip berhasil diperbarui.' : 'Arsip berhasil disimpan.')
      closeModal()
    } catch {
      setMessage('Arsip gagal disimpan. Coba lagi.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item: ArchiveWithFile) {
    const confirmed = window.confirm(`Hapus arsip "${item.title}"? File yang tersimpan di browser juga akan dihapus.`)
    if (!confirmed) return

    try {
      await deleteArchive(item.id)
      setArchives((current) => current.filter((archive) => archive.id !== item.id))
      if (viewing?.id === item.id) setViewing(null)
      setMessage('Arsip berhasil dihapus.')
    } catch {
      setMessage('Arsip gagal dihapus.')
    }
  }

  function downloadArchive(item: ArchiveWithFile) {
    if (!item.file) {
      setMessage('File tidak tersedia di browser ini.')
      return
    }
    const url = URL.createObjectURL(item.file)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = item.fileName
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  function previewUrl(item: ArchiveWithFile) {
    return item.file ? URL.createObjectURL(item.file) : ''
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-ui bg-surface p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]">
              <Archive size={27} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--primary)]">Academic Archive</p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight md:text-3xl">Arsip Perjalananmu</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 muted">
                Simpan sertifikat, prestasi, kegiatan organisasi, dan dokumen penting agar setiap langkah akademikmu punya jejak yang rapi.
              </p>
            </div>
          </div>
          <button onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:opacity-90">
            <Plus size={18} /> Tambah Arsip
          </button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Total Arsip', stats.total, Archive],
          ['Sertifikat', stats.certificates, FileText],
          ['Prestasi & Lomba', stats.achievements, Eye],
          ['Organisasi', stats.organizations, CalendarDays],
        ].map(([label, value, Icon]) => {
          const ItemIcon = Icon as typeof Archive
          return (
            <div key={String(label)} className="rounded-3xl border border-ui bg-surface p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]"><ItemIcon size={20} /></div>
                <span className="text-2xl font-extrabold">{value as number}</span>
              </div>
              <p className="mt-4 text-sm font-semibold muted">{String(label)}</p>
            </div>
          )
        })}
      </section>

      <section className="rounded-3xl border border-ui bg-surface p-4 shadow-sm md:p-5">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 muted" size={18} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari sertifikat, penyelenggara, tag..." className="w-full rounded-2xl border border-ui bg-[var(--bg)] py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[var(--primary)]" />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 muted" size={16} />
              <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as 'Semua' | ArchiveType)} className="w-full appearance-none rounded-2xl border border-ui bg-[var(--bg)] py-3 pl-9 pr-9 text-sm outline-none sm:w-48">
                <option value="Semua">Semua kategori</option>
                {archiveTypes.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} className="rounded-2xl border border-ui bg-[var(--bg)] px-4 py-3 text-sm outline-none sm:w-44">
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="name">Nama A-Z</option>
            </select>
          </div>
        </div>
      </section>

      {message && <div className="rounded-2xl border border-[var(--primary)]/20 bg-[var(--primary-soft)] px-4 py-3 text-sm font-semibold text-[var(--primary)]">{message}</div>}

      {loading ? (
        <div className="rounded-3xl border border-ui bg-surface p-12 text-center muted">Memuat arsip...</div>
      ) : filteredArchives.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-ui bg-surface p-12 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-[var(--primary-soft)] text-[var(--primary)]"><Archive size={28} /></div>
          <h2 className="mt-5 text-lg font-extrabold">Belum ada arsip</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 muted">Mulai simpan sertifikat atau dokumen akademikmu. Tidak perlu takut hilang di folder Downloads lagi.</p>
          <button onClick={openCreate} className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[var(--primary)] px-5 py-3 text-sm font-bold text-white"><Upload size={17} /> Upload Arsip</button>
        </div>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredArchives.map((item) => (
            <article key={item.id} className="overflow-hidden rounded-3xl border border-ui bg-surface shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center justify-between border-b border-ui px-5 py-4">
                <span className="rounded-full bg-[var(--primary-soft)] px-3 py-1 text-[11px] font-bold text-[var(--primary)]">{item.type}</span>
                <span className="text-xs muted">{formatSize(item.fileSize)}</span>
              </div>
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-black/5 text-[var(--primary)]">
                    {isImage(item.mimeType) ? <FileImage size={20} /> : <FileText size={20} />}
                  </div>
                  <div className="min-w-0">
                    <h2 className="line-clamp-2 text-base font-extrabold">{item.title}</h2>
                    <p className="mt-1 truncate text-xs muted">{item.fileName}</p>
                  </div>
                </div>

                <div className="mt-5 space-y-2 text-sm">
                  <div className="flex gap-2"><CalendarDays size={16} className="mt-0.5 shrink-0 muted" /><span>{formatDate(item.date)}</span></div>
                  <div className="flex gap-2"><Archive size={16} className="mt-0.5 shrink-0 muted" /><span className="truncate">{item.organizer || 'Penyelenggara belum diisi'}</span></div>
                </div>

                {item.tags && <div className="mt-4 flex flex-wrap gap-1.5">{item.tags.split(',').map((tag) => <span key={tag.trim()} className="rounded-full bg-black/5 px-2.5 py-1 text-[10px] font-semibold muted">#{tag.trim()}</span>)}</div>}

                <div className="mt-5 grid grid-cols-3 gap-2">
                  <button onClick={() => setViewing(item)} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-ui px-2 py-2.5 text-xs font-bold transition hover:bg-black/5"><Eye size={15} /> Lihat</button>
                  <button onClick={() => openEdit(item)} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-ui px-2 py-2.5 text-xs font-bold transition hover:bg-black/5"><Edit3 size={15} /> Edit</button>
                  <button onClick={() => handleDelete(item)} className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-red-50 px-2 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-100"><Trash2 size={15} /> Hapus</button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-surface shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-ui bg-surface px-5 py-4">
              <div>
                <h2 className="text-lg font-extrabold">{editing ? 'Edit Arsip' : 'Tambah Arsip Akademik'}</h2>
                <p className="mt-1 text-xs muted">Simpan sertifikat atau dokumen yang ingin kamu jaga.</p>
              </div>
              <button onClick={closeModal} className="grid h-10 w-10 place-items-center rounded-xl hover:bg-black/5" aria-label="Tutup"><X size={19} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="md:col-span-2"><span className="mb-2 block text-sm font-bold">Nama arsip <b className="text-red-500">*</b></span><input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Contoh: Sertifikat Seminar Nasional Kearsipan" className="w-full rounded-2xl border border-ui bg-[var(--bg)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)]" /></label>
                <label><span className="mb-2 block text-sm font-bold">Jenis arsip</span><select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as ArchiveType })} className="w-full rounded-2xl border border-ui bg-[var(--bg)] px-4 py-3 text-sm outline-none">{archiveTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
                <label><span className="mb-2 block text-sm font-bold">Tanggal</span><input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className="w-full rounded-2xl border border-ui bg-[var(--bg)] px-4 py-3 text-sm outline-none" /></label>
                <label className="md:col-span-2"><span className="mb-2 block text-sm font-bold">Penyelenggara</span><input value={form.organizer} onChange={(event) => setForm({ ...form, organizer: event.target.value })} placeholder="Contoh: Universitas Airlangga" className="w-full rounded-2xl border border-ui bg-[var(--bg)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)]" /></label>
                <label className="md:col-span-2"><span className="mb-2 block text-sm font-bold">Tag</span><input value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} placeholder="kearsipan, seminar, 2026" className="w-full rounded-2xl border border-ui bg-[var(--bg)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)]" /><span className="mt-1 block text-xs muted">Pisahkan tag dengan koma.</span></label>
                <label className="md:col-span-2"><span className="mb-2 block text-sm font-bold">Deskripsi</span><textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={3} placeholder="Tambahkan keterangan singkat jika diperlukan..." className="w-full resize-none rounded-2xl border border-ui bg-[var(--bg)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)]" /></label>
              </div>

              <div>
                <span className="mb-2 block text-sm font-bold">File {editing ? '' : <b className="text-red-500">*</b>}</span>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="flex w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-ui bg-[var(--bg)] px-5 py-8 text-center transition hover:border-[var(--primary)] hover:bg-[var(--primary-soft)]">
                  <Upload size={25} className="text-[var(--primary)]" />
                  <span className="mt-3 text-sm font-bold">{selectedFile ? selectedFile.name : editing ? `File saat ini: ${editing.fileName}` : 'Klik untuk memilih sertifikat'}</span>
                  <span className="mt-1 text-xs muted">PDF, JPG, PNG, WEBP • maksimal 10 MB</span>
                </button>
                <input ref={fileInputRef} type="file" accept="application/pdf,image/jpeg,image/png,image/webp" onChange={handleFileChange} className="hidden" />
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={closeModal} disabled={saving} className="rounded-2xl border border-ui px-5 py-3 text-sm font-bold">Batal</button>
                <button type="submit" disabled={saving} className="rounded-2xl bg-[var(--primary)] px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{saving ? 'Menyimpan...' : editing ? 'Simpan Perubahan' : 'Simpan Arsip'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewing && (
        <PreviewModal item={viewing} onClose={() => setViewing(null)} onDownload={() => downloadArchive(viewing)} />
      )}
    </div>
  )
}

function PreviewModal({ item, onClose, onDownload }: { item: ArchiveWithFile; onClose: () => void; onDownload: () => void }) {
  const [url, setUrl] = useState('')

  useEffect(() => {
    if (!item.file) return
    const objectUrl = URL.createObjectURL(item.file)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [item.file])

  return (
    <div className="fixed inset-0 z-[90] flex flex-col bg-slate-950/80 p-3 backdrop-blur-sm md:p-6">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between rounded-2xl bg-surface px-4 py-3 shadow-xl">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-extrabold md:text-base">{item.title}</h2>
          <p className="truncate text-xs muted">{item.fileName}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button onClick={onDownload} className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-3 py-2 text-xs font-bold text-white"><Download size={15} /> Download</button>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-xl hover:bg-black/5"><X size={18} /></button>
        </div>
      </div>

      <div className="mx-auto mt-3 flex min-h-0 w-full max-w-6xl flex-1 items-center justify-center overflow-hidden rounded-2xl bg-black/20 p-2">
        {!item.file ? (
          <div className="rounded-2xl bg-surface p-8 text-center"><p className="font-bold">File tidak tersedia.</p><p className="mt-1 text-sm muted">Silakan upload ulang dokumen tersebut.</p></div>
        ) : isPdf(item.mimeType, item.fileName) ? (
          <iframe title={item.title} src={url} className="h-full w-full rounded-xl bg-white" />
        ) : isImage(item.mimeType) ? (
          <img src={url} alt={item.title} className="max-h-full max-w-full rounded-xl object-contain" />
        ) : (
          <div className="rounded-2xl bg-surface p-8 text-center"><p className="font-bold">Preview belum tersedia.</p><p className="mt-1 text-sm muted">Gunakan tombol Download untuk membuka file.</p></div>
        )}
      </div>
    </div>
  )
}
