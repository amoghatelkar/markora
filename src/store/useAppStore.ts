import { create } from 'zustand'
import type { Document, EditorWidth, SaveStatus, Theme } from '@/types'
import { extractOutline } from '@/lib/outline'

interface AppState {
  theme: Theme
  documents: Document[]
  activeDocumentId: string | null
  sidebarOpen: boolean
  sidebarWidth: number
  focusMode: boolean
  zenMode: boolean
  commandPaletteOpen: boolean
  showWelcome: boolean
  editorWidth: EditorWidth
  showMarkdownSource: boolean
  saveStatus: SaveStatus
  recentCommands: string[]
  openDialogOpen: boolean
  toast: string | null

  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  newDocument: () => void
  openDocument: (title: string, content?: string) => void
  closeDocument: (id: string) => void
  setActiveDocument: (id: string) => void
  updateDocumentContent: (id: string, content: string) => void
  markDocumentSaved: (id: string) => void
  toggleSidebar: () => void
  setSidebarWidth: (width: number) => void
  toggleFocusMode: () => void
  toggleZenMode: () => void
  setCommandPaletteOpen: (open: boolean) => void
  setEditorWidth: (width: EditorWidth) => void
  toggleMarkdownSource: () => void
  setSaveStatus: (status: SaveStatus) => void
  addRecentCommand: (id: string) => void
  setOpenDialogOpen: (open: boolean) => void
  showToast: (message: string) => void
  dismissWelcome: () => void
}

let docCounter = 0

function createDocument(title?: string, content?: string): Document {
  docCounter++
  return {
    id: `doc-${docCounter}`,
    title: title ?? `Untitled ${docCounter}`,
    content: content ?? '',
    modified: false,
  }
}

const THEME_KEY = 'markora-theme'

function readStoredTheme(): Theme {
  try {
    const v = localStorage.getItem(THEME_KEY)
    if (v === 'light' || v === 'dark') return v
  } catch {
    /* ignore */
  }
  return 'dark'
}

const SAMPLE_CONTENT = `# My Document

This is the document content. Markora provides a premium writing experience with carefully tuned typography, generous margins, and a calm interface designed for focus.

## Introduction

Welcome to Markora — your Markdown workspace. Start writing something meaningful.

## Features

Use **bold**, *italic*, and \`inline code\` to format your text. Press \`⌘K\` to open the command palette.

## Getting Started

Explore the sidebar for document outline navigation. Toggle focus mode to minimize distractions.`

export const useAppStore = create<AppState>((set, get) => ({
  theme: readStoredTheme(),
  documents: [],
  activeDocumentId: null,
  sidebarOpen: true,
  sidebarWidth: 240,
  focusMode: false,
  zenMode: false,
  commandPaletteOpen: false,
  showWelcome: true,
  editorWidth: 'comfortable',
  showMarkdownSource: false,
  saveStatus: 'saved',
  recentCommands: [],
  openDialogOpen: false,
  toast: null,

  setTheme: (theme) => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch {
      /* ignore */
    }
    set({ theme })
  },

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark'
    get().setTheme(next)
  },

  newDocument: () => {
    const doc = createDocument()
    set((s) => ({
      documents: [...s.documents, doc],
      activeDocumentId: doc.id,
      showWelcome: false,
      saveStatus: 'unsaved',
    }))
  },

  openDocument: (title, content) => {
    const doc = createDocument(title, content ?? SAMPLE_CONTENT)
    set((s) => ({
      documents: [...s.documents, doc],
      activeDocumentId: doc.id,
      showWelcome: false,
      saveStatus: 'saved',
    }))
  },

  closeDocument: (id) => {
    set((s) => {
      const docs = s.documents.filter((d) => d.id !== id)
      const activeId =
        s.activeDocumentId === id
          ? docs.length > 0 ? docs[docs.length - 1].id : null
          : s.activeDocumentId
      return {
        documents: docs,
        activeDocumentId: activeId,
        showWelcome: docs.length === 0,
      }
    })
  },

  setActiveDocument: (id) => set({ activeDocumentId: id }),

  updateDocumentContent: (id, content) => {
    set((s) => ({
      documents: s.documents.map((d) =>
        d.id === id ? { ...d, content, modified: true } : d
      ),
      saveStatus: 'unsaved',
    }))

    clearTimeout((window as unknown as { _saveTimer?: number })._saveTimer)
    ;(window as unknown as { _saveTimer?: number })._saveTimer = window.setTimeout(() => {
      set({ saveStatus: 'saving' })
      setTimeout(() => {
        get().markDocumentSaved(id)
        get().showToast('Saved ✓')
      }, 400)
    }, 800)
  },

  markDocumentSaved: (id) => {
    set((s) => ({
      documents: s.documents.map((d) =>
        d.id === id ? { ...d, modified: false } : d
      ),
      saveStatus: 'saved',
    }))
  },

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  setSidebarWidth: (width) =>
    set({ sidebarWidth: Math.max(180, Math.min(400, width)) }),

  toggleFocusMode: () => set((s) => ({ focusMode: !s.focusMode })),

  toggleZenMode: () => set((s) => ({ zenMode: !s.zenMode, focusMode: true })),

  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

  setEditorWidth: (width) => set({ editorWidth: width }),

  toggleMarkdownSource: () =>
    set((s) => ({ showMarkdownSource: !s.showMarkdownSource })),

  setSaveStatus: (status) => set({ saveStatus: status }),

  addRecentCommand: (id) =>
    set((s) => ({
      recentCommands: [id, ...s.recentCommands.filter((c) => c !== id)].slice(0, 5),
    })),

  setOpenDialogOpen: (open) => set({ openDialogOpen: open }),

  showToast: (message) => {
    set({ toast: message })
    setTimeout(() => set({ toast: null }), 2000)
  },

  dismissWelcome: () => set({ showWelcome: false }),
}))

export function useActiveDocument() {
  const documents = useAppStore((s) => s.documents)
  const activeDocumentId = useAppStore((s) => s.activeDocumentId)
  return documents.find((d) => d.id === activeDocumentId) ?? null
}

export function useOutline() {
  const doc = useActiveDocument()
  if (!doc) return []
  return extractOutline(doc.content)
}
