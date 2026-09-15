import {
  Undo2,
  Redo2,
  Bold,
  Italic,
  Strikethrough,
  Code,
  Link,
  Image,
  List,
  ListOrdered,
  Quote,
  ChevronDown,
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { Tooltip } from '@/components/ui/Tooltip'
import './Toolbar.css'

interface ToolbarProps {
  onFormat?: (action: string) => void
}

export function Toolbar({ onFormat }: ToolbarProps) {
  const focusMode = useAppStore((s) => s.focusMode)
  const zenMode = useAppStore((s) => s.zenMode)

  if (zenMode) return null

  const format = (action: string) => onFormat?.(action)

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
        <button className="toolbar-btn toolbar-btn--text" type="button">
          Paragraph
          <ChevronDown size={12} strokeWidth={1.5} />
        </button>
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
        <Tooltip label="Link" shortcut="⌘K">
          <button className="toolbar-btn" type="button" aria-label="Insert link" onClick={() => format('link')}>
            <Link size={15} strokeWidth={1.5} />
          </button>
        </Tooltip>
        <Tooltip label="Image">
          <button className="toolbar-btn" type="button" aria-label="Insert image" onClick={() => format('image')}>
            <Image size={15} strokeWidth={1.5} />
          </button>
        </Tooltip>
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
      </div>
    </div>
  )
}
