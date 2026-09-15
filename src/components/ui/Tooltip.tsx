import type { ReactNode } from 'react'
import './Tooltip.css'

interface TooltipProps {
  label: string
  shortcut?: string
  children: ReactNode
}

export function Tooltip({ label, shortcut, children }: TooltipProps) {
  return (
    <span className="tooltip-wrapper">
      {children}
      <span className="tooltip" role="tooltip">
        {label}
        {shortcut && <kbd className="tooltip-kbd">{shortcut}</kbd>}
      </span>
    </span>
  )
}
