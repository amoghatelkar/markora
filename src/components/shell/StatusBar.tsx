import { useAppStore, useActiveDocument } from '@/store/useAppStore'
import { countWords, countCharacters } from '@/lib/wordCount'
import './StatusBar.css'

export function StatusBar() {
  const doc = useActiveDocument()
  const saveStatus = useAppStore((s) => s.saveStatus)
  const zenMode = useAppStore((s) => s.zenMode)

  if (!doc) return null

  const words = countWords(doc.content)
  const chars = countCharacters(doc.content)

  const statusLabel =
    saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? 'Saved' : 'Unsaved'

  return (
    <footer className={`statusbar ${zenMode ? 'statusbar--zen' : ''}`}>
      <div className="statusbar-left">
        <span>{words.toLocaleString()} words</span>
        <span className="statusbar-sep">·</span>
        <span>{chars.toLocaleString()} characters</span>
      </div>
      <div className="statusbar-right">
        <span>Markdown</span>
        <span className="statusbar-sep">·</span>
        <span className={saveStatus === 'saved' ? 'statusbar-saved' : ''}>
          {statusLabel}
        </span>
      </div>
    </footer>
  )
}
