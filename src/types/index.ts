export type Theme = 'dark' | 'light'
export type EditorWidth = 'compact' | 'comfortable' | 'wide'
export type SaveStatus = 'saved' | 'saving' | 'unsaved'

export interface Document {
  id: string
  title: string
  content: string
  modified: boolean
  path?: string
}

export interface OutlineItem {
  id: string
  level: number
  text: string
}

export interface Command {
  id: string
  label: string
  category: string
  shortcut?: string
  keywords?: string[]
  action: () => void
}
