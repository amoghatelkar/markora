import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import type { Editor } from '@tiptap/react'
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Columns2,
  Rows3,
  Table2,
  Trash2,
  Merge,
  SplitSquareHorizontal,
} from 'lucide-react'
import './TableBubbleMenu.css'

interface TableBubbleMenuProps {
  editor: Editor | null
  enabled?: boolean
}

function MenuBtn({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  children: ReactNode
}) {
  return (
    <button
      type="button"
      className="table-bubble-btn"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export function TableBubbleMenu({ editor, enabled = true }: TableBubbleMenuProps) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (!editor) {
      setOpen(false)
      return
    }

    const update = () => {
      if (!enabled) {
        setOpen(false)
        return
      }

      const inTable = editor.isActive('table')
      if (!inTable) {
        setOpen(false)
        return
      }

      const { from } = editor.state.selection
      const coords = editor.view.coordsAtPos(from)
      setPos({
        top: Math.max(8, coords.top - 44),
        left: Math.max(8, coords.left),
      })
      setOpen(true)
    }

    update()
    editor.on('selectionUpdate', update)
    editor.on('transaction', update)

    return () => {
      editor.off('selectionUpdate', update)
      editor.off('transaction', update)
    }
  }, [editor, enabled])

  if (!editor || !enabled || !open) return null

  const run = (fn: () => boolean) => () => {
    fn()
  }

  return createPortal(
    <div
      className="table-bubble-menu table-bubble-menu--portal"
      role="toolbar"
      aria-label="Table"
      style={{ top: pos.top, left: pos.left }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <MenuBtn
        label="Add row above"
        disabled={!editor.can().addRowBefore()}
        onClick={run(() => editor.chain().focus().addRowBefore().run())}
      >
        <ArrowUp size={14} />
      </MenuBtn>
      <MenuBtn
        label="Add row below"
        disabled={!editor.can().addRowAfter()}
        onClick={run(() => editor.chain().focus().addRowAfter().run())}
      >
        <ArrowDown size={14} />
      </MenuBtn>
      <MenuBtn
        label="Delete row"
        disabled={!editor.can().deleteRow()}
        onClick={run(() => editor.chain().focus().deleteRow().run())}
      >
        <Rows3 size={14} />
      </MenuBtn>
      <span className="table-bubble-sep" />
      <MenuBtn
        label="Add column left"
        disabled={!editor.can().addColumnBefore()}
        onClick={run(() => editor.chain().focus().addColumnBefore().run())}
      >
        <ArrowLeft size={14} />
      </MenuBtn>
      <MenuBtn
        label="Add column right"
        disabled={!editor.can().addColumnAfter()}
        onClick={run(() => editor.chain().focus().addColumnAfter().run())}
      >
        <ArrowRight size={14} />
      </MenuBtn>
      <MenuBtn
        label="Delete column"
        disabled={!editor.can().deleteColumn()}
        onClick={run(() => editor.chain().focus().deleteColumn().run())}
      >
        <Columns2 size={14} />
      </MenuBtn>
      <span className="table-bubble-sep" />
      <MenuBtn
        label="Toggle header row"
        disabled={!editor.can().toggleHeaderRow()}
        onClick={run(() => editor.chain().focus().toggleHeaderRow().run())}
      >
        <Table2 size={14} />
      </MenuBtn>
      <MenuBtn
        label="Toggle header column"
        disabled={!editor.can().toggleHeaderColumn()}
        onClick={run(() => editor.chain().focus().toggleHeaderColumn().run())}
      >
        <Columns2 size={14} />
      </MenuBtn>
      <MenuBtn
        label="Merge cells"
        disabled={!editor.can().mergeCells()}
        onClick={run(() => editor.chain().focus().mergeCells().run())}
      >
        <Merge size={14} />
      </MenuBtn>
      <MenuBtn
        label="Split cell"
        disabled={!editor.can().splitCell()}
        onClick={run(() => editor.chain().focus().splitCell().run())}
      >
        <SplitSquareHorizontal size={14} />
      </MenuBtn>
      <span className="table-bubble-sep" />
      <MenuBtn
        label="Delete table"
        disabled={!editor.can().deleteTable()}
        onClick={run(() => editor.chain().focus().deleteTable().run())}
      >
        <Trash2 size={14} />
      </MenuBtn>
    </div>,
    document.body
  )
}
