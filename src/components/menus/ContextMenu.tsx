import { useEffect, useRef } from 'react'
import './ContextMenu.css'

export interface ContextMenuItem {
  label: string
  shortcut?: string
  action?: () => void
  separator?: boolean
  disabled?: boolean
}

interface ContextMenuProps {
  x: number
  y: number
  items: ContextMenuItem[]
  onClose: () => void
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  return (
    <div
      ref={ref}
      className="context-menu animate-scale-in"
      style={{ top: y, left: x }}
      role="menu"
    >
      {items.map((item, i) =>
        item.separator ? (
          <div key={i} className="context-menu-separator" role="separator" />
        ) : (
          <button
            key={i}
            className="context-menu-item"
            type="button"
            role="menuitem"
            disabled={item.disabled}
            onClick={() => {
              item.action?.()
              onClose()
            }}
          >
            <span>{item.label}</span>
            {item.shortcut && <kbd className="context-menu-shortcut">{item.shortcut}</kbd>}
          </button>
        )
      )}
    </div>
  )
}
