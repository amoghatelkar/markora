import {
  Undo2,
  Redo2,
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Minus,
  Table,
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { useEditorStore } from '@/store/useEditorStore'
import { Tooltip } from '@/components/ui/Tooltip'
import { ToolbarDropdown } from '@/components/ui/ToolbarDropdown'
import { formatShortcut } from '@/lib/shortcuts'
import './Toolbar.css'

interface ToolbarProps {
  onFormat?: (action: string) => void
}

export function Toolbar({ onFormat }: ToolbarProps) {
  const focusMode = useAppStore((s) => s.focusMode)
  const zenMode = useAppStore((s) => s.zenMode)
  const blockLabel = useEditorStore((s) => s.blockLabel)
  const commands = useEditorStore((s) => s.commands)

  if (zenMode) return null

  const format = (action: string) => onFormat?.(action)

  const paragraphItems = [
    {
      id: 'paragraph',
      label: 'Paragraph',
      shortcut: formatShortcut('Mod+Alt+0'),
      action: () => commands?.setParagraph(),
      active: blockLabel === 'Paragraph',
    },
    {
      id: 'heading-1',
      label: 'Heading 1',
      shortcut: formatShortcut('Mod+Alt+1'),
      action: () => commands?.setHeading(1),
      active: blockLabel === 'Heading 1',
    },
    {
      id: 'heading-2',
      label: 'Heading 2',
      shortcut: formatShortcut('Mod+Alt+2'),
      action: () => commands?.setHeading(2),
      active: blockLabel === 'Heading 2',
    },
    {
      id: 'heading-3',
      label: 'Heading 3',
      shortcut: formatShortcut('Mod+Alt+3'),
      action: () => commands?.setHeading(3),
      active: blockLabel === 'Heading 3',
    },
    {
      id: 'heading-4',
      label: 'Heading 4',
      shortcut: formatShortcut('Mod+Alt+4'),
      action: () => commands?.setHeading(4),
      active: blockLabel === 'Heading 4',
    },
    {
      id: 'heading-5',
      label: 'Heading 5',
      shortcut: formatShortcut('Mod+Alt+5'),
      action: () => commands?.setHeading(5),
      active: blockLabel === 'Heading 5',
    },
    {
      id: 'heading-6',
      label: 'Heading 6',
      shortcut: formatShortcut('Mod+Alt+6'),
      action: () => commands?.setHeading(6),
      active: blockLabel === 'Heading 6',
    },
    { id: 'sep-1', label: '', separator: true },
    {
      id: 'blockquote',
      label: 'Blockquote',
      action: () => format('blockquote'),
      active: blockLabel === 'Blockquote',
    },
    {
      id: 'code-block',
      label: 'Code Block',
      action: () => format('codeBlock'),
      active: blockLabel === 'Code Block',
    },
  ]

  const insertItems = [
    {
      id: 'link',
      label: 'Link',
      shortcut: formatShortcut('Mod+K'),
      action: () => format('link'),
    },
    {
      id: 'image',
      label: 'Image',
      action: () => commands?.insertImage(),
    },
    {
      id: 'table',
      label: 'Table',
      shortcut: formatShortcut('Mod+Alt+T'),
      action: () => commands?.insertTable(),
    },
    { id: 'sep-1', label: '', separator: true },
    {
      id: 'horizontal-rule',
      label: 'Horizontal Rule',
      action: () => commands?.insertHorizontalRule(),
    },
  ]

  return (
    <div className={`toolbar ${focusMode ? 'toolbar--minimal' : ''}`}>
      <div className="toolbar-group">
        <Tooltip label="Undo" shortcut="⌘Z">
          <button className="toolbar-btn" type="button" aria-label="Undo" onClick={() => format('undo')}>
            <Undo2 size={15} strokeWidth={1.5} />
          </button>
        </Tooltip>
        <Tooltip label="Redo" shortcut="⌘⇧Z">
          <button className="toolbar-btn" type="button" aria-label="Redo" onClick={() => format('redo')}>
            <Redo2 size={15} strokeWidth={1.5} />
          </button>
        </Tooltip>
      </div>

      <div className="toolbar-separator" />

      <div className="toolbar-group">
        <ToolbarDropdown
          aria-label="Text style"
          label={blockLabel}
          items={paragraphItems}
        />
      </div>

      <div className="toolbar-separator" />

      <div className="toolbar-group">
        <Tooltip label="Bold" shortcut="⌘B">
          <button className="toolbar-btn" type="button" aria-label="Bold" onClick={() => format('bold')}>
            <Bold size={15} strokeWidth={1.5} />
          </button>
        </Tooltip>
        <Tooltip label="Italic" shortcut="⌘I">
          <button className="toolbar-btn" type="button" aria-label="Italic" onClick={() => format('italic')}>
            <Italic size={15} strokeWidth={1.5} />
          </button>
        </Tooltip>
        <Tooltip label="Strikethrough">
          <button className="toolbar-btn" type="button" aria-label="Strikethrough" onClick={() => format('strike')}>
            <Strikethrough size={15} strokeWidth={1.5} />
          </button>
        </Tooltip>
        <Tooltip label="Code" shortcut="⌘E">
          <button className="toolbar-btn" type="button" aria-label="Code" onClick={() => format('code')}>
            <Code size={15} strokeWidth={1.5} />
          </button>
        </Tooltip>
      </div>

      <div className="toolbar-separator toolbar-separator--hide-narrow" />

      <div className="toolbar-group toolbar-group--hide-narrow">
        <ToolbarDropdown
          aria-label="Insert"
          label="Insert"
          items={insertItems}
        />
      </div>

      <div className="toolbar-separator toolbar-separator--hide-narrow" />

      <div className="toolbar-group toolbar-group--hide-narrow">
        <Tooltip label="Bullet list">
          <button className="toolbar-btn" type="button" aria-label="Bullet list" onClick={() => format('bulletList')}>
            <List size={15} strokeWidth={1.5} />
          </button>
        </Tooltip>
        <Tooltip label="Numbered list">
          <button className="toolbar-btn" type="button" aria-label="Numbered list" onClick={() => format('orderedList')}>
            <ListOrdered size={15} strokeWidth={1.5} />
          </button>
        </Tooltip>
        <Tooltip label="Blockquote">
          <button className="toolbar-btn" type="button" aria-label="Blockquote" onClick={() => format('blockquote')}>
            <Quote size={15} strokeWidth={1.5} />
          </button>
        </Tooltip>
        <Tooltip label="Code block">
          <button className="toolbar-btn" type="button" aria-label="Code block" onClick={() => format('codeBlock')}>
            <Code size={15} strokeWidth={1.5} />
          </button>
        </Tooltip>
        <Tooltip label="Table">
          <button className="toolbar-btn" type="button" aria-label="Insert table" onClick={() => commands?.insertTable()}>
            <Table size={15} strokeWidth={1.5} />
          </button>
        </Tooltip>
        <Tooltip label="Horizontal rule">
          <button className="toolbar-btn" type="button" aria-label="Horizontal rule" onClick={() => commands?.insertHorizontalRule()}>
            <Minus size={15} strokeWidth={1.5} />
          </button>
        </Tooltip>
      </div>
    </div>
  )
}
