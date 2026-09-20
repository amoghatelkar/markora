import { Plus, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { Tooltip } from '@/components/ui/Tooltip'
import { formatShortcut } from '@/lib/shortcuts'
import './TabBar.css'

export function TabBar() {
  const documents = useAppStore((s) => s.documents)
  const activeDocumentId = useAppStore((s) => s.activeDocumentId)
  const tabHistory = useAppStore((s) => s.tabHistory)
  const tabHistoryIndex = useAppStore((s) => s.tabHistoryIndex)
  const setActiveDocument = useAppStore((s) => s.setActiveDocument)
  const navigateTabBack = useAppStore((s) => s.navigateTabBack)
  const navigateTabForward = useAppStore((s) => s.navigateTabForward)
  const closeDocument = useAppStore((s) => s.closeDocument)
  const newDocument = useAppStore((s) => s.newDocument)
  const zenMode = useAppStore((s) => s.zenMode)
  const focusMode = useAppStore((s) => s.focusMode)

  const canGoBack = tabHistoryIndex > 0 && tabHistory.length > 1
  const canGoForward =
    tabHistoryIndex >= 0 && tabHistoryIndex < tabHistory.length - 1

  if (zenMode) return null

  return (
    <div className={`tabbar ${focusMode ? 'tabbar--minimal' : ''}`}>
      <div className="tabbar-nav">
        <Tooltip label="Previous tab" shortcut={formatShortcut('Mod+[')}>
          <button
            className="tabbar-nav-btn"
            type="button"
            aria-label="Previous tab"
            disabled={!canGoBack}
            onClick={() => navigateTabBack()}
          >
            <ChevronLeft size={16} strokeWidth={1.75} />
          </button>
        </Tooltip>
        <Tooltip label="Next tab" shortcut={formatShortcut('Mod+]')}>
          <button
            className="tabbar-nav-btn"
            type="button"
            aria-label="Next tab"
            disabled={!canGoForward}
            onClick={() => navigateTabForward()}
          >
            <ChevronRight size={16} strokeWidth={1.75} />
          </button>
        </Tooltip>
      </div>
      <div className="tabbar-tabs" role="tablist">
        {documents.map((doc) => (
          <button
            key={doc.id}
            className={`tab ${doc.id === activeDocumentId ? 'tab--active' : ''}`}
            type="button"
            role="tab"
            aria-selected={doc.id === activeDocumentId}
            onClick={() => setActiveDocument(doc.id)}
            onAuxClick={(e) => {
              if (e.button === 1) {
                e.preventDefault()
                closeDocument(doc.id)
              }
            }}
          >
            <span className="tab-title">
              {doc.modified && <span className="tab-modified" aria-label="Modified" />}
              {doc.title}
            </span>
            <span
              className="tab-close"
              role="button"
              aria-label={`Close ${doc.title}`}
              onClick={(e) => {
                e.stopPropagation()
                closeDocument(doc.id)
              }}
            >
              <X size={12} strokeWidth={1.5} />
            </span>
          </button>
        ))}
        <button className="tab-new" type="button" aria-label="New tab" onClick={newDocument}>
          <Plus size={14} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}
