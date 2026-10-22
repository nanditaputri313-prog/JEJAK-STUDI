import { Button, Modal } from './UI'
export function ConfirmModal({ open, onClose, onConfirm, title, description, confirmLabel = 'Hapus' }: { open: boolean; onClose: () => void; onConfirm: () => void; title: string; description: string; confirmLabel?: string }) {
  return <Modal open={open} onClose={onClose} title={title} size="sm"><p className="text-sm muted">{description}</p><div className="mt-6 flex justify-end gap-2"><Button variant="ghost" onClick={onClose}>Batal</Button><Button variant="danger" onClick={() => { onConfirm(); onClose() }}>{confirmLabel}</Button></div></Modal>
}
