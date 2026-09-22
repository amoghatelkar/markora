import { PanelLeft, Search, Menu } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { assetUrl } from '@/lib/assetUrl'
import { useIsMobileLayout } from '@/hooks/useMediaQuery'
import { ViewControls } from './ViewControls'
import { ExportMenu } from './ExportMenu'
import './TitleBar.css'

export function TitleBar() {
  const zenMode = useAppStore((s) => s.zenMode)
  const focusMode = useAppStore((s) => s.focusMode)
  const toggleSidebar = useAppStore((s) => s.toggleSidebar)
  const setCommandPaletteOpen = useAppStore((s) => s.setCommandPaletteOpen)
  const setMobileMenuOpen = useAppStore((s) => s.setMobileMenuOpen)
  const isMobile = useIsMobileLayout()

  if (zenMode) return null

  const centered = !isMobile

  return (
    <header
      className={`titlebar ${focusMode ? 'titlebar--minimal' : ''} ${centered ? 'titlebar--centered' : ''}`}
    >
      <div className="titlebar-brand titlebar-drag">
        {isMobile && (
          <div className="titlebar-mobile-actions">
            <button
              type="button"
              className="titlebar-mobile-btn"
              aria-label="Menu"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={20} strokeWidth={1.75} />
            </button>
            <button
              type="button"
              className="titlebar-mobile-btn"
              aria-label="Document outline"
              onClick={toggleSidebar}
            >
              <PanelLeft size={20} strokeWidth={1.75} />
            </button>
            <button
              type="button"
              className="titlebar-mobile-btn"
              aria-label="Command palette"
              onClick={() => setCommandPaletteOpen(true)}
            >
              <Search size={20} strokeWidth={1.75} />
            </button>
            <ExportMenu variant="mobile" />
          </div>
        )}
        <img src={assetUrl('markora-icon.png')} alt="" className="titlebar-icon" width={18} height={18} />
        {import.meta.env.BASE_URL === '/app/' ? (
          <a className="titlebar-logo" href="/">Markora</a>
        ) : (
          <span className="titlebar-logo">Markora</span>
        )}
      </div>
      <div className="titlebar-end">
        <ViewControls />
      </div>
    </header>
  )
}
