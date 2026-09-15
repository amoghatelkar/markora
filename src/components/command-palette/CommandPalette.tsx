import { useState, useEffect, useRef, useMemo, useCallback, type ReactNode } from 'react'
import Fuse, { type FuseResultMatch } from 'fuse.js'
import { getCommands } from '@/lib/commands'
import { formatShortcut } from '@/lib/shortcuts'
import { useAppStore } from '@/store/useAppStore'
import './CommandPalette.css'

function highlightMatch(text: string, indices: readonly [number, number][]): ReactNode {
  if (!indices.length) return text

  const parts: ReactNode[] = []
  let lastIndex = 0

  for (const [start, end] of indices) {
    if (start > lastIndex) parts.push(text.slice(lastIndex, start))
    parts.push(<mark key={start} className="cmd-highlight">{text.slice(start, end + 1)}</mark>)
    lastIndex = end + 1
  }

  if (lastIndex < text.length) parts.push(text.slice(lastIndex))
  return parts
}

export function CommandPalette() {
  const open = useAppStore((s) => s.commandPaletteOpen)
  const setOpen = useAppStore((s) => s.setCommandPaletteOpen)
  const recentCommands = useAppStore((s) => s.recentCommands)
  const addRecentCommand = useAppStore((s) => s.addRecentCommand)

  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const allCommands = useMemo(() => getCommands(), [])

  const fuse = useMemo(
    () =>
      new Fuse(allCommands, {
        keys: ['label', 'category', 'keywords'],
        threshold: 0.35,
        includeMatches: true,
      }),
    [allCommands]
  )

  const results = useMemo(() => {
    if (!query.trim()) {
      const recent = recentCommands
        .map((id) => allCommands.find((c) => c.id === id))
        .filter(Boolean) as typeof allCommands

      const recentIds = new Set(recent.map((c) => c.id))
      const rest = allCommands.filter((c) => !recentIds.has(c.id))
      return [...recent, ...rest].map((item) => ({ item, matches: [] as FuseResultMatch[] }))
    }
    return fuse.search(query)
  }, [query, fuse, allCommands, recentCommands])

  const execute = useCallback(
    (id: string) => {
      const cmd = allCommands.find((c) => c.id === id)
      if (cmd) {
        addRecentCommand(id)
        cmd.action()
      }
      setOpen(false)
      setQuery('')
      setSelectedIndex(0)
    },
    [allCommands, addRecentCommand, setOpen]
  )

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIndex(0)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  useEffect(() => {
    const el = listRef.current?.children[selectedIndex] as HTMLElement | undefined
    el?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((i) => Math.max(i - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (results[selectedIndex]) execute(results[selectedIndex].item.id)
        break
      case 'Escape':
        e.preventDefault()
        setOpen(false)
        break
    }
  }

  if (!open) return null

  let lastCategory = ''

  return (
    <div className="cmd-overlay" onClick={() => setOpen(false)}>
      <div
        className="cmd-palette animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Command palette"
        aria-modal="true"
      >
        <div className="cmd-input-wrapper">
          <input
            ref={inputRef}
            className="cmd-input"
            type="text"
            placeholder="Search commands…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Search commands"
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <div className="cmd-list" ref={listRef} role="listbox">
          {results.length === 0 ? (
            <div className="cmd-empty">No commands found</div>
          ) : (
            results.map((result, idx) => {
              const showCategory = result.item.category !== lastCategory
              lastCategory = result.item.category
              const labelMatch = result.matches?.find((m) => m.key === 'label')
              const indices = (labelMatch?.indices ?? []) as [number, number][]

              return (
                <div key={result.item.id}>
                  {showCategory && (
                    <div className="cmd-group-label">{result.item.category}</div>
                  )}
                  <button
                    className={`cmd-item ${idx === selectedIndex ? 'cmd-item--selected' : ''}`}
                    type="button"
                    role="option"
                    aria-selected={idx === selectedIndex}
                    onClick={() => execute(result.item.id)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <span className="cmd-item-label">
                      <span className="cmd-item-arrow">↳</span>
                      {query && labelMatch
                        ? highlightMatch(result.item.label, indices)
                        : result.item.label}
                    </span>
                    {result.item.shortcut && (
                      <kbd className="cmd-item-shortcut">
                        {formatShortcut(result.item.shortcut)}
                      </kbd>
                    )}
                  </button>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
