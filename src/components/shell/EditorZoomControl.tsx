import { ZoomIn, ZoomOut } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { Tooltip } from '@/components/ui/Tooltip'
import './EditorZoomControl.css'

export function EditorZoomControl() {
  const editorZoom = useAppStore((s) => s.editorZoom)
  const setEditorZoom = useAppStore((s) => s.setEditorZoom)
  const zoomIn = useAppStore((s) => s.zoomIn)
  const zoomOut = useAppStore((s) => s.zoomOut)
  const resetEditorZoom = useAppStore((s) => s.resetEditorZoom)
  const activeDocumentId = useAppStore((s) => s.activeDocumentId)

  if (!activeDocumentId) return null

  return (
    <div className="editor-zoom" role="group" aria-label="Page zoom">
      <Tooltip label="Zoom out" shortcut="⌘−">
        <button
          className="editor-zoom-btn"
          type="button"
          aria-label="Zoom out"
          disabled={editorZoom <= 50}
          onClick={() => zoomOut()}
        >
          <ZoomOut size={14} strokeWidth={1.5} />
        </button>
      </Tooltip>
      <input
        className="editor-zoom-slider"
        type="range"
        min={50}
        max={200}
        step={5}
        value={editorZoom}
        aria-label="Page zoom"
        onChange={(e) => setEditorZoom(Number(e.target.value))}
      />
      <button
        className="editor-zoom-value"
        type="button"
        aria-label={`Zoom ${editorZoom} percent. Reset to 100 percent.`}
        onClick={() => resetEditorZoom()}
      >
        {editorZoom}%
      </button>
      <Tooltip label="Zoom in" shortcut="⌘+">
        <button
          className="editor-zoom-btn"
          type="button"
          aria-label="Zoom in"
          disabled={editorZoom >= 200}
          onClick={() => zoomIn()}
        >
          <ZoomIn size={14} strokeWidth={1.5} />
        </button>
      </Tooltip>
    </div>
  )
}
