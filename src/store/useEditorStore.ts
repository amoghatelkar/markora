import { create } from 'zustand'

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
}

interface EditorState {
  commands: EditorCommands | null
  registerCommands: (commands: EditorCommands) => void
  unregisterCommands: () => void
}

export const useEditorStore = create<EditorState>((set) => ({
  commands: null,
  registerCommands: (commands) => set({ commands }),
  unregisterCommands: () => set({ commands: null }),
}))
