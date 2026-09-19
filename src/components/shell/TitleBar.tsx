import { useAppStore } from '@/store/useAppStore'
import { assetUrl } from '@/lib/assetUrl'
import { ViewControls } from './ViewControls'
import './TitleBar.css'

export function TitleBar() {
  const zenMode = useAppStore((s) => s.zenMode)
  const focusMode = useAppStore((s) => s.focusMode)

  if (zenMode) return null

  return (
    <header className={`titlebar ${focusMode ? 'titlebar--minimal' : ''}`}>
      <div className="titlebar-drag">
        <img src={assetUrl('markora-icon.png')} alt="" className="titlebar-icon" width={18} height={18} />
        {import.meta.env.BASE_URL === '/app/' ? (
          <a className="titlebar-logo" href="/">Markora</a>
        ) : (
          <span className="titlebar-logo">Markora</span>
        )}
      </div>
      <ViewControls />
    </header>
  )
}
