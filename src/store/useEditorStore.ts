import { create } from 'zustand'

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

export interface EditorCommands {
  undo: () => void
  redo: () => void
  cut: () => void
  copy: () => void
  paste: () => void
  bold: () => void
  italic: () => void
  strike: () => void
  code: () => void
  link: () => void
  bulletList: () => void
  orderedList: () => void
  blockquote: () => void
  codeBlock: () => void
  setParagraph: () => void
  setHeading: (level: HeadingLevel) => void
  insertTable: (rows?: number, cols?: number, withHeaderRow?: boolean) => void
  addRowBefore: () => void
  addRowAfter: () => void
  deleteRow: () => void
  addColumnBefore: () => void
  addColumnAfter: () => void
  deleteColumn: () => void
  deleteTable: () => void
  toggleHeaderRow: () => void
  toggleHeaderColumn: () => void
  mergeCells: () => void
  splitCell: () => void
  insertImage: () => void
  insertHorizontalRule: () => void
  insertTableOfContents: (markdown: string) => void
  getBlockLabel: () => string
}

interface EditorState {
  commands: EditorCommands | null
  blockLabel: string
  tableInsertPickerNonce: number
  sourceInsertText: ((text: string) => void) | null
  registerCommands: (commands: EditorCommands) => void
  unregisterCommands: () => void
  setBlockLabel: (label: string) => void
  openTableInsertPicker: () => void
  registerSourceInsertText: (fn: ((text: string) => void) | null) => void
  insertTableOfContentsInSource: (markdown: string) => void
  scrollToHeading: ((slug: string) => void) | null
  registerScrollToHeading: (fn: ((slug: string) => void) | null) => void
}

export const useEditorStore = create<EditorState>((set) => ({
  commands: null,
  blockLabel: 'Paragraph',
  tableInsertPickerNonce: 0,
  sourceInsertText: null,
  registerCommands: (commands) => set({ commands, blockLabel: commands.getBlockLabel() }),
  unregisterCommands: () => set({ commands: null, blockLabel: 'Paragraph' }),
  setBlockLabel: (label) => set({ blockLabel: label }),
  openTableInsertPicker: () =>
    set((s) => ({ tableInsertPickerNonce: s.tableInsertPickerNonce + 1 })),
  registerSourceInsertText: (fn) => set({ sourceInsertText: fn }),
  insertTableOfContentsInSource: (markdown) => {
    const fn = useEditorStore.getState().sourceInsertText
    fn?.(markdown)
  },
  scrollToHeading: null,
  registerScrollToHeading: (fn) => set({ scrollToHeading: fn }),
}))
