import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Table } from 'lucide-react'
import { useEditorStore } from '@/store/useEditorStore'
import { Tooltip } from '@/components/ui/Tooltip'
import { formatShortcut } from '@/lib/shortcuts'
import './TableInsertPicker.css'

const MAX_ROWS = 10
const MAX_COLS = 10

interface TableInsertPickerProps {
  variant?: 'icon' | 'menu' | 'headless'
  onInserted?: () => void
}

export function TableInsertPicker({ variant = 'icon', onInserted }: TableInsertPickerProps) {
  const commands = useEditorStore((s) => s.commands)
  const pickerNonce = useEditorStore((s) => s.tableInsertPickerNonce)
  const [open, setOpen] = useState(false)
  const [hoverRows, setHoverRows] = useState(3)
  const [hoverCols, setHoverCols] = useState(3)
  const [withHeaderRow, setWithHeaderRow] = useState(true)
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 })
  const ref = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => setOpen(false), [])

  const openAtTrigger = useCallback(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect()
      setMenuPos({ top: rect.bottom + 4, left: rect.left })
    } else {
      setMenuPos({
        top: Math.max(80, window.innerHeight * 0.35),
        left: Math.max(16, window.innerWidth / 2 - 110),
      })
    }
    setOpen(true)
  }, [])

  // Menu bar / command palette open one shared picker; toolbar uses its own instance.
  useEffect(() => {
    if (variant !== 'headless' || pickerNonce === 0) return
    openAtTrigger()
  }, [pickerNonce, openAtTrigger, variant])

  useEffect(() => {
    if (!open) return

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (ref.current?.contains(target) || menuRef.current?.contains(target)) return
      close()
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open, close])

  const insert = (rows: number, cols: number) => {
    commands?.insertTable(rows, cols, withHeaderRow)
    close()
    onInserted?.()
  }

  const menu = open
    ? createPortal(
        <div
          ref={menuRef}
          className="table-insert-menu animate-slide-down"
          role="dialog"
          aria-label="Insert table"
          style={{ top: menuPos.top, left: menuPos.left }}
        >
          <div className="table-insert-label">
            {hoverCols} × {hoverRows}
          </div>
          <div
            className="table-insert-grid"
            onMouseLeave={() => {
              setHoverRows(1)
              setHoverCols(1)
            }}
          >
            {Array.from({ length: MAX_ROWS }, (_, row) =>
              Array.from({ length: MAX_COLS }, (_, col) => {
                const r = row + 1
                const c = col + 1
                const selected = r <= hoverRows && c <= hoverCols
                return (
                  <button
                    key={`${r}-${c}`}
                    type="button"
                    className={`table-insert-cell ${selected ? 'table-insert-cell--selected' : ''}`}
                    aria-label={`${c} columns by ${r} rows`}
                    onMouseEnter={() => {
                      setHoverRows(r)
                      setHoverCols(c)
                    }}
                    onClick={() => insert(r, c)}
                  />
                )
              })
            )}
          </div>
          <label className="table-insert-header-toggle">
            <input
              type="checkbox"
              checked={withHeaderRow}
              onChange={(e) => setWithHeaderRow(e.target.checked)}
            />
            Header row
          </label>
        </div>,
        document.body
      )
    : null

  if (variant === 'headless') {
    return <div className="table-insert-picker table-insert-picker--headless">{menu}</div>
  }

  if (variant === 'menu') {
    return (
      <button type="button" className="table-insert-menu-trigger" onClick={openAtTrigger}>
        Table…
      </button>
    )
  }

  return (
    <div className="table-insert-picker" ref={ref}>
      <Tooltip label="Insert table" shortcut={formatShortcut('Mod+Alt+T')}>
        <button
          className={`toolbar-btn ${open ? 'toolbar-btn--active' : ''}`}
          type="button"
          aria-label="Insert table"
          aria-expanded={open}
          onClick={() => (open ? close() : openAtTrigger())}
        >
          <Table size={15} strokeWidth={1.5} />
        </button>
      </Tooltip>
      {menu}
    </div>
  )
}
