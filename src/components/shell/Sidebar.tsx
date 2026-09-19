import { useRef, useCallback } from 'react'
import { useIsMobileLayout } from '@/hooks/useMediaQuery'
import { Search } from 'lucide-react'
import { useAppStore, useOutline } from '@/store/useAppStore'
import './Sidebar.css'

export function Sidebar() {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen)
  const sidebarWidth = useAppStore((s) => s.sidebarWidth)
  const setSidebarWidth = useAppStore((s) => s.setSidebarWidth)
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen)
  const focusMode = useAppStore((s) => s.focusMode)
  const zenMode = useAppStore((s) => s.zenMode)
  const outline = useOutline()
  const isResizing = useRef(false)
  const isMobile = useIsMobileLayout()

  const handleMouseDown = useCallback(() => {
    isResizing.current = true
    const onMove = (e: MouseEvent) => setSidebarWidth(e.clientX)
    const onUp = () => {
      isResizing.current = false
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [setSidebarWidth])

  if (!sidebarOpen || focusMode || zenMode) return null

  return (
    <aside
      className="sidebar"
      style={{ width: isMobile ? undefined : sidebarWidth }}
    >
      <div className="sidebar-search">
        <Search size={14} strokeWidth={1.5} className="sidebar-search-icon" />
        <input
          type="search"
          className="sidebar-search-input"
          placeholder="Search…"
          aria-label="Search documents"
        />
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-label">Document</div>
        <nav className="sidebar-outline" aria-label="Document outline">
          {outline.length === 0 ? (
            <div className="sidebar-empty">No headings</div>
          ) : (
            outline.map((item) => (
              <button
                key={item.id}
                className="sidebar-outline-item"
                type="button"
                style={{ paddingLeft: `${(item.level - 1) * 12 + 12}px` }}
                onClick={() => isMobile && setSidebarOpen(false)}
              >
                {item.text}
              </button>
            ))
          )}
        </nav>
      </div>

      <div
        className="sidebar-resizer"
        onMouseDown={handleMouseDown}
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize sidebar"
      />
    </aside>
  )
}
