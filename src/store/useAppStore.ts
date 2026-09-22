import { create } from 'zustand'
import type { Document, EditorWidth, SaveStatus, Theme } from '@/types'
import { extractOutline } from '@/lib/outline'
import {
  defaultSaveFileName,
  ensureWritePermission,
  openFileFromSystem,
  type OpenedFile,
  saveFileAs,
  saveToPath,
  setDocumentFileHandle,
  titleFromOpenedFile,
} from '@/lib/fileAccess'

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
  editorZoom: number
  showMarkdownSource: boolean
  saveStatus: SaveStatus
  recentCommands: string[]
  openDialogOpen: boolean
  toast: string | null
  tabHistory: string[]
  tabHistoryIndex: number
  mobileMenuOpen: boolean
  autoSaveEnabled: boolean

  setMobileMenuOpen: (open: boolean) => void
  toggleAutoSave: () => void

  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  newDocument: () => void
  openDocument: (title: string, content?: string) => void
  openDocumentFromSystem: () => Promise<void>
  openDocumentFromElectron: (file: { path: string; content: string }) => void
  saveActiveDocument: (options?: { silent?: boolean }) => Promise<void>
  saveActiveDocumentAs: () => Promise<void>
  closeDocument: (id: string) => void
  setActiveDocument: (id: string) => void
  navigateTabBack: () => void
  navigateTabForward: () => void
  updateDocumentContent: (id: string, content: string) => void
  markDocumentSaved: (id: string) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setSidebarWidth: (width: number) => void
  toggleFocusMode: () => void
  toggleZenMode: () => void
  setCommandPaletteOpen: (open: boolean) => void
  setEditorWidth: (width: EditorWidth) => void
  setEditorZoom: (zoom: number) => void
  zoomIn: () => void
  zoomOut: () => void
  resetEditorZoom: () => void
  toggleMarkdownSource: () => void
  setSaveStatus: (status: SaveStatus) => void
  addRecentCommand: (id: string) => void
  setOpenDialogOpen: (open: boolean) => void
  showToast: (message: string) => void
  dismissWelcome: () => void
}

let docCounter = 0

function createDocument(title?: string, content?: string, path?: string): Document {
  docCounter++
  return {
    id: `doc-${docCounter}`,
    title: title ?? `Untitled ${docCounter}`,
    content: content ?? '',
    modified: false,
    path,
  }
}

const THEME_KEY = 'markora-theme'
const AUTO_SAVE_KEY = 'markora-auto-save'

function readAutoSaveEnabled(): boolean {
  try {
    const v = localStorage.getItem(AUTO_SAVE_KEY)
    if (v === '0') return false
    if (v === '1') return true
  } catch {
    /* ignore */
  }
  return true
}

let autoSaveTimer: ReturnType<typeof setTimeout> | undefined

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

function pruneTabHistory(documents: Document[], history: string[]) {
  const openIds = new Set(documents.map((d) => d.id))
  return history.filter((id) => openIds.has(id))
}

