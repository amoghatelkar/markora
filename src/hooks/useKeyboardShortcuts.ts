import { useEffect } from 'react'
import { matchesShortcut } from '@/lib/shortcuts'
import { getCommands } from '@/lib/commands'
import { useAppStore } from '@/store/useAppStore'

export function useKeyboardShortcuts() {
  const setCommandPaletteOpen = useAppStore((s) => s.setCommandPaletteOpen)
  const commandPaletteOpen = useAppStore((s) => s.commandPaletteOpen)
  const toggleZenMode = useAppStore((s) => s.toggleZenMode)
  const zenMode = useAppStore((s) => s.zenMode)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (commandPaletteOpen) return

      const target = e.target as HTMLElement
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA'

      if (matchesShortcut(e, 'Mod+K')) {
        e.preventDefault()
        setCommandPaletteOpen(true)
        return
      }

      if (zenMode && e.key === 'Escape') {
        toggleZenMode()
        return
      }

      if (
        isInput &&
        !matchesShortcut(e, 'Mod+S') &&
        !matchesShortcut(e, 'Mod+Shift+S')
      ) {
        return
      }

      const commands = getCommands()
      for (const cmd of commands) {
        if (cmd.shortcut && matchesShortcut(e, cmd.shortcut)) {
          e.preventDefault()
          cmd.action()
          return
        }
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [commandPaletteOpen, setCommandPaletteOpen, toggleZenMode, zenMode])
}
