import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Download, X } from 'lucide-react'
import { ToolbarDropdown } from '@/components/ui/ToolbarDropdown'
import { getExportMenuItems } from '@/lib/exportMenuItems'
import { useAppStore } from '@/store/useAppStore'
import { useIsMobileLayout } from '@/hooks/useMediaQuery'
import './ExportMenu.css'

interface ExportMenuProps {
  /** Status bar dropdown (desktop) or title bar icon (mobile). */
  variant?: 'statusbar' | 'mobile'
}

export function ExportMenu({ variant = 'statusbar' }: ExportMenuProps) {
  const isMobileLayout = useIsMobileLayout()
  const hasDocument = Boolean(useAppStore((s) => s.activeDocumentId))
  const [sheetOpen, setSheetOpen] = useState(false)
  const items = getExportMenuItems(hasDocument)

  const showStatusbar = variant === 'statusbar' && !isMobileLayout
  const showMobileTrigger = variant === 'mobile' && isMobileLayout

  useEffect(() => {
    if (!sheetOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSheetOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [sheetOpen])

  const mobileSheet =
    sheetOpen && showMobileTrigger
      ? createPortal(
          <div
            className="export-sheet-overlay"
            role="presentation"
            onClick={() => setSheetOpen(false)}
          >
            <div
              className="export-sheet animate-slide-up"
              role="dialog"
              aria-modal="true"
              aria-label="Export document"
              onClick={(e) => e.stopPropagation()}
            >
              <header className="export-sheet-header">
                <h2 className="export-sheet-title">Export</h2>
                <button
                  type="button"
                  className="export-sheet-close"
                  aria-label="Close"
                  onClick={() => setSheetOpen(false)}
                >
                  <X size={20} strokeWidth={1.75} />
                </button>
              </header>
              <ul className="export-sheet-list">
                {items.map((item) =>
                  item.separator ? (
                    <li key={item.id} className="export-sheet-separator" role="separator" />
                  ) : (
                    <li key={item.id}>
                      <button
                        type="button"
                        className="export-sheet-item"
                        disabled={item.disabled}
                        onClick={() => {
                          item.action?.()
                          setSheetOpen(false)
                        }}
                      >
                        {item.label}
                      </button>
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>,
          document.body
        )
      : null

  if (showMobileTrigger) {
    return (
      <>
        <button
          type="button"
          className="titlebar-mobile-btn"
          aria-label="Export document"
          onClick={() => setSheetOpen(true)}
        >
          <Download size={20} strokeWidth={1.75} />
        </button>
        {mobileSheet}
      </>
    )
  }

  if (!showStatusbar) return null

  return (
    <div className="export-menu">
      <ToolbarDropdown
        aria-label="Export document"
        label="Export"
        icon={<Download size={13} strokeWidth={1.75} />}
        items={items}
      />
    </div>
  )
}