function activateDocument(
  state: AppState,
  id: string,
  options?: { recordHistory?: boolean }
): Partial<AppState> {
  if (!state.documents.some((d) => d.id === id)) return {}
  if (id === state.activeDocumentId) {
    return { showWelcome: false }
  }

  if (options?.recordHistory === false) {
    return { activeDocumentId: id, showWelcome: false }
  }

  const trimmed = state.tabHistory.slice(0, state.tabHistoryIndex + 1)
  if (trimmed[trimmed.length - 1] !== id) {
    trimmed.push(id)
  }

  return {
    activeDocumentId: id,
    showWelcome: false,
    tabHistory: trimmed,
    tabHistoryIndex: trimmed.length - 1,
  }
}

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
  editorZoom: 100,
  showMarkdownSource: false,
  saveStatus: 'saved',
  recentCommands: [],
  openDialogOpen: false,
  toast: null,
  tabHistory: [],
  tabHistoryIndex: -1,
  mobileMenuOpen: false,
  autoSaveEnabled: readAutoSaveEnabled(),

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
    set((s) => {
      const documents = [...s.documents, doc]
      return {
        documents,
        saveStatus: 'unsaved',
        ...activateDocument({ ...s, documents }, doc.id),
      }
    })
  },

  openDocument: (title, content) => {
    const doc = createDocument(title, content ?? SAMPLE_CONTENT)
    set((s) => {
      const documents = [...s.documents, doc]
      return {
        documents,
        saveStatus: 'saved',
        ...activateDocument({ ...s, documents }, doc.id),
      }
    })
  },

  openDocumentFromSystem: async () => {
    const file = await openFileFromSystem()
    if (!file) return
    get().openDocumentFromElectron({ path: file.path, content: file.content })
    if (file.handle) {
      const docId = get().activeDocumentId
      if (docId) {
        setDocumentFileHandle(docId, file.handle)
        await ensureWritePermission(file.handle, file.name, { interactive: true })
      }
    }
  },

  openDocumentFromElectron: (file) => {
    const name = file.path.split(/[/\\]/).pop() ?? file.path
    const opened: OpenedFile = { name, path: file.path, content: file.content }
    const doc = createDocument(titleFromOpenedFile(opened), file.content, file.path)
    set((s) => {
      const documents = [...s.documents, doc]
      return {
        documents,
        saveStatus: 'saved',
        showWelcome: false,
        ...activateDocument({ ...s, documents }, doc.id),
      }
    })
    get().showToast(`Opened ${name}`)
  },

  saveActiveDocument: async (options) => {
    const id = get().activeDocumentId
    if (!id) return
    const doc = get().documents.find((d) => d.id === id)
    if (!doc) return

    if (!doc.path) {
      await get().saveActiveDocumentAs()
      return
    }

    set({ saveStatus: 'saving' })
    try {
      const path = await saveToPath(
        id,
        doc.path,
        doc.content,
        defaultSaveFileName(doc.title),
        { interactive: !options?.silent }
      )
      set((s) => ({
        documents: s.documents.map((d) =>
          d.id === id ? { ...d, path, modified: false } : d
        ),
        saveStatus: 'saved',
      }))
      if (!options?.silent) get().showToast('Saved ✓')
    } catch {
      set({ saveStatus: 'unsaved' })
      if (!options?.silent) get().showToast('Could not save file')
    }
  },

  saveActiveDocumentAs: async () => {
    const id = get().activeDocumentId
    if (!id) return
    const doc = get().documents.find((d) => d.id === id)
    if (!doc) return

    set({ saveStatus: 'saving' })
    try {
      const suggested = defaultSaveFileName(doc.title)
      const result = await saveFileAs(id, suggested, doc.content)
      if (!result) {
        set({ saveStatus: doc.modified ? 'unsaved' : 'saved' })
        return
      }
      if (result.handle) setDocumentFileHandle(id, result.handle)
      set((s) => ({
        documents: s.documents.map((d) =>
          d.id === id
            ? {
                ...d,
                path: result.path,
                title: titleFromOpenedFile({
                  name: result.path,
                  path: result.path,
                  content: doc.content,
                }),
                modified: false,
              }
            : d
        ),
        saveStatus: 'saved',
      }))
      get().showToast('Saved ✓')
    } catch {
      set({ saveStatus: 'unsaved' })
      get().showToast('Could not save file')
    }
  },

  closeDocument: (id) => {
    setDocumentFileHandle(id, null)
    set((s) => {
      const docs = s.documents.filter((d) => d.id !== id)
      const activeId =
        s.activeDocumentId === id
          ? docs.length > 0 ? docs[docs.length - 1].id : null
          : s.activeDocumentId
      const tabHistory = pruneTabHistory(docs, s.tabHistory)
      const tabHistoryIndex =
        activeId === null ? -1 : Math.max(0, tabHistory.lastIndexOf(activeId))
      return {
        documents: docs,
        activeDocumentId: activeId,
        showWelcome: docs.length === 0,
        tabHistory,
        tabHistoryIndex,
      }
    })
  },

  setActiveDocument: (id) => set((s) => activateDocument(s, id)),

  navigateTabBack: () =>
    set((s) => {
      if (s.tabHistoryIndex <= 0) return {}
      const nextIndex = s.tabHistoryIndex - 1
      const docId = s.tabHistory[nextIndex]
      if (!docId || !s.documents.some((d) => d.id === docId)) return {}
      return {
        tabHistoryIndex: nextIndex,
        activeDocumentId: docId,
        showWelcome: false,
      }
    }),

  navigateTabForward: () =>
    set((s) => {
      if (s.tabHistoryIndex < 0 || s.tabHistoryIndex >= s.tabHistory.length - 1) return {}
      const nextIndex = s.tabHistoryIndex + 1
      const docId = s.tabHistory[nextIndex]
      if (!docId || !s.documents.some((d) => d.id === docId)) return {}
      return {
        tabHistoryIndex: nextIndex,
        activeDocumentId: docId,
        showWelcome: false,
      }
    }),

  updateDocumentContent: (id, content) => {
    set((s) => ({
      documents: s.documents.map((d) =>
        d.id === id ? { ...d, content, modified: true } : d
      ),
      saveStatus: 'unsaved',
    }))

    if (!get().autoSaveEnabled) return

    const doc = get().documents.find((d) => d.id === id)
    if (!doc?.path) return

    if (autoSaveTimer) clearTimeout(autoSaveTimer)
    autoSaveTimer = setTimeout(() => {
      const active = get().activeDocumentId
      const current = get().documents.find((d) => d.id === id)
      if (!current?.path || active !== id) return
      void get().saveActiveDocument({ silent: true })
    }, 1500)
  },

  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),

  toggleAutoSave: () => {
    const next = !get().autoSaveEnabled
    try {
      localStorage.setItem(AUTO_SAVE_KEY, next ? '1' : '0')
    } catch {
      /* ignore */
    }
    set({ autoSaveEnabled: next })
    get().showToast(next ? 'Auto-save on' : 'Auto-save off')
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

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  setSidebarWidth: (width) =>
    set({ sidebarWidth: Math.max(180, Math.min(400, width)) }),

  toggleFocusMode: () => set((s) => ({ focusMode: !s.focusMode })),

  toggleZenMode: () => set((s) => ({ zenMode: !s.zenMode, focusMode: true })),

  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

  setEditorWidth: (width) => set({ editorWidth: width }),

  setEditorZoom: (zoom) =>
    set({ editorZoom: Math.min(200, Math.max(50, Math.round(zoom))) }),

  zoomIn: () =>
    set((s) => ({ editorZoom: Math.min(200, s.editorZoom + 10) })),

  zoomOut: () =>
    set((s) => ({ editorZoom: Math.max(50, s.editorZoom - 10) })),

  resetEditorZoom: () => set({ editorZoom: 100 }),

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
