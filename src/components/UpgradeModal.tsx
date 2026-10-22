import { Crown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Button, Modal } from './UI'
export function UpgradeModal() {
  const { upgradeModal, closeUpgrade } = useApp(); const navigate = useNavigate()
  return <Modal open={upgradeModal} onClose={closeUpgrade} title="Buka lebih banyak ruang dengan PLUS" size="sm"><div className="rounded-3xl bg-gradient-to-br from-yellow-50 to-orange-50 p-5"><Crown className="text-amber-500"/><p className="mt-3 font-bold">JEJAK STUDI PLUS ⭐</p><p className="mt-2 text-sm muted">Unlimited tasks & goals, advanced insight, dark/custom theme, dan Semester Wrapped.</p></div><div className="mt-5 flex justify-end gap-2"><Button variant="ghost" onClick={closeUpgrade}>Nanti</Button><Button onClick={() => { closeUpgrade(); navigate('/app/pricing') }}>Lihat Paket</Button></div></Modal>
}
