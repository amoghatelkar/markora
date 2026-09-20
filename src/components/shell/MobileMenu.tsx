import { useEffect } from 'react'
import { X } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { getMenus } from '@/lib/menus'
import './MobileMenu.css'

export function MobileMenu() {
  const open = useAppStore((s) => s.mobileMenuOpen)
  const setOpen = useAppStore((s) => s.setMobileMenuOpen)
  const autoSaveEnabled = useAppStore((s) => s.autoSaveEnabled)
  const toggleAutoSave = useAppStore((s) => s.toggleAutoSave)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, setOpen])

  if (!open) return null

  const menus = getMenus()

  return (
    <div className="mobile-menu-overlay" role="presentation" onClick={() => setOpen(false)}>
      <div
        className="mobile-menu-sheet animate-slide-up"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="mobile-menu-header">
          <h2 className="mobile-menu-title">Menu</h2>
          <button
            type="button"
            className="mobile-menu-close"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          >
            <X size={20} strokeWidth={1.75} />
          </button>
        </header>

        <label className="mobile-menu-autosave">
          <input type="checkbox" checked={autoSaveEnabled} onChange={() => toggleAutoSave()} />
          <span>Auto-save to disk when a file path is set</span>
        </label>

        <div className="mobile-menu-sections">
          {menus.map((menu) => (
            <section key={menu.id} className="mobile-menu-section">
              <h3 className="mobile-menu-section-title">{menu.label}</h3>
              <ul className="mobile-menu-list">
                {menu.items.map((item) =>
                  item.separator ? (
                    <li key={item.id} className="mobile-menu-separator" role="separator" />
                  ) : (
                    <li key={item.id}>
                      <button
                        type="button"
                        className="mobile-menu-item"
                        disabled={item.disabled}
                        onClick={() => {
                          item.action?.()
                          setOpen(false)
                        }}
                      >
                        <span>{item.label}</span>
                        {item.shortcut && (
                          <kbd className="mobile-menu-shortcut">{item.shortcut}</kbd>
                        )}
                      </button>
                    </li>
                  )
                )}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
