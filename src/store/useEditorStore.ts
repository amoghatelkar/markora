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
  insertTable: () => void
  insertImage: () => void
  insertHorizontalRule: () => void
  getBlockLabel: () => string
}

interface EditorState {
  commands: EditorCommands | null
  blockLabel: string
  registerCommands: (commands: EditorCommands) => void
  unregisterCommands: () => void
  setBlockLabel: (label: string) => void
}

export const useEditorStore = create<EditorState>((set) => ({
  commands: null,
  blockLabel: 'Paragraph',
  registerCommands: (commands) => set({ commands, blockLabel: commands.getBlockLabel() }),
  unregisterCommands: () => set({ commands: null, blockLabel: 'Paragraph' }),
  setBlockLabel: (label) => set({ blockLabel: label }),
}))
