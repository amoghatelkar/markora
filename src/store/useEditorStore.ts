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
  getBlockLabel: () => string
}

interface EditorState {
  commands: EditorCommands | null
  blockLabel: string
  tableInsertPickerNonce: number
  registerCommands: (commands: EditorCommands) => void
  unregisterCommands: () => void
  setBlockLabel: (label: string) => void
  openTableInsertPicker: () => void
}

export const useEditorStore = create<EditorState>((set) => ({
  commands: null,
  blockLabel: 'Paragraph',
  tableInsertPickerNonce: 0,
  registerCommands: (commands) => set({ commands, blockLabel: commands.getBlockLabel() }),
  unregisterCommands: () => set({ commands: null, blockLabel: 'Paragraph' }),
  setBlockLabel: (label) => set({ blockLabel: label }),
  openTableInsertPicker: () =>
    set((s) => ({ tableInsertPickerNonce: s.tableInsertPickerNonce + 1 })),
}))
