import { useAppStore } from '@/store/useAppStore'
import './Toast.css'

export function Toast() {
  const toast = useAppStore((s) => s.toast)
  if (!toast) return null

  return (
    <div className="toast animate-fade-in" role="status" aria-live="polite">
      {toast}
    </div>
  )
}
