import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
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

const MENU_GAP_PX = 4
const MENU_FALLBACK_HEIGHT_PX = 220

function getMenuPosition(trigger: HTMLDivElement, menuEl: HTMLDivElement | null) {
  const rect = trigger.getBoundingClientRect()
  const menuHeight = Math.max(menuEl?.offsetHeight ?? 0, MENU_FALLBACK_HEIGHT_PX)
  const spaceBelow = window.innerHeight - rect.bottom
  const spaceAbove = rect.top
  const openUpward = spaceBelow < menuHeight + MENU_GAP_PX && spaceAbove > spaceBelow

  if (openUpward) {
    return {
      placement: 'top' as const,
      bottom: window.innerHeight - rect.top + MENU_GAP_PX,
      left: rect.left,
    }
  }

  return {
    placement: 'bottom' as const,
    top: rect.bottom + MENU_GAP_PX,
    left: rect.left,
  }
}

export function ToolbarDropdown({ label, items, 'aria-label': ariaLabel, icon }: ToolbarDropdownProps) {
  const [open, setOpen] = useState(false)
  const [menuPos, setMenuPos] = useState<{
    placement: 'top' | 'bottom'
    top?: number
    bottom?: number
    left: number
  }>({ placement: 'bottom', left: 0, top: 0 })
  const ref = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => setOpen(false), [])

  const updateMenuPosition = useCallback(() => {
    if (!ref.current) return
    setMenuPos(getMenuPosition(ref.current, menuRef.current))
  }, [])

  useEffect(() => {
    if (!open) return

    updateMenuPosition()

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (ref.current?.contains(target) || menuRef.current?.contains(target)) return
      close()
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }

    const handleReposition = () => updateMenuPosition()

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    window.addEventListener('resize', handleReposition)
    window.addEventListener('scroll', handleReposition, true)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
      window.removeEventListener('resize', handleReposition)
      window.removeEventListener('scroll', handleReposition, true)
    }
  }, [open, close, updateMenuPosition])

  useLayoutEffect(() => {
    if (!open) return
    updateMenuPosition()
  }, [open, items, updateMenuPosition])

  const handleItemClick = (item: ToolbarDropdownItem) => {
    if (item.disabled || item.separator) return
    item.action?.()
    close()
  }

  const menu = open
    ? createPortal(
        <div
          ref={menuRef}
          className={`toolbar-dropdown-menu toolbar-dropdown-menu--portal ${
            menuPos.placement === 'top' ? 'animate-slide-up' : 'animate-slide-down'
          }`}
          role="menu"
          style={
            menuPos.placement === 'top'
              ? { bottom: menuPos.bottom, left: menuPos.left, top: 'auto' }
              : { top: menuPos.top, left: menuPos.left, bottom: 'auto' }
          }
        >
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
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleItemClick(item)}
              >
                <span>{item.label}</span>
                {item.shortcut && (
                  <kbd className="toolbar-dropdown-shortcut">{item.shortcut}</kbd>
                )}
              </button>
            )
          )}
        </div>,
        document.body
      )
    : null

  return (
    <div className="toolbar-dropdown" ref={ref}>
      <button
        className={`toolbar-dropdown-trigger ${open ? 'toolbar-dropdown-trigger--open' : ''}`}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => {
          setOpen((v) => !v)
          if (!open) requestAnimationFrame(updateMenuPosition)
        }}
      >
        {icon}
        <span className="toolbar-dropdown-label">{label}</span>
        <ChevronDown size={12} strokeWidth={1.5} />
      </button>
      {menu}
    </div>
  )
}
