import { useAppStore } from '@/store/useAppStore'
import { useEditorStore } from '@/store/useEditorStore'
import { formatShortcut } from '@/lib/shortcuts'

export interface MenuItem {
  id: string
  label: string
  shortcut?: string
  action?: () => void
  separator?: boolean
  disabled?: boolean
}

export interface MenuDefinition {
  id: string
  label: string
  items: MenuItem[]
}

export function getMenus(): MenuDefinition[] {
  const store = useAppStore.getState()
  const editor = useEditorStore.getState().commands

  const runEditor = (fn: keyof NonNullable<typeof editor>) => {
    editor?.[fn]?.()
  }

  return [
    {
      id: 'file',
      label: 'File',
      items: [
        {
          id: 'new-document',
          label: 'New Document',
          shortcut: formatShortcut('Mod+N'),
          action: () => store.newDocument(),
        },
        {
          id: 'open-document',
          label: 'Open Document…',
          shortcut: formatShortcut('Mod+O'),
          action: () => store.setOpenDialogOpen(true),
        },
        { id: 'sep-1', label: '', separator: true },
        {
          id: 'close-tab',
          label: 'Close Tab',
          shortcut: formatShortcut('Mod+W'),
          action: () => {
            if (store.activeDocumentId) store.closeDocument(store.activeDocumentId)
          },
          disabled: !store.activeDocumentId,
        },
      ],
    },
    {
      id: 'edit',
      label: 'Edit',
      items: [
        {
          id: 'undo',
          label: 'Undo',
          shortcut: formatShortcut('Mod+Z'),
          action: () => runEditor('undo'),
        },
        {
          id: 'redo',
          label: 'Redo',
          shortcut: formatShortcut('Mod+Shift+Z'),
          action: () => runEditor('redo'),
        },
        { id: 'sep-1', label: '', separator: true },
        {
          id: 'cut',
          label: 'Cut',
          shortcut: formatShortcut('Mod+X'),
          action: () => runEditor('cut'),
        },
        {
          id: 'copy',
          label: 'Copy',
          shortcut: formatShortcut('Mod+C'),
          action: () => runEditor('copy'),
        },
        {
          id: 'paste',
          label: 'Paste',
          shortcut: formatShortcut('Mod+V'),
          action: () => runEditor('paste'),
        },
        { id: 'sep-2', label: '', separator: true },
        {
          id: 'bold',
          label: 'Bold',
          shortcut: formatShortcut('Mod+B'),
          action: () => runEditor('bold'),
        },
        {
          id: 'italic',
          label: 'Italic',
          shortcut: formatShortcut('Mod+I'),
          action: () => runEditor('italic'),
        },
        {
          id: 'link',
          label: 'Link',
          shortcut: formatShortcut('Mod+K'),
          action: () => runEditor('link'),
        },
      ],
    },
    {
      id: 'view',
      label: 'View',
      items: [
        {
          id: 'toggle-sidebar',
          label: 'Toggle Sidebar',
          shortcut: formatShortcut('Mod+\\'),
          action: () => store.toggleSidebar(),
        },
        {
          id: 'toggle-focus',
          label: 'Focus Mode',
          shortcut: formatShortcut('Mod+Shift+F'),
          action: () => store.toggleFocusMode(),
        },
        {
          id: 'toggle-zen',
          label: 'Zen Mode',
          shortcut: formatShortcut('Mod+Shift+Z'),
          action: () => store.toggleZenMode(),
        },
        { id: 'sep-1', label: '', separator: true },
        {
          id: 'toggle-source',
          label: 'Toggle Markdown Source',
          shortcut: formatShortcut('Mod+Shift+M'),
          action: () => store.toggleMarkdownSource(),
        },
        {
          id: 'change-theme',
          label: 'Change Theme',
          action: () => store.toggleTheme(),
        },
      ],
    },
    {
      id: 'insert',
      label: 'Insert',
      items: [
        {
          id: 'insert-table',
          label: 'Table',
          shortcut: formatShortcut('Mod+Alt+T'),
          action: () => store.showToast('Table inserted'),
        },
        {
          id: 'insert-image',
          label: 'Image',
          action: () => store.showToast('Image insertion'),
        },
        {
          id: 'insert-link',
          label: 'Link',
          action: () => runEditor('link'),
        },
      ],
    },
    {
      id: 'format',
      label: 'Format',
      items: [
        {
          id: 'bold',
          label: 'Bold',
          shortcut: formatShortcut('Mod+B'),
          action: () => runEditor('bold'),
        },
        {
          id: 'italic',
          label: 'Italic',
          shortcut: formatShortcut('Mod+I'),
          action: () => runEditor('italic'),
        },
        {
          id: 'strikethrough',
          label: 'Strikethrough',
          action: () => runEditor('strike'),
        },
        {
          id: 'code',
          label: 'Inline Code',
          shortcut: formatShortcut('Mod+E'),
          action: () => runEditor('code'),
        },
        { id: 'sep-1', label: '', separator: true },
        {
          id: 'bullet-list',
          label: 'Bullet List',
          action: () => runEditor('bulletList'),
        },
        {
          id: 'numbered-list',
          label: 'Numbered List',
          action: () => runEditor('orderedList'),
        },
        {
          id: 'blockquote',
          label: 'Blockquote',
          action: () => runEditor('blockquote'),
        },
        {
          id: 'code-block',
          label: 'Code Block',
          action: () => runEditor('codeBlock'),
        },
      ],
    },
    {
      id: 'help',
      label: 'Help',
      items: [
        {
          id: 'command-palette',
          label: 'Command Palette',
          shortcut: formatShortcut('Mod+K'),
          action: () => store.setCommandPaletteOpen(true),
        },
        {
          id: 'keyboard-shortcuts',
          label: 'Keyboard Shortcuts',
          action: () => store.showToast('Press ⌘K to open the command palette'),
        },
      ],
    },
  ]
}
