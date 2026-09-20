import type { Command } from '@/types'
import { useAppStore } from '@/store/useAppStore'
import { useEditorStore } from '@/store/useEditorStore'

export function getCommands(): Command[] {
  const store = useAppStore.getState()

  return [
    {
      id: 'new-document',
      label: 'New Document',
      category: 'File',
      shortcut: 'Mod+N',
      keywords: ['create', 'new'],
      action: () => store.newDocument(),
    },
    {
      id: 'open-document',
      label: 'Open…',
      category: 'File',
      shortcut: 'Mod+O',
      keywords: ['open', 'file', 'explorer'],
      action: () => {
        void store.openDocumentFromSystem()
      },
    },
    {
      id: 'save-document',
      label: 'Save',
      category: 'File',
      shortcut: 'Mod+S',
      keywords: ['save', 'write', 'disk'],
      action: () => {
        void store.saveActiveDocument()
      },
    },
    {
      id: 'save-document-as',
      label: 'Save As…',
      category: 'File',
      shortcut: 'Mod+Shift+S',
      keywords: ['save', 'export', 'copy'],
      action: () => {
        void store.saveActiveDocumentAs()
      },
    },
    {
      id: 'toggle-markdown-source',
      label: 'Toggle Markdown Source',
      category: 'View',
      shortcut: 'Mod+Shift+M',
      keywords: ['source', 'markdown', 'code'],
      action: () => store.toggleMarkdownSource(),
    },
    {
      id: 'insert-table',
      label: 'Insert Table',
      category: 'Insert',
      shortcut: 'Mod+Alt+T',
      keywords: ['table', 'grid'],
      action: () => useEditorStore.getState().openTableInsertPicker(),
    },
    {
      id: 'insert-image',
      label: 'Insert Image',
      category: 'Insert',
      keywords: ['image', 'picture', 'photo'],
      action: () => store.showToast('Image insertion'),
    },
    {
      id: 'export-pdf',
      label: 'Export PDF',
      category: 'Export',
      keywords: ['pdf', 'export', 'print'],
      action: () => store.showToast('Exporting PDF…'),
    },
    {
      id: 'toggle-sidebar',
      label: 'Toggle Sidebar',
      category: 'View',
      shortcut: 'Mod+\\',
      keywords: ['sidebar', 'panel'],
      action: () => store.toggleSidebar(),
    },
    {
      id: 'toggle-focus-mode',
      label: 'Toggle Focus Mode',
      category: 'View',
      shortcut: 'Mod+Shift+F',
      keywords: ['focus', 'distraction', 'writing'],
      action: () => store.toggleFocusMode(),
    },
    {
      id: 'toggle-zen-mode',
      label: 'Toggle Zen Mode',
      category: 'View',
      shortcut: 'Mod+Shift+Z',
      keywords: ['zen', 'fullscreen', 'minimal'],
      action: () => store.toggleZenMode(),
    },
    {
      id: 'change-theme',
      label: 'Change Theme',
      category: 'Preferences',
      keywords: ['theme', 'dark', 'light', 'appearance'],
      action: () => store.toggleTheme(),
    },
    {
      id: 'editor-width-compact',
      label: 'Editor Width: Compact',
      category: 'Preferences',
      keywords: ['width', 'compact', 'narrow'],
      action: () => store.setEditorWidth('compact'),
    },
    {
      id: 'editor-width-comfortable',
      label: 'Editor Width: Comfortable',
      category: 'Preferences',
      keywords: ['width', 'comfortable', 'default'],
      action: () => store.setEditorWidth('comfortable'),
    },
    {
      id: 'editor-width-wide',
      label: 'Editor Width: Wide',
      category: 'Preferences',
      keywords: ['width', 'wide', 'broad'],
      action: () => store.setEditorWidth('wide'),
    },
    {
      id: 'zoom-in',
      label: 'Zoom In',
      category: 'View',
      shortcut: 'Mod+=',
      keywords: ['zoom', 'larger', 'text'],
      action: () => store.zoomIn(),
    },
    {
      id: 'zoom-out',
      label: 'Zoom Out',
      category: 'View',
      shortcut: 'Mod+-',
      keywords: ['zoom', 'smaller', 'text'],
      action: () => store.zoomOut(),
    },
    {
      id: 'zoom-reset',
      label: 'Reset Zoom',
      category: 'View',
      shortcut: 'Mod+0',
      keywords: ['zoom', 'reset', '100'],
      action: () => store.resetEditorZoom(),
    },
    {
      id: 'command-palette',
      label: 'Command Palette',
      category: 'General',
      shortcut: 'Mod+K',
      keywords: ['search', 'commands'],
      action: () => store.setCommandPaletteOpen(true),
    },
  ]
}
