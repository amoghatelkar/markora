import { Download } from 'lucide-react'
import { ToolbarDropdown } from '@/components/ui/ToolbarDropdown'
import { exportActiveDocument } from '@/lib/exportActions'
import { useAppStore } from '@/store/useAppStore'
import './ExportMenu.css'

export function ExportMenu() {
  const hasDocument = Boolean(useAppStore((s) => s.activeDocumentId))

  const items = [
    {
      id: 'export-md',
      label: 'Markdown (.md)',
      action: () => exportActiveDocument('markdown'),
      disabled: !hasDocument,
    },
    {
      id: 'export-html',
      label: 'HTML (.html)',
      action: () => exportActiveDocument('html'),
      disabled: !hasDocument,
    },
    {
      id: 'export-txt',
      label: 'Plain text (.txt)',
      action: () => exportActiveDocument('text'),
      disabled: !hasDocument,
    },
    { id: 'sep-1', label: '', separator: true },
    {
      id: 'export-pdf',
      label: 'PDF (print dialog)',
      action: () => exportActiveDocument('pdf'),
      disabled: !hasDocument,
    },
  ]

  return (
    <div className="export-menu">
      <ToolbarDropdown
        aria-label="Export document"
        label="Export"
        icon={<Download size={13} strokeWidth={1.75} />}
        items={items}
      />
    </div>
  )
}
