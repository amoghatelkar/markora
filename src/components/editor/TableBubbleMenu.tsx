import type { ReactNode } from 'react'
import type { Editor } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react'
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

export function TableBubbleMenu({ editor }: TableBubbleMenuProps) {
  if (!editor) return null

  const run = (fn: () => boolean) => () => {
    fn()
  }

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{ duration: 120, placement: 'top' }}
      shouldShow={({ editor: ed }) => ed.isActive('table')}
      className="table-bubble-menu"
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
    </BubbleMenu>
  )
}
