import { Award } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Button, Modal } from './UI'
export function AchievementModal() {
  const { latestAchievement, clearLatestAchievement } = useApp()
  return <Modal open={!!latestAchievement} onClose={clearLatestAchievement} title="Achievement unlocked! 🎉" size="sm"><div className="text-center"><div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-yellow-100"><Award size={40} className="text-yellow-600"/></div><h3 className="mt-4 text-xl font-extrabold">{latestAchievement?.title}</h3><p className="mt-2 muted">{latestAchievement?.description}</p><Button className="mt-6 w-full" onClick={clearLatestAchievement}>Lanjutkan langkahmu</Button></div></Modal>
}
