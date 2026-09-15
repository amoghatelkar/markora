import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import './ToolbarDropdown.css'

export interface ToolbarDropdownItem {
  id: string
  label: string
  shortcut?: string
  action?: () => void
  separator?: boolean
  disabled?: boolean
  active?: boolean
}

interface ToolbarDropdownProps {
  label: string
  items: ToolbarDropdownItem[]
  'aria-label': string
  icon?: ReactNode
}

export function ToolbarDropdown({ label, items, 'aria-label': ariaLabel, icon }: ToolbarDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return

    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close()
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

  const handleItemClick = (item: ToolbarDropdownItem) => {
    if (item.disabled || item.separator) return
    item.action?.()
    close()
  }

  return (
    <div className="toolbar-dropdown" ref={ref}>
      <button
        className={`toolbar-dropdown-trigger ${open ? 'toolbar-dropdown-trigger--open' : ''}`}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((v) => !v)}
      >
        {icon}
        <span className="toolbar-dropdown-label">{label}</span>
        <ChevronDown size={12} strokeWidth={1.5} />
      </button>

      {open && (
        <div className="toolbar-dropdown-menu animate-slide-down" role="menu">
          {items.map((item) =>
            item.separator ? (
              <div key={item.id} className="toolbar-dropdown-separator" role="separator" />
            ) : (
              <button
                key={item.id}
                className={`toolbar-dropdown-item ${item.active ? 'toolbar-dropdown-item--active' : ''}`}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => handleItemClick(item)}
              >
                <span>{item.label}</span>
                {item.shortcut && (
                  <kbd className="toolbar-dropdown-shortcut">{item.shortcut}</kbd>
                )}
              </button>
            )
          )}
        </div>
      )}
    </div>
  )
}
