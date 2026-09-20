import { useAppStore } from '@/store/useAppStore'
import { assetUrl } from '@/lib/assetUrl'
import { Button } from '@/components/ui/Button'
import { formatShortcut } from '@/lib/shortcuts'
import './WelcomeScreen.css'

const RECENT_FILES = ['README.md', 'Design.md', 'Notes.md']

export function WelcomeScreen() {
  const newDocument = useAppStore((s) => s.newDocument)
  const openDocument = useAppStore((s) => s.openDocument)
  const openDocumentFromSystem = useAppStore((s) => s.openDocumentFromSystem)
  const setOpenDialogOpen = useAppStore((s) => s.setOpenDialogOpen)

  return (
    <div className="welcome">
      <div className="welcome-content animate-fade-in">
        <img src={assetUrl('markora-icon.png')} alt="" className="welcome-icon" width={64} height={64} />
        <h1 className="welcome-title">Markora</h1>
        <p className="welcome-subtitle">Your Markdown workspace.</p>

        <div className="welcome-actions">
          <Button variant="primary" onClick={newDocument}>
            New Document
          </Button>
          <Button variant="secondary" onClick={() => void openDocumentFromSystem()}>
            Open Document
          </Button>
          <Button variant="secondary" onClick={() => setOpenDialogOpen(true)}>
            Open Sample
          </Button>
        </div>

        <div className="welcome-shortcuts">
          <span>{formatShortcut('Mod+N')}</span>
          <span>{formatShortcut('Mod+O')}</span>
        </div>

        <div className="welcome-recent">
          <div className="welcome-recent-label">Recent Documents</div>
          {RECENT_FILES.map((file) => (
            <button
              key={file}
              className="welcome-recent-item"
              type="button"
              onClick={() => openDocument(file)}
            >
              {file}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
