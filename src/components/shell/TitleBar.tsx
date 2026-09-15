import { useAppStore } from '@/store/useAppStore'
import './TitleBar.css'

export function TitleBar() {
  const zenMode = useAppStore((s) => s.zenMode)
  const focusMode = useAppStore((s) => s.focusMode)

  if (zenMode) return null

  return (
    <header className={`titlebar ${focusMode ? 'titlebar--minimal' : ''}`}>
      <div className="titlebar-drag">
        <img src="/markora-icon.png" alt="" className="titlebar-icon" width={18} height={18} />
        <span className="titlebar-logo">Markora</span>
      </div>
      <div className="titlebar-status">
        <span className="titlebar-dot" aria-hidden="true" />
      </div>
    </header>
  )
}
