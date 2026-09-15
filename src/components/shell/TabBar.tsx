import { Plus, X } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import './TabBar.css'

export function TabBar() {
  const documents = useAppStore((s) => s.documents)
  const activeDocumentId = useAppStore((s) => s.activeDocumentId)
  const setActiveDocument = useAppStore((s) => s.setActiveDocument)
  const closeDocument = useAppStore((s) => s.closeDocument)
  const newDocument = useAppStore((s) => s.newDocument)
  const zenMode = useAppStore((s) => s.zenMode)
  const focusMode = useAppStore((s) => s.focusMode)

  if (zenMode) return null

  return (
    <div className={`tabbar ${focusMode ? 'tabbar--minimal' : ''}`}>
      <div className="tabbar-nav">
        <button className="tabbar-nav-btn" type="button" aria-label="Go back" disabled>
          ←
        </button>
        <button className="tabbar-nav-btn" type="button" aria-label="Go forward" disabled>
          →
        </button>
      </div>
      <div className="tabbar-tabs" role="tablist">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className={`tab ${doc.id === activeDocumentId ? 'tab--active' : ''}`}
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
            <button
              className="tab-close"
              type="button"
              aria-label={`Close ${doc.title}`}
              onClick={(e) => {
                e.stopPropagation()
                closeDocument(doc.id)
              }}
            >
              <X size={12} strokeWidth={1.5} />
            </button>
          </div>
        ))}
        <button className="tab-new" type="button" aria-label="New tab" onClick={newDocument}>
          <Plus size={14} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}
