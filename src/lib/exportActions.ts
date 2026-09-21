import { useAppStore } from '@/store/useAppStore'
import { exportDocument, type ExportFormat } from '@/lib/exportDocument'

const FORMAT_LABELS: Record<ExportFormat, string> = {
  markdown: 'Markdown',
  html: 'HTML',
  text: 'Plain text',
  pdf: 'PDF',
}

export function exportActiveDocument(format: ExportFormat) {
  const store = useAppStore.getState()
  const id = store.activeDocumentId
  if (!id) {
    store.showToast('Open a document to export')
    return
  }
  const doc = store.documents.find((d) => d.id === id)
  if (!doc) return

  const result = exportDocument(doc.title, doc.content, format)
  if (!result.ok) {
    store.showToast(result.reason)
    return
  }
  store.showToast(`Exported as ${FORMAT_LABELS[format]}`)
}
