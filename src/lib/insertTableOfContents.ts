import { useAppStore } from '@/store/useAppStore'
import { useEditorStore } from '@/store/useEditorStore'
import {
  buildTableOfContentsMarkdown,
  extractTocHeadings,
} from '@/lib/tableOfContents'

export function insertTableOfContents() {
  const store = useAppStore.getState()
  const id = store.activeDocumentId
  if (!id) return

  const doc = store.documents.find((d) => d.id === id)
  if (!doc) return

  const headings = extractTocHeadings(doc.content)
  const tocMarkdown = buildTableOfContentsMarkdown(headings)

  if (!tocMarkdown) {
    store.showToast('Add headings to the document first.')
    return
  }

  if (store.showMarkdownSource) {
    useEditorStore.getState().insertTableOfContentsInSource(tocMarkdown)
    store.showToast('Table of contents inserted')
    return
  }

  const commands = useEditorStore.getState().commands
  if (!commands) {
    store.showToast('Open a document in the editor first.')
    return
  }
  commands.insertTableOfContents(tocMarkdown)
  store.showToast('Table of contents inserted')
}
