import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Button, Input } from '../components/UI'
import logo from '../assets/jejak-studi-logo.png'
export default function LoginPage() {
  const { login } = useApp(); const navigate = useNavigate(); const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [error,setError]=useState(''); const [busy,setBusy]=useState(false)
  const submit=async(e:FormEvent)=>{e.preventDefault();setError('');if(!email||!password){setError('Email dan password wajib diisi.');return}setBusy(true);const r=await login(email,password);setBusy(false);if(!r.ok)setError(r.error||'Gagal masuk.');else navigate('/app/dashboard')}
  return <div className="grid min-h-screen place-items-center bg-app px-4"><div className="w-full max-w-md rounded-[32px] border border-ui bg-surface p-7 shadow-soft"><Link to="/" className="inline-flex"><img src={logo} alt="JEJAK STUDI" className="h-auto w-36 object-contain"/></Link><h1 className="mt-8 text-3xl font-extrabold">Lanjutkan jejakmu.</h1><p className="mt-2 muted">Masuk dan lihat apa yang perlu kamu lanjutkan hari ini.</p><form onSubmit={submit} className="mt-7 space-y-4"><Input label="Email" type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="nama@email.com"/><Input label="Password" type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Minimal 6 karakter"/>{error&&<p className="text-sm text-red-600">{error}</p>}<Button type="submit" className="w-full" disabled={busy}>{busy?'Memeriksa...':'Masuk'}</Button></form><p className="mt-6 text-center text-sm muted">Belum punya akun? <Link to="/register" className="font-semibold text-[var(--primary)]">Mulai gratis</Link></p></div></div>
}
