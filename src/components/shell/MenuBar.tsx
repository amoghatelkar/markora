import { useAppStore } from '@/store/useAppStore'
import './MenuBar.css'

const MENUS = ['File', 'Edit', 'View', 'Insert', 'Format', 'Help']

export function MenuBar() {
  const zenMode = useAppStore((s) => s.zenMode)
  const focusMode = useAppStore((s) => s.focusMode)

  if (zenMode || focusMode) return null

  return (
    <nav className="menubar" aria-label="Application menu">
      {MENUS.map((menu) => (
        <button key={menu} className="menubar-item" type="button">
          {menu}
        </button>
      ))}
    </nav>
  )
}
