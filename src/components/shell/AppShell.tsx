import { useState, useCallback } from 'react'
import { TitleBar } from './TitleBar'
import { MenuBar } from './MenuBar'
import { TabBar } from './TabBar'
import { Sidebar } from './Sidebar'
import { StatusBar } from './StatusBar'
import { Editor } from '@/components/editor/Editor'
import { WelcomeScreen } from '@/components/welcome/WelcomeScreen'
import { CommandPalette } from '@/components/command-palette/CommandPalette'
import { OpenDocumentDialog } from '@/components/dialogs/OpenDocumentDialog'
import { ContextMenu, type ContextMenuItem } from '@/components/menus/ContextMenu'
import { Toast } from '@/components/ui/Toast'
import { useAppStore } from '@/store/useAppStore'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import './AppShell.css'

export function AppShell() {
  useKeyboardShortcuts()

  const showWelcome = useAppStore((s) => s.showWelcome)
  const activeDocumentId = useAppStore((s) => s.activeDocumentId)
  const zenMode = useAppStore((s) => s.zenMode)
  const showToast = useAppStore((s) => s.showToast)

  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    items: ContextMenuItem[]
  } | null>(null)

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('.editor-prose, .editor-source')) {
      e.preventDefault()
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        items: [
          { label: 'Cut', shortcut: '⌘X', action: () => document.execCommand('cut') },
          { label: 'Copy', shortcut: '⌘C', action: () => document.execCommand('copy') },
          { label: 'Paste', shortcut: '⌘V', action: () => document.execCommand('paste') },
          { separator: true, label: '' },
          { label: 'Bold', shortcut: '⌘B' },
          { label: 'Italic', shortcut: '⌘I' },
          { label: 'Link', shortcut: '⌘K' },
          { separator: true, label: '' },
          { label: 'Copy as Markdown', action: () => showToast('Copied as Markdown') },
          { label: 'Copy as HTML', action: () => showToast('Copied as HTML') },
        ],
      })
    }
  }, [showToast])

  return (
    <div className={`app-shell ${zenMode ? 'app-shell--zen' : ''}`} onContextMenu={handleContextMenu}>
      <TitleBar />
      <MenuBar />
      <TabBar />

      <div className="app-shell-body">
        <Sidebar />
        <main className="app-shell-main">
          {showWelcome && !activeDocumentId ? <WelcomeScreen /> : <Editor />}
        </main>
      </div>

      <StatusBar />
      <CommandPalette />
      <OpenDocumentDialog />
      <Toast />

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenu.items}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  )
}
