import { useState, useEffect, useRef } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { Button } from '@/components/ui/Button'
import './OpenDocumentDialog.css'

const SAMPLE_FILES = ['README.md', 'Design.md', 'Notes.md', 'Project.md', 'Changelog.md']

export function OpenDocumentDialog() {
  const open = useAppStore((s) => s.openDialogOpen)
  const setOpen = useAppStore((s) => s.setOpenDialogOpen)
  const openDocument = useAppStore((s) => s.openDocument)

  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = SAMPLE_FILES.filter((f) =>
    f.toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelected(0)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  const handleOpen = () => {
    if (filtered[selected]) {
      openDocument(filtered[selected])
      setOpen(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelected((i) => Math.min(i + 1, filtered.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelected((i) => Math.max(i - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        handleOpen()
        break
      case 'Escape':
        e.preventDefault()
        setOpen(false)
        break
    }
  }

  if (!open) return null

  return (
    <div className="dialog-overlay" onClick={() => setOpen(false)}>
      <div
        className="dialog animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Open Document"
        aria-modal="true"
      >
        <h2 className="dialog-title">Open Document</h2>

        <input
          ref={inputRef}
          className="dialog-search"
          type="search"
          placeholder="Search files…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setSelected(0)
          }}
          onKeyDown={handleKeyDown}
          aria-label="Search files"
        />

        <div className="dialog-list" role="listbox">
          {filtered.map((file, i) => (
            <button
              key={file}
              className={`dialog-list-item ${i === selected ? 'dialog-list-item--selected' : ''}`}
              type="button"
              role="option"
              aria-selected={i === selected}
              onClick={() => {
                setSelected(i)
                openDocument(file)
                setOpen(false)
              }}
              onMouseEnter={() => setSelected(i)}
            >
              {file}
            </button>
          ))}
        </div>

        <div className="dialog-actions">
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleOpen}>Open</Button>
        </div>
      </div>
    </div>
  )
}
