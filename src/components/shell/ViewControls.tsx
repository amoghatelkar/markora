import { Moon, Sun, ZoomIn, ZoomOut } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { Tooltip } from '@/components/ui/Tooltip'
import './ViewControls.css'

export function ViewControls() {
  const theme = useAppStore((s) => s.theme)
  const toggleTheme = useAppStore((s) => s.toggleTheme)
  const showMarkdownSource = useAppStore((s) => s.showMarkdownSource)
  const toggleMarkdownSource = useAppStore((s) => s.toggleMarkdownSource)
  const activeDocumentId = useAppStore((s) => s.activeDocumentId)
  const editorZoom = useAppStore((s) => s.editorZoom)
  const zoomIn = useAppStore((s) => s.zoomIn)
  const zoomOut = useAppStore((s) => s.zoomOut)
  const resetEditorZoom = useAppStore((s) => s.resetEditorZoom)

  return (
    <div className="view-controls">
      {activeDocumentId && (
        <>
          <div className="view-controls-zoom" role="group" aria-label="Editor zoom">
            <Tooltip label="Zoom out" shortcut="⌘−">
              <button
                className="view-controls-btn"
                type="button"
                aria-label="Zoom out"
                disabled={editorZoom <= 50}
                onClick={() => zoomOut()}
              >
                <ZoomOut size={15} strokeWidth={1.5} />
              </button>
            </Tooltip>
            <button
              className="view-controls-zoom-label"
              type="button"
              aria-label={`Zoom ${editorZoom} percent. Reset to 100 percent.`}
              onClick={() => resetEditorZoom()}
            >
              {editorZoom}%
            </button>
            <Tooltip label="Zoom in" shortcut="⌘+">
              <button
                className="view-controls-btn"
                type="button"
                aria-label="Zoom in"
                disabled={editorZoom >= 200}
                onClick={() => zoomIn()}
              >
                <ZoomIn size={15} strokeWidth={1.5} />
              </button>
            </Tooltip>
          </div>

          <SegmentedControl
            aria-label="Editor mode"
            options={[
              { id: 'view', label: 'View' },
              { id: 'source', label: 'Source' },
            ]}
            value={showMarkdownSource ? 'source' : 'view'}
            onChange={(id) => {
              const wantSource = id === 'source'
              if (wantSource !== showMarkdownSource) toggleMarkdownSource()
            }}
          />
        </>
      )}

      <Tooltip label={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
        <button
          className="view-controls-btn"
          type="button"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          onClick={toggleTheme}
        >
          {theme === 'dark' ? (
            <Sun size={15} strokeWidth={1.5} />
          ) : (
            <Moon size={15} strokeWidth={1.5} />
          )}
        </button>
      </Tooltip>
    </div>
  )
}
