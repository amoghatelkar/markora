import { Moon, Sun } from 'lucide-react'
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

  return (
    <div className="view-controls">
      {activeDocumentId && (
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
