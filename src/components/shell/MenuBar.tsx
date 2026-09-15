import { useState, useRef, useEffect, useCallback } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { getMenus, type MenuDefinition } from '@/lib/menus'
import './MenuBar.css'

export function MenuBar() {
  const zenMode = useAppStore((s) => s.zenMode)
  const focusMode = useAppStore((s) => s.focusMode)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const barRef = useRef<HTMLElement>(null)

  const menus = getMenus()

  const closeMenu = useCallback(() => setOpenMenuId(null), [])

  useEffect(() => {
    if (!openMenuId) return

    const handleClickOutside = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        closeMenu()
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu()
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [openMenuId, closeMenu])

  if (zenMode || focusMode) return null

  const handleMenuClick = (menu: MenuDefinition) => {
    setOpenMenuId((current) => (current === menu.id ? null : menu.id))
  }

  const handleItemClick = (item: MenuDefinition['items'][number]) => {
    if (item.disabled || item.separator) return
    item.action?.()
    closeMenu()
  }

  return (
    <nav className="menubar" aria-label="Application menu" ref={barRef}>
      {menus.map((menu) => (
        <div key={menu.id} className="menubar-group">
          <button
            className={`menubar-item ${openMenuId === menu.id ? 'menubar-item--open' : ''}`}
            type="button"
            aria-haspopup="menu"
            aria-expanded={openMenuId === menu.id}
            onClick={() => handleMenuClick(menu)}
          >
            {menu.label}
          </button>

          {openMenuId === menu.id && (
            <div className="menubar-dropdown animate-slide-down" role="menu">
              {menu.items.map((item) =>
                item.separator ? (
                  <div key={item.id} className="menubar-dropdown-separator" role="separator" />
                ) : (
                  <button
                    key={item.id}
                    className="menubar-dropdown-item"
                    type="button"
                    role="menuitem"
                    disabled={item.disabled}
                    onClick={() => handleItemClick(item)}
                  >
                    <span>{item.label}</span>
                    {item.shortcut && (
                      <kbd className="menubar-dropdown-shortcut">{item.shortcut}</kbd>
                    )}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      ))}
    </nav>
  )
}
