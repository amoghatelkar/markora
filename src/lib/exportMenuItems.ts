import { exportActiveDocument } from '@/lib/exportActions'
import type { ToolbarDropdownItem } from '@/components/ui/ToolbarDropdown'

export function getExportMenuItems(hasDocument: boolean): ToolbarDropdownItem[] {
  return [
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
}
