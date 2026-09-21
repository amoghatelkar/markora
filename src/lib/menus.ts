import { useAppStore } from '@/store/useAppStore'
import { useEditorStore, type EditorCommands } from '@/store/useEditorStore'
import { formatShortcut } from '@/lib/shortcuts'
import { insertTableOfContents } from '@/lib/insertTableOfContents'
import { exportActiveDocument } from '@/lib/exportActions'

type EditorAction = Exclude<
  keyof EditorCommands,
  'setHeading' | 'getBlockLabel' | 'insertTableOfContents'
>

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

  const runEditor = (fn: EditorAction) => {
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
          label: 'Open…',
          shortcut: formatShortcut('Mod+O'),
          action: () => {
            void store.openDocumentFromSystem()
          },
        },
        {
          id: 'open-sample',
          label: 'Open Sample…',
          action: () => store.setOpenDialogOpen(true),
        },
        { id: 'sep-save', label: '', separator: true },
        {
          id: 'save-document',
          label: 'Save',
          shortcut: formatShortcut('Mod+S'),
          action: () => {
            void store.saveActiveDocument()
          },
          disabled: !store.activeDocumentId,
        },
        {
          id: 'save-document-as',
          label: 'Save As…',
          shortcut: formatShortcut('Mod+Shift+S'),
          action: () => {
            void store.saveActiveDocumentAs()
          },
          disabled: !store.activeDocumentId,
        },
        {
          id: 'toggle-auto-save',
          label: store.autoSaveEnabled ? 'Auto-save: On' : 'Auto-save: Off',
          action: () => store.toggleAutoSave(),
        },
        { id: 'sep-export', label: '', separator: true },
        {
          id: 'export-markdown',
          label: 'Export as Markdown…',
          action: () => exportActiveDocument('markdown'),
          disabled: !store.activeDocumentId,
        },
        {
          id: 'export-html',
          label: 'Export as HTML…',
          action: () => exportActiveDocument('html'),
          disabled: !store.activeDocumentId,
        },
        {
          id: 'export-text',
          label: 'Export as Plain Text…',
          action: () => exportActiveDocument('text'),
          disabled: !store.activeDocumentId,
        },
        {
          id: 'export-pdf',
          label: 'Export as PDF…',
          action: () => exportActiveDocument('pdf'),
          disabled: !store.activeDocumentId,
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
          label: 'Table…',
          shortcut: formatShortcut('Mod+Alt+T'),
          action: () => useEditorStore.getState().openTableInsertPicker(),
        },
        {
          id: 'insert-toc',
          label: 'Table of Contents',
          action: () => insertTableOfContents(),
          disabled: !store.activeDocumentId,
        },
        {
          id: 'insert-image',
          label: 'Image',
          action: () => runEditor('insertImage'),
        },
        {
          id: 'insert-hr',
          label: 'Horizontal Rule',
          action: () => runEditor('insertHorizontalRule'),
        },
        {
          id: 'insert-link',
          label: 'Link',
          action: () => runEditor('link'),
        },
      ],
    },
    {
      id: 'table',
      label: 'Table',
      items: [
        {
          id: 'insert-table',
          label: 'Insert Table…',
          shortcut: formatShortcut('Mod+Alt+T'),
          action: () => useEditorStore.getState().openTableInsertPicker(),
        },
        { id: 'table-sep-1', label: '', separator: true },
        {
          id: 'add-row-before',
          label: 'Add Row Above',
          action: () => runEditor('addRowBefore'),
          disabled: !editor,
        },
        {
          id: 'add-row-after',
          label: 'Add Row Below',
          action: () => runEditor('addRowAfter'),
          disabled: !editor,
        },
        {
          id: 'delete-row',
          label: 'Delete Row',
          action: () => runEditor('deleteRow'),
          disabled: !editor,
        },
        { id: 'table-sep-2', label: '', separator: true },
        {
          id: 'add-col-before',
          label: 'Add Column Left',
          action: () => runEditor('addColumnBefore'),
          disabled: !editor,
        },
        {
          id: 'add-col-after',
          label: 'Add Column Right',
          action: () => runEditor('addColumnAfter'),
          disabled: !editor,
        },
        {
          id: 'delete-col',
          label: 'Delete Column',
          action: () => runEditor('deleteColumn'),
          disabled: !editor,
        },
        { id: 'table-sep-3', label: '', separator: true },
        {
          id: 'toggle-header-row',
          label: 'Toggle Header Row',
          action: () => runEditor('toggleHeaderRow'),
          disabled: !editor,
        },
        {
          id: 'toggle-header-col',
          label: 'Toggle Header Column',
          action: () => runEditor('toggleHeaderColumn'),
          disabled: !editor,
        },
        {
          id: 'merge-cells',
          label: 'Merge Cells',
          action: () => runEditor('mergeCells'),
          disabled: !editor,
        },
        {
          id: 'split-cell',
          label: 'Split Cell',
          action: () => runEditor('splitCell'),
          disabled: !editor,
        },
        { id: 'table-sep-4', label: '', separator: true },
        {
          id: 'delete-table',
          label: 'Delete Table',
          action: () => runEditor('deleteTable'),
          disabled: !editor,
        },
      ],
    },
    {
      id: 'format',
      label: 'Format',
      items: [
        {
          id: 'paragraph',
          label: 'Paragraph',
          shortcut: formatShortcut('Mod+Alt+0'),
          action: () => runEditor('setParagraph'),
        },
        {
          id: 'heading-1',
          label: 'Heading 1',
          shortcut: formatShortcut('Mod+Alt+1'),
          action: () => editor?.setHeading(1),
        },
        {
          id: 'heading-2',
          label: 'Heading 2',
          shortcut: formatShortcut('Mod+Alt+2'),
          action: () => editor?.setHeading(2),
        },
        {
          id: 'heading-3',
          label: 'Heading 3',
          shortcut: formatShortcut('Mod+Alt+3'),
          action: () => editor?.setHeading(3),
        },
        {
          id: 'heading-4',
          label: 'Heading 4',
          shortcut: formatShortcut('Mod+Alt+4'),
          action: () => editor?.setHeading(4),
        },
        {
          id: 'heading-5',
          label: 'Heading 5',
          shortcut: formatShortcut('Mod+Alt+5'),
          action: () => editor?.setHeading(5),
        },
        {
          id: 'heading-6',
          label: 'Heading 6',
          shortcut: formatShortcut('Mod+Alt+6'),
          action: () => editor?.setHeading(6),
        },
        { id: 'sep-1', label: '', separator: true },
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
        { id: 'sep-2', label: '', separator: true },
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
