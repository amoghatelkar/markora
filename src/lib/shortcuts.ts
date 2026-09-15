const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform)

export function formatShortcut(keys: string): string {
  if (isMac) {
    return keys
      .replace('Mod', '⌘')
      .replace('Shift', '⇧')
      .replace('Alt', '⌥')
      .replace('Ctrl', '⌃')
  }
  return keys
    .replace('Mod', 'Ctrl')
    .replace('Shift', 'Shift+')
    .replace('Alt', 'Alt+')
}

export function matchesShortcut(e: KeyboardEvent, keys: string): boolean {
  const parts = keys.split('+')
  const mod = isMac ? e.metaKey : e.ctrlKey
  const needsMod = parts.includes('Mod')
  const needsShift = parts.includes('Shift')
  const needsAlt = parts.includes('Alt')
  const key = parts[parts.length - 1].toLowerCase()

  if (needsMod !== mod) return false
  if (needsShift !== e.shiftKey) return false
  if (needsAlt !== e.altKey) return false
  return e.key.toLowerCase() === key
}
