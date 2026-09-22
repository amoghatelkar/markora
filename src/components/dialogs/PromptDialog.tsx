import { useEffect, useRef } from 'react'
import { usePromptStore } from '@/store/usePromptStore'
import { Button } from '@/components/ui/Button'
import './OpenDocumentDialog.css'
import './PromptDialog.css'

export function PromptDialog() {
  const active = usePromptStore((s) => s.active)
  const value = usePromptStore((s) => s.value)
  const setValue = usePromptStore((s) => s.setValue)
  const submit = usePromptStore((s) => s.submit)
  const cancel = usePromptStore((s) => s.cancel)

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!active) return
    if (active.kind === 'prompt') {
      requestAnimationFrame(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      })
    }
  }, [active])

  if (!active) return null

  const isPrompt = active.kind === 'prompt'
  const title = active.title
  const confirmLabel = active.confirmLabel ?? (isPrompt ? 'OK' : 'Confirm')
  const cancelLabel = active.cancelLabel ?? 'Cancel'

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      cancel()
    }
    if (e.key === 'Enter' && isPrompt) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="dialog-overlay" onClick={cancel}>
      <div
        className="dialog prompt-dialog animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-modal="true"
        aria-labelledby="prompt-dialog-title"
      >
        <h2 id="prompt-dialog-title" className="dialog-title">{title}</h2>

        {active.message && <p className="prompt-dialog-message">{active.message}</p>}

        {isPrompt && (
          <label className="prompt-dialog-field">
            {active.label && <span className="prompt-dialog-label">{active.label}</span>}
            <input
              ref={inputRef}
              className="dialog-search prompt-dialog-input"
              type="text"
              value={value}
              placeholder={active.placeholder}
              onChange={(e) => setValue(e.target.value)}
              aria-label={active.label ?? title}
            />
          </label>
        )}

        <div className="dialog-actions">
          <Button variant="ghost" onClick={cancel}>{cancelLabel}</Button>
          <Button variant="primary" onClick={submit}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
